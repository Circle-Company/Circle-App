import PersistedContext from "@/contexts/Persisted"
import { useMutation } from "@tanstack/react-query"
import { LanguagesCodesType } from "locales/LanguageTypes"
import React from "react"
import { apiRoutes } from "../../services/Api"

export function useSetAppLanguageMutation({ appLanguage }: { appLanguage: LanguagesCodesType }) {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.language.setAppLanguage({
                userId: session.user.id,
                appLanguage,
            })
        },
        onSuccess: () => {
            session.preferences.setAppLanguage(appLanguage)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}
