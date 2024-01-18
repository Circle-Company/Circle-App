import RenderStatistics from "./render-statistics";
import profileData from '../../data/profile.json'
import { View } from "react-native";
import { Profile } from "../../components/profile";
import { Text } from "../../components/Themed";
import sizes from "../../layout/constants/sizes";

type RenderViewProfileProps = {
    user: any
}
export default function RenderViewProfile({user}: RenderViewProfileProps) {

    const top_container: any = {
        alignItems: 'center',
        paddingBottom: sizes.paddings["1sm"]
    }
    const name_container: any = {
        paddingTop: sizes.paddings["1sm"]
    }
    const description_container: any = {
        paddingVertical: sizes.paddings["1sm"]
    }
    return (
        <Profile.MainRoot data={user}>
            <View style={top_container}>
                <Profile.Picture/>
                <View style={name_container}>
                    <Profile.Name/>
                </View>
                
            </View>
            <RenderStatistics/>    
            <View style={description_container}>
              <Profile.Description/>  
            </View>
            
            
        </Profile.MainRoot>

        
    )
}