import React from "react"
import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Image } from "expo-image"
import { router, usePathname } from "expo-router"
import { Text } from "@/components/Themed"
import HeartIcon from "@/assets/icons/svgs/heart_2.svg"
import AtIcon from "@/assets/icons/svgs/@2.svg"
import CheckIcon from "@/assets/icons/svgs/check.svg"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import ProfileContext from "@/contexts/profile"
import { useLocaleDateRelative } from "@/lib/hooks/useLocaleDate"
import { ViewersRenderViewerProps } from "../viewers-types"

const AVATAR = 44

export default function RenderViewer({ viewer: item }: ViewersRenderViewerProps) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { setUserId, setProfilePreview } = React.useContext(ProfileContext)
    const pathname = usePathname()

    const relative = useLocaleDateRelative(item.lastViewedAt)
    // Perfil ausente ainda ocupa uma linha: o registro da visualização existe,
    // só a conta não foi encontrada.
    const username = item.username ? `@${item.username}` : t("Unavailable user")

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: sizes.paddings["1sm"] * 0.8,
        paddingHorizontal: sizes.paddings["1sm"],
    }

    const avatar: ViewStyle = {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        backgroundColor: colors.gray.grey_07,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    }

    const usernameStyle: TextStyle = {
        fontFamily: fonts.family["Semibold-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.white,
    }

    const subtitleStyle: TextStyle = {
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body * 0.85,
        color: colors.gray.grey_04,
    }

    function handlePress() {
        if (!item.username) return
        const targetId = String(item.userId)
        const isSelf = targetId === String(session.user.id)
        const targetPath = isSelf ? `/you/${targetId}` : `/profile/${targetId}`
        if (pathname === targetPath) return

        setProfilePreview({ id: targetId, username: String(item.username || "") })
        setUserId(targetId)

        if (isSelf)
            router.push({ pathname: "/you/[id]", params: { id: targetId, from: "profile" } })
        else router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
    }

    // `viewCount` conta cada exibição: duas visualizações da mesma pessoa
    // aparecem numa linha só, com o número ao lado do horário.
    const subtitle = [relative, item.viewCount > 1 ? `${item.viewCount}× ${t("views")}` : null]
        .filter(Boolean)
        .join(" · ")

    return (
        <Pressable
            onPress={handlePress}
            disabled={!item.username}
            style={({ pressed }) => [container, { opacity: pressed && item.username ? 0.6 : 1 }]}
        >
            <View style={avatar}>
                {item.profilePictureUrl ? (
                    <Image
                        source={{ uri: item.profilePictureUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                    />
                ) : (
                    <AtIcon width={AVATAR * 0.5} height={AVATAR * 0.5} fill={colors.gray.grey_04} />
                )}
            </View>

            <View style={{ flex: 1, marginLeft: sizes.margins["3sm"] }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={usernameStyle} numberOfLines={1}>
                        {username}
                    </Text>
                    {item.hasCompleted ? (
                        <View style={{ marginLeft: sizes.margins["1sm"] }}>
                            <CheckIcon width={11} height={11} fill={colors.gray.grey_04} />
                        </View>
                    ) : null}
                </View>
                {item.name ? (
                    <Text style={subtitleStyle} numberOfLines={1}>
                        {item.name}
                    </Text>
                ) : null}
                <Text style={subtitleStyle} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>

            {item.hasLiked ? (
                <View style={{ marginLeft: sizes.margins["2sm"] }}>
                    <HeartIcon width={18} height={18} fill={colors.red.red_05} />
                </View>
            ) : null}
        </Pressable>
    )
}
