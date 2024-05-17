import { View } from "react-native";
import sizes from "../../../../layout/constants/sizes";
import { ProfileStatisticsContainerProps } from "../../profile-types";

export default function statistics_container ({
    children
}: ProfileStatisticsContainerProps) {

    const container: any = {
        width: sizes.screens.width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: sizes.paddings["1xl"]*1.2
    }

    return (
        <View style={container}>
            {children}
        </View>
    )
} 