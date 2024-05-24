import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable, FlatList} from 'react-native'
import { Text, View } from '../../../../components/Themed'
import ColorTheme from '../../../../layout/constants/colors'
import AuthContext from '../../../../contexts/auth';
import LanguageContext from '../../../../contexts/Preferences/language';
import { LanguagesCodesType } from '../../../../locales/LanguageTypes';
import PersistedContext from '../../../../contexts/Persisted';
import sizes from '../../../../layout/constants/sizes';
import { useTranslation } from 'react-i18next';
import ListLanguagesSelector from '../../../../features/list-languages-selector';
export default function LanguageScreen() {

    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <ListLanguagesSelector/>
        </View>
    )
}