import React from "react"
import { View } from "../../components/Themed"
import { FlatList, Pressable, Text, useColorScheme } from "react-native"
import sizes from "../../layout/constants/sizes"
import { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import CloseIcon from "../../assets/icons/svgs/close.svg"
import NewMomentContext, { TagProps } from "../../contexts/newMoment"

export default function RenderTagsList() {
    const isDarkMode = useColorScheme() === "dark"
    const { tags, removeTag } = React.useContext(NewMomentContext)
    const [tagsRenderList, setTagsRenderList] = React.useState<TagProps[]>([])
    const flatListRef = React.useRef<FlatList>(null)
    const listContentSize = React.useRef<number>(0)

    React.useEffect(() => {
        setTagsRenderList(tags)
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [tags])

    const container: any = {
        flexDirection: "row",
        paddingTop: sizes.paddings["1sm"] * 0.5,
        width: sizes.screens.width,
    }

    const tag_container = {
        height: sizes.sizes["1md"] * 0.9,
        backgroundColor: isDarkMode ? `${colors.blue.blue_03}25` : `${colors.blue.blue_05}10`,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1sm"],
        borderRadius: (sizes.sizes["1md"] * 0.9) / 2,
        flexDirection: "row",
    }

    const icon_container: any = {
        padding: 3.7,
        borderRadius: 14 / 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.paddings["1sm"] / 2,
        backgroundColor: isDarkMode ? `${colors.blue.blue_01}25` : `${colors.blue.blue_05}20`,
    }

    const text_style: any = {
        fontFamily: fonts.family["Regular-Italic"],
        color: isDarkMode ? colors.blue.blue_01 : colors.blue.blue_05,
    }

    function handlePress(index: number) {
        removeTag(index)
    }

    return (
        <View style={container}>
            <FlatList
                horizontal={true}
                ref={flatListRef}
                showsHorizontalScrollIndicator={false}
                data={tagsRenderList}
                contentContainerStyle={{ paddingHorizontal: sizes.paddings["2sm"] }}
                onContentSizeChange={(contentWidth) => {
                    listContentSize.current = contentWidth
                    if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true })
                }}
                renderItem={({ item, index }) => {
                    return (
                        <View key={index} style={tag_container}>
                            <Text style={text_style}>#{item.title}</Text>
                            <Pressable
                                style={icon_container}
                                onPress={() => {
                                    handlePress(index)
                                }}
                            >
                                <CloseIcon
                                    fill={String(
                                        isDarkMode
                                            ? `${colors.blue.blue_01}70`
                                            : `${colors.blue.blue_06}40`
                                    )}
                                    width={7}
                                    height={7}
                                    strokeWidth={1.5}
                                    stroke={String(
                                        isDarkMode
                                            ? `${colors.blue.blue_01}70`
                                            : `${colors.blue.blue_06}40`
                                    )}
                                />
                            </Pressable>
                        </View>
                    )
                }}
            />
        </View>
    )
}
