import { istNotificationDelegationEnabled } from "@react-native-firebase/messaging"
import { MomentOptionsProps } from "./types"
import React from "react"

export interface MomentOptionsState extends MomentOptionsProps {
    enableLike: boolean
    enableComment: boolean
    enableReport: boolean
    enableWatch: boolean
    isFeed: boolean
    isFocused: boolean
    setIsFeed: React.Dispatch<React.SetStateAction<boolean>>
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
    set: (momentOptionsProps: MomentOptionsProps) => void
}

export function useOptions(): MomentOptionsState {
    const [enableLike, setEnableLike] = React.useState<boolean>(false)
    const [enableComment, setEnableComment] = React.useState<boolean>(false)
    const [enableReport, setEnableReport] = React.useState<boolean>(false)
    const [enableWatch, setEnableWatch] = React.useState<boolean>(false)
    const [isFeed, setIsFeed] = React.useState<boolean>(false)
    const [isFocused, setIsFocused] = React.useState<boolean>(false)

    function set(momentOptionsProps: MomentOptionsProps) {
        setEnableReport(momentOptionsProps.enableReport)
        setEnableComment(momentOptionsProps.enableComment)
        setEnableWatch(momentOptionsProps.enableWatch)
        setEnableLike(momentOptionsProps.enableLike)
        setIsFeed(momentOptionsProps.isFeed)
        setIsFocused(momentOptionsProps.isFocused)
    }

    React.useEffect(() => {
        setIsFocused(isFocused)
    }, [isFocused])

    return {
        enableReport,
        enableLike,
        enableComment,
        enableWatch,
        isFeed,
        isFocused,
        setIsFeed,
        setIsFocused,
        set,
    }
}
