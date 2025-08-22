import { MomentVideoProps } from "./types"
import React from "react"

export interface MomentVideoState extends MomentVideoProps {
    setCurrentTime: React.Dispatch<React.SetStateAction<number>>
    setDuration: React.Dispatch<React.SetStateAction<number>>
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>
    togglePlay: () => void
    setMomentVideo: (momentVideo: MomentVideoProps) => void
    exportMomentVideo: () => MomentVideoProps
}

export function useMomentVideo(): MomentVideoState {
    const [currentTime, setCurrentTime] = React.useState<number>(0)
    const [duration, setDuration] = React.useState<number>(0)
    const [isPaused, setIsPaused] = React.useState<boolean>(false)
    const [isMuted, setIsMuted] = React.useState<boolean>(false)

    function togglePlay() {
        setIsPaused(prev => !prev)
    }

    function exportMomentVideo(): MomentVideoProps {
        return {
            currentTime,
            duration,
            isPaused,
            isMuted,
        }
    }

    function setMomentVideo(momentVideo: MomentVideoProps) {
        setCurrentTime(momentVideo.currentTime)
        setDuration(momentVideo.duration)
        setIsPaused(momentVideo.isPaused)
        if (momentVideo.isMuted !== undefined) {
            setIsMuted(momentVideo.isMuted)
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
        setMomentVideo,
        exportMomentVideo
    }
} 