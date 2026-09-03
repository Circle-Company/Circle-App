# Localização: remover a permissão "Always" e sincronizar em background

> **Status: implementado** (branch `feature/friendship-api`). Os passos 1-7
> abaixo já estão aplicados no código; o que falta é o build nativo e a
> validação em device — ver §6. O documento fica como registro da decisão e do
> desenho, e como referência para revisão.

## 1. Objetivo

Hoje o app pede **`Always` / "Sempre"** (localização o tempo todo) e mantém o GPS
ativo em background com o indicador azul no iOS. Isso é agressivo demais para o
que o produto precisa: as coordenadas alimentam recomendações de *moments* e
pessoas próximas — precisão de bairro e atualização a cada dezenas de minutos
são suficientes.

O alvo:

- pedir **somente `When In Use`** (`NSLocationWhenInUseUsageDescription`);
- **remover** `NSLocationAlwaysUsageDescription`,
  `NSLocationAlwaysAndWhenInUseUsageDescription` e o background mode `location`;
- manter uma **atualização periódica em background** via `BGProcessingTask`
  (`expo-background-task`), lendo a **última posição conhecida em cache do SO**
  — o que não liga o GPS e portanto **não exige `Always`**;
- remover o passo obrigatório de localização em background do onboarding.

### Decisões já tomadas

| Tema | Decisão |
| --- | --- |
| Estratégia | `When In Use` + `expo-background-task` (best-effort) |
| Onboarding | Remover o passo `locationBackground` de vez |
| Dependência | `expo-background-task@~56.0.27` — **já instalada** (`npm`/`package.json` atualizados) |

## 2. Por que isso funciona sem `Always`

No iOS, `Always` só é necessário para **iniciar/receber atualizações contínuas de
localização com o app em background** (`startLocationUpdatesAsync`,
`CLLocationManager.allowsBackgroundLocationUpdates`, significant-change,
geofencing). É exatamente o que o código faz hoje.

`Location.getLastKnownPositionAsync()` **não inicia** o serviço de localização:
ele lê a última posição que o SO já tem em cache (preenchida por qualquer app com
permissão que tenha consultado a posição recentemente, incluindo o nosso quando
está em foreground). Por isso pode ser chamado a partir de um `BGProcessingTask`
apenas com `When In Use`.

O `expo-background-task` agenda um `BGProcessingTaskRequest` com
`requiresNetworkConnectivity = true` e `requiresExternalPower = false`
(ver `node_modules/expo-background-task/ios/BackgroundTaskScheduler.swift:92-95`),
identificador `com.expo.modules.backgroundtask.processing`.

**Limitação a aceitar conscientemente:** o agendamento é *oportunístico*. O
`minimumInterval` é um piso, não uma garantia — o iOS decide quando executar com
base em uso do app, bateria e rede; pode passar horas sem rodar, e não roda com o
app force-quit pelo usuário. No Android é WorkManager, mais previsível, mas o
`getLastKnownPositionAsync` pode retornar `null` em background no Android 10+
sem `ACCESS_BACKGROUND_LOCATION` (que **não** vamos adicionar) — nesse caso a
task simplesmente não faz nada. A rede de segurança real continua sendo a
atualização em foreground (camadas 1 e 2 abaixo).

## 3. Estado atual (inventário)

