import { Animated, Text, TextStyle, ViewStyle, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../../../../../constants/colors"

import AddIcon from "@/assets/icons/svgs/plus_circle-outline.svg"
import React from "react"
import ButtonStandart from "../../../../../../components/buttons/button-standart"
import ViewMorebutton from "../../../../../../components/buttons/view_more"
import { Comments } from "../../../../../../components/comment"
import { CommentObject } from "../../../../../../components/comment/comments-types"
import PreviewCommentsList from "../../../../../../components/comment/components/comments-list_comments"
import FetchedCommentsList from "../../../../../../components/comment/components/fetched-comments-list"
import fonts from "../../../../../../constants/fonts"
import sizes from "../../../../../../constants/sizes"
import BottomSheetContext from "../../../../../../contexts/bottomSheet"
import FeedContext from "../../../../../../contexts/Feed"
import { MomentProps } from "../../../../../../contexts/Feed/types"
import LanguageContext from "../../../../../../contexts/Preferences/language"

type renderCommentFeedProps = {
    moment: MomentProps
    focused: boolean
}

export default function RenderCommentFeed({ moment, focused }: renderCommentFeedProps) {
    const { t } = React.useContext(LanguageContext)
    const { commentEnabled, setCommentEnabled, setKeyboardVisible } = React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))
    const [animatedHeaderOpacityValue] = React.useState(new Animated.Value(1))
    const { expand, collapse } = React.useContext(BottomSheetContext)
    const isDarkMode = useColorScheme() === "dark"

    function handlePressViewMore() {
        expand({
            enablePanDownToClose: true,
            enableHandlePanningGesture: true,
            enableContentPanningGesture: true,
            children: (
                <FetchedCommentsList
                    totalCommentsNum={moment.comments_count}
                    momentId={moment.id}
                />
            ),
            snapPoints: ["70%", "99%"],
            customStyles: {
                modal: {
                    width: sizes.screens.width,
                    marginHorizontal: 0,
                    paddingHorizontal: 0,
                },
                modalBackground: {
                    backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
                },
            },
        })
    }

    React.useEffect(() => {
        if (commentEnabled) {
            Animated.timing(animatedHeaderOpacityValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(animatedHeaderOpacityValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start()
        }
    }, [commentEnabled, animatedHeaderOpacityValue])

    React.useEffect(() => {
        Animated.timing(animatedOpacityValue, {
            toValue: focused ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start()
        Animated.timing(animatedHeaderOpacityValue, {
            toValue: focused ? 1 : 0,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [focused, animatedOpacityValue, animatedHeaderOpacityValue])

    const animated_header_container: ViewStyle = {
        opacity: animatedHeaderOpacityValue,
    }

    const animated_center_container: ViewStyle = {
        opacity: animatedOpacityValue,
    }

    const iconStyle = { top: 0.6 }

    const commentCountStyle: TextStyle = {
        fontSize: 12,
        color: ColorTheme().textDisabled,
        fontFamily: fonts.family.Medium,
    }
    const viewMoreTextStyle: TextStyle = {
        top: -4,
        fontSize: 12,
        color: ColorTheme().textDisabled,
        fontFamily: fonts.family["Medium-Italic"],
    }

    function handlePress() {
        setCommentEnabled(true)
        setKeyboardVisible(true)
    }

    // Adaptar os dados do feed para o formato esperado pelo componente Comments
    const commentsData: CommentObject[] = moment.lastComment
        ? [
              {
                  id: moment.lastComment.id,
                  user: {
                      id: String(moment.lastComment.user.id),
                      username: moment.lastComment.user.username,
                      verifyed: moment.lastComment.user.verifyed,
                      profile_picture: {
                          small_resolution:
                              moment.lastComment.user.profile_picture.small_resolution,
                          tiny_resolution: moment.lastComment.user.profile_picture.tiny_resolution,
                      },
                      you_follow: moment.lastComment.user.isFollowing,
                  },
                  content: moment.lastComment.content,
                  created_at: moment.lastComment.created_at,
                  statistics: moment.lastComment.statistics,
                  is_liked: false,
              },
          ]
        : []

    const commentsCount = moment.comments_count || 0

    return (
        <Comments.MainRoot data={commentsData} preview={true}>
            <Comments.Container focused={true}>
                <Animated.View style={animated_header_container}>
                    <Comments.TopRoot>
                        <Comments.TopLeftRoot>
                            <Comments.HeaderLeft>
                                <Text style={commentCountStyle}>
                                    {commentsCount > 0
                                        ? commentsCount > 1
                                            ? `${commentsCount} ${t("Comments")}`
                                            : `${commentsCount} ${t("Comment")}`
                                        : t("No Comments")}
                                </Text>
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
                <Animated.View style={animated_center_container}>
                    <Comments.CenterRoot>
                        <PreviewCommentsList comment={commentsData} />
                    </Comments.CenterRoot>

                    <ButtonStandart
                        style={{
                            alignSelf: "center",
                            marginVertical: 0,
                            paddingVertical: 0,
                            paddingHorizontal: 0,
                        }}
                        action={handlePressViewMore}
                        margins={false}
                        backgroundColor="transparent"
                    >
                        {commentsCount > 1 && (
                            <Text style={viewMoreTextStyle}>
                                {`${t("View more")} ${commentsCount - 1} ${
                                    commentsCount - 1 > 1 ? t("comments") : t("comment")
                                }`}
                            </Text>
                        )}
                    </ButtonStandart>
                </Animated.View>
            </Comments.Container>
        </Comments.MainRoot>
    )
}
