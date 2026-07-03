import { useEffect, useRef } from "react"

// Ticks recordingTime at 100ms so the header progress bar can advance
// smoothly. Auto-stops the recording once maxTime is reached.
export function useRecordingInterval(
    isRecording: boolean,
    setRecordingTime: (n: number) => void,
    setIsRecording: (b: boolean) => void,
    maxTime: number,
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isRecording) {
            if (!intervalRef.current) setRecordingTime(0)
            if (intervalRef.current) clearInterval(intervalRef.current)
            let current = 0
            intervalRef.current = setInterval(() => {
                current += 0.1
                if (current > maxTime) current = maxTime
                setRecordingTime(current)
                if (current >= maxTime) setIsRecording(false)
            }, 100)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setRecordingTime(0)
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isRecording, setRecordingTime, setIsRecording, maxTime])
}
