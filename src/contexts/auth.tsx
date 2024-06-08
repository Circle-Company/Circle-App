import React, { useState, useEffect } from "react"
import api from "../services/api"
import { SessionDataType } from "./Persisted/types"
import { storage } from "../store"
import { storageKeys } from "./Persisted/storageKeys"
type AuthProviderProps = { children: React.ReactNode }

export type AuthContextsData = {
  signInputUsername: string
  signInputPassword: string
  sessionData: SessionDataType
  jwtToken: string | null
  getSessionData: ({sessionId}: {sessionId: string}) => Promise<void>
  refreshJwtToken: ({username, id}: {username: string, id: number}) => Promise<void>
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut(): void,
  checkIsSigned: () => boolean
  setSignInputPassword: React.Dispatch<React.SetStateAction<string>>
  setSignInputUsername: React.Dispatch<React.SetStateAction<string>>
};

const AuthContext = React.createContext<AuthContextsData>({} as AuthContextsData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [signInputUsername, setSignInputUsername] = React.useState('')
  const [signInputPassword, setSignInputPassword] = React.useState('')
  const [ sessionData, setSessionData ] = useState<SessionDataType>({} as SessionDataType)
  const [ jwtToken, setJwtToken ] = useState<string | null>(null)

  async function signIn() { 
    try {
      const response = await api.post('/auth/sign-in', {
        username: signInputUsername,
        password: signInputPassword
      })
      setSessionData(response.data.session)
      setJwtToken(response.data.access_token)
      const userId = response.data.session.id
      if(userId) storage.set('@circle:sessionId', Number(userId))
    } catch (error: any) { throw new Error(error.message)}
  }

  async function signUp() {
    try {
      const response = await api.post('/auth/sign-up', {
        username: signInputUsername,
        password: signInputPassword
      })
      setSessionData(response.data.session)
      setJwtToken(response.data.access_token)
      const userId = response.data.session.id
      if(userId) storage.set('@circle:sessionId', Number(userId))
    } catch (error: any) { throw new Error(error.message)}
  }

  async function getSessionData() {

  }


  function signOut() {
    storage.clearAll()
    setSessionData({} as SessionDataType)
    setJwtToken(null)
  }

  function checkIsSigned() {
    const hasSessionId = storage.getAllKeys().map((key) => { if(key == '@circle:sessionId') return true; else return false})
    if(storage.getNumber(storageKeys().user.id) && hasSessionId) return true
    else return false
  }

  async function refreshJwtToken({username, id}: {username: string, id: number}) {
    const response = await api.post('/auth/refresh-token', { username, id })
    setJwtToken(response.data.access_token)
  }

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        sessionData,
        signInputPassword,
        signInputUsername,
        refreshJwtToken,
        setSignInputPassword,
        setSignInputUsername,
        getSessionData,
        checkIsSigned,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
