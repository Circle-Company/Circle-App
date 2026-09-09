import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import { preferencesStorage } from "@/contexts/Persisted/preferences/preferences.persistence"

export type HapticFeedbackTypes =
    | "selection"
    | "impactLight"
    | "impactMedium"
    | "impactHeavy"
    | "rigid"
    | "soft"
    | "notificationSuccess"
    | "notificationWarning"
    | "notificationError"
    | "clockTick"
    | "contextClick"
    | "keyboardPress"
    | "keyboardRelease"
    | "keyboardTap"
    | "longPress"
    | "textHandleMove"
    | "virtualKey"
    | "virtualKeyRelease"
    | "effectClick"
    | "effectDoubleClick"
    | "effectHeavyClick"
    | "effectTick"

const options = {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: true,
}

/**
 * A leitura anterior era `storage.getBoolean(storageKeys().preferences.haptics) === false`,
 * e tinha dois defeitos que se somavam:
 *
 * 1. **A chave nunca é escrita.** A preferência real é `disableHaptics`, que mora dentro do
 *    blob `@circle:preferences` (§2.2/P2) — `preferences:content:haptics` só existe na
 *    tabela de chaves, sem ninguém do outro lado gravando nela.
 * 2. Como a chave nunca existe, `getBoolean` devolvia `undefined`, e `undefined === false`
 *    é `false`. **Nenhuma vibração do app disparava** — o mesmo formato de bug do
 *    `undefined == false` que escondia os gradientes do `midia_render-root`.
 *
 * Agora lê `disableHaptics` da fonte que o toggle de fato escreve. `preferencesStorage.read()`
 * é síncrono e já devolve o default (`false`) quando não há nada gravado, então o padrão
 * passa a ser **vibrar**, e desligar é escolha explícita do usuário.
 */
export function Vibrate(hapticType: HapticFeedbackTypes) {
    if (!preferencesStorage.read().content.disableHaptics) {
        ReactNativeHapticFeedback.trigger(hapticType, options)
    }
}
