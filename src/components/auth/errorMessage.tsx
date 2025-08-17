import { Text, View } from "../Themed"

export function errorMessage(errorMessage: string) {
    return (
        <View>
            <Text>{errorMessage}</Text>
        </View>
    )
}
