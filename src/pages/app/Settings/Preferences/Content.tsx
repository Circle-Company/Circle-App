import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable} from 'react-native'
import { Text, View } from '../../../../components/Themed'
import ColorTheme from '../../../../layout/constants/colors'
import AuthContext from '../../../../contexts/auth';

export default function ContentScreen() {
    const {useSignOut}= React.useContext(AuthContext)
    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    function handlePress(){
        
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <Text>Settings-Content_screen</Text>
            <Pressable onPress={handlePress}>
                <Text>ChangeContent</Text>
            </Pressable>
        </View>
    )
}