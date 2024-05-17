import React from 'react';
import { StatusBar,  useColorScheme, Animated, Keyboard, TextInput} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import { MidiaRender } from '../../../components/midia_render';
import NewMomentContext from '../../../contexts/newMoment';
import sizes from '../../../layout/constants/sizes';
import DescriptionInput from '../../../features/new_moment/components/input_description';
import TagsInput from '../../../features/new_moment/components/input_tags';
import RenderTagsList from '../../../features/new_moment/render-tags_list';


export default function NewMomentDescriptionScreen() {
    const isDarkMode = useColorScheme() === 'dark'

    const { selectedImage, getAllMemories} = React.useContext(NewMomentContext)
    const [keyboardIsVisible, setKeyboardIsVisible] = React.useState(false);
    const [animation] = React.useState(new Animated.Value(0))
    const [renderMemoryScale]: any = React.useState(new Animated.Value(1));

    const container: any = {
        alignItems:'center',
        top: keyboardIsVisible?  - sizes.sizes['2lg'] * 1.2 : sizes.sizes['1xxl']*0.1,
        flex: 1,
    }
    const moment_container: any = {
        marginTop: sizes.margins['1md'],
        overflow: 'hidden',
        borderRadius: sizes.moment.tiny.borderRadius
    }

    const inputs_container: any = {
        top: keyboardIsVisible?  - sizes.sizes['1lg'] : sizes.sizes['1xxl']*0.3,
    }

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardIsVisible(true)
            animateRenderMemoryScaleAndTranslate(0.4, -100) // Altere o valor de translação conforme necessário
        })
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardIsVisible(false)
            animateRenderMemoryScaleAndTranslate(1, 0) //Reinicie a posição quando o teclado estiver oculto
        })
        return () => { keyboardDidShowListener.remove(); keyboardDidHideListener.remove()}
      }, [])

    const animateRenderMemoryScaleAndTranslate = (toScale: number, toTranslate: number) => {
        Animated.parallel([
            Animated.timing(renderMemoryScale, {
                toValue: toScale,
                duration: 300, // Ajuste conforme necessário
                useNativeDriver: true,
            }),
            Animated.timing(animation, {
                toValue: toTranslate,
                duration: 300, // Ajuste conforme necessário
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <View style={container}>
            <StatusBar translucent={false} backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <Animated.View style={{ transform: [{ scale: renderMemoryScale }], ...moment_container}}>
                <MidiaRender.Root data={{"fullhd_resolution": selectedImage.assets[0].uri}} content_sizes={{...sizes.moment.tiny}}>
                    <MidiaRender.RenderImage />
                </MidiaRender.Root>            
            </Animated.View>
            <View style={inputs_container}>
                <DescriptionInput keyboardIsVisible={keyboardIsVisible}/>
                <TagsInput keyboardIsVisible={keyboardIsVisible}/>
                <RenderTagsList/>                
            </View>

        </View>
    )
}