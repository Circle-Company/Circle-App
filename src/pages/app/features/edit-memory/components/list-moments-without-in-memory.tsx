import {
    Animated,
    Easing,
    FlatList,
    Keyboard,
    TextStyle,
    View,
    ViewStyle,
    useColorScheme,
} from "react-native"
import ColorTheme, { colors } from "../../../../../constants/colors"

import AddIcon from "@/assets/icons/svgs/plus_circle-outline.svg"
import React from "react"
import { Text } from "../../../../../components/Themed"
import ViewMorebutton from "../../../../../components/buttons/view_more"
import OfflineCard from "../../../../../components/general/offline"
import fonts from "../../../../../constants/fonts"
import sizes from "../../../../../constants/sizes"
import PersistedContext from "../../../../../contexts/Persisted"
import LanguageContext from "../../../../../contexts/Preferences/language"
import MemoryContext from "../../../../../contexts/memory"
import NetworkContext from "../../../../../contexts/network"
import api from "../../../../../services/Api"
import EditMemoryContext from "../edit_memory_context"
import AnyMomentsWithoutInMemory from "./any-moments-without-in-memory"
import RenderEndReached from "./render-end-reached"
import RenderMoment from "./render-moments"

type Moment = {
    id: number
    content_type: "IMAGE" | "VIDEO"
    midia: any
}

export default function ListMomentsWithoutInMemory() {
    // Contexts
    const { memory } = React.useContext(MemoryContext)
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { networkStats } = React.useContext(NetworkContext)
    const { selectedMoments, addMoments } = React.useContext(EditMemoryContext)
    const isDarkMode = useColorScheme() === "dark"

    // States
    const [allMoments, setAllMoments] = React.useState<Moment[]>([])
    const [loading, setLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [pageSize] = React.useState(15)
    const [endReached, setEndReached] = React.useState(false)
    const animation = React.useRef(new Animated.Value(-sizes.headers.height * 0.8)).current

    // Styles
    const styles = {
        container: {
            marginTop: sizes.paddings["1sm"],
            width: sizes.screens.width - sizes.paddings["1sm"] * 2,
            marginHorizontal: sizes.paddings["1sm"],
            backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
            borderRadius: sizes.borderRadius["1md"],
            transform: [{ translateY: animation }],
        } as ViewStyle,
        itemContainer: {
            width: sizes.screens.width - sizes.paddings["1sm"] * 2,
            paddingHorizontal: 8,
        } as ViewStyle,
        titleStyle: {
            alignSelf: "center" as const,
            fontSize: fonts.size.body * 0.9,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().text,
            flex: 1,
        } as TextStyle,
        header: {
            width: sizes.screens.width - sizes.paddings["1sm"] * 2,
            height: sizes.headers.height * 0.8,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            flexDirection: "row" as const,
            paddingHorizontal: sizes.paddings["1md"] * 0.7,
        } as ViewStyle,
        addButtonContainer: {
            opacity: selectedMoments.length > 0 ? 1 : 0.25,
        } as ViewStyle,
        columnWrapper: {
            justifyContent: "space-between" as const,
        } as ViewStyle,
        endReachedContainer: {
            alignSelf: "center" as const,
            paddingVertical: sizes.paddings["1sm"],
        } as ViewStyle,
        addIcon: {
            top: 0.5,
        },
    }

    // Handlers
    const handleAddMoments = async () => {
        if (selectedMoments.length > 0) {
            await addMoments()
        }
    }

    const fetchMoments = React.useCallback(async () => {
        try {
            const response = await api.get(`/moments/tiny/exclude-memory/${memory.id}`, {
                headers: { Authorization: session.account.jwtToken },
            })

            if (page === 1) {
                setAllMoments(response.data)
            } else {
                setAllMoments((prev) => [...prev, ...response.data])
            }

            setEndReached(response.data.length < pageSize)
        } catch (error) {
            console.error("Erro ao buscar momentos:", error)
        }
    }, [memory.id, session.account.jwtToken, page, pageSize])

    const handleLoadMore = () => {
        if (!loading && !endReached) {
            setPage((prev) => prev + 1)
            fetchMoments()
        }
    }

    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }: any) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom
    }

    // Effects
    React.useEffect(() => {
        setPage(1)
        setLoading(true)
        fetchMoments().finally(() => {
            setLoading(false)
        })
    }, [fetchMoments])

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })

        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            Animated.timing(animation, {
                toValue: -sizes.headers.height * 0.8,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start()
        })

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [animation])

    if (networkStats === "OFFLINE" && allMoments.length === 0) {
        return <OfflineCard height={(sizes.screens.height - sizes.headers.height) / 2} />
    }

    return (
        <Animated.View style={styles.container}>
            {allMoments.length > 0 ? (
                <>
                    <View style={styles.header}>
                        <Text style={styles.titleStyle}>{t("Add Moments")}</Text>
                        <View style={styles.addButtonContainer}>
                            <ViewMorebutton
                                text={t("Add")}
                                icon={
                                    <AddIcon
                                        style={styles.addIcon}
                                        width={12}
                                        height={12}
                                        fill={colors.blue.blue_05.toString()}
                                    />
                                }
                                action={handleAddMoments}
                            />
                        </View>
                    </View>

                    <FlatList
                        data={allMoments}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.itemContainer}
                        columnWrapperStyle={styles.columnWrapper}
                        numColumns={3}
                        renderItem={({ item }) => <RenderMoment moment={item} />}
                        ListFooterComponent={() => {
                            if (endReached)
                                return (
                                    <View style={styles.endReachedContainer}>
                                        <RenderEndReached text="Crie um novo Moment" />
                                    </View>
                                )
                            return null
                        }}
                        onEndReachedThreshold={0.1}
                        onEndReached={handleLoadMore}
                        onScroll={({ nativeEvent }) => {
                            if (!endReached && isCloseToBottom(nativeEvent)) {
                                handleLoadMore()
                            }
                        }}
                        scrollEventThrottle={400}
                    />
                </>
            ) : (
                <AnyMomentsWithoutInMemory />
            )}
        </Animated.View>
    )
}