| Arquivo | O que faz hoje |
| --- | --- |
| `src/contexts/geolocation.tsx` | Define `BACKGROUND_LOCATION_TASK`, pede `requestBackgroundPermissionsAsync()`, roda `Location.startLocationUpdatesAsync` com `showsBackgroundLocationIndicator: true`, `accuracy: High`, `foregroundService` no Android. Expõe `backgroundStatus` / `canAskAgainBackground`. |
| `src/lib/hooks/useAppPermissions.ts` | Tem o id `locationBackground` (item, requester, refresh, ORDER, `requestAllInOrder`). |
| `app/permissions/index.tsx` | `STEPS` inclui `locationBackground` como **required**; há um card 🌎 "Keep nearby recommendations relevant" e lógica especial em `handleAllow`. |
| `ios/CircleApp/Info.plist` | `NSLocationAlwaysAndWhenInUseUsageDescription` (l. 62), `NSLocationAlwaysUsageDescription` (l. 64), `NSLocationWhenInUseUsageDescription` (l. 66), `UIBackgroundModes` = `fetch`, `location`, `remote-notification` (l. ~97). |
| `android/app/src/main/AndroidManifest.xml` | Só `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` — **nunca teve** `ACCESS_BACKGROUND_LOCATION`, então o background no Android já não funcionava. |
| `app.config.js` | Não declara o plugin `expo-location` nem as strings de localização (elas moram direto no `Info.plist`, que é versionado). |
| `src/queries/account.ts:365` | `updateAccountCoordinates({ lat, lng })` — função pura, sem hooks: pode ser chamada de dentro de uma task headless (o interceptor do axios lê o JWT direto do MMKV). |

Consumidores do contexto (importam apenas o que sobrevive à mudança):

- `app/(tabs)/moments/index.tsx:30` → `foregroundStatus`, `refreshPermissions`
- `src/features/moments/location-not-provided.card.tsx:21` → `openSettings`

## 4. Arquitetura alvo

Três camadas, da mais confiável para a menos:

1. **Ao abrir / voltar para o app** — `AppState` `background|inactive → active`
   dispara um `getCurrentPositionAsync` e sincroniza. Cobre a maioria dos casos.
2. **Enquanto o app está aberto** — `setInterval` de 5 min (já existe).
3. **Periodicamente em background** — `BGProcessingTask` a cada ≥ 15 min lê
   `getLastKnownPositionAsync` e sincroniza. Best-effort, sem GPS, sem `Always`.

Um *throttle* persistido no MMKV evita requisições redundantes quando as três
camadas se sobrepõem.

---

## 5. Implementação

### Passo 0 — dependência (já feito)

```bash
npx expo install expo-background-task   # ~56.0.27 — já em package.json
```

O `npx expo install` **não conseguiu** editar o `app.config.js` (config dinâmico).
O plugin é adicionado à mão no Passo 4.

### Passo 1 — chave de throttle no MMKV

`src/store/index.ts` — dentro de `storageKeys()`, no bloco `account.coordinates`:

```diff
             coordinates: {
                 latitude: baseKey + "account:coordinates:latitude",
                 longitude: baseKey + "account:coordinates:longitude",
+                lastSyncAt: baseKey + "account:coordinates:lastsyncat",
             },
```

### Passo 2 — reescrever `src/contexts/geolocation.tsx`

Substituir o arquivo inteiro pelo conteúdo abaixo.

