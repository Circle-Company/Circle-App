import { useEffect } from "react"
import type {
    useCameraPermission,
    useMicrophonePermission,
} from "react-native-vision-camera"

type CamPerm = ReturnType<typeof useCameraPermission>
type MicPerm = ReturnType<typeof useMicrophonePermission>

// One-shot request for camera + microphone permissions while `active`.
// Silent on failure — the UI shows dedicated fallback cards when either
// permission is missing.
export function useRequestCameraPermissions(
    cameraPermission: CamPerm,
    microphonePermission: MicPerm,
    active: boolean,
) {
    useEffect(() => {
        if (!active) return
        let cancelled = false
        ;(async () => {
            try {
                if (
                    !cameraPermission.hasPermission &&
                    cameraPermission.canRequestPermission
                ) {
                    await cameraPermission.requestPermission()
                }
                if (
                    !microphonePermission.hasPermission &&
                    microphonePermission.canRequestPermission
                ) {
                    await microphonePermission.requestPermission()
                }
            } catch {
                /* noop */
            }
            if (cancelled) return
        })()
        return () => {
            cancelled = true
        }
    }, [active, cameraPermission, microphonePermission])
}
