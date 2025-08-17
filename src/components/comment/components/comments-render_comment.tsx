import { TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../layout/constants/colors"

import React from "react"
import PersistedContext from "../../../contexts/Persisted"
import { timeDifferenceConverter } from "../../../helpers/dateConversor"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import MomentContext from "../../moment/context"
import { Text } from "../../Themed"
import { UserShow } from "../../user_show"
import { CommentsRenderCommentProps } from "../comments-types"

export default function RenderComment({ comment, preview, index }: CommentsRenderCommentProps) {
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const [like, setLike] = React.useState(comment.is_liked)

    // Verificar se o MomentContext está disponível
    let momentUserActions: any = null
    try {
        const momentContext = React.useContext(MomentContext)
        momentUserActions = momentContext?.momentUserActions
    } catch (error) {
        // MomentContext não está disponível, funcionalidade de like será limitada
    }

    const container: ViewStyle = {
        flexDirection: "row",
        marginTop: preview ? sizes.margins["1sm"] * 0.8 : sizes.margins["1sm"] * 0.5,
        marginBottom: preview ? sizes.margins["1sm"] * 0.5 : sizes.margins["1sm"],
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
        padding: sizes.paddings["1sm"],
        flex: 1,
    }
    const container_left: ViewStyle = {
        left: -2,
        alignItems: "center",
        justifyContent: "flex-start",
        marginRight: sizes.margins["1sm"] / 2,
    }
    const container_center: ViewStyle = {
        top: preview ? 0 : -4,
        left: -2,
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
    }
    const container_center_top: ViewStyle = {
        flexDirection: "row",
        marginBottom: sizes.margins["1sm"] * 0.5,
    }
    const content_style: TextStyle = {
        marginTop: preview ? -2 : 2,
        fontSize: preview ? fonts.size.body * 0.9 : fonts.size.body * 0.85,
        fontFamily: preview ? fonts.family.Medium : fonts.family.Semibold,
        lineHeight: preview ? fonts.size.body * 1.2 : fonts.size.body,
    }
    const date_style: TextStyle = {
        marginLeft: 5,
        fontSize: preview ? fonts.size.caption1 : fonts.size.caption1 * 1.1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    /**
    const likesNum = like
        ? comment.statistics.total_likes_num + 1
        : comment.statistics.total_likes_num
    const likeLabel = likesNum == 1 ? "like" : "likes"

    async function handleLikePress() {
        if (!momentUserActions) {
            console.log("Não é possível curtir comentário sem MomentContext")
            return
        }

        if (like) {
            momentUserActions.setLikeComment(false)
            setLike(false)
            Vibrate("effectTick")
            await api
                .post(
                    `/moments/comments/${comment.id}/unlike`,
                    {},
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .catch((error) => console.log(error))
        } else {
            momentUserActions.setLikeComment(true)
            setLike(true)
            Vibrate("effectClick")
            await api
                .post(
                    `/moments/comments/${comment.id}/like`,
                    {},
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .catch((error) => console.log(error))
        }
    }
    */

    return (
        <View style={container}>
            <View style={container_left}>
                <UserShow.Root data={comment.user}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{ width: preview ? 28 : 32, height: preview ? 28 : 32 }}
                        displayOnMoment={false}
                    />
                </UserShow.Root>
            </View>
            <View style={container_center}>
                <View style={container_center_top}>
                    <UserShow.Root data={comment.user}>
                        <UserShow.Username
                            displayOnMoment={false}
                            truncatedSize={18}
                            color={ColorTheme().textDisabled}
                            fontFamily={fonts.family.Medium}
                            fontSize={preview ? fonts.size.caption1 : fonts.size.caption1 * 1.1}
                            margin={0}
                        />
                    </UserShow.Root>
                    <Text style={date_style}>•</Text>
                    <Text style={date_style}>
                        {timeDifferenceConverter({
                            date: String(comment.created_at),
                            small: false,
                        })}
                    </Text>
                </View>
                <Text style={content_style}>{comment.content}</Text>
            </View>
        </View>
    )
}
