import React from 'react'
import {PermissionsAndroid, RefreshControl, ScrollView, StatusBar, useColorScheme} from 'react-native'
import { View, Text } from '../../../components/Themed'
import AuthContext from '../../../contexts/auth'
import ListMemories from '../../../features/list-memories/list-memories-preview'
import RenderProfile from '../../../features/render-profile'
import { Loading } from '../../../components/loading'
import sizes from '../../../layout/constants/sizes'
import { colors } from '../../../layout/constants/colors'
import PersistedContext from '../../../contexts/Persisted'

export default function AccountScreen() {

  const {useSignOut, user, findUserProfileData} = React.useContext(AuthContext)
  const { session } = React.useContext(PersistedContext)
  const [refreshing, setRefreshing] = React.useState(false)
  const [ loading, setLoading] = React.useState(false)
  const isDarkMode = useColorScheme() === 'dark'

  const container = {
    top: 0,
  } 

  const handleRefresh = () => {
    setLoading(true)
    findUserProfileData()
    .finally(() => {
        setTimeout(() => {
        setLoading(false)
        setRefreshing(false)         
        }, 200)
    })
};

  React.useEffect(() => {
    if(!user) setLoading(true)
      else setLoading(false)
  }, [])

  const renderUser = {
    ...session.user,
    statistics: {
      total_followers_num: 1,
      total_likes_num: 1,
      total_views_num: 1
    }
  }

  return (    
    <View style={container}>
    <ScrollView
      style={container}
      showsVerticalScrollIndicator={false}
      horizontal={false}
      refreshControl={
        <RefreshControl
        progressBackgroundColor={String(isDarkMode? colors.gray.grey_08 : colors.gray.grey_02)}
        colors={[String(isDarkMode? colors.gray.grey_04: colors.gray.grey_04), '#00000000']}
        refreshing={refreshing}
        onRefresh={handleRefresh}
    />
      }
    >
    <View style={{marginBottom: sizes.margins['1md']}}>
      {loading?
        <Loading.Container width={sizes.screens.width} height={sizes.screens.height/3}>
            <Loading.ActivityIndicator/>
        </Loading.Container>
        :
        <RenderProfile user={renderUser}/>
      }
      
    </View>      
    <ListMemories
    isAccountScreen={true}
    user={user}/>   
    </ScrollView>
           
    </View>  
  )
}