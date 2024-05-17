import React from "react"
import { FlatList, ScrollView } from "react-native"
import { Settings } from "../../components/settings"
import SettingsSections from '../../data/settings_sections.json'
import { View } from "../../components/Themed"
import AuthContext from "../../contexts/auth"
import { truncated } from "../../algorithms/processText"

export default function ListSettings(){
    const {user} = React.useContext(AuthContext)

    const name_text = user.name? truncated({text: user.name, size: 18}) : 'add new name'
    const description_text = user.description? truncated({text: user.description, size: 18}) : 'add new description'


    const accountData = [
        {
            name: "public profile",
            content:[
                {
                    "name": "Profile Picture",
                    "value": null,
                    "type": "IMAGE",
                    "navigateTo": "Settings-Privacy-Policy",
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
                    "secure": true
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
                    "navigateTo": "Settings-Sign-Out",
                    "secure": false
                }
            ]
        }
    ]
    return (
        <ScrollView>
            <FlatList
                data={accountData}
                scrollEnabled={false}
                keyExtractor={(item) => item.name}
                renderItem={({item}) => {
                    return (<Settings.Section name={item.name} content={item.content} type='ACCOUNT'/>)
                }}
            />      
        </ScrollView>

        
    )
}