export type NotificationTypeProps =
    | "LIKE-MOMENT"
    | "NEW-MEMORY"
    | "ADD-TO-MEMORY"
    | "FOLLOW-USER"
    | "VIEW-USER"

export type NotificationProps = {
    id: number
    receiver_user_id: number
    viewed: boolean
    type: NotificationTypeProps
    created_at: string
    midia?: {
        nhd_resolution: string
    }
    sender_user: {
        id: number
        username: string
        verifyed: boolean
        profile_picture: {
            tiny_resolution: string | null
        }
    }
    you_follow: boolean
}
