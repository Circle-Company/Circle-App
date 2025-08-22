import React from "react"
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions,
    useColorScheme,
    Image,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Colors from "../../constants/Colors"

const WindowWidth = Dimensions.get("window").width
const WindowHeight = Dimensions.get("window").height

export default function HeaderHome({ close }) {
    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === "dark"

    const ArrowLeftIcon = require("../../assets/icons/pngs/24/arrow-left.png")
    const XIcon = require("../../assets/icons/pngs/24/x.png")

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack()}>
                <Image
                    source={close ? XIcon : ArrowLeftIcon}
                    style={{
                        width: 24,
                        height: 24,
                        tintColor: isDarkMode ? Colors.dark.text : Colors.light.text,
                    }}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        flexDirection: "row",
    },
    iconContainer: {
        alignItems: "center",
        borderRadius: 30,
        justifyContent: "center",
        marginLeft: 10,
        padding: 8,
        top: 0,
    },
    iconContainer2: {
        alignItems: "center",
        backgroundColor: "#00000040",
        borderRadius: 30,
        flexDirection: "row",
        height: 40,
        justifyContent: "center",
        marginRight: 22,
        paddingHorizontal: 15,
        top: 0,
        width: 40,
    },
})