```tsx
import React from "react"
import * as BackgroundTask from "expo-background-task"
import * as Location from "expo-location"
import * as TaskManager from "expo-task-manager"
import { AppState, Linking } from "react-native"

import PersistedContext from "./Persisted"
import { updateAccountCoordinates, useUpdateAccCoordsMutation } from "@/queries"
import { safeSet, storage, storageKeys } from "@/store"

/**
 * Sincronização de localização sem a permissão "Always".
 *
 * O app pede apenas `When In Use`. Em background usamos um BGProcessingTask que
 * lê a ÚLTIMA POSIÇÃO CONHECIDA em cache do sistema (`getLastKnownPositionAsync`)
 * — isso não liga o GPS e por isso não exige `Always` nem mostra o indicador
 * azul. É best-effort: o SO decide quando rodar a task.
 */
const LOCATION_SYNC_TASK = "LOCATION_SYNC_TASK"

/** Intervalo do timer de foreground (app aberto). */
const FOREGROUND_UPDATE_INTERVAL = 5 * 60 * 1000
/** Piso do agendamento em background, em MINUTOS (API do expo-background-task). */
const BACKGROUND_MINIMUM_INTERVAL = 15
/** Idade máxima aceitável para a posição em cache lida em background. */
const LAST_KNOWN_MAX_AGE = 30 * 60 * 1000
/** Não reenvia coordenadas ao servidor mais de uma vez a cada 4 min. */
const SYNC_THROTTLE = 4 * 60 * 1000

function isLoggedIn(): boolean {
    try {
        return Boolean(storage.getString(storageKeys().account.jwt.token))
    } catch {
        return false
    }
}

function shouldSync(): boolean {
    try {
        const last = storage.getNumber(storageKeys().account.coordinates.lastSyncAt)
        if (!last) return true
        return Date.now() - last >= SYNC_THROTTLE
    } catch {
        return true
    }
}

function markSynced() {
    safeSet(storageKeys().account.coordinates.lastSyncAt, Date.now())
}

/**
 * Task headless: roda fora do React, sem acesso a hooks. Usa a função pura
 * `updateAccountCoordinates` — o interceptor do axios lê o JWT direto do MMKV.
 */
TaskManager.defineTask(LOCATION_SYNC_TASK, async () => {
    try {
        if (!isLoggedIn()) return BackgroundTask.BackgroundTaskResult.Success

        const { status } = await Location.getForegroundPermissionsAsync()
        if (status !== "granted") return BackgroundTask.BackgroundTaskResult.Success

        // Cache do SO — não ativa o serviço de localização.
        const position = await Location.getLastKnownPositionAsync({
            maxAge: LAST_KNOWN_MAX_AGE,
        })
        if (!position) return BackgroundTask.BackgroundTaskResult.Success

        const { latitude, longitude } = position.coords
        await updateAccountCoordinates({ lat: String(latitude), lng: String(longitude) })
        markSynced()
        console.log("📍 Localização sincronizada em background")
        return BackgroundTask.BackgroundTaskResult.Success
    } catch (e) {
        console.error("📍 Falha ao sincronizar localização em background:", e)
        return BackgroundTask.BackgroundTaskResult.Failed
    }
})

interface UpdateCoordinatesPayload {
    latitude: number
    longitude: number
}

type GeolocationProviderProps = { children: React.ReactNode }

export type GeolocationContextsData = {
    updateUserLocation: () => Promise<void>
    isUpdating: boolean
    foregroundStatus: Location.PermissionStatus | null
    canAskAgainForeground: boolean
    requestForegroundPermission: () => Promise<boolean>
    openSettings: () => Promise<void>
    refreshPermissions: () => Promise<void>
}

const GeolocationContext = React.createContext<GeolocationContextsData>(
    {} as GeolocationContextsData,
)

export function Provider({ children }: GeolocationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { mutateAsync: updateCoords } = useUpdateAccCoordsMutation()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
    const [foregroundStatus, setForegroundStatus] =
        React.useState<Location.PermissionStatus | null>(null)
    const [canAskAgainForeground, setCanAskAgainForeground] = React.useState<boolean>(true)

    const openSettings = React.useCallback(async () => {
        try {
            if (typeof (Linking as any).openSettings === "function") {
                await (Linking as any).openSettings()
                return
            }
            await Linking.openURL("app-settings:")
        } catch (e) {
            console.warn("Não foi possível abrir as configurações do sistema:", e)
        }
    }, [])

    const refreshPermissions = React.useCallback(async () => {
        try {
            const fg = await Location.getForegroundPermissionsAsync()
            setForegroundStatus(fg.status)
            setCanAskAgainForeground(fg.canAskAgain)
        } catch (e) {
            console.warn("Falha ao consultar permissão de localização:", e)
        }
    }, [])

    /** Pede apenas `When In Use`. Nunca pedimos background/Always. */
    const requestForegroundPermission = React.useCallback(async (): Promise<boolean> => {
        try {
            const servicesEnabled = await Location.hasServicesEnabledAsync()
            if (!servicesEnabled) {
                console.warn("Serviços de localização desativados pelo usuário")
            }

            const fg = await Location.requestForegroundPermissionsAsync()
            setForegroundStatus(fg.status)
            setCanAskAgainForeground(fg.canAskAgain)
            return fg.status === "granted"
        } catch (error) {
            console.error("Erro ao solicitar permissão de localização:", error)
            return false
        }
    }, [])

    // ---- Background sync (BGProcessingTask) --------------------------------

    const registerBackgroundSync = React.useCallback(async () => {
        try {
            if (!(await TaskManager.isAvailableAsync())) {
                console.warn("TaskManager não disponível neste ambiente")
                return
            }

            const status = await BackgroundTask.getStatusAsync()
            if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
                console.warn("Background task restrita pelo sistema")
                return
            }

            if (await TaskManager.isTaskRegisteredAsync(LOCATION_SYNC_TASK)) return

            await BackgroundTask.registerTaskAsync(LOCATION_SYNC_TASK, {
                minimumInterval: BACKGROUND_MINIMUM_INTERVAL,
            })
            console.log("✅ Sync de localização em background registrado")
        } catch (e) {
            console.error("Erro ao registrar background task de localização:", e)
        }
    }, [])

    const unregisterBackgroundSync = React.useCallback(async () => {
        try {
            if (!(await TaskManager.isAvailableAsync())) return
            if (!(await TaskManager.isTaskRegisteredAsync(LOCATION_SYNC_TASK))) return
            await BackgroundTask.unregisterTaskAsync(LOCATION_SYNC_TASK)
            console.log("🛑 Sync de localização em background cancelado")
        } catch (e) {
            console.error("Erro ao cancelar background task de localização:", e)
        }
    }, [])

    // ---- Foreground --------------------------------------------------------

    const updateUserCoordinates = async (payload: UpdateCoordinatesPayload): Promise<void> => {
        if (!session.user.id) return
        try {
            await updateCoords({
                lat: String(payload.latitude),
                lng: String(payload.longitude),
            })
            session.account.setCoordinates({
                latitude: payload.latitude,
                longitude: payload.longitude,
            })
            markSynced()
        } catch (error) {
            console.error("Error updating coordinates:", error)
            throw error
        }
    }

    const updateUserLocation = React.useCallback(
        async (force = false): Promise<void> => {
            if (!session.user.id) throw new Error("User ID is not available")

            const fg = await Location.getForegroundPermissionsAsync()
            if (fg.status !== "granted") throw new Error("Location permission is not granted")

            if (!force && !shouldSync()) return

            setIsUpdating(true)
            try {
                // Balanced basta para "pessoas por perto" e gasta bem menos bateria
                // que High.
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    mayShowUserSettingsDialog: true,
                })
                const { latitude, longitude } = location.coords
                await updateUserCoordinates({ latitude, longitude })
            } catch (error) {
                console.error("Error getting location:", error)
                throw error
            } finally {
                setIsUpdating(false)
            }
        },
        [session.user.id],
    )

    const startLocationUpdateInterval = React.useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            updateUserLocation().catch((error) => {
                console.error("Error updating location in interval:", error)
            })
        }, FOREGROUND_UPDATE_INTERVAL)
    }, [updateUserLocation])

    // ---- Ciclo de vida -----------------------------------------------------

    React.useEffect(() => {
        refreshPermissions()
    }, [refreshPermissions])

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Atualiza ao voltar para o foreground.
    const appState = React.useRef(AppState.currentState)
    React.useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState) => {
            const prevState = appState.current
            appState.current = nextState
            if ((prevState === "inactive" || prevState === "background") && nextState === "active") {
                if (session.user.id && !isUpdating) {
                    updateUserLocation().catch((err) => {
                        console.warn("Falha ao atualizar localização ao voltar ao app:", err)
                    })
                }
            }
        })
        return () => subscription.remove()
    }, [session.user.id, isUpdating, updateUserLocation])

    // Liga/desliga o serviço conforme a sessão.
    React.useEffect(() => {
        const run = async () => {
            if (!session.user.id) {
                await unregisterBackgroundSync()
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                return
            }

            try {
                await refreshPermissions()
                const fg = await Location.getForegroundPermissionsAsync()
                if (fg.status !== "granted") {
                    await unregisterBackgroundSync()
                    return
                }

                await updateUserLocation(true)
                startLocationUpdateInterval()
                await registerBackgroundSync()
            } catch (error) {
                console.error("Error in initial location update:", error)
            }
        }

        run()
    }, [session.user.id, foregroundStatus])

    const contextValue: GeolocationContextsData = {
        updateUserLocation: () => updateUserLocation(true),
        isUpdating,
        foregroundStatus,
        canAskAgainForeground,
        requestForegroundPermission,
        openSettings,
        refreshPermissions,
    }

    return (
        <GeolocationContext.Provider value={contextValue}>{children}</GeolocationContext.Provider>
    )
}

export default GeolocationContext
```

