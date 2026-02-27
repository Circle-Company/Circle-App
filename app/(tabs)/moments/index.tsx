import React from "react"
import ListMoments from "@/features/moments"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import useAppPermissions from "@/lib/hooks/useAppPermissions"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import TutorialDialog from "@/features/moments/feed/render-tutorial-dialog"
import { View } from "react-native"
import { BlurView } from "expo-blur"
import sizes from "@/constants/sizes"
import { useTutorial } from "@/contexts/tutorial"
import { colors } from "@/constants/colors"

export default function HomeScreen() {
    const router = useRouter()
    const { refresh, hasMissingRequired } = useAppPermissions()
    const onboardingPermissionsCompleted = usePreferencesStore(
        (s) => s.onboardingPermissionsCompleted,
    )
    const [checked, setChecked] = React.useState(false)
    const { shouldShowFeedTutorial } = useTutorial()

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true
            ;(async () => {
                try {
                    setChecked(false)
                    await refresh()
                } catch {
                } finally {
                    setChecked(true)
                }
            })()
            return () => {
                isActive = false
            }
        }, [refresh]),
    )

    React.useEffect(() => {
        if (checked && hasMissingRequired && !onboardingPermissionsCompleted) {
            router.replace("/permissions")
        }
    }, [checked, hasMissingRequired, onboardingPermissionsCompleted, router])

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            <ListMoments />
            {shouldShowFeedTutorial && <TutorialDialog />}
        </View>
    )
}
