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
import { useIsFocused } from '@react-navigation/native'
import BottomTabsContext from '../../../contexts/bottomTabs'

export default function AccountScreen() {
    const { session } = React.useContext(PersistedContext)
    const { currentTab, setCurrentTab } = React.useContext(BottomTabsContext)
    const [refreshing, setRefreshing] = React.useState(false)
    const [ loading, setLoading] = React.useState(false)
    const isDarkMode = useColorScheme() === 'dark'
    const isFocused = useIsFocused()


    React.useEffect(() => {
        setCurrentTab('Account')
      }, [isFocused])

    const container = {
        top: 0,
    } 

    const handleRefresh = () => {
        setLoading(true)
        session.user.getUser(session.user.id)
        session.statistics.getStatistics(session.user.id)
        .finally(() => {
            setTimeout(() => {
            setLoading(false)
            setRefreshing(false)         
        }, 200)
        })
    };

    React.useEffect(() => {
        if(!session.user) setLoading(true)
        else setLoading(false)
    }, [])

    const renderUser = {
        ...session.user,
        statistics: {
            ...session.statistics
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
            {loading?
                <Loading.Container width={sizes.screens.width} height={sizes.screens.height/3}>
                    <Loading.ActivityIndicator/>
                </Loading.Container>
                :
                <RenderProfile user={renderUser}/>
            }   
            <ListMemories isAccountScreen={true} user={session.user}/>
        </ScrollView>
    </View>  
  )
}