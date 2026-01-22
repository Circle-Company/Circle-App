import { Animated, ViewStyle } from "react-native"

import AddIcon from "@/assets/icons/svgs/plus_circle-outline.svg"
import ColorTheme from "@/constants/colors"
import { Comments } from "@/components/comment"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/language"
import { dataProps } from "@/components/moment/context/types"
import React from "react"
import ViewMorebutton from "@/components/buttons/view_more"

type renderCommentProps = {
    moment: dataProps
    focused: boolean
}

export default function RenderComment({ moment, focused }: renderCommentProps) {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible, setFocusedMoment } =
        React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))
    const comments = Array.isArray(moment.comments) ? moment.comments : []

    React.useEffect(() => {
        if (focused) {
            Animated.timing(animatedOpacityValue, {
                toValue: commentEnabled ? 0 : 1,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            if (!commentEnabled) {
                Animated.timing(animatedOpacityValue, {
                    delay: 0,
                    toValue: 1,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true,
                }).start()
            }
        }
    }, [commentEnabled, focused, animatedOpacityValue])

    const animated_header_container: ViewStyle = {
        opacity: animatedOpacityValue,
    }

    const iconStyle = { top: 0.6 }

    function handlePress() {
        if (commentEnabled) {
            setCommentEnabled(false)
            setKeyboardVisible(false)
        } else {
            setCommentEnabled(true)
            setKeyboardVisible(true)
            setFocusedMoment(moment)
        }
    }

    return (
        <Comments.MainRoot data={moment.comments} preview={true}>
            <Comments.Container focused={focused}>
                <Animated.View style={animated_header_container}>
                    <Comments.TopRoot>
                        <Comments.TopLeftRoot>
                            <Comments.HeaderLeft>
                                <></>
                            </Comments.HeaderLeft>
                        </Comments.TopLeftRoot>
                        <Comments.TopRightRoot>
                            <ViewMorebutton
                                action={handlePress}
                                text={t("Add Comment")}
                                icon={
                                    <AddIcon
                                        style={iconStyle}
                                        fill={ColorTheme().primary.toString()}
                                        width={12}
                                        height={12}
                                    />
                                }
                            />
                        </Comments.TopRightRoot>
                    </Comments.TopRoot>
                </Animated.View>

                <Comments.CenterRoot>
                    <Comments.ListComments comment={comments} />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}
