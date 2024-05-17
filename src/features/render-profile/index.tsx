import RenderStatistics from "./render-statistics";
import profileData from '../../data/profile.json'
import { View, useColorScheme} from "react-native";
import { Profile } from "../../components/profile";
import { Text } from "../../components/Themed";
import sizes from "../../layout/constants/sizes";
import React from "react";
import AuthContext from "../../contexts/auth";
import { colors } from "../../layout/constants/colors";
import { userReciveDataProps } from "../../components/user_show/user_show-types";

type RenderProfileProps = {
    user: userReciveDataProps
}

export default function RenderProfile({user}: RenderProfileProps) {
    const top_container: any = {
        paddingTop: sizes.paddings["1xl"],
        alignItems: 'center',
    }
    const name_container: any = {
        paddingTop: sizes.paddings["1sm"],
        paddingBottom: sizes.paddings["1sm"]*0.6
    }
    const description_container: any = {
    }
    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture/>
                <View style={name_container}>
                    <Profile.Name scale={0.8}/>
                </View>
            </View>
            
            <RenderStatistics/>    
            <View style={description_container}>
              <Profile.Description/>  
            </View>
        </Profile.MainRoot>
    )
}