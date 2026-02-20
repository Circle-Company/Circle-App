import { MomentOptionsProps } from "./types"
import React from "react"

export interface MomentOptionsState extends MomentOptionsProps {
    setIsFeed: React.Dispatch<React.SetStateAction<boolean>>
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
    setIsHidden: React.Dispatch<React.SetStateAction<boolean>>
    setShowReportModal: React.Dispatch<React.SetStateAction<boolean>>
    set: (momentOptionsProps: MomentOptionsProps) => void
}

export function useOptions(): MomentOptionsState {
    const [showReportModal, setShowReportModal] = React.useState<boolean>(false)
    const [enableLike, setEnableLike] = React.useState<boolean>(false)
    const [enableComment, setEnableComment] = React.useState<boolean>(false)
    const [enableReport, setEnableReport] = React.useState<boolean>(false)
    const [enableWatch, setEnableWatch] = React.useState<boolean>(false)
    const [enableContentWarning, setEnableContentWarning] = React.useState<boolean>(false)
    const [isHidden, setIsHidden] = React.useState<boolean>(false)
    const [isFeed, setIsFeed] = React.useState<boolean>(false)
    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    function set(props: MomentOptionsProps) {
        setEnableReport(props.enableReport)
        setEnableComment(props.enableComment)
        setEnableWatch(props.enableWatch)
        setEnableLike(props.enableLike)
        setEnableContentWarning(props.enableContentWarning)
        setIsFeed(props.isFeed)
        setIsFocused(props.isFocused)
        setIsHidden(props.isHidden)
    }

    React.useEffect(() => {
        setIsFocused(isFocused)
    }, [isFocused])

    return {
        enableReport,
        enableLike,
        enableComment,
        enableWatch,
        enableContentWarning,
        showReportModal,
        setShowReportModal,
        isFeed,
        isFocused,
        isHidden,
        setIsFeed,
        setIsFocused,
        setIsHidden,
        set,
    }
}
