import { useMutation } from "@tanstack/react-query"
import React from "react"
import PersistedContext from "@/contexts/Persisted"
import { LanguagesCodesType } from "@/locales/LanguageTypes"
import { apiRoutes } from "@/api"

export function useSetAppLanguageMutation({ appLanguage }: { appLanguage: LanguagesCodesType }) {
    const { session } = React.useContext(PersistedContext)

    // Guardar chamadas em voo e última linguagem aplicada para evitar loops/duplicações
    const inFlightRef = React.useRef(false)
    const lastAppliedRef = React.useRef<LanguagesCodesType | null>(null)

    const mutation = useMutation({
        mutationFn: async () => {
            // Evita chamadas simultâneas ou repetidas para o mesmo idioma
            if (inFlightRef.current) return
            if (lastAppliedRef.current === appLanguage) return

            inFlightRef.current = true
            try {
                await apiRoutes.preferences.language.setLanguage({
                    userId: session.user.id,
                    appLanguage,
                })
            } finally {
                inFlightRef.current = false
            }
        },
        onSuccess: () => {
            lastAppliedRef.current = appLanguage
            // Só atualiza o estado se houver mudança real para evitar re-render em loop
            if (session.preferences.language.appLanguage !== appLanguage) {
                session.preferences.setAppLanguage(appLanguage)
            }
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
