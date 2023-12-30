import { FlatList } from "react-native"
import { Settings } from "../../components/settings"
import SettingsSections from '../../data/settings_sections.json'

export default function ListSettings(){
    return (
        <FlatList
            data={SettingsSections}
            keyExtractor={(item) => item.name}
            renderItem={({item}) => {
                return (<Settings.Section name={item.name} content={item.content}/>)
            }}
        />
        
    )
}