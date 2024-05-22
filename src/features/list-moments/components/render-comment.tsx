import React from 'react'
import { Animated } from 'react-native'
import { Comments } from '../../../components/comment'
import AddIcon from '../../../assets/icons/svgs/plus_circle-outline.svg'
import FeedContext from '../../../contexts/Feed'
import ViewMorebutton from '../../../components/buttons/view_more'
import ColorTheme from '../../../layout/constants/colors'
import { MomentDataProps } from '../../../components/moment/context/types'
import { useKeyboardAnimation } from 'react-native-keyboard-controller'

type renderCommentProps = {
    moment: MomentDataProps,
    focused: boolean,
}

export default function render_comment ({moment, focused}: renderCommentProps) {
    const { height, progress } = useKeyboardAnimation()
    const { commentEnabled, setCommentEnabled, setShowKeyboard} = React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))

    React.useEffect(() => {
        if(focused){
            Animated.timing(
                animatedOpacityValue,
                {
                    toValue: commentEnabled ? 0 : 1,
                    duration: 200, // Adjust duration as needed
                    useNativeDriver: true
                }
            ).start();
            if (!commentEnabled) {
                Animated.timing(
                    animatedOpacityValue,
                    {
                        delay: 0,
                        toValue: 1,
                        duration: 200, // Adjust duration as needed
                        useNativeDriver: true
                    }
                ).start();
            } 
        }
    }, [commentEnabled])

    const animated_header_container: any = {
        opacity: animatedOpacityValue
    }

    function handlePress() {
        if(commentEnabled) setCommentEnabled(false)
        else setCommentEnabled(true); setShowKeyboard(true)
    }

    return (
            <Comments.MainRoot data={moment.comments}>
                <Comments.Container focused={focused}>
                    <Animated.View style={animated_header_container}>
                        <Comments.TopRoot>
                            <Comments.TopLeftRoot>
                                <Comments.HeaderLeft/>
                            </Comments.TopLeftRoot>
                            <Comments.TopRightRoot>
                                <ViewMorebutton
                                navigateTo=''
                                action={() => {handlePress()}}
                                text='Add Comment'
                                icon={
                                    <AddIcon
                                        style={{top: 0.6}}
                                        fill={ColorTheme().primary.toString()}
                                        width={12}
                                        height={12}
                                    />
                                }/>
                            </Comments.TopRightRoot>
                            
                        </Comments.TopRoot>                    
                    </Animated.View>

                    <Comments.CenterRoot>
                        <Comments.ListComments preview={true}/>                    
                    </Comments.CenterRoot>
                </Comments.Container>
            </Comments.MainRoot>                
  
    )
}