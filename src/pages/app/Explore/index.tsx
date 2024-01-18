import React from 'react';
import { StatusBar, useColorScheme } from 'react-native'
import { View, Text} from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import ListSearch from '../../../features/list-search'
import { SearchContextProvider } from '../../../components/search/search-context';
import { Search } from '../../../components/search';
import { ScrollView } from 'react-native-gesture-handler';
export default function ExploreScreen() {
  const isDarkMode = useColorScheme() === 'dark'

  const container  = {
    alignItems:'center',
    flex: 1
  }
  return (
    <View style={container}>
      <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
      <SearchContextProvider>
        <Search.Input/>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ListSearch/>
        </ScrollView>
        
        
      </SearchContextProvider>
      
    </View>
  )
}