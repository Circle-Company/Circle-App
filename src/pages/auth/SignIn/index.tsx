import React, {useState, useEffect} from 'react';
import { SafeAreaView, StatusBar, StyleSheet, useColorScheme, ScrollView, TouchableOpacity, Dimensions, Image, Pressable, TextInput} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import { Text, View } from '../../../components/Themed'
import {useNavigation} from '@react-navigation/native'
import * as authActions from '../../../store/actions/auth'
import { useDispatch } from 'react-redux'

import ButtonClose from '../../../components/buttons/close'
import AuthTitle from '../../../components/auth/title'
import AuthSocialLogin from '../../../components/auth/social'
import Loading from '../../../components/loading'
import AuthTermsText from '../../../components/auth/terms'

const WindowWidth = Dimensions.get('screen').width
const WindowHeight = Dimensions.get('screen').height

export default function SignInScreen() {
  const isDarkMode = useColorScheme() === 'dark'
  const navigation = useNavigation()
  //const dispatch = useDispatch()

  const [ error, setError ] = useState(false)
  const [ userError, setUserError ] = useState(false)
  const [ passError, setPassError ] = useState(false)
  const [ viewPass, setViewPass ] = useState(false)
  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ userShowMessage, setUserShowMessage ] = useState('Invalid Username')
  const [ passShowMessage, setPassShowMessage ] = useState('Incorrect Password')
  const [ isLoading, setIsLoading ] = useState(false)

  const container = {
    width: WindowWidth - 60,
    alignItems: 'center',
  }
  const inputContainer = {
    width: WindowWidth - 60,
    alignItems: 'center',
    flexDirection: 'row',
  }
  const icon = {
    width: 24,
    height: 24,
    tintColor: ColorTheme().icon,
    marginRight: 16
  }
  const icon2 = {
    width: 18,
    height: 18,
    tintColor: ColorTheme().placeholder,
    padding: 10,
    marginLeft: 16,
    marginRight: 8
  }
  const input = {
    flex: 1,
    fontFamily: 'RedHatDisplay-Regular',
    color: ColorTheme().text,
    borderBottomWidth: 0.5,
    borderColor:ColorTheme().backgroundDisabled,        
  }
  const inputError = {
    flex: 1,
    fontFamily: 'RedHatDisplay-Regular',
    color: ColorTheme().text,
    borderBottomWidth: 0.7,
    borderColor: ColorTheme().error,        
  }
  const subTitle = {
    marginTop: 8,
    fontSize: 11,
    fontFamily: error? 'RedHatDisplay-Medium': 'RedHatDisplay-Regular',
    color: ColorTheme().textDisabled,
  }
  const subTitleError = {
    marginTop: 8,
    flex: 1,
    fontSize: 11,
    fontFamily: 'RedHatDisplay-Regular',
    color: ColorTheme().error,
  }
  const buttonContainerEnable = {
    width: 160,
    height: 56,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: ColorTheme().primary,
    top: WindowHeight - 560
  }  
  const buttonTextEnable = {
    fontSize: 16,
    fontFamily: 'RedHatDisplay-Bold',
    color: ColorTheme().background,
  }

  async function ViewPassword() {
    if(viewPass == true){
        setViewPass(false)
    }else{
        setViewPass(true)
    }
  }
  async function FormValidation() {
    const passwordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})")
    const usernameRegex = new RegExp(/^[a-z0-9_\.]+$/)
    if(username.length < 4){
      setUserShowMessage('Username should be atleast 4 characters long.')
      setIsLoading(false)
      setUserError(true)
    }
    if(!username || username.length === 0){
      setUserShowMessage('Username should be atleast 4 characters long.')
      setIsLoading(false)
      setUserError(true)
      return false
    }
    if(!usernameRegex.test(username)){
      setUserShowMessage('Username should contain a lowercase letter, ". and _" special charcters')
      setIsLoading(false)
      setUserError(true)
      return false
    }
    if(!password || password.length === 0){
      setPassShowMessage('Password should be atleast 6 characters long.')
      setIsLoading(false)
      setPassError(true)
      return false
    }
    if(password.length < 6){
      setPassShowMessage('Password should be atleast 6 characters long.')
      setIsLoading(false)
      setPassError(true)
      return false
    }
    if(!/\d/.test(password)){
      setPassShowMessage('Password should contain at least one number.')
      setIsLoading(false)
      setPassError(true)
      return false
    }
    if(!/[a-z]/.test(password)){
      setPassShowMessage('Password should contain at least one lower case and one upper case.')
      setIsLoading(false)
      setPassError(true)
      return false
    }
    setPassError(false)
    setUserError(false)
    return true
  }
  async function SignIn() {
    if((await FormValidation()).valueOf()){
      //dispatch(authActions.signin( username, password ))
      setIsLoading(true)
    }else{
      setError(true)
      setIsLoading(false)
    }
  }

  if(isLoading){
    return(
      <View style={[styles.containerLoading]}>
        <Loading/>
      </View>
      
    )
  }

  return (
    <View style={[styles.container]}>
      <StatusBar style={'light-content'} translucent={true}/>

      <View style={{marginBottom: 30}}>
        <ButtonClose
          style={{
            backgroundColor: ColorTheme().backgroundDisabled,
            iconColor: ColorTheme().icon
          }}
        />
      </View>

      <View style={{marginBottom: 18}}>
        <AuthTitle
          title={'Wellcome Back!'}
          subTitle={'Sign In with Social of fill the form to continue.'}
        />
      </View>

      <View style={[
        styles.socialContainer,
        {
          borderColor: ColorTheme().backgroundDisabled
        }
      ]}>
        <AuthSocialLogin/>
      </View>

      <View style={container}>
        <View style={inputContainer}>
          <Image 
            source={require('../../../assets/icons/pngs/24/user.png')}
            style={icon}
          />
          <TextInput
            style={userError? inputError: input}
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
        {userError?
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={subTitleError}>{userShowMessage}</Text>
            <TouchableOpacity style={{paddingLeft: 10}} onPress={() => {setUsername('')}}>
              <Text style={subTitle}>Reset</Text>
            </TouchableOpacity>                    
          </View>: null
        }
        
        <View style={inputContainer}>
          <Image 
            source={require('../../../assets/icons/pngs/24/lock.png')}
            style={icon}
          />
          <TextInput
            style={passError? inputError: input}
            placeholder={'Password'}
            placeholderColor={ColorTheme().placeholder}
            textContentType={'newPassword'}
            autocomplete={'password-new'}
            autoCapitalize={'none'}
            autoCorrect={false}
            clearButtonMode={'while-editing'}
            maxLength={16}
            returnKeyType={'go'}
            secureTextEntry={!viewPass}
            value={password}
            onChangeText={(text) => {setPassword(text)}}
          />
          <TouchableOpacity onPress={() => {ViewPassword()}}>
            <Image 
              source={viewPass?require('../../../assets/icons/pngs/24/eye.png') : require('../../../assets/icons/pngs/24/eye-off.png')}
              style={icon2}
            />                                    
          </TouchableOpacity>
        </View>
        {passError?
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={subTitleError}>{passShowMessage}</Text>
            <TouchableOpacity style={{paddingLeft: 10}} onPress={() => {setPassword('')}}>
              <Text style={subTitle}>Reset</Text>
            </TouchableOpacity>                    
          </View>:
          <Text style={subTitle}>At least 6 characters,1 number</Text>
        }
      </View>

      <View style={styles.footerContainer}>
        <AuthTermsText signText={'sign in'}/>
      </View>
      

      <TouchableOpacity style={buttonContainerEnable} onPress={() => {SignIn()}}>
        <Text style={buttonTextEnable}>Sign In</Text>
      </TouchableOpacity>

    </View>
  );
};

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