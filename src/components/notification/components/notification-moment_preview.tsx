import { MidiaRender } from "@/components/midia_render"
import sizes from "@/layout/constants/sizes"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Pressable, useColorScheme } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
export default function notification_moment_preview() {
    const isDarkMode = useColorScheme() === "dark"
    const { notification } = useIndividualNotificationContext()
    const container: any = {
        position: "absolute",
        bottom: 0,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.7,
        alignItems: "center",
        borderColor: ColorTheme().background,
        justifyContent: "center",
    }

    function handlePress() {
        useNavigation().navigate("")
    }
    return (
        <Pressable>
            <MidiaRender.Root data={notification.midia} content_sizes={sizes.moment.micro}>
                <MidiaRender.RenderImage />
            </MidiaRender.Root>
        </Pressable>
    )
}
