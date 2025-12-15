import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react"
import { uploadMoment } from "../hooks/uploadMoment"
import PersistedContext from "@/contexts/Persisted"

export type CameraVideoInfo = {
    path: string
    duration?: number
    size?: number
    mimeType?: string
    buffer?: string | null
    // Allow extra fields coming from native camera libs
    [key: string]: any
} | null

type UploadResult = { ok: true; data: any } | { ok: false; error: string }

type CameraContextType = {
    // Recording state
    isRecording: boolean
    setIsRecording: (value: boolean) => void

    // Video state
    video: CameraVideoInfo
    setVideo: (video: CameraVideoInfo) => void

    // Timer state
    recordingTime: number
    setRecordingTime: (value: number) => void

    // Raw video buffer (expected base64 or data-URI)
    videoBuffer: string | null
    setVideoBuffer: (buffer: string | null) => void

    // Optional metadata
    description: string | null
    setDescription: (description: string | null) => void

    // Auth token to be used by default on upload (can be overridden per call)
    authToken: string | null
    setAuthToken: (token: string | null) => void

    // Upload state
    isUploading: boolean
    uploadError: string | null
    lastUploadResponse: any | null
    clearUploadError: () => void

    // Actions
    upload: () => Promise<UploadResult>
    reset: () => void
}

const CameraContext = createContext<CameraContextType | undefined>(undefined)

export const CameraProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useContext(PersistedContext)
    const [isRecording, setIsRecording] = useState(false)
    const [video, setVideo] = useState<CameraVideoInfo>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [videoBuffer, setVideoBuffer] = useState<string | null>(null)
    const [description, setDescription] = useState<string | null>(null)
    const [authToken, setAuthToken] = useState<string | null>(null)

    // Upload state
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [lastUploadResponse, setLastUploadResponse] = useState<any | null>(null)

    const clearUploadError = useCallback(() => setUploadError(null), [])

    const reset = useCallback(() => {
        setIsRecording(false)
        setVideo(null)
        setRecordingTime(0)
        setVideoBuffer(null)
        setDescription(null)
        setIsUploading(false)
        setUploadError(null)
        setLastUploadResponse(null)
        // authToken intentionally preserved across resets
    }, [])

    const normalizeToken = (token: string) => {
        const t = token.trim()
        return t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`
    }

    const upload: CameraContextType["upload"] = useCallback(async () => {
        setIsUploading(true)
        setUploadError(null)
        setLastUploadResponse(null)

        console.log("🚀 Upload iniciado")
        console.log("Video info:", video)

        try {
            // Validate preconditions
            if (!video) {
                const msg = "No video selected to upload"
                console.error("❌ Erro:", msg)
                setUploadError(msg)
                return { ok: false, error: msg }
            }

            if (!video.path) {
                const msg = "Video path is missing"
                console.error("❌ Erro:", msg)
                setUploadError(msg)
                return { ok: false, error: msg }
            }

            // Delegate upload to hook (conversion to base64 happens there)
            console.log("📤 Enviando para uploadMoment...")

            // Extract filename from path
            const filename = video.path.split("/").pop() || "video.mp4"

            const data = await uploadMoment({
                description: description !== undefined ? description : null,
                videoMetadata: {
                    filename: filename,
                    mimeType: video?.mimeType || "video/mp4",
                    size: typeof video?.size === "number" ? video.size : 0,
                },
                videoPath: video.path,
                jwtToken: normalizeToken(session.account.jwtToken),
            })

            console.log("✅ Upload concluído com sucesso!")
            setLastUploadResponse(data)
            return { ok: true, data }
        } catch (err: any) {
            // Normalize error message
            const status = err?.response?.status
            const detail = err?.response?.data
            const message =
                typeof detail === "string"
                    ? detail
                    : detail?.message || err?.message || "Unknown error during upload"

            const msg = status
                ? `Upload failed (${status}): ${message}`
                : `Upload failed: ${message}`

            console.error("❌ Erro durante upload:", msg)
            console.error("Erro completo:", err)

            setUploadError(msg)
            return { ok: false, error: msg }
        } finally {
            setIsUploading(false)
        }
    }, [video, description, session.account.jwtToken])

    const value = useMemo<CameraContextType>(
        () => ({
            // recording
            isRecording,
            setIsRecording,

            // video
            video,
            setVideo,

            // timer
            recordingTime,
            setRecordingTime,

            // buffer
            videoBuffer,
            setVideoBuffer,

            // metadata
            description,
            setDescription,

            // auth
            authToken,
            setAuthToken,

            // upload state
            isUploading,
            uploadError,
            lastUploadResponse,
            clearUploadError,

            // actions
            upload,
            reset,
        }),
        [
            isRecording,
            video,
            recordingTime,
            videoBuffer,
            description,
            authToken,
            isUploading,
            uploadError,
            lastUploadResponse,
            upload,
            reset,
            clearUploadError,
        ],
    )

    return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
}

export const useCameraContext = () => {
    const ctx = useContext(CameraContext)
    if (!ctx) {
        throw new Error("useCameraContext must be used within a CameraProvider")
    }
    return ctx
}
