import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import AuthContext from '../../../contexts/auth';

export default function LogOutScreen() {
    const {useSignOut}= React.useContext(AuthContext)
    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    function handlePress(){useSignOut()}

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <Text>Settings-LogOut_screen</Text>
            <Pressable onPress={handlePress}>
                <Text> Exit Now</Text>
            </Pressable>
        </View>
    )
}