import React from "react"
import { FlatList, ScrollView } from "react-native"
import { Settings } from "../../components/settings"
import SettingsSections from '../../data/settings_sections.json'
import { View } from "../../components/Themed"
import AuthContext from "../../contexts/auth"
import { truncated } from "../../algorithms/processText"
import PersistedContext from "../../contexts/Persisted"

export default function ListSettings(){
    const { session } = React.useContext(PersistedContext)

    const name_text = session.user.name? truncated({text: session.user.name, size: 18}) : 'add new name'
    const description_text = session.user.description? truncated({text: session.user.description, size: 18}) : 'add new description'


    const ListData = [
        {
            name: "public profile",
            content:[
                {
                    "name": "Profile Picture",
                    "value": null,
                    "type": "IMAGE",
                    "navigateTo": "Settings-ProfilePicture",
                    "secure": false
                },
                {
                    "name": "Name",
                    "value": name_text,
                    "type": "TEXT",
                    "navigateTo": "Settings-Name",
                    "secure": false
                },
                {
                    "name": "Description",
                    "value": description_text,
                    "type": "TEXT",
                    "navigateTo": "Settings-Description",
                    "secure": false
                },
            ]
        },
        {
            name: "account",
            content:[
                {
                    "name": "Moments",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-All-Moments",
                    "secure": false
                },
                {
                    "name": "Password",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Password",
                    "secure": true
                }
            ]
        },
        {
            name: "app",
            content:[
                /** 
                {
                    "name": "Language",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Preferences-Language",
                    "secure": false
                },*/
                {
                    "name": "Open Source",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Open-Source",
                    "secure": false
                },
                {
                    "name": "Version",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Version",
                    "secure": false
                },
            ]
        },
        {
            name: "legal",
            content:[
                {
                    "name": "Privacy Policy",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Privacy-Policy",
                    "secure": false
                },
                {
                    "name": "Terms of Service",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Terms-Of-Service",
                    "secure": false
                },
            ]
        },
        {
            name: "more",
            content:[
                {
                    "name": "Log Out",
                    "value": null,
                    "type": "TEXT",
                    "navigateTo": "Settings-Log-Out",
                    "secure": false
                }
            ]
        }
    ]
    return (
        <ScrollView showsVerticalScrollIndicator={false} horizontal={false}>
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