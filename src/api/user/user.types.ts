export type UserFollowProps = {
    userId: string
    followedUserId: string
}

export type UserUnfollowProps = {
    userId: string
    followedUserId: string
}

export type UserDataByPkProps = {
    userId: string
    findedUserPk: string
}