Pontos de atenção:

- `updateUserLocation` exposto no contexto passa `force = true` — chamadas
  manuais (botão, card) ignoram o throttle; as automáticas respeitam.
- O efeito de ciclo de vida depende também de `foregroundStatus`, para que
  conceder a permissão pela tela de onboarding ligue o serviço sem precisar de
  reload.
- `accuracy` caiu de `High` para `Balanced` — combina com o caso de uso e reduz
  consumo. Se o produto exigir precisão fina, voltar para `High` só aqui.

### Passo 3 — remover `locationBackground` do sistema de permissões

**`src/lib/hooks/useAppPermissions.ts`** — 5 edições:

1. Tipo `PermissionId`: remover a linha `| "locationBackground"`.
2. Lista `base` (dentro do `useState` inicial): remover o objeto inteiro
   `{ id: "locationBackground", ... }`.
3. `buildRequesters`: remover a entrada `locationBackground: async () => {...}`.
4. `refresh`: remover o bloco `// location background (only check if FG granted...)`
   inteiro (o `try/catch` que chama `getBackgroundPermissionsAsync`).
5. `ORDER`: remover `"locationBackground"`; em `requestAllInOrder`, remover o
   `if (id === "locationBackground") { ... continue }`.

Depois disso não deve restar nenhuma referência a
`requestBackgroundPermissionsAsync` / `getBackgroundPermissionsAsync` no
`src/`. Verificar com:

