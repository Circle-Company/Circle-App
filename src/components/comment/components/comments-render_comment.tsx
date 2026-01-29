import { TextStyle, View, ViewStyle } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import { CommentsRenderCommentProps } from "../comments-types"
import { useLocaleDateRelative } from "@/lib/hooks/useLocaleDate"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { textLib } from "@/circle.text.library"

export default function RenderComment({ comment, preview, index }: CommentsRenderCommentProps) {
    const container: ViewStyle = {
        flexDirection: "row",
        marginTop: preview ? sizes.margins["1sm"] * 0.8 : 0,
        marginBottom: preview ? sizes.margins["1sm"] * 0.5 : 0,
        backgroundColor: preview ? colors.gray.grey_09 : "#FFFFFF09",
        borderRadius: sizes.borderRadius["1md"],
        padding: sizes.paddings["1sm"],
        minHeight: preview ? 40 : 32,
        alignItems: "center",
    }
    const container_left: ViewStyle = {
        alignItems: "center",
        justifyContent: "flex-start",
        marginRight: sizes.margins["1sm"] / 2,
    }
    const container_center: ViewStyle = {
        top: 0,
        left: 0,
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    }
    const container_center_top: ViewStyle = {
        flexDirection: "row",
        marginBottom: sizes.margins["1sm"] * 0.5,
    }
    const content_style: TextStyle = {
        marginTop: preview ? 0 : 5,
        fontSize: preview ? fonts.size.body * 0.9 : fonts.size.body * 1.05,
        fontFamily: preview ? fonts.family.Medium : fonts.family.Semibold,
        lineHeight: preview ? fonts.size.body * 1.4 : fonts.size.body * 1.3,
        width: "100%",
        flexShrink: 1,
    }
    const date_style: TextStyle = {
        marginLeft: 5,
        fontSize: preview ? fonts.size.caption1 : fonts.size.caption1 * 1.1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

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
                    <Text style={date_style}>{useLocaleDateRelative(comment.createdAt)}</Text>
                </View>
                <Text style={content_style}>
                    {textLib.conversor.sliceWithDots({
                        text: comment.content,
                        size: sizes.screens.width * 0.147,
                    })}
                </Text>
            </View>
        </View>
    )
}
