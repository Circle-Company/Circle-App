import { View } from "react-native";
import { ProfileStatisticsFollowersProps } from "../../profile-types";
import { useProfileContext } from "../../profile-context";
import { Text } from "../../../Themed";
import NumberConversor from "../../../../algorithms/numberConversor";
import {statistics_container, statistics_number, statistics_text} from './profile-statistics-styles'

export default function statistics_followers ({}: ProfileStatisticsFollowersProps) {
    const {user} = useProfileContext()
    return (
        <View style={statistics_container}>
            <Text style={statistics_number}>{ NumberConversor(user.statistics.followers)}</Text>
            <Text style={statistics_text}>Followers</Text>
        </View>
    )
} 