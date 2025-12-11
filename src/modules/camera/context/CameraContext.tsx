import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"

export type CameraVideoInfo = {
    path: string
    duration?: number
    size?: number
    mimeType?: string
    buffer?: string | null
    [key: string]: any
} | null

type CameraContextType = {
    isRecording: boolean
    setIsRecording: (value: boolean) => void
    video: CameraVideoInfo
    setVideo: (video: CameraVideoInfo) => void
    recordingTime: number
    setRecordingTime: (value: number) => void
    videoBuffer: string | null
    setVideoBuffer: (buffer: string | null) => void
    reset: () => void
}

const CameraContext = createContext<CameraContextType | undefined>(undefined)

export const CameraProvider = ({ children }: { children: ReactNode }) => {
    const [isRecording, setIsRecording] = useState(false)
    const [video, setVideo] = useState<CameraVideoInfo>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [videoBuffer, setVideoBuffer] = useState<string | null>(null)

    const reset = useCallback(() => {
        setIsRecording(false)
        setVideo(null)
        setRecordingTime(0)
        setVideoBuffer(null)
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
                videoBuffer,
                setVideoBuffer,
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
