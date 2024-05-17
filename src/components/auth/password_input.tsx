import React, { useState, useEffect } from "react"
import { Pressable, TextInput, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import Icon from "../../assets/icons/svgs/lock.svg"
import { Text, View} from "../Themed"
import CheckIcon from '../../assets/icons/svgs/check_circle.svg'
import XIcon from '../../assets/icons/svgs/close.svg'
import Eye from '../../assets/icons/svgs/eye.svg'
import EyeSlash from '../../assets/icons/svgs/eye_slash.svg'
import sizes from "../../layout/constants/sizes"
import api from "../../services/api"
import AuthContext from "../../contexts/auth"

export default function PasswordInput({
    sign = true
}: {sign?: boolean }) {
    const isDarkMode = useColorScheme() === 'dark'
    const { setPasswordInput, usernameInput} = React.useContext(AuthContext)
    const [password, setPassword] = useState("");
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isVisible, setIsVisible] = useState(false)
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
        bottomContainer: {
            marginTop: sizes.margins["1sm"],
            width: sizes.screens.width,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingHorizontal: sizes.paddings["1xl"] * 1.1,
        },
        bottomTopContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },
        charcetsCounterContainer: {
            borderRadius: sizes.sizes["1md"],
            paddingHorizontal: sizes.paddings["1sm"],
            paddingVertical: sizes.paddings["1sm"] * 0.3,
            backgroundColor: ColorTheme().backgroundDisabled + '80'
        },
        charctersCounter: {
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled
        },
        legendContainer: {
            marginTop: sizes.margins["1md"]
        },
        legend: {
            marginTop: sizes.margins["1sm"],
            fontSize: fonts.size.caption2,
            fontFamily: fonts.family.Medium,
            color: ColorTheme().textDisabled
        },
        statusContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
        },
        status: {
            fontSize: fonts.size.caption1,
            fontFamily: fonts.family.Medium,
            color:isValidPassword? ColorTheme().success : ColorTheme().textDisabled
        },
        closeButtonContainer: {
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ColorTheme().backgroundDisabled
        },
        visibleButtonContainer: {
            right: -5,
            width: 30,
            height: 30,
            marginLeft: sizes.margins["1sm"],
            alignItems: 'center',
            justifyContent: 'center',
        }
    }

    const handleVisiblePressed = () => {
        if(isVisible) setIsVisible(false)
        else setIsVisible(true)
    }

    const handleClearPressed = () => {
        setPassword('')
        setIsValidPassword(false)
        setStatusMessage("The Password needs least 6 characters.")
        setShowStatusMessage(true)
        
        setPasswordInput('')
    }

    const handleInputChange = (text: string) => {
        setPassword(text)
    }

    React.useEffect(() => {
        if (password.length <= 5) {
            setIsValidPassword(false)
            setStatusMessage("The Password needs least 6 characters.")
            setShowStatusMessage(true)
            
            setPasswordInput('')
        }
        if(password == usernameInput && sign){
                setIsValidPassword(false)
                setStatusMessage("Your password cannot be the same as the username.")
                setShowStatusMessage(true)

                setPasswordInput('')
        } else {
            if(sign || password.length >= 6){
                setIsValidPassword(true)
                setShowStatusMessage(true)
                setStatusMessage("This password can be used.")  
                setPasswordInput(password)                 
            }
 
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
                    secureTextEntry={isVisible}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="none"
                    textContentType='password'
                    autoFocus={true}
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={20}
                    style={styles.input}
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />
                {password && 
                    <>
                    <Pressable onPress={handleClearPressed} style={styles.closeButtonContainer}>
                        <XIcon
                            fill={String(isDarkMode? colors.gray.grey_04 : colors.gray.grey_04)}
                            width={sizes.icons["1sm"].width * 0.7}
                            height={sizes.icons["1sm"].height * 0.7}
                        />
                    </Pressable>

                    <Pressable onPress={handleVisiblePressed} style={[styles.visibleButtonContainer]}>
                        {isVisible?
                            <Eye
                                fill={String(isDarkMode? colors.gray.grey_04 : colors.gray.grey_04)}
                                width={sizes.icons["1sm"].width * 1.2}
                                height={sizes.icons["1sm"].height * 1.2}
                            />
                            :
                            <EyeSlash
                                fill={String(isDarkMode? colors.gray.grey_04 : colors.gray.grey_04)}
                                width={sizes.icons["1sm"].width * 1.2}
                                height={sizes.icons["1sm"].height * 1.2}
                            />
                        }
                    </Pressable>
                    </>           
                }
            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.bottomTopContainer}>
                    {showStatusMessage && (
                        <View style={styles.statusContainer}>
                            {isValidPassword && statusMessage !== 'Checking availability...' && 
                                <CheckIcon style={{top: 0.4, marginRight: 7}} fill={colors.green.green_05.toString()} width={sizes.icons["1sm"].width * 0.7} height={sizes.icons["1sm"].height * 0.7} />
                            }
                            <Text style={styles.status}>{statusMessage}</Text>
                        </View>
                    )}
                    <View style={styles.charcetsCounterContainer}>
                        <Text style={styles.charctersCounter}>{password.length} - {20}</Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    <Text style={styles.legend}>It is recommended that the password has numbers and special characters for greater security.</Text>
                </View>                
            </View>

        </View>
    );
}
