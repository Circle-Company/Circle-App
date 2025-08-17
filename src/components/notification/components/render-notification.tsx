import React from "react"
import { Notification } from ".."
import { UserShow } from "../../user_show"
import { NotificationProps } from "../notification-types"

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

            <Notification.Container.Right>
                {notification.midia?.nhd_resolution ? (
                    <Notification.Preview />
                ) : (
                    <UserShow.Root data={notification.sender_user}>
                        <UserShow.FollowButton isFollowing={notification.you_follow} />
                    </UserShow.Root>
                )}
            </Notification.Container.Right>
        </Notification.Container.Main>
    )
}
