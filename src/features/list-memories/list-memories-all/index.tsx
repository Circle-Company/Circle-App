import {groupObjectsByDate, TimeInterval} from '../../../algorithms/separateArrByDate'
import { Text, View } from '../../../components/Themed'
import memory_all_data from '../../../data/memories-all.json'
import ColorTheme from '../../../layout/constants/colors'
import {ListMemoriesAll} from './components/list-memories-date_group'
import { ScrollView } from 'react-native'

export default function ListMemoriesAllSeparatedbyDate() {
    const data_to_render = groupObjectsByDate(memory_all_data, TimeInterval.DAY)
        return (
            <ScrollView showsVerticalScrollIndicator>
                {data_to_render.map((item, index) => {

                    return (
                            <ListMemoriesAll key={index} data={item} date_text={item.date} count={item.count}/>
                        
                    )
                })

                }
                
            </ScrollView>
            
        )

}