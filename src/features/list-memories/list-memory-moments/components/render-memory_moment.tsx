import React from "react"
import { Animated, View } from "react-native"
import { Moment } from "../../../../components/moment"
import { MomentDataProps } from "../../../../components/moment/context/types"
import { colors } from "../../../../constants/colors"
import sizes from "../../../../constants/sizes"
import FeedContext from "../../../../contexts/Feed"

type RenderMemoryMomenProps = {
    moment: MomentDataProps
    focused?: boolean
}
export function RenderMemoryMoment({ moment, focused = true }: RenderMemoryMomenProps) {
    const { setFocusedMoment } = React.useContext(FeedContext)
    const [animatedValue] = React.useState(new Animated.Value(0))
    const [opacityValue] = React.useState(new Animated.Value(1))
    const [footerOpacityValue] = React.useState(new Animated.Value(1))

    React.useEffect(() => {
        if (focused) setFocusedMoment(moment)
    }, [focused])

    React.useEffect(() => {
        if (focused) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 300, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(footerOpacityValue, {
                toValue: 1,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(animatedValue, {
                toValue: 0.2,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(opacityValue, {
                toValue: 0.4,
                duration: 300, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
            Animated.timing(footerOpacityValue, {
                toValue: 0,
                duration: 200, // Adjust duration as needed
                useNativeDriver: true,
            }).start()
        }
    }, [focused])

    const scale = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.2],
    })
    const container: any = {
        opacity: opacityValue,
        transform: [{ scale: scale }],
    }
    const top_container: any = {
        opacity: footerOpacityValue,
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
        marginBottom: sizes.margins["2sm"],
    }
    const footer_container: any = {
        opacity: footerOpacityValue,
        marginTop: sizes.margins["1sm"],
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1sm"] / 2,
    }
    const footer_left_container: any = {
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        flex: 1,
    }
    const footer_right_container: any = {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
    }

    return (
        <Animated.View style={container}>
            <Moment.Root.Main
                momentData={moment}
                isFeed={true}
                isFocused={focused}
                momentSize={sizes.moment.small}
            >
                <Animated.View style={top_container}>
                    <Moment.Date color={String(colors.gray.white)} />
                </Animated.View>
                <Moment.Container contentRender={moment.midia} isFocused={focused} blurRadius={40}>
                    <Moment.Root.Center>
                        <Moment.Description />
                    </Moment.Root.Center>
                </Moment.Container>
                <Animated.View style={footer_container}>
                    <View style={footer_left_container}>
                        <Moment.LikeButton
                            isLiked={moment.is_liked}
                            backgroundColor={String(colors.gray.grey_07)}
                        />
                    </View>
                    <View style={footer_right_container}>
                        <Moment.MoreButton
                            color={String(colors.gray.white)}
                            backgroundColor={String(colors.gray.grey_07)}
                        />
                    </View>
                    {/**
                     * 
                    <View style={footer_right_container}>
                        <View style={{marginRight: sizes.margins['2sm']}}>
                            <Moment.ShareButton color={String(colors.gray.white)} backgroundColor={String(colors.gray.grey_07)}/>
                        </View>
                        <Moment.MoreButton color={String(colors.gray.white)} backgroundColor={String(colors.gray.grey_07)}/>
                    </View>                     * 
                     * 
                     * 
                     */}
                </Animated.View>
            </Moment.Root.Main>
        </Animated.View>
    )
}
