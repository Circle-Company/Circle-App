import { View, StyleSheet, Dimensions, FlatList, ViewToken } from "react-native"
import { Moment } from "@/components/moment"
import { MomentDataProps } from "@/components/moment/context/types"
import sizes from "@/constants/sizes"
import { AccountMoment } from "@/state/queries/account"
import { colors } from "@/constants/colors"
import React from "react"
import PersistedContext from "@/contexts/Persisted"
import { DateFormatter } from "@/shared/circle.text.library"
import LanguageContext from "@/contexts/Preferences/language"
import { LanguageType } from "@/locales/LanguageTypes"
import { EmptyList as MomentEmptyList } from "../list-moments/components/render-empty_list"

const { width } = Dimensions.get("window")
const SPACING = 5
const NUM_COLUMNS = 2
const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS

type AccountMomentsProps = {
    moments: AccountMoment[]
    totalMoments?: number
}

// Convert API AccountMoment to MomentDataProps format
function convertToMomentData(
    moment: AccountMoment,
    userId: string,
    username: string,
    profilePicture: string | null,
    verified: boolean,
): MomentDataProps {
    return {
        id: moment.id,
        user: {
            id: userId,
            username: username,
            verified: verified,
            profilePicture: profilePicture || "",
            youFollow: false,
            followYou: false,
        },
        description: moment.description || "",
        midia: {
            content_type: "VIDEO",
            fullhd_resolution: moment.video.url,
            nhd_resolution: moment.video.url,
            nhd_thumbnail: moment.thumbnail.url,
        },
        comments: [],
        statistics: {
            total_likes_num: 0,
            total_shares_num: 0,
            total_views_num: 0,
            total_comments_num: 0,
        },
        tags: [],
        language: "pt" as any,
        created_at: moment.publishedAt,
        is_liked: false,
    }
}

export function AccountMoments({ moments, totalMoments }: AccountMomentsProps) {
    const { session } = React.useContext(PersistedContext)
    const { atualAppLanguage } = React.useContext(LanguageContext)
    const [visibleMomentIds, setVisibleMomentIds] = React.useState<Set<string>>(new Set())
    const flatListRef = React.useRef<FlatList>(null)

    // Mapear LanguageType para DateFormatLocale (apenas valores aceitos pelo DateFormatter)
    function getDateLocale(language: LanguageType): "pt" | "en" {
        // Faz cast para string para evitar erro TS2367
        if (String(language) === "pt") return "pt"
        return "en"
    }

    // DateFormatter que reage às mudanças de idioma
    const dateFormatter = React.useMemo(
        () =>
            new DateFormatter({
                useApproximateTime: true,
                usePrefix: true,
                useSuffix: true,
                locale: getDateLocale(atualAppLanguage),
            }),
        [atualAppLanguage],
    )

    if (!moments || moments.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MomentEmptyList />
            </View>
        )
    }

    // Convert moments to MomentDataProps
    const convertedMoments = moments.map((moment) =>
        convertToMomentData(
            moment,
            session?.user?.id || "",
            session?.user?.username || "",
            session?.user?.profilePicture,
            session?.user?.isVerified || false,
        ),
    )

    // Callback para rastrear itens visíveis
    const onViewableItemsChanged = React.useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const newVisibleIds = new Set(
                viewableItems
                    .filter((item) => item.isViewable && item.item)
                    .map((item) => item.item.id),
            )
            setVisibleMomentIds(newVisibleIds)
        },
    ).current

    const viewabilityConfig = React.useRef({
        minimumViewTime: 0,
        viewAreaCoveragePercentThreshold: 50, // 50% do item visível
        waitForInteraction: false,
    }).current

    const renderItem = React.useCallback(
        ({ item, index }: { item: MomentDataProps; index: number }) => {
            const isVisible = visibleMomentIds.has(item.id)

            return (
                <View style={styles.momentWrapper}>
                    <Moment.Root.Main
                        momentSize={{
                            ...sizes.moment.small,
                            width: ITEM_SIZE,
                            height: ITEM_SIZE * sizes.moment.aspectRatio,
                            borderRadius: sizes.moment.small.borderRadius * 0.7,
                        }}
                        isFeed={false}
                        isFocused={isVisible}
                        momentData={item}
                    >
                        <Moment.Container
                            contentRender={item.midia}
                            isFocused={isVisible}
                            loading={false}
                            blurRadius={0}
                            forceMute={true}
                            showSlider={false}
                            disableCache={true}
                            // Vídeos em loop infinito: repeat={true} no MediaRenderVideo
                            // Sem onVideoEnd para manter loop contínuo e automático
                        >
                            <Moment.Root.Center />
                            <Moment.Root.Bottom>
                                <Moment.Description displayOnMoment={true} />
                            </Moment.Root.Bottom>
                        </Moment.Container>
                    </Moment.Root.Main>
                </View>
            )
        },
        [visibleMomentIds],
    )

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={convertedMoments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={NUM_COLUMNS}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                scrollEnabled={true}
                extraData={visibleMomentIds}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                removeClippedSubviews={true}
                maxToRenderPerBatch={6}
                windowSize={5}
            />
            <View style={{ height: 30, width: 10 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: SPACING,
    },
    listContent: {
        paddingHorizontal: SPACING,
    },
    row: {
        justifyContent: "flex-start",
        marginBottom: SPACING,
    },
    momentWrapper: {
        width: ITEM_SIZE,
        marginRight: SPACING,
        borderRadius: sizes.moment.small.borderRadius * 0.7,
        borderWidth: 1,
        borderColor: colors.gray.grey_09,
        overflow: "hidden",
    },
    emptyContainer: {
        padding: sizes.paddings["2md"],
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: colors.gray.grey_04,
        fontSize: 14,
    },
    headerContainer: {
        paddingHorizontal: SPACING,
        paddingBottom: sizes.paddings["1sm"],
    },
    totalText: {
        color: colors.gray.grey_06,
        fontSize: 14,
        fontWeight: "600",
    },
})
