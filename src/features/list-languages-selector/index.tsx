import { FlatList, Pressable, useColorScheme } from "react-native";
import { LanguagesCodesType, LanguagesListType } from "../../locales/LanguageTypes"
import { Text, View } from "../../components/Themed";
import LanguageContext from "../../contexts/Preferences/language";
import PersistedContext from "../../contexts/Persisted"
import CheckIcon from '../../assets/icons/svgs/check_circle.svg'
import React from "react";
import sizes from "../../layout/constants/sizes";
import ColorTheme, { colors } from "../../layout/constants/colors";
import fonts from "../../layout/constants/fonts";


export default function ListLanguagesSelector() {
    const { changeAppLanguage, languagesList, t} = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    function handlePress(value: LanguagesCodesType){ changeAppLanguage(value) }

    const isDarkMode = useColorScheme() === 'dark'
    const icon_fill: string = isDarkMode? String(colors.blue.blue_05): String(colors.blue.blue_05)

    const header_container: any = {
        height: sizes.sizes["2md"],
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderBottomWidth: 1,
        backgroundColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_01,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
    const header_text: any = {
        fontSize: fonts.size.caption1*1.05,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary
    }

    const container: any = {
        width: sizes.screens.width,
        height: sizes.sizes["3md"],
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
    const container_left: any = {
        paddingLeft: sizes.paddings["1sm"],
        alignItems: 'flex-start',
        flex: 1
    }    
    const container_right: any = {
        paddingLeft: 2,
        alignItems: 'center',
        width: sizes.screens.width/8,
    }


    const text_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold
        
    }

    return (
        <FlatList
        data={languagesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
            return (
                <View style={header_container}>
                    <Text style={header_text}>{t('Select Language')}</Text>
                </View>
            )
        }}
        renderItem={({item, index}) => {
            return (
                <Pressable style={container} onPress={() => {handlePress(item.code)}}>
                <View style={container_left}>
                    <Text style={text_style}>{item.nativeName}</Text>
                </View>
                {session.preferences.language.appLanguage == item.code &&
                    <View style={container_right}>
                        <CheckIcon fill={icon_fill} width={16} height={16}/>
                    </View>
                }
            </Pressable>
            )
        }}
        />
    )
}