```bash
grep -rn "BackgroundPermissions\|locationBackground\|startLocationUpdatesAsync" src app
```

**`app/permissions/index.tsx`** — 4 edições:

```diff
-type StepId = "locationForeground" | "locationBackground" | "pushNotifications"
+type StepId = "locationForeground" | "pushNotifications"

-const STEPS: StepId[] = ["locationForeground", "locationBackground", "pushNotifications"]
+const STEPS: StepId[] = ["locationForeground", "pushNotifications"]
```

```diff
     const { items, refresh, requestOne, hasMissingRequired, requiredMissingIds, openSettings } =
         useAppPermissions({
-            required: ["locationForeground", "locationBackground", "pushNotifications"],
+            required: ["locationForeground", "pushNotifications"],
         })
```

No `useEffect` de auto-advance, remover o bloco:

```diff
-            // For BG location, only ask if FG granted; if not, we can skip for now
-            if (id === "locationBackground") {
-                const fg = getItem("locationForeground")
-                if (fg?.status !== "granted") {
-                    break
-                }
-            }
-
```

Em `handleAllow`:

```diff
-        const order: StepId[] = ["locationForeground", "locationBackground", "pushNotifications"]
+        const order: StepId[] = ["locationForeground", "pushNotifications"]
 
         for (const id of order) {
             const currentStatus = getItem(id)?.status ?? "unknown"
             if (treatAsGranted(currentStatus)) {
                 continue
             }
 
             const result = await requestOne(id)
             await refresh()
-
-            // If requesting Background and it did not grant, open Settings and finish
-            if (id === "locationBackground" && result !== "granted") {
-                setOnboardingPermissionsCompleted(true)
-                router.replace("/(tabs)/moments")
-                return
-            }
         }
 
-        // Final refresh and immediately navigate if both permissions have been requested
         await refresh()
         const fg = getItem("locationForeground")?.status ?? "unknown"
-        const bg = getItem("locationBackground")?.status ?? "unknown"
-        if (fg !== "unknown" && bg !== "unknown") {
+        const push = getItem("pushNotifications")?.status ?? "unknown"
+        if (fg !== "unknown" && push !== "unknown") {
             setOnboardingPermissionsCompleted(true)
             router.replace("/(tabs)/moments")
             return
         }
     }
```

