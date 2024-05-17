import React, { useState, useEffect } from "react";
import { AppState } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from 'socket.io-client';
import getDeviceInfoFunc, { getDeviceInfoProps } from "../services/deviceInfo";
import api from "../services/api";


type UserProps = {
  id: number,
  username: string,
  name: string | null,
  description: string | null,
  verifyed: boolean,
  deleted: boolean,
  blocked: boolean,
  muted: boolean,
  last_active_at: string,
  last_login_at: string,
  last_password_updated_at: string,
  send_notification_emails: boolean,
  profile_picture: {
    fullhd_resolution: string | null,
    tiny_resolution: string | null,
  },
  statistics: {
    total_followers_num: number,
    total_likes_num: number,
    total_views_num: number
  }
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export type AuthContextsData = {
  signed: boolean
  accessToken?: string
  socket: Socket | any
  user: UserProps
  deviceInfo: getDeviceInfoProps
  usernameInput: string,
  passwordInput: string,
  findUserProfileData:() => Promise<void>
  setUsernameInput: React.Dispatch<React.SetStateAction<string>>
  setPasswordInput: React.Dispatch<React.SetStateAction<string>> 
  signIn: () => Promise<void>
  useSignOut(): void
  checkAuthenticated(): Promise<boolean>
  getDeviceInfo(): Promise<void>
  signUp: () => Promise<void>
};

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [usernameInput, setUsernameInput] = useState<string>('')
  const [passwordInput, setPasswordInput] = useState<string>('')
  const [user, setUser] = useState<UserProps | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<any>()
  const [socket, setSocket] = useState<Socket>(io('http://192.168.15.10:3001'))

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log(`AppState mudou para: ${nextAppState}`)
      if(user) socket.emit('sign', { user_id: user.id })
    }
    AppState.addEventListener('change', handleAppStateChange)
  }, [socket])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log(`AppState mudou para: ${nextAppState}`)
      if(user) socket.emit('sign', { user_id: user.id })
    }
    AppState.addEventListener('change', handleAppStateChange)
  }, [])

  useEffect(() => {

    async function loadStorageData() {
      const storagedUser = await AsyncStorage.getItem('@CircleAuth:user')
      const storagedAccessToken = await AsyncStorage.getItem('@CircleAuth:accessToken')
      if (storagedUser && storagedAccessToken) {
        setUser(JSON.parse(storagedUser))
        const storedDeviceInfo = await AsyncStorage.getItem('@CircleAuth:deviceInfo')
        if (storedDeviceInfo) { setDeviceInfo(JSON.parse(storedDeviceInfo)) }
        else { await getDeviceInfo() }
      }
    }; loadStorageData()
  }, [])

  async function getDeviceInfo() {
    await getDeviceInfoFunc()
    .then(async (info: getDeviceInfoProps) => {
      setDeviceInfo(info)
      await AsyncStorage.setItem('@CircleAuth:deviceInfo', JSON.stringify(info));
    })
    .catch(async () => {
      const data: any = await AsyncStorage.getItem('@CircleAuth:deviceInfo')
      setDeviceInfo(data)
    })
  }

  async function signIn() {
    try {
      const response = await api.post('/auth/sign-in', {
        username: usernameInput,
        password: passwordInput
      });
      await setUser(response.data.user);
      await AsyncStorage.setItem('@CircleAuth:user', JSON.stringify(response.data.user))
      await AsyncStorage.setItem('@CircleAuth:accessToken', response.data.access_token)
    } catch (error: any) { throw new Error(error.message)}
  }

  async function signUp() {
    try {
      const response = await api.post('/auth/sign-up', {
        username: usernameInput,
        password: passwordInput
      })
      await setUser(response.data.user);
      await AsyncStorage.setItem('@CircleAuth:user', JSON.stringify(response.data.user))
      await AsyncStorage.setItem('@CircleAuth:accessToken', response.data.access_token)
    } catch (error: any) { throw new Error(error.message)}
  }

  async function findUserProfileData() {
    try {
      const response = await api.post(`/user/profile/data/pk/${user?.id}`, {user_id: user?.id})
      setUser(response.data)
      await AsyncStorage.setItem('@CircleAuth:user', JSON.stringify(response.data))
    }catch(error: any){throw new Error(error.message)}
  }

  useEffect(() => {
    console.log('user dentro do useEffect: ', user);
  }, [user]);

  function useSignOut() {
    setUser(null);
    AsyncStorage.removeItem('@CircleAuth:user');
    AsyncStorage.removeItem('@CircleAuth:accessToken');
    AsyncStorage.removeItem('@CircleAuth:deviceInfo'); // Remover o deviceInfo ao fazer logout
  }

  async function checkAuthenticated(): Promise<boolean> {
    // Lógica de verificação de autenticação
    // Exemplo: verificar se o usuário está autenticado no AsyncStorage
    const userToken = await AsyncStorage.getItem('@CircleAuth:accessToken')

    return !!userToken; // Converte para booleano
  }

  return (
    <AuthContext.Provider
      value={{
        usernameInput,
        passwordInput,
        signed: Boolean(user),
        user,
        socket: socket,
        deviceInfo,
        findUserProfileData,
        setUsernameInput,
        setPasswordInput,
        signIn,
        useSignOut,
        signUp,
        checkAuthenticated,
        getDeviceInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
