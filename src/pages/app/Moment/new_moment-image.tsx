import React from 'react';
import { StatusBar,  useColorScheme} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import NewMomentContext from '../../../contexts/newMoment'
import { MidiaRender } from '../../../components/midia_render';
import sizes from '../../../layout/constants/sizes';
import RenderSelectButton from '../../../features/new_moment/render-select_button';

export default function NewMomentImageScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const { selectedImage, handleLaunchImageLibrary} = React.useContext(NewMomentContext)

  const [ image, setImage ] = React.useState(selectedImage)

  React.useEffect(() => {
    if(selectedImage) setImage(selectedImage.assets[0].uri)

    console.log(selectedImage)
  }, [selectedImage])

    const container  = {
        paddingTop: sizes.paddings['1md'],
        alignItems:'center',
        flex: 1,
    }

    const midia_container = {
        overflow: 'hidden',
        marginBottom: sizes.margins['1md']
    }
    const image_cover = {
        ...sizes.moment.standart,
        borderRadius: sizes.moment.standart.borderRadius*0.6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorTheme().backgroundDisabled
    }

    const image_container: any = {
        overflow: 'hidden',
        borderRadius: sizes.moment.standart.borderRadius*0.6,
        borderWidth: 1.5,
        borderColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_02
    }

    React.useEffect(() => {
        handleLaunchImageLibrary()
    }, [])


return (
    <View style={container}>
    <StatusBar translucent={false} backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
    <View style={midia_container}>
        {image &&
            <View style={image_container}>
                <MidiaRender.Root data={{"fullhd_resolution": image}} content_sizes={{...sizes.moment.standart, borderRadius: sizes.moment.standart.borderRadius*0.6}}>
                    <MidiaRender.RenderImage />
                </MidiaRender.Root>            
            </View>
        }
    </View>
    { image? <RenderSelectButton/>: null }         
    </View>
);
}