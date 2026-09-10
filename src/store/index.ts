import { createMMKV } from "react-native-mmkv"

/** Prefixo de todas as chaves do app. É o que `clearSessionDataPreservingTutorial()` e
 * `clearKeysByPrefix()` usam para varrer o storage — uma chave sem ele nunca é apagada. */
export const BASE_KEY = "@circle:"

/**
 * Qualquer chave sob o prefixo do app.
 *
 * É o tipo que os leitores/escritores exigem, e o que ele garante é justamente o invariante
 * que o `migrateUnprefixedProfilePicture()` abaixo existe para reparar: uma chave gravada
 * sem `@circle:` sobrevive a todas as limpezas e vaza de uma conta para a outra. Antes isso
 * era um comentário; agora não compila.
 *
 * Aceita qualquer sufixo porque chaves derivadas são legítimas — o namespace efêmero
 * `like:pressed:<id>` e os blobs montados em `Persisted/*` são construídos em runtime.
 */
export type ScopedKey = `${typeof BASE_KEY}${string}`

/** A superfície do MMKV que o app usa, com as chaves restritas ao prefixo. */
type ScopedStorage = {
    getString(key: ScopedKey): string | undefined
    getNumber(key: ScopedKey): number | undefined
    getBoolean(key: ScopedKey): boolean | undefined
    set(key: ScopedKey, value: string | number | boolean): void
    remove(key: ScopedKey): boolean
    contains(key: ScopedKey): boolean
    getAllKeys(): string[]
    clearAll(): void
}

export const storage = createMMKV() as unknown as ScopedStorage

/**
 * Remove uma chave do storage.
 *
 * O método é `remove` — a MMKV o renomeou de `delete` na v4. A versão anterior desta
 * função procurava `delete`, depois `removeItem`, e caía num `set(key, "")` quando não
 * achava nenhum dos dois. Como na v4 nenhum dos dois existe, **toda remoção do app virava
 * uma escrita de string vazia**: a chave continuava lá, e quem lia depois recebia `""` em
 * vez de `null`. Nos tokens isso é a diferença entre "deslogado" e "sessão com credencial
 * em branco".
 *
 * O `try/catch` fica: apagar é sempre best-effort, e uma falha de storage não pode derrubar
 * um signout.
 */
export const safeDelete = (key: ScopedKey) => {
    try {
        storage.remove(key)
    } catch {
        // noop
    }
}

export const safeSet = (key: ScopedKey, value: string | number | boolean | null | undefined) => {
    if (value === undefined || value === null) {
        safeDelete(key)
    } else {
        storage.set(key, value)
    }
}

/**
 * A chave da foto de perfil nasceu como `"user:profilepicture"`, **sem** o `@circle:`.
 * Como as limpezas varrem só o que tem o prefixo, a foto do usuário anterior sobrevivia
 * ao logout e ao login seguinte — vazando de uma conta para a outra no mesmo aparelho.
 *
 * Esta migração roda uma vez, no import deste módulo (portanto antes de qualquer store
 * ler o storage): move o valor para a chave prefixada e apaga a órfã. É idempotente —
 * depois da primeira execução a chave antiga não existe mais e ela sai no primeiro `if`.
 */
const LEGACY_PROFILE_PICTURE_KEY = "user:profilepicture"

function migrateUnprefixedProfilePicture() {
    try {
        // O único lugar do app que legitimamente toca uma chave sem `@circle:` — e o cast
        // é o que o marca como tal. Qualquer outro ponto que precise dele está errado.
        const legacyKey = LEGACY_PROFILE_PICTURE_KEY as unknown as ScopedKey

        const legacy = storage.getString(legacyKey)
        if (legacy === undefined) return

        const target = `${BASE_KEY}user:profilepicture` as const
        // Só copia se o destino estiver vazio: um valor já gravado na chave nova é mais
        // recente que o legado e não pode ser sobrescrito.
        if (legacy && !storage.getString(target)) storage.set(target, legacy)

        safeDelete(legacyKey)
    } catch {
        // noop — storage indisponível não pode impedir o app de subir
    }
}

migrateUnprefixedProfilePicture()

/**
 * As chaves do MMKV que o código de hoje realmente usa.
 *
 * **Esta tabela encolheu.** Ela listava ~30 chaves granulares (`statistics:*`,
 * `preferences:content:*`, `account:moments`, `account:terms:*`, `permissions:*`,
 * `camera:position`, …) herdadas do modelo anterior, em que cada campo tinha a sua chave.
 * Com a consolidação em blobs (§2.2/P2) o dado passou a viver em `@circle:account`,
 * `@circle:preferences` e `@circle:metrics`, e **ninguém mais escrevia** nas granulares —
 * mas elas continuaram aqui, prontas para serem lidas.
 *
 * Isso não é hipotético: três leituras foram encontradas apontando para chaves que nada
 * grava, e as três falhavam em silêncio, sempre pelo mesmo formato (`undefined` comparado
 * com um literal) —
 *   - `Vibrate()` lia `preferences:content:haptics` → a háptica do app inteiro nunca disparou;
 *   - `recentTimeLabel` lia `preferences:language:app` → o rótulo ficava sempre em português;
 *   - `localTZ` lia `preferences:timezone:code` → o fuso local nascia `undefined`.
 *
 * O que sobrou aqui se divide em dois grupos, e a diferença importa:
 *
 * 1. **Vivas** — `baseKey`, `clockOffset`, `account:coordinates:lastsyncat` e a árvore
 *    `tutorial:*`. Escritas e lidas pelo código atual.
 * 2. **Legadas, ainda lidas na migração** — `account:jwt:*`, `user:*` e os campos de status
 *    da conta. `src/session/runtime.ts` as consulta como fallback quando não há blob de
 *    sessão (`legacyCredentials`, `readProfileFromLegacyKeys`, `readStatusFromLegacyKeys`);
 *    é o que faz o app de um usuário que atualiza de uma build antiga continuar logado.
 *    **Só saem daqui quando esse fallback sair.**
 *
 * Apagar as demais definições não deixa dado para trás: `KEY_SCOPES` (`../contexts/Persisted/scopes`)
 * resolve por **prefixo** (`account:`, `user:`, `statistics:`, `permissions:`, `camera:`),
 * então o que ficou em disco de versões antigas continua sendo varrido no logout.
 */
