import { create } from "zustand"
import type { TimezoneCode } from "circle-text-library"

import { asNumber, asString } from "../coerce"
import type { PreferencesContent, PreferencesDataType, PreferencesLanguage } from "../types"
import {
    defaultContent,
    defaultLanguage,
    defaultState,
    preferencesStorage,
} from "./preferences.persistence"
import type { PreferencesState } from "./preferences.types"

/**
 * As preferências do **aparelho**: idioma, fuso, autoplay, háptico, áudio e o onboarding
 * de permissões.
 *
 * Escopo `device` (`../scopes`): sobrevivem ao logout e à troca de conta. O idioma é do
 * telefone, não de quem está logado nele — zerá-lo no logout faria o app voltar para inglês
 * na tela de login de um usuário que nunca escolheu inglês.
 *
 * A divisão em arquivos é a mesma dos outros dois stores:
 *
 *   types.ts        a forma em memória e a forma em disco
 *   persistence.ts  chave, padrões e tudo que toca o storage
 *   index.ts        a store Zustand e as ações (com os três bugs que ela corrige)
 */

/**
 * O modelo anterior tinha onze chaves e um setter por campo escrevendo cada uma na mão.
 * Três bugs vieram daí, e todos eram invisíveis porque o estado em memória e o storage eram
 * atualizados separadamente:
 *
 * - `setDisableContentWarning` gravava a chave certa mas escrevia `DisableContentWarning`
 *   (com maiúscula) no estado — o campo real nunca mudava em memória.
 * - `setTranslationLanguage` escrevia dentro de `content`, e não de `language`: o valor ia
 *   para o storage certo e para o lugar errado da memória.
 * - `set()` não persistia `onboardingPermissionsCompleted`, então o onboarding voltava a
 *   aparecer depois de qualquer sincronização de sessão.
 *
 * Aqui cada ação altera **um campo do snapshot** e persiste o conjunto, o que torna essa
 * classe de erro impossível: só existe um caminho de escrita.
 */
export const usePreferencesStore = create<PreferencesState>((set, get) => {
    const persist = () => {
        const {
            appTimezone,
            timezoneCode,
            language,
            content,
            onboardingPermissionsCompleted,
            profilePictureOnboardingPending,
        } = get()
        preferencesStorage.write({
            appTimezone,
            timezoneCode,
            language,
            content,
            onboardingPermissionsCompleted,
            profilePictureOnboardingPending,
        })
    }

    const patchLanguage = (partial: Partial<PreferencesLanguage>) => {
        set((state) => ({ language: { ...state.language, ...partial } }))
        persist()
    }

    const patchContent = (partial: Partial<PreferencesContent>) => {
        set((state) => ({ content: { ...state.content, ...partial } }))
        persist()
    }

    return {
        // Sem I/O no import.
        ...defaultState(),

        setAppLanguage: (value) => patchLanguage({ appLanguage: asString(value, "en") }),
        setTranslationLanguage: (value) =>
            patchLanguage({ translationLanguage: asString(value, "en") }),

        setTimezoneCode: (value: TimezoneCode) => {
            set({ timezoneCode: asString(value) })
            persist()
        },
        setAppTimezone: (value) => {
            set({ appTimezone: asNumber(value) })
            persist()
        },

        setDisableAutoPlay: (value) => patchContent({ disableAutoplay: value === true }),
        setDisableHaptics: (value) => patchContent({ disableHaptics: value === true }),
        setDisableTranslation: (value) => patchContent({ disableTranslation: value === true }),
        setDisableContentWarning: (value) =>
            patchContent({ disableContentWarning: value === true }),
        setMuteAudio: (value) => patchContent({ muteAudio: value === true }),

        setOnboardingPermissionsCompleted: (value) => {
            set({ onboardingPermissionsCompleted: value === true })
            persist()
        },

        // Mesma natureza do de cima: é marca do aparelho, ligada só no cadastro, e por isso
        // também fica fora do `set()` do payload de sessão.
        setProfilePictureOnboardingPending: (value) => {
            set({ profilePictureOnboardingPending: value === true })
            persist()
        },

        set: (value: PreferencesDataType) => {
            set({
                appTimezone: asNumber(value?.appTimezone),
                timezoneCode: asString(value?.timezoneCode),
                language: { ...defaultLanguage(), ...(value?.language ?? {}) },
                content: { ...defaultContent(), ...(value?.content ?? {}) },
            })
            // `onboardingPermissionsCompleted` **não** entra aqui: é do aparelho, e o
            // payload de sessão não fala sobre ele. Sobrescrevê-lo com o default era o
            // terceiro bug — o onboarding reaparecia a cada login.
            persist()
        },

        hydrate: () => set(preferencesStorage.read()),

        clear: () => {
            preferencesStorage.clear()
            set(defaultState())
        },
    }
})

export { PREFERENCES_KEY, PREFERENCES_SCHEMA_VERSION } from "./preferences.persistence"
export type { PersistedPreferences, PreferencesState } from "./preferences.types"
