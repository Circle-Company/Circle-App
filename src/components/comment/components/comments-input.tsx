import React from "react"
import { View, Text, Animated, Pressable, TextInput, KeyboardAvoidingView} from "react-native"
import { CommentsInputProps } from "../comments-types"
import { useCommentsContext } from "../comments-context"
import { useMomentContext } from "../../moment/moment-context"
import sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { BlurView } from "@react-native-community/blur"

import Arrowbottom from "../../../assets/icons/svgs/paper_plane.svg"

export default function input ({
    placeholder = "Send Comment..."
}: CommentsInputProps) {
    const { comment } = useCommentsContext()
    const {momentSizes} = useMomentContext()

    var animatedScale = React.useRef(new Animated.Value(0)).current


    React.useEffect(() => { animatedScale.setValue(1) }, [])
    const handleButtonPress = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const blur_container: any = {
        borderRadius: sizes.inputs.height/2,
        overflow: 'hidden',
    }

    const input_container: any = {
        width: '100%',
        height: sizes.inputs.height,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: sizes.inputs.height/2,
        paddingLeft: sizes.inputs.paddingHorizontal,
        backgroundColor: ColorTheme().blur_button_color,
        paddingRight: 9
    }
    const text:any = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 14,
        color: colors.gray.white
    }
    const placeholderStyle:any = {
        flex: 1,
        fontFamily: fonts.family.Medium,
        fontSize: 14,
        color: colors.gray.white
    }
    const textContainer:any = {
        marginLeft: 5,
        height: sizes.inputs.height,
        justifyContent: 'center',
        flex: 1
    }
    const pressable_style:any = {
        width: 40,
        height: 40,
    }
    const iconContainer:any = {
        width: 40,
        borderRadius: 40 / 2,
        height: 40,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.transparent.white_10
    }
    return (
         <View style={blur_container}>
            <BlurView
                overlayColor={String(colors.transparent.black_00)}
                blurAmount={sizes.blur.blurAmount*1.5}
            >
                <View style={input_container}>
                    <View style={textContainer}>
                        <TextInput
                            style={text}
                            placeholder={placeholder}
                            placeholderTextColor={String(colors.transparent.white_80)}
                            numberOfLines={1}
                            
                        />
                    </View>
                    <Pressable onPress={(n) => { handleButtonPress() }} style={pressable_style}>
                        <Animated.View style={[iconContainer, { transform: [{ scale: animatedScale }] }]}>
                            <Arrowbottom fill={String(colors.transparent.white_60)} width={16} height={16}/>
                        </Animated.View>                                
                    </Pressable>

                </View>
            </BlurView>            
        </View>            


   

    )
}