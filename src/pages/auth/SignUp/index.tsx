import React from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, Dimensions,TextInput} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import { Text, View } from '../../../components/Themed'
import ButtonClose from '../../../components/buttons/close'
import AuthTitle from '../../../components/auth/title'
import AuthSocialLogin from '../../../components/auth/social'
import AuthTermsText from '../../../components/auth/terms'
import AuthContext from '../../../contexts/auth'
import Lock from '../../../assets/icons/svgs/lock.svg'
import User from '../../../assets/icons/svgs/user.svg'

const WindowWidth = Dimensions.get('screen').width
const WindowHeight = Dimensions.get('screen').height

export default function SignUpScreen() {
  const {useSignIn, signed} = React.useContext(AuthContext)
  const [ username, setUsername ] = React.useState('')
  const [ password, setPassword ] = React.useState('')

  const container = {
    width: WindowWidth - 60,
    alignItems: 'center',
  }
  const inputContainer = {
    width: WindowWidth - 60,
    alignItems: 'center',
    flexDirection: 'row',
  }
  const input:any = {
    flex: 1,
    fontFamily: 'RedHatDisplay-Regular',
    color: ColorTheme().text,
    borderBottomWidth: 0.5,
    borderColor: ColorTheme().backgroundDisabled,        
  }
  const buttonContainerEnable:any = {
    width: 160,
    height: 56,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: ColorTheme().primary,
    top: WindowHeight - 560
  }  
  const buttonTextEnable:any = {
    fontSize: 16,
    fontFamily: 'RedHatDisplay-Bold',
    color: ColorTheme().background,
  }

  function SignUp() {
    useSignIn()
  }
  return (
    <View style={[styles.container]}>
      <StatusBar style={'light-content'}/>
      <View style={{marginBottom: 30}}><ButtonClose/></View>
      <View style={{marginBottom: 18}}>
        <AuthTitle
          title={'Let’s Get Started!'}
          subTitle={'Sign up with Social of fill the form to create your account.'}
        />
      </View>
      <View style={[ styles.socialContainer, { borderColor: ColorTheme().backgroundDisabled } ]}>
        <AuthSocialLogin/>
      </View>
      <View style={container}>
        <View style={inputContainer}>
          <User fill={String(ColorTheme().text)} width={18} height={18} style={{marginRight: 16}}/>
          <TextInput
            style={input}
            placeholder={'@username'}
            textContentType={'username'}
            autocomplete={'username-new'}
            autoCapitalize={'none'}
            autoCorrect={false}
            maxLength={20}
            returnKeyType={'next'}
            value={username}
            onChangeText={(text) => {setUsername(text)}}
          />                        
        </View>
        <View style={inputContainer}>

          <Lock fill={String(ColorTheme().text)} width={18} height={18} style={{marginRight: 16}}/>
          <TextInput
            style={input}
            placeholder={'Password'}
            placeholderColor={ColorTheme().placeholder}
            textContentType={'newPassword'}
            autocomplete={'password-new'}
            autoCapitalize={'none'}
            autoCorrect={false}
            clearButtonMode={'while-editing'}
            maxLength={16}
            returnKeyType={'go'}
            value={password}
            onChangeText={(text) => {setPassword(text)}}
          />
        </View>
      </View>
      <View style={styles.footerContainer}>
        <AuthTermsText signText={'sign up'}/>
      </View>
      <TouchableOpacity style={buttonContainerEnable} onPress={SignUp}>
        <Text style={buttonTextEnable}>Sign Up</Text>
      </TouchableOpacity>
    </View>
 
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30
  },
  containerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialContainer: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 30
  },
  footerContainer: {
    left: 30,
    position: 'absolute',
    top: WindowHeight - 230,
    alignSelf: 'flex-start',
},
  buttonContainer: {
    width: 160,
    height: 56,
    alignSelf: 'center',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 24
  },
});