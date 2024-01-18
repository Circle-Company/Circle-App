import React from 'react'

export type ProfileReciveDataProps = {
	id: number,
	username: string,
	access_level: number,
	verifyed: boolean,
	deleted: boolean,
	blocked: boolean,
	muted: boolean,
	send_notification_emails: boolean,
	name: string | null,
	description: string | null,
	last_active_at: string,
	profile_picture: {
		fullhd_resolution: string,
		tiny_resolution: string
	},
	statistics: {
		total_followers_num: number,
		total_likes_num: number,
		total_views_num: number
	}
}
export type ProfileMainRootProps = {
    children: React.ReactNode,
    data: ProfileReciveDataProps
}
export type ProfileShareProps = {
    color?: string,
    backgroundColor?: string
}
export type ProfileNameProps = {
    color?: string,
    fontSize?: number,
    fontFamily?: string,
    margin?: number,
    scale?: number
}
export type ProfilePictureProps = {
}
export type ProfileDescriptionProps = {
}
export type ProfileStatisticsContainerProps = {
    children: React.ReactNode
}
export type ProfileStatisticsFollowersProps = {
}
export type ProfileStatisticsLikesProps = {
}
export type ProfileStatisticsViewsProps = {
}