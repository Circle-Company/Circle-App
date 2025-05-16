import { View, Text } from "@/components/Themed"
import { Loading } from "@/components/loading"

export function RenderFooter({ hasMorePages }: { hasMorePages: boolean }) {
    if (!hasMorePages) return <View />

    return (
        <View style={{ padding: 20, alignItems: "center" }}>
            <Loading.ActivityIndicator size={10} />
            <Text style={{ marginTop: 10 }}>Carregando mais usuários...</Text>
        </View>
    )
}
