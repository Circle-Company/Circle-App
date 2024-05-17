import { MomentUserActionsProps } from "./types"

export default class MomentUserActionsClass {
    public liked : boolean
    public shared: boolean
    public viewed: boolean
    public clickIntoMoment: boolean
    public watchTime: number
    public clickProfile: boolean
    public commented: boolean
    public likeComment: boolean
    public skipped: boolean
    public showLessOften: boolean
    public reported: boolean

    constructor({
        liked,
        shared,
        viewed,
        clickIntoMoment,
        watchTime,
        clickProfile,
        commented,
        likeComment,
        skipped,
        showLessOften,
        reported
    }: MomentUserActionsProps) {
        this.liked = liked
        this.shared = shared
        this.viewed = viewed
        this.clickIntoMoment = clickIntoMoment
        this.watchTime = watchTime
        this.clickProfile = clickProfile
        this.commented = commented
        this.likeComment = likeComment
        this.skipped = skipped
        this.showLessOften = showLessOften
        this.reported = reported
    }

    public setLiked(value: boolean): void { this.liked = value }
    public setShared(value: boolean): void { this.shared = value }
    public setViewed(value: boolean): void { this.viewed = value }
    public setClickIntoMoment(value: boolean): void { this.clickIntoMoment = value }
    public setWatchTime(value: number): void { this.watchTime = value }
    public setClickProfile(value: boolean): void { this.clickProfile = value }
    public setCommented(value: boolean): void { this.commented = value }
    public setLikeComment(value: boolean): void { this.likeComment = value }
    public setSkipped(value: boolean): void { this.skipped = value }
    public setShowLessOften(value: boolean): void { this.showLessOften = value }
    public setReported(value: boolean): void { this.reported = value }
}