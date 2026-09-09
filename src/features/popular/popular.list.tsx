import React from "react"
import { FlatList, RefreshControl, TextStyle, View, ViewStyle } from "react-native"

import { Text } from "@/components/Themed"
import { NotificationSkeleton } from "@/components/notification/notification.skeleton"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { usePopularNearbyQuery } from "@/queries/radar"
import { PopularItem } from "./popular.item"

type PopularListProps = {
    latitude: number | null
    longitude: number | null
}

/**
 * Lista de "populares na sua região". O backend já filtra quem você não pode
 * mais convidar, então não existe estado "convite enviado" aqui: quem foi
 * convidado simplesmente sai da lista.
 */
export function PopularList({ latitude, longitude }: PopularListProps) {
    const { t } = React.useContext(LanguageContext)
    const { data, isLoading, isRefetching, refetch, error } = usePopularNearbyQuery({
        latitude,
        longitude,
    })

    // Removidos otimisticamente ao disparar o convite. Some no refetch seguinte,
    // que já vem sem eles — o Set só cobre a janela até a lista voltar.
    const [dismissed, setDismissed] = React.useState<Set<string>>(new Set())

    const people = React.useMemo(
        () => (data?.people ?? []).filter((p) => !dismissed.has(p.userId)),
        [data?.people, dismissed],
    )

    const handleInvited = React.useCallback((userId: string) => {
        setDismissed((prev) => new Set(prev).add(userId))
    }, [])

    const handleInviteFailed = React.useCallback(
        (userId: string) => {
            setDismissed((prev) => {
                const next = new Set(prev)
                next.delete(userId)
                return next
            })
            refetch()
        },
        [refetch],
    )

    // Zera o Set otimista quando uma resposta nova chega: ela já reflete os
    // convites enviados e passa a ser a fonte de verdade. Segurar os ids além
    // disso esconderia quem voltou a ser convidável — um convite recusado
    // devolve a pessoa para a lista. Ancorado em `generatedAt` (e não em
    // `isRefetching`) para o card só sair de vez quando a lista nova chega.
    React.useEffect(() => {
        setDismissed(new Set())
    }, [data?.generatedAt])

    const status = (error as any)?.response?.status

    const cardContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.9,
        borderRadius: sizes.borderRadius["1lg"] * 1.4,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
    }

    const cardTitle: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const cardDescription: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
    }

    const retryLabel: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    // 403 = sem a permissão VIEW_RADAR. A tela não deve existir para essa conta.
    if (status === 403) {
        return (
            <View style={cardContainer}>
                <Text style={cardTitle}>{t("Not available")}</Text>
                <Text style={cardDescription}>
                    {t("This feature is not available for your account.")}
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={cardContainer}>
                <Text style={cardTitle}>{t("Could not load")} 📡</Text>
                <Text style={cardDescription}>
                    {t("Something went wrong while looking for people near you.")}
                </Text>
                <View style={{ marginTop: sizes.margins["1md"] }}>
                    <ButtonStandart
                        action={() => refetch()}
                        margins={false}
                        height={sizes.buttons.height * 0.42}
                        backgroundColor={colors.gray.white}
                    >
                        <Text style={retryLabel}>{t("Try again")}</Text>
                    </ButtonStandart>
                </View>
            </View>
        )
    }

    // Sem coordenadas a query fica desabilitada, e query desabilitada não é
    // "loading" no react-query — sem este `hasCoords` a tela piscaria o estado
    // vazio enquanto o GPS ainda está sendo lido.
    const hasCoords = typeof latitude === "number" && typeof longitude === "number"

    if ((isLoading || !hasCoords) && people.length === 0) {
        return (
            <View
                style={{
                    paddingTop: sizes.paddings["1md"],
                    paddingHorizontal: sizes.margins["1md"],
                    gap: sizes.paddings["1sm"],
                }}
            >
                <NotificationSkeleton opacity={1} />
                <NotificationSkeleton opacity={0.7} />
                <NotificationSkeleton opacity={0.4} />
            </View>
        )
    }

    return (
        <FlatList
            data={people}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
                <PopularItem
                    person={item}
                    onInvited={handleInvited}
                    onInviteFailed={handleInviteFailed}
                />
            )}
            ItemSeparatorComponent={() => <View style={{ height: sizes.margins["2sm"] }} />}
            ListHeaderComponent={<View style={{ height: sizes.paddings["1md"] }} />}
            ListEmptyComponent={
                <View style={cardContainer}>
                    <Text style={cardTitle}>{t("Nobody new around here")} 🧭</Text>
                    <Text style={cardDescription}>
                        {t(
                            "When new people show up near you, they will appear here with an invite button.",
                        )}
                    </Text>
                </View>
            }
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor={colors.gray.grey_04}
                    colors={[colors.gray.grey_04]}
                />
            }
            contentContainerStyle={{ marginHorizontal: sizes.margins["1md"], flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
        />
    )
}

export default PopularList
