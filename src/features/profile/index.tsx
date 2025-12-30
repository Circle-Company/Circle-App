import React from "react"
import { View, ViewStyle } from "react-native"
import { Profile } from "../../components/profile"
import { ProfileReciveDataProps } from "../../components/profile/profile-types"
import sizes from "../../constants/sizes"
import PersistedContext from "../../contexts/Persisted"
import { AccountMoments } from "@/features/render-profile/render-account-moments"
import { AccountMomentsHeader } from "@/features/render-profile/components/AccountMomentsHeader"
import { DateFormatter } from "circle-text-library"
import LanguageContext from "@/contexts/Preferences/language"
import { LanguageType } from "@/locales/LanguageTypes"
import { iOSMajorVersion } from "@/lib/platform/detection"

type RenderProfileProps = {
    user?: ProfileReciveDataProps
}

export default function RenderProfile({ user }: RenderProfileProps) {
    const { session } = React.useContext(PersistedContext)

    const top_container: ViewStyle = {
        paddingTop: iOSMajorVersion! >= 26 ? 0 : sizes.paddings["2sm"],
        alignItems: "center",
    }
    const name_container: ViewStyle = {
        paddingTop: sizes.paddings["2md"],
        paddingBottom: user?.name ? sizes.paddings["1sm"] : 0,
    }

    // Idioma e tradução
    const { atualAppLanguage, t } = React.useContext(LanguageContext)

    // DateFormatter que reage às mudanças de idioma
    const dateFormatter = React.useMemo(
        () =>
            new DateFormatter({
                useApproximateTime: true,
                usePrefix: true,
                useSuffix: true,
                locale: atualAppLanguage as any,
            }),
        [atualAppLanguage],
    )

    // Calcular a data do último momento
    const moments = session.account.moments || []
    const lastUpdateDate = moments.length > 0 ? new Date(moments[0].publishedAt) : new Date()
    if (user)
        return (
            <Profile.MainRoot data={user}>
                <View style={top_container}>
                    <Profile.Picture fromProfile={true} hasOutline={false} />
                    {user?.name && (
                        <View style={name_container}>
                            <Profile.NameFollow scale={0.75} />
                        </View>
                    )}
                </View>
                {user?.description && <Profile.Description />}
                {session.account.totalMoments !== undefined && moments.length > 0 && (
                    <AccountMomentsHeader
                        totalMoments={session.account.totalMoments}
                        lastUpdateDate={lastUpdateDate}
                        dateFormatter={dateFormatter}
                    />
                )}
                <AccountMoments moments={moments} totalMoments={session.account.totalMoments} />
            </Profile.MainRoot>
        )
    else return null
}
