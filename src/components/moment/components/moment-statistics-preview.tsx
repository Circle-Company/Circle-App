import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { FlatList, View } from "react-native"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { apiRoutes } from "../../../services/Api"
import { Text } from "../../Themed"
import { MomentDataReturnsProps, MomentOptionsProps } from "../context/types"

type StatisticsPreviewProps = {
    momentData: MomentDataReturnsProps
    momentOptions: MomentOptionsProps
}

export function statisticsPreview({ momentOptions, momentData }: StatisticsPreviewProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [likes, setLikes] = React.useState("--")
    const [views, setViews] = React.useState("--")
    const [comments, setComments] = React.useState("--")

    async function fetch() {
        await apiRoutes.moment
            .statisticsPreview({
                momentId: momentData.id,
                authorizationToken: session.account.jwtToken,
            })
            .then((response) => {
                setLikes(response.data.total_likes_num)
                setViews(response.data.total_views_num)
                setComments(response.data.total_comments_num)
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

    const itemContainer: any = {
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
        color: ColorTheme().text,
    }

    const itemsToRender = [
        { title: t("Likes"), value: likes },
        { title: t("Views"), value: views },
        { title: t("Comments"), value: comments },
    ]

    if (!momentOptions.enableAnalyticsView) return null
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
