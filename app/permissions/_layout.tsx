import { Stack } from "expo-router"
import fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"

export default function MomentsLayout() {
    return (
        <Stack
            screenOptions={{
                presentation: "containedModal",
                contentStyle: {
                    backgroundColor: colors.gray.black,
                },
                statusBarAnimation: "fade",
                statusBarStyle: "light",
                headerTransparent: false,
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: colors.gray.black,
                },

                headerTintColor: colors.gray.white,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    presentation: "containedModal",
                    headerTitle: "One last thing",
                    headerTitleAlign: "center",
                    headerTintColor: "white",
                    headerLargeTitle: false,
                    headerTitleStyle: {
                        fontFamily: fonts.family["Black-Italic"],
                    },
                    headerLargeTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                }}
            />
        </Stack>
    )
}