export const STORAGE_KEYS = {
    baseKey: BASE_KEY,
    clockOffset: `${BASE_KEY}clockoffset`,
    account: {
        coordinates: {
            // Só o carimbo de tempo é persistido: as coordenadas em si vão para a API
            // (`updateAccountCoordinates`) e não ficam no aparelho.
            lastSyncAt: `${BASE_KEY}account:coordinates:lastsyncat`,
        },
        // ── legadas: lidas por `session/runtime.ts` na migração ──────────────────
        blocked: `${BASE_KEY}account:block`,
        accessLevel: `${BASE_KEY}account:accesslevel`,
        verified: `${BASE_KEY}account:verified`,
        deleted: `${BASE_KEY}account:deleted`,
        jwt: {
            expiration: `${BASE_KEY}account:jwt:expiration`,
            token: `${BASE_KEY}account:jwt:token`,
            refreshToken: `${BASE_KEY}account:jwt:refreshtoken`,
        },
    },
    // ── legadas: lidas por `session/runtime.ts` na migração ──────────────────────
    user: {
        id: `${BASE_KEY}user:id`,
        name: `${BASE_KEY}user:name`,
        username: `${BASE_KEY}user:username`,
        profilePicture: `${BASE_KEY}user:profilepicture`,
    },
    permissions: {
        // Escrita por `contexts/push.notification.tsx` a cada checagem de permissão.
        postNotifications: `${BASE_KEY}permissions:postnotifications`,
    },
    notifications: {
        /**
         * As preferências de notificação da conta, como JSON.
         *
         * Cache do que o servidor decide, não a verdade: existe para a tela de ajustes abrir
         * já mostrando o estado certo, em vez de piscar o padrão e corrigir depois. É escrita
         * com a resposta do `PUT /account/notifications/preferences` e no login.
         *
         * Escopo de **conta**, não de aparelho: por estar sob `@circle:`, some no logout
         * junto do resto — que é o comportamento correto, porque a preferência é de quem
         * estava logado.
         */
        preferences: `${BASE_KEY}notifications:preferences`,
    },
    tutorial: {
        feed: {
            step1Seen: `${BASE_KEY}tutorial:feed:step1Seen`,
            step2Seen: `${BASE_KEY}tutorial:feed:step2Seen`,
        },
        dismissed: `${BASE_KEY}tutorial:dismissed`,
    },
} as const

/**
 * O `as const` acima não é cosmético: com os valores montados por template literal e o
 * `BASE_KEY` sendo ele próprio um literal, cada folha ganha o **tipo da própria string**
 * (`"@circle:account:jwt:token"`, e não `string`). É isso que faz `StorageKey` abaixo ser
 * uma união fechada, e que dá erro de compilação — em vez de `undefined` em runtime — para
 * quem digitar um caminho que não existe na tabela.
 */
export type StorageKeys = typeof STORAGE_KEYS

/** Achata a tabela na união das chaves que ela declara. */
type LeafValues<T> = T extends string
    ? T
    : T extends object
      ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
      : never

/** Toda chave declarada na tabela. Inclui `baseKey`, que é prefixo e não chave própria. */
export type StorageKey = LeafValues<StorageKeys>

/**
 * A tabela é imutável e compartilhada — antes cada chamada remontava o objeto inteiro, o
 * que só produzia lixo, já que nenhum valor depende de estado.
 */
export function storageKeys(): StorageKeys {
    return STORAGE_KEYS
}

// Ephemeral like-pressed memory namespace and helpers
export const LIKE_PRESSED_NS = `${BASE_KEY}like:pressed:` as const

/**
 * As chaves lidas de disco (`getAllKeys()`) são `string` — o storage não sabe nada dos
 * nossos tipos. Este predicado é a fronteira: só o que carrega o prefixo do app vira
 * `ScopedKey` e pode ser apagado. A checagem já existia nas varreduras abaixo; o que muda é
 * que agora o compilador a exige antes de qualquer `safeDelete`.
 */
export const isScopedKey = (key: string): key is ScopedKey => key.startsWith(BASE_KEY)

export const clearKeysByPrefix = (prefix: ScopedKey) => {
    try {
        for (const k of storage.getAllKeys()) {
            if (isScopedKey(k) && k.startsWith(prefix)) {
                safeDelete(k)
            }
        }
    } catch {
        // noop
    }
}

export const clearLikePressedNamespace = () => {
    clearKeysByPrefix(LIKE_PRESSED_NS)
}

export const clearSessionDataPreservingTutorial = () => {
    try {
        const tutorialPrefix = `${BASE_KEY}tutorial:` as const
        for (const k of storage.getAllKeys()) {
            // `isScopedKey` já garante o prefixo do app; sobra excluir o tutorial.
            if (isScopedKey(k) && !k.startsWith(tutorialPrefix)) {
                safeDelete(k)
            }
        }
    } catch {
        // noop
    }
}
