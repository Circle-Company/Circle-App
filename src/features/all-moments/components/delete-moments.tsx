import React from "react";
import { Text, View } from "../../../components/Themed";
import sizes from "../../../layout/constants/sizes";
import AllMomentsContext from "../all_moments_context";
import ColorTheme, { colors } from "../../../layout/constants/colors";
import { useColorScheme } from "react-native";
import ButtonStandart from "../../../components/buttons/button-standart";
import Icon from '../../../assets/icons/svgs/trash.svg'
import fonts from "../../../layout/constants/fonts";

export default function deleteMoments() {
    const isDarkMode = useColorScheme() === 'dark'
    const {selectedMoments, deleteMoments} = React.useContext(AllMomentsContext)
    const container = {
        width: sizes.screens.width,
        height: sizes.headers.height * 1.5,
        borderTopWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02,
        flexDirection: 'row',
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1md"] 
    }

    const description_container = {
        flex: 1,
        paddingRight: sizes.paddings["1md"]
    }

    const button_text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
    }

    const description_text: any = {
        fontSize: fonts.size.body * 0.7,
        fontFamily: fonts.family.Medium,
        color: isDarkMode? colors.gray.grey_04 : colors.gray.grey_06,
        textAlign: 'justify',
    }

    const icon: any = {
        marginLeft: sizes.margins['2sm'],
        top: 0.4
    }


    if(selectedMoments.length <= 0) return null
    else {
    return (
            <View style={container}>
                <View style={description_container}>
                    <Text style={description_text}>Are you sure you want to permanently delete your selected moments? You won't be able to recover them later.</Text>
                </View>
                
                <View>
                    <ButtonStandart
                        margins={false}
                        width={sizes.buttons.width/3.5}
                        height={40} 
                        action={deleteMoments}
                        backgroundColor={colors.red.red_05.toString()}
                    >
                        <Text style={button_text}>Delete</Text>
                        <Icon
                            style={icon}
                            fill={colors.gray.white.toString()}
                            width={17}
                            height={17}
                        />
                    </ButtonStandart>                       
                </View>

            </View>
        )        
    }



}