import React, {useState, useEffect} from 'react';
import { Pressable, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, TextInput} from 'react-native'
import { Text, View } from '../Themed'
import Colors from '../../constants/Colors'

import Lock from '../../assets/icons/svgs/lock.svg'
import User from '../../assets/icons/svgs/user.svg'
import Eye from '../../assets/icons/svgs/eye.svg'
import EyeSlash from '../../assets/icons/svgs/eye_slash.svg'
import ColorTheme from '../../layout/constants/colors';

const WindowWidth = Dimensions.get('screen').width

export default function AuthInput(props) {
    const isDarkMode = useColorScheme() === 'dark'

    const container = {
        width: WindowWidth - 60,
        alignItems: 'center',
    }
    const inputContainer = {
        width: WindowWidth - 60,
        alignItems: 'center',
        flexDirection: 'row',
    }
    const input = {
        flex: 1,
        fontFamily: 'RedHatDisplay-Regular',
        color: isDarkMode ? Colors.dark.text : Colors.light.text,
        borderBottomWidth: 0.5,
        borderColor: isDarkMode ? Colors.dark.disabledBackground : Colors.light.disabledBackground,        
    }
    const inputError = {
        flex: 1,
        fontFamily: 'RedHatDisplay-Regular',
        color: isDarkMode ? Colors.dark.text : Colors.light.text,
        borderBottomWidth: 0.7,
        borderColor: isDarkMode ? Colors.dark.error : Colors.light.error,        
    }
    const subTitle = {
        marginTop: 8,
        fontSize: 11,
        fontFamily: error? 'RedHatDisplay-Medium': 'RedHatDisplay-Regular',
        color: isDarkMode ? Colors.dark.disableText : Colors.light.disableText,
    }
    const subTitleError = {
        marginTop: 8,
        flex: 1,
        fontSize: 11,
        fontFamily: 'RedHatDisplay-Regular',
        color: isDarkMode ? Colors.dark.error: Colors.light.error,
    }
    
    const [error, setError] = useState(false)
    const [viewPass, setViewPass] = useState(false)

    async function ViewPassword() {
        if(viewPass == true){
            setViewPass(false)
        }else{
            setViewPass(true)
        }
    }

    return(
        <>
            {props.pass?

                <View style={container}>
                    <View style={inputContainer}>
                        <Lock color={ColorTheme().icon} width={24} height={24} style={{marginRight: 16}}/>
                        <TextInput
                            style={error? inputError: input}
                            placeholder={props.placeholder}
                            placeholderColor={isDarkMode ? Colors.dark.disableText : Colors.light.disableText}
                            textContentType={'newPassword'}
                            autocomplete={'password-new'}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            clearButtonMode={'while-editing'}
                            maxLength={15}
                            returnKeyType={'go'}
                            secureTextEntry={!viewPass}
                        />
                        <TouchableOpacity onPress={() => {ViewPassword()}}>
                            {viewPass? 
                                <Eye color={ColorTheme().icon} width={18} height={18} style={{padding: 10, marginLeft: 16, marginRight: 8}}/>
                            :
                                <EyeSlash color={ColorTheme().icon} width={18} height={18} style={{padding: 10, marginLeft: 16, marginRight: 8}}/>
                            }                                 
                        </TouchableOpacity>
             
                    </View>
                    {error?
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={subTitleError}>Incorrect password</Text>
                            <Pressable>
                                <Text style={subTitle}>Reset Password</Text>
                            </Pressable>                    
                        </View>:
                        <Text style={subTitle}>At least 6 characters, 1 uppercase letter, 1 number, 1 symbol</Text>
                    }
                    

                </View>     
                
                : 

                <View style={container}>
                    <View style={inputContainer}>
                    <User color={ColorTheme().icon} width={24} height={24} style={{marginRight: 16}}/>
                        <TextInput
                            style={input}
                            placeholder={props.placeholder}
                            textContentType={'username'}
                            autocomplete={'username-new'}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            maxLength={20}
                            returnKeyType={'next'}  
                        />                        
                    </View>

                </View>    
            }
        
        </>

    )        

}

const styles = StyleSheet.create({
    title: {
        fontFamily: 'RedHatDisplay-Bold',
        fontSize: 28,
        marginBottom: 8
    },
    subTitle: {
        fontFamily: 'RedHatDisplay-Regular',
        fontSize: 12,
    }
});