No JSX, remover o card 🌎 inteiro:

```diff
-            <View style={{ alignItems: "center" }}>
-                <PermissionCard
-                    title={"Keep nearby recommendations relevant"}
-                    icon={<Text style={{ fontSize: 60 }}>🌎</Text>}
-                />
-                <Text style={styles.hint}>
-                    Background location is used to update nearby moments and people recommendations,
-                    even when the app isn’t open.
-                </Text>
-            </View>
-
```

E ajustar a cópia do card 📍 para deixar explícito que a atualização periódica
continua existindo, sem prometer rastreamento contínuo:

```diff
                 <Text style={styles.hint}>
-                    Your approximate location is used while you’re using the app to show moments and
-                    people near you.
+                    Your approximate location is used while you’re using the app to show moments
+                    and people near you, and is refreshed occasionally to keep them relevant.
                 </Text>
```

> Com 2 cards em vez de 3 o layout sobra espaço — conferir no simulador se o
> `gap: 30` do container ainda dá um resultado equilibrado; se ficar esparso,
> subir para `gap: 40` ou centralizar verticalmente.

### Passo 4 — `app.config.js`

Adicionar o plugin do background task e declarar o `expo-location` **sem**
permissões de background, para que um `expo prebuild` futuro gere o `Info.plist`
correto (hoje as strings estão só no arquivo nativo versionado):

```diff
             plugins: [
                 "expo-router",
                 "expo-video",
                 "expo-audio",
                 "expo-localization",
+                "expo-background-task",
+                [
+                    "expo-location",
+                    {
+                        locationWhenInUsePermission:
+                            "$(PRODUCT_NAME) uses your location while you are using the app to show nearby moments and people.",
+                        isIosBackgroundLocationEnabled: false,
+                        isAndroidBackgroundLocationEnabled: false,
+                        isAndroidForegroundServiceEnabled: false,
+                    },
+                ],
```

### Passo 5 — `ios/CircleApp/Info.plist`

O diretório `ios/` é versionado, então editar direto (linhas 62-67 e o array
`UIBackgroundModes`):

```diff
-	<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
-	<string>$(PRODUCT_NAME) uses background location to keep nearby moments and people recommendations up to date, even when the app is not open.</string>
-	<key>NSLocationAlwaysUsageDescription</key>
-	<string>$(PRODUCT_NAME) uses background location to keep nearby moments and people recommendations up to date.</string>
 	<key>NSLocationWhenInUseUsageDescription</key>
 	<string>$(PRODUCT_NAME) uses your location while you are using the app to show nearby moments and people.</string>
```

```diff
 	<key>UIBackgroundModes</key>
 	<array>
 		<string>fetch</string>
-		<string>location</string>
+		<string>processing</string>
 		<string>remote-notification</string>
 	</array>
+	<key>BGTaskSchedulerPermittedIdentifiers</key>
+	<array>
+		<string>com.expo.modules.backgroundtask.processing</string>
+	</array>
```

`processing` e `BGTaskSchedulerPermittedIdentifiers` são exatamente o que o
plugin do `expo-background-task` injeta
(`node_modules/expo-background-task/plugin/build/withBackgroundTask.js`);
adicionamos à mão porque o `Info.plist` é versionado. `fetch` pode ficar (é usado
por outras libs); `location` **precisa** sair — é ele que sustenta a
justificativa de `Always` na revisão da App Store.

### Passo 6 — Android

Nenhuma permissão nova. **Não** adicionar `ACCESS_BACKGROUND_LOCATION` nem
`FOREGROUND_SERVICE_LOCATION`. O `expo-background-task` usa WorkManager e o
autolinking cuida do que precisa. Confirmar depois do build que
`ACCESS_BACKGROUND_LOCATION` não apareceu no manifest mesclado:

```bash
grep -rn "ACCESS_BACKGROUND_LOCATION" android/app/build/intermediates/merged_manifests/ 2>/dev/null
```

### Passo 7 — documentação

