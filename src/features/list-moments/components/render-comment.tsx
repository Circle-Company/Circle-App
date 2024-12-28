import React from "react"
import { Animated } from "react-native"
import AddIcon from "../../../assets/icons/svgs/plus_circle-outline.svg"
import ViewMorebutton from "../../../components/buttons/view_more"
import { Comments } from "../../../components/comment"
import { MomentDataProps } from "../../../components/moment/context/types"
import FeedContext from "../../../contexts/Feed"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme from "../../../layout/constants/colors"

type renderCommentProps = {
    moment: MomentDataProps
    focused: boolean
}

export default function render_comment({ moment, focused }: renderCommentProps) {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible, setFocusedMoment } =
        React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))
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
    }, [commentEnabled])

    const animated_header_container: any = {
        opacity: animatedOpacityValue,
    }

    function handlePress() {
        if (commentEnabled) setCommentEnabled(false)
        else setCommentEnabled(true)
        setKeyboardVisible(true)
        setFocusedMoment(moment)
    }

    return (
        <Comments.MainRoot data={moment.comments} preview={true}>
            <Comments.Container focused={focused}>
                <Animated.View style={animated_header_container}>
                    <Comments.TopRoot>
                        <Comments.TopLeftRoot>
                            <Comments.HeaderLeft />
                        </Comments.TopLeftRoot>
                        <Comments.TopRightRoot>
                            <ViewMorebutton
                                action={handlePress}
                                text={t("Add Comment")}
                                icon={
                                    <AddIcon
                                        style={{ top: 0.6 }}
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
                    <Comments.ListComments />
                </Comments.CenterRoot>
            </Comments.Container>
        </Comments.MainRoot>
    )
}
