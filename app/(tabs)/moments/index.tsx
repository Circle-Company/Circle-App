import { View } from "@/components/Themed"
import ListMoments from "@/features/moments"

export default function HomeScreen() {
    return (
        <View style={{ flex: 1 }}>
            <ListMoments />
        </View>
    )
}