Atualizar `docs/onboarding-permissions.md`:

- na seção "Sources in this project" → Location: trocar
  `Location.requestBackgroundPermissionsAsync()` e "Background updates with
  TaskManager" por "Background sync via expo-background-task
  (getLastKnownPositionAsync)";
- remover o bullet "Location (Background)" de "Target permissions";
- remover a cópia de UX correspondente;
- apontar para este documento.

---

## 6. Build e validação

O `Info.plist` e a dependência nativa mudaram → **é obrigatório um novo build**
(não basta OTA):

```bash
npx expo prebuild --platform ios --no-install   # opcional; ios/ é versionado, revisar o diff antes
npm run pod-install
npm run ios
```

Ou `eas build --platform ios --profile development`.

### Como testar

1. **Prompt correto** — instalar em device limpo, passar pelo onboarding: deve
   aparecer **um único** prompt de localização, com as opções "Permitir uma vez /
   Ao usar o app / Não permitir". **Não** deve aparecer o segundo prompt
   "Alterar para Sempre permitir?".
2. **Sem indicador azul** — usar o app, mandar para background: a barra/pílula
   azul de localização **não** pode aparecer. Em Ajustes → Privacidade →
   Serviços de Localização → Circle App, a opção "Sempre" não deve existir.
3. **Foreground** — sair e voltar ao app: log de sincronização e coordenada nova
   no servidor.
4. **Background task (debug build)** — `BackgroundTask.triggerTaskWorkerForTestingAsync()`
   só funciona em build de debug. Alternativa no Xcode, com o app em background,
   pausar no debugger e rodar:
   ```
   e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.expo.modules.backgroundtask.processing"]
   ```
   Esperado: log `📍 Localização sincronizada em background`.
5. **Sem permissão** — negar localização: nenhuma task registrada, nenhum crash,
   e o `LocationNotProvidedCard` continua aparecendo em `moments`.
6. **Logout** — a task deve ser desregistrada (`🛑 Sync de localização em
   background cancelado`).
7. `npm run test:run` e `npm run lint` limpos.

### App Store

Ao remover `location` de `UIBackgroundModes` e as strings `Always`, a
justificativa de background location sai da revisão. Se o App Privacy do App
Store Connect declarar "Precise Location — tracking/background", revisar a
declaração para refletir uso apenas em foreground.

---

## 7. Checklist de aceite

- [x] `grep -rn "requestBackgroundPermissionsAsync\|getBackgroundPermissionsAsync\|startLocationUpdatesAsync\|locationBackground" src app` → sem resultados
- [x] `Info.plist` sem `NSLocationAlways*` e sem `location` em `UIBackgroundModes`
- [x] `Info.plist` com `processing` e `BGTaskSchedulerPermittedIdentifiers`
- [x] `app.config.js` com `expo-background-task` e `expo-location` (background desabilitado)
- [x] `AndroidManifest.xml` sem `ACCESS_BACKGROUND_LOCATION`
- [ ] Onboarding com 2 cards de permissão (📍 + 🔔) e navegação correta
- [ ] Um único prompt de localização, sem "Sempre"
- [ ] Sem indicador azul de localização no iOS
- [ ] Task de background registra no login e desregistra no logout
- [ ] `npm run lint` e `npm run test:run` passando
- [x] `docs/onboarding-permissions.md` atualizado

## 8. Riscos e reversão

- **Frequência menor.** A atualização em background passa a ser oportunística.
  Se o produto medir degradação nas recomendações, a primeira alavanca é reduzir
  `SYNC_THROTTLE` / aumentar a agressividade das camadas 1 e 2 — **não** voltar a
  pedir `Always`.
- **`getLastKnownPositionAsync` pode retornar `null`** se o SO não tiver cache
  recente (usuário que não abre o app há muito tempo). Comportamento: a task não
  faz nada e tenta de novo depois. Aceitável.
- **Reversão:** os passos 2, 3, 5 são o coração da mudança; `git revert` do
  commit restaura o comportamento anterior, mas exige novo build nativo porque o
  `Info.plist` volta a mudar.
