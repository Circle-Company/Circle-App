import { storageKeys } from "@/store"

import { createBlobStorage } from "../blob"
import { asBoolean, asNumber, asString, isObject } from "../coerce"
import type { PreferencesContent, PreferencesLanguage } from "../types"

/**
 * A fronteira com o MMKV. Nada aqui conhece a store — mesma divisão do `../account`.
 *
 * Uma chave só (§2.2/P2): as preferências são lidas juntas no boot e mudam de uma em uma,
 * mas o conjunto cabe em poucas centenas de bytes — reescrevê-lo ao trocar um toggle custa
 * menos que manter onze chaves que podem divergir.
 *
 * Escopo **device** (`../scopes`): idioma e fuso são do aparelho, não de quem está logado
 * nele. É por isso que `clearUserScopedData()` não as toca.
 */

export const PREFERENCES_KEY = `${storageKeys().baseKey}preferences` as const
export const PREFERENCES_SCHEMA_VERSION = 1

export const defaultLanguage = (): PreferencesLanguage => ({
    appLanguage: "en",
    translationLanguage: "en",
})

export const defaultContent = (): PreferencesContent => ({
    disableAutoplay: false,
    disableHaptics: false,
    disableTranslation: false,
    disableContentWarning: false,
    muteAudio: false,
})

/** Os padrões de fábrica. Função, e não constante — ver a nota em `../blob.ts`: `language`
 * e `content` são objetos aninhados, e a referência compartilhada deixaria uma mutação
 * acidental atravessar de uma sessão para a outra. */
export const defaultState = () => ({
    appTimezone: 0,
    timezoneCode: "",
    language: defaultLanguage(),
    content: defaultContent(),
    onboardingPermissionsCompleted: false,
})

export type PreferencesSnapshot = ReturnType<typeof defaultState>

/**
 * O ciclo vem de `../blob`; aqui fica só o `parse`.
 *
 * Ele é campo a campo com padrão explícito, e não um spread do que veio: uma preferência
 * nova no app não invalida as antigas, e uma preferência **removida** do app não deixa lixo
 * no estado — que é o que um spread cego faria.
 */
export const preferencesStorage = createBlobStorage<PreferencesSnapshot>({
    key: PREFERENCES_KEY,
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    empty: defaultState,
    parse: (data) => {
        const language = isObject(data.language) ? data.language : {}
        const content = isObject(data.content) ? data.content : {}

        return {
            appTimezone: asNumber(data.appTimezone),
            timezoneCode: asString(data.timezoneCode),
            language: {
                ...defaultLanguage(),
                appLanguage: asString(language.appLanguage, "en"),
                translationLanguage: asString(language.translationLanguage, "en"),
            },
            content: {
                ...defaultContent(),
                disableAutoplay: asBoolean(content.disableAutoplay),
                disableHaptics: asBoolean(content.disableHaptics),
                disableTranslation: asBoolean(content.disableTranslation),
                disableContentWarning: asBoolean(content.disableContentWarning),
                muteAudio: asBoolean(content.muteAudio),
            },
            onboardingPermissionsCompleted: asBoolean(data.onboardingPermissionsCompleted),
        }
    },
})
