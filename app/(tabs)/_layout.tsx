import { NativeTabs } from "expo-router/unstable-native-tabs"
import { usePathname, useRouter } from "expo-router"
import React from "react"
import { Platform, DynamicColorIOS } from "react-native"
import { colors } from "@/constants/colors"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { usePushNotifications } from "@/contexts/push.notification"
import PersistedContext from "@/contexts/Persisted"
import { usePreferencesStore } from "@/contexts/Persisted/preferences"

/**
 * Etapa de foto de perfil do cadastro. Fica aqui, no layout das tabs, porque a
 * entrada na parte logada é `/(tabs)/create` — pendurar em uma tela específica
 * deixaria de fora quem entrasse por outra.
 *
 * Só dispara para quem acabou de criar a conta: `profilePictureOnboardingPending`
 * é ligada nos fluxos de cadastro e nunca esteve ligada em conta antiga.
 */
function useProfilePictureOnboarding() {
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)
    const pending = usePreferencesStore((s) => s.profilePictureOnboardingPending)
    const setPending = usePreferencesStore((s) => s.setProfilePictureOnboardingPending)
    const profilePicture = session?.account?.profilePicture

    React.useEffect(() => {
        if (!pending) return
        // Já tem foto (ex.: enviou e voltou): baixa a marca em vez de mostrar
        // a etapa de novo.
        if (profilePicture) {
            setPending(false)
            return
        }
        router.replace("/onboarding/profile-picture")
    }, [pending, profilePicture, router, setPending])
}

export default function TabsLayout() {
    const pathname = usePathname()
    useProfilePictureOnboarding()
    const { unreadCount, inboxVisited } = usePushNotifications()
    const hideTabBar =
        // `chat/[cid]` entra aqui: a conversa troca a tab bar pelo campo de escrita.
        /^\/(you|moment|chat)\/[^/]+/.test(pathname ?? "") ||
        /^\/(radar|popular|inbox|settings)(\/|$)/.test(pathname ?? "")

    // O botão de notificações vive no header da câmera. Ao sair dessa aba o
    // header some, então espelhamos o badge no ícone da câmera na tab bar —
    // só enquanto NÃO estamos na aba da câmera.
    const isOnCamera = (pathname ?? "").startsWith("/create")
    const showCameraBadge = unreadCount > 0 && !inboxVisited && !isOnCamera
    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark:
                iOSMajorVersion && iOSMajorVersion >= 26
                    ? colors.purple.purple_03
                    : colors.purple.purple_04,
            light: colors.purple.purple_05,
        }),
    })

    const indicatorColor =
        Platform.OS === "ios" && iOSMajorVersion && iOSMajorVersion >= 26
            ? colors.gray.grey_05
            : undefined

    return (
        <NativeTabs tintColor={tintColor} indicatorColor={indicatorColor} hidden={hideTabBar}>
            <NativeTabs.Trigger name="moments">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "bolt",
                        selected: "bolt.fill",
                    }}
                />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="create">
                <NativeTabs.Trigger.Icon
                    sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
                />
                <NativeTabs.Trigger.Label hidden />
                {showCameraBadge && (
                    <NativeTabs.Trigger.Badge selectedBackgroundColor={colors.red.red_05}>
                        {unreadCount > 99 ? "99+" : unreadCount.toString()}
                    </NativeTabs.Trigger.Badge>
                )}
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="chat">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "message",
                        selected: "message.fill",
                    }}
                />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="you">
                <NativeTabs.Trigger.Icon sf={{ default: "at", selected: "at" }} />
                <NativeTabs.Trigger.Label hidden />
            </NativeTabs.Trigger>
        </NativeTabs>
    )
}
