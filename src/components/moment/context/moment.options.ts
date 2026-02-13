import { MomentOptionsProps } from "./types"
import React from "react"

export interface MomentOptionsState extends MomentOptionsProps {
    setIsFeed: React.Dispatch<React.SetStateAction<boolean>>
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
    setHide: React.Dispatch<React.SetStateAction<boolean>>
    set: (momentOptionsProps: MomentOptionsProps) => void
}

export function useOptions(): MomentOptionsState {
    const [hide, setHide] = React.useState<boolean>(false)
    const [enableLike, setEnableLike] = React.useState<boolean>(false)
    const [enableComment, setEnableComment] = React.useState<boolean>(false)
    const [enableReport, setEnableReport] = React.useState<boolean>(false)
    const [enableWatch, setEnableWatch] = React.useState<boolean>(false)
    const [enableContentWarning, setEnableContentWarning] = React.useState<boolean>(false)
    const [isFeed, setIsFeed] = React.useState<boolean>(false)
    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    function set(momentOptionsProps: MomentOptionsProps) {
        setEnableReport(momentOptionsProps.enableReport)
        setEnableComment(momentOptionsProps.enableComment)
        setEnableWatch(momentOptionsProps.enableWatch)
        setEnableLike(momentOptionsProps.enableLike)
        setEnableContentWarning(momentOptionsProps.enableContentWarning)
        setIsFeed(momentOptionsProps.isFeed)
        setIsFocused(momentOptionsProps.isFocused)
        setHide(momentOptionsProps.hide)
    }

    React.useEffect(() => {
        setIsFocused(isFocused)
    }, [isFocused])

    return {
        hide,
        enableReport,
        enableLike,
        enableComment,
        enableWatch,
        enableContentWarning,
        isFeed,
        isFocused,
        setIsFeed,
        setIsFocused,
        setHide,
        set,
    }
}
