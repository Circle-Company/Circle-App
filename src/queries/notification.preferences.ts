import React from "react"

import { apiRoutes } from "@/api"
import type { NotificationPreferences } from "@/api/account/account"
import { safeSet, storage, storageKeys } from "@/store"

/**
 * As preferências de notificação da conta.
 *
 * Não é React Query como o resto de `src/queries/`, e a razão é o que se lê aqui: **não há
 * rota de leitura**. O servidor devolve as preferências no payload do login e na resposta do
 * `PUT`; entre uma coisa e outra, o que o app tem é o último valor conhecido. Um `useQuery`
 * sem `queryFn` seria uma ficção com mais cerimônia.
 *
 * O valor fica no MMKV para a tela de ajustes abrir já certa. Chave sob `@circle:`, então
 * some no logout junto do resto — a preferência é da conta, não do aparelho.
 */
const KEY = storageKeys().notifications.preferences

/** `undefined` é "ligada": conta antiga não tem a chave, e o padrão de `message` é `true`. */
export function readNotificationPreferences(): NotificationPreferences {
    try {
        const raw = storage.getString(KEY)
        if (!raw) return {}

        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === "object" ? (parsed as NotificationPreferences) : {}
    } catch {
        // JSON corrompido não pode derrubar a tela de ajustes: o padrão cobre.
        return {}
    }
}

export function writeNotificationPreferences(preferences: NotificationPreferences): void {
    safeSet(KEY, JSON.stringify(preferences))
}

export type NotificationPreferenceToggle = {
    /** O valor atual, já com o padrão aplicado. */
    enabled: boolean
    saving: boolean
    /** Falhou ao salvar — o valor voltou ao que era. */
    error: boolean
    toggle: () => void
}

/**
 * Uma chave das preferências, pronta para um switch.
 *
 * Escreve otimista e desfaz no erro: o switch precisa responder ao toque, mas mentir sobre
 * o que ficou salvo é pior que demorar. Manda **só a chave que mudou** — o backend preserva
 * as demais, e enviar o objeto inteiro sobrescreveria com o que este aparelho acha que sabe.
 */
export function useNotificationPreference(
    key: keyof NotificationPreferences,
): NotificationPreferenceToggle {
    const [preferences, setPreferences] = React.useState<NotificationPreferences>(
        readNotificationPreferences,
    )
    const [saving, setSaving] = React.useState(false)
    const [error, setError] = React.useState(false)

    const enabled = preferences[key] ?? true

    const toggle = React.useCallback(() => {
        if (saving) return

        const next = !(preferences[key] ?? true)
        const optimistic = { ...preferences, [key]: next }

        setPreferences(optimistic)
        setSaving(true)
        setError(false)

        apiRoutes.account
            .updateNotificationPreferences({ [key]: next })
            .then((response) => {
                // A resposta traz o objeto completo do servidor — é ela que vira o cache, e
                // não o palpite otimista: outra preferência pode ter mudado em outro aparelho.
                const saved = response?.preferences?.notifications ?? optimistic
                setPreferences(saved)
                writeNotificationPreferences(saved)
            })
            .catch(() => {
                setPreferences(preferences)
                setError(true)
            })
            .finally(() => setSaving(false))
    }, [key, preferences, saving])

    return { enabled, saving, error, toggle }
}
