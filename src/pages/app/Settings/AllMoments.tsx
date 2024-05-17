import React from 'react'
import { StatusBar,  useColorScheme } from 'react-native'
import { View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import ListAllMoments from '../../../features/all-moments'
import { AllMomentsProvider } from '../../../features/all-moments/all_moments_context'
import DeleteMoments from '../../../features/all-moments/components/delete-moments'
export default function AllMomentsScreen() {
    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }
    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <AllMomentsProvider>
                <View style={{flex: 1}}>
                    <ListAllMoments/>
                </View>
                
                <DeleteMoments/>
            </AllMomentsProvider>
            
        </View>
    
    )
}