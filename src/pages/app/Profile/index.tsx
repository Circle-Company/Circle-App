import React from 'react'
import { Text } from '../../../components/Themed'
import ViewProfileContext from '../../../contexts/viewProfile'
import RenderViewProfile from '../../../features/render-view_profile'
import { Profile } from '../../../components/profile'
import sizes from '../../../layout/constants/sizes'
import { View } from 'react-native'
import ProfileHeader from '../../../components/headers/profile/profile-header'
export default function ProfileScreen() {
  const { user } = React.useContext(ViewProfileContext)

  const container = {
     flex: 1
  } 
  const top_container: any = {
    alignItems: 'center',
    paddingBottom: sizes.paddings["1sm"]
}
const name_container: any = {
    paddingTop: sizes.paddings["1sm"]
}
const description_container: any = {
    paddingVertical: sizes.paddings["1sm"]
}

console.log(user)
  return (    
    <View style={container}>
      <ProfileHeader/>   
      <RenderViewProfile user={user}/>

    </View>  
  )
}