import React from 'react'
import { StatusBar, useColorScheme, View, Image} from 'react-native'
import { Text } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import PersistedContext from '../../../contexts/Persisted'
import Icon from '../../../assets/icons/svgs/arrow_up.svg'
import EditIcon from '../../../assets/icons/svgs/camera.svg'
import ButtonStandart from '../../../components/buttons/button-standart'
import { ImagePickerResponse, launchImageLibrary} from 'react-native-image-picker'
import api from '../../../services/api'
import RNFS from 'react-native-fs'
import { useNavigation } from '@react-navigation/native'
import { Loading } from '../../../components/loading'
export default function ProfilePictureScreen() {
    const isDarkMode = useColorScheme() === 'dark'
    const { session } = React.useContext(PersistedContext)
    const [ selectedImage, setSelectedImage ] = React.useState('')
    const [ loading, setLoading ] = React.useState(false)
    const navigation = useNavigation()

    const container: any = {
      alignItems:'center',
      flex: 1
    }

    const image: any = {
        width: sizes.screens.width - sizes.margins['1xxl'] * 2,
        height: sizes.screens.width - sizes.margins['1xxl'] * 2,
        borderRadius: (sizes.screens.width - sizes.margins['1xxl'] * 2) /2,
        marginVertical: sizes.paddings['1lg'],
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
    }

    const button_text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
    }

    const icon: any = {
        marginLeft: sizes.margins['2sm'],
        top: 0.4
    }
    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white
    }
    const bottomContainer: any = {
        width: sizes.screens.width,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderTopWidth: sizes.borders['1md'],
        borderBottomWidth: sizes.borders['1md'],
        borderColor: ColorTheme().backgroundDisabled,
        paddingHorizontal: sizes.paddings["1md"]* 0.7,
        paddingVertical: sizes.paddings['1sm']
    }

    const loading_container: any = {
        marginLeft: sizes.margins['3sm'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDarkMode? 0.6 : 1
    }

    const loading_text: any = {
        color: colors.gray.white,
        fontSize: fonts.size.caption1,
        flex: 1
    }

    const textContainer: any = {
        marginRight: sizes.margins['2sm']
    }


    async function uploadMoment () {
        if(selectedImage){
            const IMG = selectedImage.assets[0]
            const imageBase64 = await RNFS.readFile(IMG.uri, 'base64')
            await api.put(`/account/edit/profile-picture`, {
                user_id: session.user.id,
                midia: { base64: imageBase64},
                metadata: {
                    file_name: IMG.fileName,
                    file_size: IMG.fileSize,
                    file_type: IMG.type,
                    resolution_width: IMG.width,
                    resolution_height: IMG.width,
                },
            })
            .finally(() => {setSelectedImage('')})
            .catch(function (error) { console.log(error)})
        }
    }

    const handleImagePickerResponse = async (response: ImagePickerResponse) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
        } else {
            try {   
                // const convertedBase64 = await HEICtoJPEG(response.assets[0].base64)
                setSelectedImage(response)
                console.log('selectedimage --------------------',selectedImage)
            } catch (error) {
                console.log('Error converting HEIC to JPEG:', error);
            }

            
        }
    }

    async function handleLaunchImageLibrary() {
        launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
        }, handleImagePickerResponse);
    }

    async function handlePressImagePicker() {
        await handleLaunchImageLibrary()
    }

    async function handlePressUpload() {
        if(!loading){
            setLoading(true)
            await uploadMoment()
            .then(async function () {
                setLoading(false)
                await session.user.getUser(session.user.id)
                navigation.goBack()
            })
        }

    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={[image, {position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 10}]}>
                {!selectedImage &&
                    <ButtonStandart
                        margins={false}
                        width={80}
                        height={80} 
                        action={handlePressImagePicker}
                        backgroundColor={colors.gray.white.toString()}
                    >
                        <EditIcon
                            fill={String(colors.gray.black)}
                            width={24}
                            height={24}
                        />
                    </ButtonStandart> 
                }
 
            </View>            
            <Image source={{ uri: selectedImage? selectedImage.assets[0].uri : session.user.profile_picture.small_resolution}} style={image}/>

            {selectedImage &&
                <View style={bottomContainer}>
                    <View style={{flex: 1}}>
                        <ButtonStandart
                        margins={false}
                        width={sizes.buttons.width/2.2}
                        height={40} 
                        action={handlePressImagePicker}
                        backgroundColor={'#00000000'}
                        >
                        <Text style={button_text}>Change Image</Text>
                        <EditIcon
                            style={icon}
                            fill={String(colors.gray.white)}
                            width={17}
                            height={17}
                        />
                        </ButtonStandart>                
                    </View>
    
                    <ButtonStandart
                    action={handlePressUpload}
                    width={sizes.buttons.width*0.31}
                    backgroundColor={loading ? `${colors.blue.blue_05}40`:String(colors.blue.blue_05) }
                >
                    {loading?
                        <View style={loading_container}>
                            <Text style={loading_text}>Loading</Text>
                            <Loading.Container width={40} height={30}>
                            <Loading.ActivityIndicator size={10}/>
                            </Loading.Container>                     
                        </View>

                    :
                        <>
                            <View style={textContainer}>
                                <Text style={text}>Upload</Text>
                            </View>
                            <Icon fill={String(colors.gray.white)} width={15} height={15}/>                    
                        </>

                    }
                    
                </ButtonStandart>  
                </View>
            }
        </View>
    )
}