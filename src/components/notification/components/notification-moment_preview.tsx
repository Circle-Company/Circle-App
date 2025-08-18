import React from "react"
import { Pressable } from "react-native"
import sizes from "../../../constants/sizes"
import { MidiaRender } from "../../midia_render"
import { useIndividualNotificationContext } from "../notification-individual_context"

export default function NotificationMomentPreview() {
    const { notification } = useIndividualNotificationContext()
    return (
        <Pressable>
            <MidiaRender.Root data={notification.midia} content_sizes={sizes.moment.micro}>
                <MidiaRender.RenderImage />
            </MidiaRender.Root>
        </Pressable>
    )
}
