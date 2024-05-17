export type NotificationTypeProps =
    'LIKE-MOMENT'
    | 'LIKE-MOMENT-2'
    | 'LIKE-MOMENT-3'
    | 'LIKE-MEMORY'
    | 'LIKE-COMMENT'
    | 'COMMENT-MOMENT'    
    | 'FOLLOW-USER'
    | 'VIEW-USER'

export type NotificationProps = {
	id: number
	receiver_user_id: number,
	viewed: boolean,
	type: NotificationTypeProps,
	created_at: string,
	midia?: {
		nhd_resolution: string
	}
	sender_user: {
		id: number,
		username: string,
		verifyed: boolean,
		profile_picture: {
			tiny_resolution: string | null
		}
	},
	you_follow: boolean
}