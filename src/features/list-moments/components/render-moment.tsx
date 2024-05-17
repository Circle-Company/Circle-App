import React from 'react'
import sizes from '../../../layout/constants/sizes'
import { Moment } from '../../../components/moment'
import { UserShow } from '../../../components/user_show'
import RenderComment from './render-comment'
import FeedContext from '../../../contexts/Feed'
import { View, Animated } from 'react-native'
import { MomentDataProps } from '../../../components/moment/context/types'

type renderMomentProps = {
    momentData: MomentDataProps,
    isFocused: boolean,
    isFeed: boolean
}

export default function render_moment ({
    momentData,
    isFocused,
    isFeed
}: renderMomentProps) {
    const { commentEnabled } = React.useContext(FeedContext)
    const [animatedValue] = React.useState(new Animated.Value(0))
    const [commentValue] = React.useState(new Animated.Value(0))
    const [opacityValue] = React.useState(new Animated.Value(1))

    React.useEffect(() => {
        if(isFocused){
            if(commentEnabled) {
                Animated.timing(
                    animatedValue,
                    {
                        toValue: 1,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();
                Animated.timing(
                    commentValue,
                    {
                        toValue: 1,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();
            }else {
                Animated.timing(
                    animatedValue,
                    {
                        toValue: 0,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();       
                
                Animated.timing(
                    commentValue,
                    {
                        toValue: 0,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();
            }
        } else {
            if(commentEnabled){
                Animated.timing(
                    opacityValue,
                    {
                        toValue: 0,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start(); 
            }else {
                Animated.timing(
                    opacityValue,
                    {
                        delay: 100,
                        toValue: 1,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();    
                Animated.timing(
                    commentValue,
                    {
                        toValue: 0,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();          
            }
       
        }
    }, [commentEnabled])

    React.useEffect(() => {
        if(isFocused){
            Animated.timing(
                animatedValue,
                {
                    toValue: 0,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true
                }
            ).start();
            Animated.timing(
                opacityValue,
                {
                    toValue: 1,
                    duration: 100, // Adjust duration as needed
                    useNativeDriver: true
                }
            ).start();

        } else {
            Animated.timing(
                animatedValue,
                {
                    toValue: 0.03,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true
                }
            ).start();
            Animated.timing(
                opacityValue,
                {
                    toValue: 0.8,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true
                }
            ).start();
        }

    }, [ isFocused ])

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -175], // Adjust the value as needed
    });
    const scale = animatedValue.interpolate({
        inputRange: [0, 0.4],
        outputRange: [1, 0.31], // Adjust the value as needed
    })

    const translateCommentsY = commentValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -sizes.screens.height/1.9], // Adjust the value as needed
    });

    const animated_container: any = {
        opacity: opacityValue,
        transform: [
            { translateY: isFocused ? translateY : 0 },
            { scale: scale },
        ]
    }

    const animated_comment_container: any = {
        transform: [
            { translateY: isFocused ? translateCommentsY : 0 },
        ]
    }
    return (
        <Moment.Root.Main momentData={momentData} isFeed={isFeed} isFocused={isFocused} momentSize={sizes.moment.standart}>
            <Animated.View style={animated_container}>
                    <Moment.Container contentRender={momentData.midia} isFocused={isFocused} blurRadius={30}>
                        <Moment.Root.Top>
                            <Moment.Root.TopLeft>
                                <UserShow.Root data={momentData.user}>
                                    <UserShow.ProfilePicture pictureDimensions={{ width: 30, height: 30 }} />
                                    <UserShow.Username truncatedSize={8} />
                                    <UserShow.FollowButton isFollowing={false} displayOnMoment={true} />
                                </UserShow.Root>
                            </Moment.Root.TopLeft>
                            <Moment.Root.TopRight>
                                <Moment.LikeButton isLiked={false}/>
                            </Moment.Root.TopRight>
                        </Moment.Root.Top>

                        <Moment.Root.Center>
                            <View style={{ marginBottom: sizes.margins['2sm'] }}>
                                <Moment.Description />
                            </View>
                        </Moment.Root.Center>
                    </Moment.Container>                    

            </Animated.View>


            <Animated.View style={animated_comment_container}>
                <RenderComment moment={momentData} focused={isFocused} />
            </Animated.View>
        </Moment.Root.Main>
    )
}
