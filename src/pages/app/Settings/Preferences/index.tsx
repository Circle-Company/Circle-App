import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Button, Pressable, ScrollView, FlatList} from 'react-native'
import { Text, View } from '../../../../components/Themed'
import ColorTheme from '../../../../layout/constants/colors'
import AuthContext from '../../../../contexts/auth';
import { Settings } from '../../../../components/settings'
import PersistedContext from '../../../../contexts/Persisted';

export default function PreferencesScreen() {
    const {useSignOut}= React.useContext(AuthContext)
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === 'dark'

    const ListData = [
        {
            name: "Language",
            content:[
                {
                    "name": "App Language",
                    "value": null,
                    "type": 'TEXT',
                    "navigateTo": "Settings-Privacy-Policy",
                    "secure": false
                },
            ]
        },
        {
            name: "Content",
            content:[
                {
                    "name": "Auto Play",
                    "value": null,
                    "type": 'TEXT',
                    "navigateTo": "Settings-Privacy-Policy",
                    "secure": false
                },
                {
                    "name": "Haptic Feedback",
                    "value": null,
                    "type": 'TEXT',
                    "navigateTo": "Settings-Privacy-Policy",
                    "secure": false
                },
                {
                    "name": "Content Translation",
                    "value": null,
                    "type": 'TEXT',
                    "navigateTo": "Settings-Privacy-Policy",
                    "secure": false
                },
            ]
        }
    ]

    const container  = {
      alignItems:'center',
      flex: 1
    }

    function handlePress(){
        
    }

    return (
        <ScrollView>
            <FlatList
                data={ListData}
                scrollEnabled={false}
                keyExtractor={(item) => item.name}
                renderItem={({item}) => {
                    return (<Settings.Section name={item.name} content={item.content} type='ACCOUNT'/>)
                }}
            />      
        </ScrollView>
    )
}