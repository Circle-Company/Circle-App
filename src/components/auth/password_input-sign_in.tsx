import React, { useState, useEffect } from "react"
import { Pressable, TextInput, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import Icon from "../../assets/icons/svgs/lock.svg"
import { Text, View} from "../Themed"
import CheckIcon from '../../assets/icons/svgs/check_circle.svg'
import XIcon from '../../assets/icons/svgs/close.svg'
import sizes from "../../layout/constants/sizes"
import api from "../../services/api"
import AuthContext from "../../contexts/auth"

export default function PasswordInputSignIn() {
    const isDarkMode = useColorScheme() === 'dark'
    const { setSignInputPassword } = React.useContext(AuthContext)
    const [password, setPassword] = useState("")
    const inputRef = React.useRef<TextInput>(null)

    const inputWidth = sizes.screens.width - sizes.paddings["1lg"] * 2;

    const styles: any = {
        container: {
            width: sizes.screens.width,
            alignItems: 'center',
        },
        inputContainer: {
            width: inputWidth,
            height: sizes.headers.height,
            backgroundColor: isDarkMode ? colors.gray.grey_08 + '90' : colors.gray.grey_02 + '80',
            borderRadius: sizes.headers.height / 2,
            paddingVertical: sizes.paddings["1sm"],
            paddingHorizontal: sizes.paddings["1md"],
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row'
        },
        input: {
            top: 2.5,
            marginLeft: 10,
            fontFamily: fonts.family.Semibold,
            flex: 1,
            color: ColorTheme().text
        },
        closeButtonContainer: {
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ColorTheme().backgroundDisabled
        }
    }

    const handleClearPressed = () => {
        setPassword('')
        setSignInputPassword ('')
    }

    const handleInputChange = (text: string) => {
        setPassword(text)
    }

    React.useEffect(() => {
        if (password.length <= 0) {
            setSignInputPassword ('')
        } else {
            setSignInputPassword (password)  
        }

    }, [password, inputRef])

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Icon
                    fill={ColorTheme().text.toString()}
                    width={sizes.icons["1md"].width * 0.73}
                    height={sizes.icons["1md"].height * 0.73}
                />
                <TextInput
                    value={password}
                    ref={inputRef}
                    textAlignVertical="center"
                    multiline={false}
                    secureTextEntry={true}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="none"
                    textContentType='password'
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={20}
                    style={styles.input}
                    placeholder="Password..."
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />
                {password &&
                    <Pressable onPress={handleClearPressed} style={styles.closeButtonContainer}>
                        <XIcon
                            fill={String(isDarkMode? colors.gray.grey_04 : colors.gray.grey_04)}
                            width={sizes.icons["1sm"].width * 0.7}
                            height={sizes.icons["1sm"].height * 0.7}
                        />
                    </Pressable>                
                }
            </View>
        </View>
    );
}
