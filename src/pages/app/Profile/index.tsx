import React from 'react'
import { Text } from '../../../components/Themed'
import ViewProfileContext from '../../../contexts/viewProfile'
import sizes from '../../../layout/constants/sizes'
import { View, ScrollView, RefreshControl, useColorScheme, StatusBar} from 'react-native'
import ProfileHeader from '../../../components/headers/profile/profile-header'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import ListMemories from '../../../features/list-memories/list-memories-preview'
import { Loading } from '../../../components/loading'
import RenderProfile from '../../../features/render-profile'
export default function ProfileScreen() {
  const { userProfile, setProfile} = React.useContext(ViewProfileContext)
  const [refreshing, setRefreshing] = React.useState(false)
  const [ loading, setLoading] = React.useState(false)
  const isDarkMode = useColorScheme() === 'dark'

  const container = {
    top: 0,
  } 

  const handleRefresh = () => {
    setLoading(true)
    setProfile()
    .finally(() => {
        setTimeout(() => {
        setLoading(false)
        setRefreshing(false)         
        }, 200)
    })
};

  React.useEffect(() => {
    if(!userProfile) setLoading(true)
      else setLoading(false)
  }, [])

  return (    
    <View style={container}>
      <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ProfileHeader/>
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
        <RenderProfile user={userProfile}/>
      }
      
    </View>      
    </ScrollView>
      <ListMemories isAccountScreen={false} user={userProfile}/>        
    </View>  
  )
}