import { useEffect, useRef } from "react"

// Ticks recordingTime at ~100ms so the header progress bar can advance
// smoothly. Auto-stops the recording once maxTime is reached.
//
// Elapsed is computed from a startedAt timestamp (Date.now diff) rather
// than by summing 0.1 per tick. setInterval on the JS thread jitters and
// throttles under load — the old +=0.1 scheme fell increasingly behind
// wall clock across successive recordings as the app warmed up, which
// looked like the timer "slowing down".
export function useRecordingInterval(
    isRecording: boolean,
    setRecordingTime: (n: number) => void,
    setIsRecording: (b: boolean) => void,
    maxTime: number,
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const startedAtRef = useRef<number>(0)

    useEffect(() => {
        const clear = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        if (isRecording) {
            clear()
            startedAtRef.current = Date.now()
            setRecordingTime(0)

            intervalRef.current = setInterval(() => {
                const elapsed = (Date.now() - startedAtRef.current) / 1000
                const clamped = Math.min(elapsed, maxTime)
                setRecordingTime(clamped)
                if (elapsed >= maxTime) setIsRecording(false)
            }, 100)
        } else {
            clear()
            setRecordingTime(0)
        }

        return clear
    }, [isRecording, setRecordingTime, setIsRecording, maxTime])
}
