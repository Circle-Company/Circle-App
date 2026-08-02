import React from "react"
import ListMoments from "@/features/moments"
import { useRouter } from "expo-router"
import { useFocusEffect } from "expo-router"
import useAppPermissions from "@/lib/hooks/useAppPermissions"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import TutorialDialog from "@/features/moments/feed/render-tutorial-dialog"
import { LocationNotProvidedCard } from "@/features/moments/location-not-provided.card"
import { NoMomentsCard } from "@/features/moments/no-moments.card"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Location from "expo-location"
import GeolocationContext from "@/contexts/geolocation"
import PersistedContext from "@/contexts/Persisted"
import { useAccountMomentsQuery } from "@/queries/account"
import { useTutorial } from "@/contexts/tutorial"
import { colors } from "@/constants/colors"

// Mesmo offset de topo do preview da câmera (safe area + nav bar 46 + folga 8),
// para o card de localização alinhar verticalmente igual ao card da câmera.
const HEADER_TOP_INSET = 54

// TEMPORÁRIO — apenas para inspecionar o NoMomentsCard sem zerar a conta.
// Força o estado "nenhum moment publicado". Voltar para `false` antes de commitar.
const FORCE_NO_MOMENTS = false

export default function HomeScreen() {
    const router = useRouter()
    const { refresh, hasMissingRequired } = useAppPermissions()
    const { foregroundStatus, refreshPermissions } = React.useContext(GeolocationContext)
    const onboardingPermissionsCompleted = usePreferencesStore(
        (s) => s.onboardingPermissionsCompleted,
    )
    const [checked, setChecked] = React.useState(false)
    const { shouldShowFeedTutorial } = useTutorial()
    const insets = useSafeAreaInsets()
    const { session } = React.useContext(PersistedContext)

    const hasToken = !!session?.account?.jwtToken

    // O feed só é liberado depois do primeiro momento publicado. `limit: 1`
    // porque só interessa `pagination.total`, não a lista.
    const {
        data: accountMoments,
        isLoading: isLoadingAccountMoments,
        isError: accountMomentsFailed,
        refetch: refetchAccountMoments,
    } = useAccountMomentsQuery(1, 1, {
        enabled: hasToken,
    })

    const createdMomentsCount = accountMoments?.pagination?.total
    // Se a consulta falhar (offline, por ex.), libera o feed em vez de travar
    // o usuário atrás do card.
    const hasNoMoments = FORCE_NO_MOMENTS || (!accountMomentsFailed && createdMomentsCount === 0)
    // Enquanto não sabemos, não renderiza nem feed nem card — evita o card
    // piscar para quem já tem momentos (e vice-versa).
    const isCheckingMoments =
        !FORCE_NO_MOMENTS &&
        !accountMomentsFailed &&
        createdMomentsCount === undefined &&
        isLoadingAccountMoments

    // Só exibe o card quando SABEMOS que a localização não está concedida
    // (foregroundStatus é null enquanto a permissão ainda não foi consultada,
    // evitando um flash do card antes de o feed carregar).
    const locationDenied =
        foregroundStatus != null && foregroundStatus !== Location.PermissionStatus.GRANTED

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true
            ;(async () => {
                try {
                    setChecked(false)
                    // Revalida ao voltar do fluxo de criação: é o que destrava
                    // o feed logo após o primeiro momento ser publicado.
                    await Promise.all([
                        refresh(),
                        refreshPermissions(),
                        // `refetch` ignora o `enabled`, então só chama com token.
                        hasToken ? refetchAccountMoments() : Promise.resolve(),
                    ])
                } catch {
                } finally {
                    setChecked(true)
                }
            })()
            return () => {
                isActive = false
            }
        }, [refresh, refreshPermissions, refetchAccountMoments, hasToken]),
    )

    React.useEffect(() => {
        if (checked && hasMissingRequired && !onboardingPermissionsCompleted) {
            router.replace("/permissions")
        }
    }, [checked, hasMissingRequired, onboardingPermissionsCompleted, router])

    return (
        <View style={{ flex: 1, backgroundColor: colors.gray.black }}>
            {locationDenied ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: insets.top + HEADER_TOP_INSET,
                    }}
                >
                    <LocationNotProvidedCard />
                </View>
            ) : isCheckingMoments ? null : hasNoMoments ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: insets.top + HEADER_TOP_INSET,
                    }}
                >
                    <NoMomentsCard />
                </View>
            ) : (
                <ListMoments />
            )}
            {shouldShowFeedTutorial && <TutorialDialog />}
        </View>
    )
}
