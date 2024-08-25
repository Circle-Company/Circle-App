export type UserFollowProps = {
    userId: number
    followedUserId: number
}

export type UserUnfollowProps = {
    userId: number
    followedUserId: number
}

export type UserDataByPkProps = {
    userId: number
    findedUserPk: number
}
