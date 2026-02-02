import { MomentVideoProps } from "./types"
import React from "react"
import PersistedContext from "../../../contexts/Persisted"

export interface MomentVideoState extends MomentVideoProps {
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>
    setDuration: React.Dispatch<React.SetStateAction<number>>
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>
    togglePlay: () => void
    set: (video: MomentVideoProps) => void
}

export function useVideo(): MomentVideoState {
    const [currentTime, setCurrentTime] = React.useState<number>(0)
    const [duration, setDuration] = React.useState<number>(0)
    const [isPaused, setIsPaused] = React.useState<boolean>(false)
    const [isMuted, setIsMuted] = React.useState<boolean>(false)
    const [shadow, setShadow] = React.useState<MomentVideoProps["shadow"]>({
        bottom: true,
        top: true,
    })
    const { session } = React.useContext(PersistedContext)

    React.useEffect(() => {
        const prefMuted = session?.preferences?.content?.muteAudio ?? false
        setIsMuted(prefMuted)
    }, [session?.preferences?.content?.muteAudio])

    function togglePlay() {
        setIsPaused((prev) => !prev)
    }

    function set(video: MomentVideoProps) {
        setCurrentTime(video.currentTime)
        setDuration(video.duration)
        setIsPaused(video.isPaused)
        setShadow(video.shadow)
        if (video.isMuted !== undefined) {
            setIsMuted(video.isMuted)
        }
    }

    return {
        currentTime,
        duration,
        isPaused,
        isMuted,
        setCurrentTime,
        setDuration,
        setIsPaused,
        setIsMuted,
        togglePlay,
        shadow,
        set,
    }
}
