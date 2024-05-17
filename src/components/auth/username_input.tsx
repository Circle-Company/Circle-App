import React, { useState, useEffect } from "react"
import { Pressable, TextInput, useColorScheme } from "react-native"
import ColorTheme, { colors } from "../../layout/constants/colors"
import fonts from "../../layout/constants/fonts"
import Icon from "../../assets/icons/svgs/@.svg"
import { Text, View} from "../Themed"
import CheckIcon from '../../assets/icons/svgs/check_circle.svg'
import XIcon from '../../assets/icons/svgs/close.svg'
import sizes from "../../layout/constants/sizes"
import api from "../../services/api"
import AuthContext from "../../contexts/auth"

export default function UsernameInput() {
    const isDarkMode = useColorScheme() === 'dark'
    const { setUsernameInput } = React.useContext(AuthContext)
    const [username, setUsername] = useState("");
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isValidUsername, setIsValidUsername] = useState(true);
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
            color:isUsernameAvailable? ColorTheme().success : ColorTheme().textDisabled
        },
        closeButtonContainer: {
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ColorTheme().backgroundDisabled
        }
    };

    useEffect(() => {
        if(isUsernameAvailable) {
            const firstChar = username.charAt(0);
            const lastChar = username.charAt(username.length - 1);

                if (firstChar === "_") setStatusMessage("Your username cannot start with an underline.");
                if (firstChar === ".") setStatusMessage("Your username cannot start with a dot.");
                if (lastChar === "_") setStatusMessage("Your username cannot end with an underline.");
                if (lastChar === ".") setStatusMessage("Your username cannot end with a dot.");
            if (firstChar === "_" || firstChar === "." || lastChar === "_" || lastChar === ".") {
                setIsValidUsername(false);
                setIsUsernameAvailable(false);
                setShowStatusMessage(true)
                setUsernameInput('')
                return;
            }
            if (isUsernameAvailable) {
                setStatusMessage("This username is available for use.");
            } else {
                setStatusMessage("Checking availability...");
            }
            setShowStatusMessage(isUsernameAvailable);   
            setUsernameInput(username)         
        }

    }, [isUsernameAvailable]);

    const findUsernameExists = () => {
        if(username. length > 0) {
            api.post('/auth/username-already-in-use', { username })
            .then(function (response) {
                console.log(response.data)
                setTimeout(() => {
                    setIsUsernameAvailable(response.data.enable_to_use)
                    setStatusMessage(response.data.message)
                }, 600)

            })            
        }

    };

    const handleClearPressed = () => {
        setUsername('')
        setIsValidUsername(false);
        setStatusMessage("The username needs least 4 characters.");
        setIsUsernameAvailable(false);
        setShowStatusMessage(true);
        setUsernameInput('')
    }

    const handleInputChange = (text: string) => {
        const formattedText = text.replace(/(?!^[_\.])[^a-zA-Z0-9_\.]|[^a-zA-Z0-9_\.](?![_\.])|\s/g, "")
        setUsername(formattedText)
    }

    React.useEffect(() => {
        if (username.length <= 3) {
            setIsValidUsername(false);
            setStatusMessage("The username needs least 4 characters.");
            setIsUsernameAvailable(false);
            setShowStatusMessage(true);
            setUsernameInput('')
            return;
        } else {
            setIsValidUsername(true);
            setStatusMessage("Checking availability...");
            setIsUsernameAvailable(false); // Simulando a verificação
            setShowStatusMessage(true);
            findUsernameExists();            
        }

    }, [username, inputRef])

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Icon fill={ColorTheme().text.toString()} width={sizes.icons["1md"].width * 0.73} height={sizes.icons["1md"].height * 0.73} />
                <TextInput
                    value={username}
                    ref={inputRef}
                    textAlignVertical="center"
                    multiline={false}
                    returnKeyType="done"
                    keyboardType="default"
                    autoCapitalize="none"
                    textContentType="username"
                    autoFocus={true}
                    autoCorrect={false}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    autoComplete="username-new"
                    maxLength={20}
                    style={styles.input}
                    placeholder="Username..."
                    placeholderTextColor={String(ColorTheme().textDisabled + "99")}
                />
                {username &&
                    <Pressable onPress={handleClearPressed} style={styles.closeButtonContainer}>
                        <XIcon fill={String(isDarkMode? colors.gray.grey_04 : colors.gray.grey_04)} width={sizes.icons["1sm"].width * 0.7} height={sizes.icons["1sm"].height * 0.7} />
                    </Pressable>                
                }
            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.bottomTopContainer}>
                    {showStatusMessage && (
                        <View style={styles.statusContainer}>
                            {isValidUsername && statusMessage !== 'Checking availability...' && 
                            <CheckIcon style={{top: 0.4, marginRight: 7}} fill={colors.green.green_05.toString()} width={sizes.icons["1sm"].width * 0.7} height={sizes.icons["1sm"].height * 0.7} />
                            }
                            <Text style={styles.status}>{statusMessage}</Text>
                        </View>
                    )}
                    <View style={styles.charcetsCounterContainer}>
                        <Text style={styles.charctersCounter}>{username.length} - {20}</Text>
                    </View>
                </View>

                <View style={styles.legendContainer}>
                    <Text style={styles.legend}>The username can only contain lowercase letters, numbers and "_" and "." as special characters</Text>
                </View>                
            </View>

        </View>
    );
}
