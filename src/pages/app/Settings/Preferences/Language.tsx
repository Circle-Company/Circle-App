import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable, FlatList} from 'react-native'
import { Text, View } from '../../../../components/Themed'
import ColorTheme from '../../../../layout/constants/colors'
import AuthContext from '../../../../contexts/auth';
import LanguageContext from '../../../../contexts/Preferences/language';
import { LanguagesCodesType } from '../../../../locales/LanguageTypes';
import PersistedContext from '../../../../contexts/Persisted';
import sizes from '../../../../layout/constants/sizes';
export default function LanguageScreen() {
    const {useSignOut}= React.useContext(AuthContext)
    const { changeAppLanguage, languagesList} = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    function handlePress(value: LanguagesCodesType){
        console.warn('lingua mudada para: ' + value)
        changeAppLanguage(value)
        console.log(JSON.stringify(session.preferences.language.appLanguage))
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <Text>{session.preferences.language.appLanguage}</Text>
            <FlatList
            data={languagesList}
            renderItem={({item}) => {
                return (
                    <Pressable onPress={() => {handlePress(item.code)}} style={{width: sizes.screens.width, height: sizes.headers.height}}>
                        <Text>{item.nativeName}</Text> 
                        {session.preferences?.language.appLanguage == item.code && <Text>Selected</Text>}
                    </Pressable>
                   
                )
            }}
            />

        </View>
    )
}