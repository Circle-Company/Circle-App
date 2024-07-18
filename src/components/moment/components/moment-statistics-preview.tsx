import React from "react"
import { FlatList, View } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { apiRoutes } from "../../../services/Api"
import { Loading } from "../../loading"
import { Text } from "../../Themed"
import { MomentDataReturnsProps, MomentOptionsProps } from "../context/types"

type StatisticsPreviewProps = {
    momentData: MomentDataReturnsProps
    momentOptions: MomentOptionsProps
}

export function statisticsPreview({ momentOptions, momentData }: StatisticsPreviewProps) {
    const [isLoading, setIsLoading] = React.useState(true)
    const [likes, setLikes] = React.useState("--")
    const [views, setViews] = React.useState("--")
    const [comments, setComments] = React.useState("--")

    function fetch() {
        setIsLoading(true)
        apiRoutes.moment
            .statisticsPreview({ momentId: momentData.id })
            .then((response) => {
                setLikes(response.data.total_likes_num)
                setViews(response.data.total_views_num)
                setComments(response.data.total_comments_num)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    React.useEffect(() => {
        fetch()
    }, [])

    const container = {
        padding: sizes.paddings["2sm"],
        backgroundColor: ColorTheme().backgroundDisabled,
        borderRadius: sizes.borderRadius["1sm"] * 1.2,
    }

    const itemContainer = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const titleContainer = {
        flex: 1,
    }

    const title = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
    }

    const value = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary,
    }

    const itemsToRender = [
        { title: "Likes", value: likes },
        { title: "Views", value: views },
        { title: "Comments", value: comments },
    ]

    if (!momentOptions.enableAnalyticsView) return null
    if (isLoading) {
        return (
            <View style={container}>
                <Loading.Container width={"100%"} height={sizes.sizes["3md"]}>
                    <Loading.ActivityIndicator size={22} />
                </Loading.Container>
            </View>
        )
    }
    return (
        <View style={container}>
            <FlatList
                renderItem={({ item, index }) => {
                    return (
                        <View
                            key={index}
                            style={[
                                itemContainer,
                                {
                                    marginBottom:
                                        index < itemsToRender.length - 1 ? sizes.margins["2sm"] : 0,
                                },
                            ]}
                        >
                            <View style={titleContainer}>
                                <Text style={title}>{item.title}</Text>
                            </View>
                            <View>
                                <Text style={value}>{item.value}</Text>
                            </View>
                        </View>
                    )
                }}
                data={itemsToRender}
            />
        </View>
    )
}
