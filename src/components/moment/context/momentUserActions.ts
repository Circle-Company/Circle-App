import React from "react"
import { MomentUserActionsProps } from "./types"

export interface MomentUserActionsState extends MomentUserActionsProps {
    setShared: React.Dispatch<React.SetStateAction<boolean>>
    setViewed: React.Dispatch<React.SetStateAction<boolean>>
    setClickIntoMoment: React.Dispatch<React.SetStateAction<boolean>>
    setWatchTime: React.Dispatch<React.SetStateAction<number>>
    setClickProfile: React.Dispatch<React.SetStateAction<boolean>>
    setCommented: React.Dispatch<React.SetStateAction<boolean>>
    setLikeComment: React.Dispatch<React.SetStateAction<boolean>>
    setSkipped: React.Dispatch<React.SetStateAction<boolean>>
    setShowLessOften: React.Dispatch<React.SetStateAction<boolean>>
    setReported: React.Dispatch<React.SetStateAction<boolean>>
    setMomentUserActions: (momentUserActions: MomentUserActionsProps) => void
    exportMomentUserActions: () => MomentUserActionsProps
    handleLikeButtonPressed: ({ likedValue }: { likedValue?: boolean }) => void
}

export function useMomentUserActions(): MomentUserActionsState {
    const [liked, setLiked] = React.useState<boolean>(false)
    const [shared, setShared] = React.useState<boolean>(false)
    const [viewed, setViewed] = React.useState<boolean>(false)
    const [clickIntoMoment, setClickIntoMoment] = React.useState<boolean>(false)
    const [watchTime, setWatchTime] = React.useState<number>(0)
    const [clickProfile, setClickProfile] = React.useState<boolean>(false)
    const [commented, setCommented] = React.useState<boolean>(false)
    const [likeComment, setLikeComment] = React.useState<boolean>(false)
    const [skipped, setSkipped] = React.useState<boolean>(false)
    const [showLessOften, setShowLessOften] = React.useState<boolean>(false)
    const [reported, setReported] = React.useState<boolean>(false)

    function exportMomentUserActions(): MomentUserActionsProps {
        return {
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
            reported,
        }
    }

    function handleLikeButtonPressed() {
        if (liked == true) setLiked(false)
        else setLiked(true)
    }

    function setMomentUserActions(momentUserActions: MomentUserActionsProps) {
        setLiked(momentUserActions.liked)
        setShared(momentUserActions.shared)
        setViewed(momentUserActions.viewed)
        setClickIntoMoment(momentUserActions.clickIntoMoment)
        setWatchTime(momentUserActions.watchTime)
        setClickProfile(momentUserActions.clickProfile)
        setCommented(momentUserActions.commented)
        setLikeComment(momentUserActions.likeComment)
        setSkipped(momentUserActions.skipped)
        setShowLessOften(momentUserActions.showLessOften)
        setReported(momentUserActions.reported)
    }

    return {
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
        reported,
        setShared,
        setViewed,
        setClickIntoMoment,
        setWatchTime,
        setClickProfile,
        setCommented,
        setLikeComment,
        setSkipped,
        setShowLessOften,
        setReported,

        setMomentUserActions,
        exportMomentUserActions,
        handleLikeButtonPressed,
    }
}
