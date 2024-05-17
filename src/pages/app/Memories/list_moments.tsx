import React from 'react'
import { StatusBar,  useColorScheme } from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import ListMemoryMoments from '../../../features/list-memories/list-memory-moments'
import { useRoute } from '@react-navigation/native'
import MemoryContext from '../../../contexts/memory'

export default function MemoriesListMomentsScreen() {
  const {memory, memoryMoments} = React.useContext(MemoryContext)
  const isDarkMode = useColorScheme() === 'dark'
  const route = useRoute();

  console.log(route.params)

  const container  = {
    alignItems:'center',
    flex: 1,
    backgroundColor: colors.gray.black
  }
  return (
    <View style={container}>
      <StatusBar backgroundColor={String(colors.gray.black)} barStyle={'light-content'}/>
      <ListMemoryMoments memory_id={memory.id}/>
    </View>
  )
}