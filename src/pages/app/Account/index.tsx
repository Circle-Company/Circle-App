import React from 'react'
import { StyleSheet, Dimensions,Pressable} from 'react-native'
import { View, Text } from '../../../components/Themed'
import AuthContext from '../../../contexts/auth'
import ListMemories from '../../../features/list-memories/list-memories-preview'
import RenderProfile from '../../../features/render-profile'
export default function AccountScreen() {

  const {useSignOut} = React.useContext(AuthContext)

  const container = {
    flex: 1,
  } 
  return (    
    <View style={container}>
      <RenderProfile/>
      <ListMemories/>
    </View>  
  )
}