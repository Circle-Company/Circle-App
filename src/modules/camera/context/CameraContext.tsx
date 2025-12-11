import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"

export type CameraVideoInfo = {
    path: string
    duration?: number
    size?: number
    mimeType?: string
    [key: string]: any
} | null

type CameraContextType = {
    isRecording: boolean
    setIsRecording: (value: boolean) => void
    video: CameraVideoInfo
    setVideo: (video: CameraVideoInfo) => void
    recordingTime: number
    setRecordingTime: (value: number) => void
    reset: () => void
}

const CameraContext = createContext<CameraContextType | undefined>(undefined)

export const CameraProvider = ({ children }: { children: ReactNode }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [video, setVideo] = useState<CameraVideoInfo>(null)
    const [recordingTime, setRecordingTime] = useState(0)

    const reset = useCallback(() => {
        setIsRecording(false)
        setVideo(null)
        setRecordingTime(0)
    }, [])

    return (
        <CameraContext.Provider
            value={{
                isRecording,
                setIsRecording,
                video,
                setVideo,
                recordingTime,
                setRecordingTime,
                reset,
            }}
        >
            {children}
        </CameraContext.Provider>
    )
}

export const useCameraContext = () => {
    const ctx = useContext(CameraContext)
    if (!ctx) {
        throw new Error("useCameraContext must be used within a CameraProvider")
    }
    return ctx
}
