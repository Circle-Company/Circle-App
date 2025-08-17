import React from "react"
import { NotificationProps } from "../notification-types"
import { Notification } from ".."
import { UserShow } from "../../user_show"

type renderNotificationProps = {
    notification: NotificationProps
}

export default function render_notification({ notification }: renderNotificationProps) {
    return (
        <Notification.Container.Main notification={notification}>
            <Notification.Container.Left>
                <UserShow.Root data={notification.sender_user}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{ width: 50, height: 50 }}
                        displayOnMoment={false}
                    />
                </UserShow.Root>
                <Notification.Seal />
            </Notification.Container.Left>

            <Notification.Container.Center>
                <Notification.Text />
            </Notification.Container.Center>
        </Notification.Container.Main>
    )
}
