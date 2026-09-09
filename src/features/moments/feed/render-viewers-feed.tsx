import React from "react"
import { View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated"
import { Text } from "@/components/Themed"
import { Viewers } from "@/components/viewers"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { flattenViewers, latestStats, useMomentViewersQuery } from "@/queries/moment.viewers"
import { VIEWERS_MOVE_UP, VIEWERS_OPEN_SCALE } from "@/features/moments/viewers/useViewersPanel"

// O card encolhe em torno do próprio centro, então metade do que ele perde em
// altura vira espaço livre embaixo — mais a subida. É exatamente esse espaço
// que o painel ocupa, por isso a margem negativa: ele começa colado na base
// visual do moment, e não onde o card estaria em escala cheia.
const MOMENT_HEIGHT = sizes.moment.standart.height
const GAINED_SPACE = ((1 - VIEWERS_OPEN_SCALE) * MOMENT_HEIGHT) / 2 + VIEWERS_MOVE_UP
/** Área que o bloco de comentários já ocupava abaixo do moment. */
const COMMENTS_AREA = 125
const PANEL_HEIGHT = GAINED_SPACE + COMMENTS_AREA
/** Sobra do cabeçalho (título + fechar) dentro do painel. */
const HEADER_HEIGHT = 34

type renderViewersFeedProps = {
    momentId: string
    focused: boolean
    openProgress: SharedValue<number>
    scrollY: SharedValue<number>
}

/**
 * "Quem viu este moment" no lugar do bloco de comentários, enquanto o card
 * encolhe e sobe. O scroll da lista alimenta `scrollY`, que a tela usa para
 * continuar interpolando a escala do moment até o limite.
 */
export default function RenderViewersFeed({
    momentId,
    focused,
    openProgress,
    scrollY,
}: renderViewersFeedProps) {
    const { t } = React.useContext(LanguageContext)

    const {
        data,
        error,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMomentViewersQuery(String(momentId))

    const viewers = React.useMemo(() => flattenViewers(data), [data])
    const stats = React.useMemo(() => latestStats(data), [data])

    const panelStyle = useAnimatedStyle(() => {
        "worklet"
        return { opacity: openProgress.value }
    }, [])

    const panel: ViewStyle = {
        marginTop: -GAINED_SPACE,
        height: PANEL_HEIGHT,
    }

    const titleStyle = {
        color: colors.gray.grey_04,
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
    }

    const title = stats?.uniqueViewers ? `${stats.uniqueViewers} ${t("Viewers")}` : t("Viewers")

    return (
        <Animated.View style={[panel, panelStyle]}>
            <Viewers.MainRoot
                data={viewers}
                stats={stats}
                momentId={String(momentId)}
                errorCode={error ? (error.code ?? "UNKNOWN") : undefined}
                loading={isLoading}
            >
                <Viewers.Container focused={focused}>
                    <Viewers.TopRoot>
                        <Viewers.TopLeftRoot>
                            <Viewers.HeaderLeft>
                                <Text style={titleStyle} numberOfLines={1} ellipsizeMode="tail">
                                    {title}
                                </Text>
                            </Viewers.HeaderLeft>
                        </Viewers.TopLeftRoot>
                        {/* Sem botão de fechar: tocar no moment é a saída. */}
                        <Viewers.TopRightRoot>
                            <></>
                        </Viewers.TopRightRoot>
                    </Viewers.TopRoot>

                    <Viewers.CenterRoot>
                        <View style={{ paddingHorizontal: sizes.paddings["1sm"] * 0.5 }}>
                            <Viewers.ListViewers
                                height={PANEL_HEIGHT - HEADER_HEIGHT}
                                scrollY={scrollY}
                                refreshing={isRefetching && !isFetchingNextPage}
                                onRefresh={refetch}
                                loadingMore={isFetchingNextPage}
                                onEndReached={() => {
                                    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
                                }}
                            />
                        </View>
                    </Viewers.CenterRoot>
                </Viewers.Container>
            </Viewers.MainRoot>
        </Animated.View>
    )
}
