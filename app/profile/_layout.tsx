import React from "react"
import fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"
import { Stack, useRouter } from "expo-router"
import ProfileContext from "@/contexts/profile"
import LanguageContext from "@/contexts/language"
import ExclamationIcon from "@/assets/icons/svgs/exclamationmark_circle.svg"
import { HeaderBackButton, HeaderButton } from "@react-navigation/elements"
import BottomSheetContext from "@/contexts/bottomSheet"
import { Text } from "@/components/Themed"
import { Button, Host } from "@expo/ui/swift-ui"
import { ScreenStackHeaderConfig } from "react-native-screens"
import { ProfileOptionsDropDownMenuIOS } from "@/features/profile/profile.dropdown.menu"

export default function ProfileLayout() {
    const { t } = React.useContext(LanguageContext)
    const { profile } = React.useContext(ProfileContext)
    const router = useRouter()
    const usernameTitle = profile?.username ? `@${profile.username}` : t("Profile")

    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: colors.gray.black,
                },
                headerShadowVisible: false,
                animationMatchesGesture: true,
                animation: "slide_from_right",
                gestureEnabled: true,
                headerTransparent: true,
                headerStyle: {
                    backgroundColor: colors.gray.black,
                },
                headerTintColor: colors.gray.white,
            }}
        >
            <Stack.Screen
                name="[userId]"
                options={{
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: {
                        fontFamily: fonts.family["Black-Italic"],
                        fontSize: fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    title: usernameTitle,
                    headerBackTitle: t("Back"),
                    headerBackVisible: true,
                    // Always show a back button action, even if it's the first screen
                    headerRight: () => (
                        <ProfileOptionsDropDownMenuIOS profile={profile}>
                            <HeaderButton
                                pressOpacity={0.8}
                                tintColor={colors.gray.white}
                                pressColor={colors.gray.white}
                                style={{ alignItems: "center", justifyContent: "center" }}
                            >
                                <ExclamationIcon width={20} height={20} fill={colors.gray.white} />
                            </HeaderButton>
                        </ProfileOptionsDropDownMenuIOS>
                    ),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            pressColor={colors.gray.white}
                            onPress={() => {
                                const r: any = router
                                if (r?.canGoBack && r.canGoBack()) {
                                    router.back()
                                } else {
                                    router.replace("/(tabs)/moments")
                                }
                            }}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="moment/[momentId]"
                options={{
                    headerTitle: "Moment",
                    headerTitleAlign: "center",
                    animation: "slide_from_right",
                    headerTintColor: "white",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerLargeTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerBackTitle: t("Back"),
                    headerBackVisible: true,
                }}
            />
        </Stack>
    )
}
