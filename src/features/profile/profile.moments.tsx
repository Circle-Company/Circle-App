import { View, StyleSheet, Dimensions, FlatList, ViewToken } from "react-native"
import { Moment } from "@/components/moment"
import { dataProps } from "@/components/moment/context/types"
import sizes from "@/constants/sizes"
import { AccountMoment } from "@/queries/account"
import { colors } from "@/constants/colors"
import React from "react"
import PersistedContext from "@/contexts/Persisted"
import { DropDownMenuIOS } from "@/features/account/account.moments.dropdown.menu"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { ProfileMomentEmpty } from "@/features/profile/profile.moments.empty"

const { width } = Dimensions.get("window")
const SPACING = 5
const NUM_COLUMNS = 2
const ITEM_SIZE = (width - (NUM_COLUMNS + 1) * SPACING) / NUM_COLUMNS

type AccountMomentsProps = {
    moments: AccountMoment[]
    totalMoments?: number
}

export function ProfileMoments({ moments, totalMoments }: AccountMomentsProps) {
    const { session } = React.useContext(PersistedContext)

    const [visibleMomentIds, setVisibleMomentIds] = React.useState<Set<string>>(new Set())

    const flatListRef = React.useRef<FlatList>(null)

    // moved empty state rendering to main return to preserve hook order

    // Convert moments to dataProps
    const userId = session?.user?.id || ""
    const username = session?.user?.username || ""
    const profilePicture = session?.user?.profilePicture ?? null
    const isVerified = session?.user?.isVerified || false

    // Callback para rastrear itens visíveis
    const onViewableItemsChanged = React.useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const newVisibleIds = new Set(
                viewableItems
                    .filter((item) => item.isViewable && item.item)
                    .map((item) => item.item.id),
            )
            setVisibleMomentIds(newVisibleIds)
        },
        [],
    )

    function deleteMoment() {}

    const viewabilityConfig = React.useRef({
        minimumViewTime: 0,
        viewAreaCoveragePercentThreshold: 50, // 50% do item visível
        waitForInteraction: false,
    }).current

    const renderItem = React.useCallback(
        ({ item, index }: { item: dataProps; index: number }) => {
            const isVisible = visibleMomentIds.has(item.id)

            return (
                <View style={styles.momentWrapper}>
                    <DropDownMenuIOS onDelete={deleteMoment}>
                        <Moment.Root.Main
                            size={{
                                ...sizes.moment.small,
                                width: ITEM_SIZE,
                                height: ITEM_SIZE * sizes.moment.aspectRatio,
                                borderRadius: sizes.moment.small.borderRadius * 0.7,
                            }}
                            isFeed={false}
                            isFocused={isVisible}
                            data={item}
                        >
                            <Moment.Container
                                contentRender={item.media}
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
                    </DropDownMenuIOS>
                </View>
            )
        },
        [visibleMomentIds],
    )

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={moments as any}
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
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ProfileMomentEmpty username={username} isAccount={true} />
                    </View>
                }
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
        borderWidth: iOSMajorVersion! >= 26 ? 0 : 1,
        borderColor: iOSMajorVersion! >= 26 ? "#00000000" : colors.gray.grey_09,
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
