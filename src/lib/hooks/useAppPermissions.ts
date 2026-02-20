import React from "react"
import { Linking, Platform } from "react-native"

// Camera & Microphone (react-native-vision-camera)
import { Camera } from "react-native-vision-camera"

// Photos / Media Library (expo-image-picker)
import * as ImagePicker from "expo-image-picker"

// Location (expo-location)
import * as Location from "expo-location"

export type PermissionId =
    | "camera"
    | "microphone"
    | "mediaLibrary"
    | "locationForeground"
    | "locationBackground"

export type PermissionStatus = "unknown" | "granted" | "denied" | "limited"

export interface PermissionItem {
    id: PermissionId
    title: string
    description: string
    required: boolean
    status: PermissionStatus
    request: () => Promise<PermissionStatus>
    openSettings?: () => Promise<void>
    // Hints for UI (not required by consumer)
    canAskAgain?: boolean
}

export type UseAppPermissionsOptions = {
    // Which permissions are considered required to continue
    required?: PermissionId[]
    // Called whenever one permission status changes
    onStatusChange?: (id: PermissionId, status: PermissionStatus) => void
}

export type UseAppPermissionsResult = {
    items: PermissionItem[]
    refresh: () => Promise<void>
    requestOne: (id: PermissionId) => Promise<PermissionStatus>
    requestAllInOrder: () => Promise<void>
    hasMissingRequired: boolean
    requiredMissingIds: PermissionId[]
    // Utility to open app settings directly
    openSettings: () => Promise<void>
}

const DEFAULT_REQUIRED: PermissionId[] = ["camera", "microphone", "mediaLibrary"]

// Utilities
const openSettings = async () => {
    try {
        if (typeof (Linking as any).openSettings === "function") {
            await (Linking as any).openSettings()
            return
        }
    } catch {}
    await Linking.openURL("app-settings:")
}

const mapVisionCameraStatus = (s: string | undefined): PermissionStatus => {
    switch (s) {
        case "authorized":
        case "granted":
            return "granted"
        case "denied":
            return "denied"
        case "restricted":
        case "limited":
            return "limited"
        case "not-determined":
        case "undetermined":
        default:
            return "unknown"
    }
}

const mapExpoPermissionStatus = (s: string | undefined): PermissionStatus => {
    switch (s) {
        case "granted":
            return "granted"
        case "denied":
            return "denied"
        case "limited":
            return "limited"
        case "undetermined":
        default:
            return "unknown"
    }
}

export function useAppPermissions(options: UseAppPermissionsOptions = {}): UseAppPermissionsResult {
    const required = React.useMemo(
        () => new Set<PermissionId>(options.required ?? DEFAULT_REQUIRED),
        [options.required],
    )

    // Local state for all items
    const [items, setItems] = React.useState<PermissionItem[]>(() => {
        const base: Omit<PermissionItem, "request">[] = [
            {
                id: "camera",
                title: "Camera Access",
                description: "Record and share Moments with your camera.",
                required: required.has("camera"),
                status: "unknown",
                openSettings,
            },
            {
                id: "microphone",
                title: "Microphone Access",
                description: "Capture audio for your videos and voice notes.",
                required: required.has("microphone"),
                status: "unknown",
                openSettings,
            },
            {
                id: "mediaLibrary",
                title: "Photos & Media Access",
                description: "Choose photos and videos from your library.",
                required: required.has("mediaLibrary"),
                status: "unknown",
                openSettings,
            },
            {
                id: "locationForeground",
                title: "Location Access",
                description: "Share your approximate location to discover nearby content.",
                required: required.has("locationForeground"),
                status: "unknown",
                openSettings,
            },
            {
                id: "locationBackground",
                title: "Allow Background Location",
                description:
                    "Keep your location up to date even when you’re not using the app for better nearby content.",
                required: required.has("locationBackground"),
                status: "unknown",
                openSettings,
            },
        ]

        // Placeholder request; replaced after in hook body
        return base.map((b) => ({ ...b, request: async () => b.status }))
    })

    const updateOne = React.useCallback(
        (id: PermissionId, partial: Partial<PermissionItem>) => {
            let didChange = false
            let statusChanged = false
            setItems((prev) => {
                let localChange = false
                let localStatusChanged = false
                const next = prev.map((it) => {
                    if (it.id !== id) return it
                    // Check if any provided partial field actually changes
                    let needsUpdate = false
                    for (const key of Object.keys(partial) as (keyof PermissionItem)[]) {
                        const nextVal = partial[key]
                        if (nextVal !== undefined && it[key] !== nextVal) {
                            needsUpdate = true
                        }
                    }
                    if (needsUpdate) {
                        localChange = true
                        if (partial.status !== undefined && it.status !== partial.status) {
                            localStatusChanged = true
                        }
                        return { ...it, ...partial }
                    }
                    return it
                })
                didChange = localChange
                statusChanged = localStatusChanged
                return localChange ? next : prev
            })
            if (statusChanged && partial.status !== undefined) {
                options.onStatusChange?.(id, partial.status)
            }
        },
        [options],
    )

    // Build "request" functions that always work with latest closures
    const buildRequesters = React.useCallback(() => {
        const requesters: Record<PermissionId, () => Promise<PermissionStatus>> = {
            camera: async () => {
                try {
                    const status = await Camera.requestCameraPermission()
                    return mapVisionCameraStatus(status)
                } catch {
                    return "unknown"
                }
            },

            microphone: async () => {
                try {
                    const status = await Camera.requestMicrophonePermission()
                    return mapVisionCameraStatus(status)
                } catch {
                    return "unknown"
                }
            },

            mediaLibrary: async () => {
                try {
                    const result = await ImagePicker.requestMediaLibraryPermissionsAsync()
                    // iOS may support limited access
                    if (
                        (result as any).accessPrivileges === "limited" ||
                        (result as any).status === "limited"
                    ) {
                        return "limited"
                    }
                    return mapExpoPermissionStatus(result.status)
                } catch {
                    return "unknown"
                }
            },

            locationForeground: async () => {
                try {
                    const res = await Location.requestForegroundPermissionsAsync()
                    return mapExpoPermissionStatus(res.status)
                } catch {
                    return "unknown"
                }
            },

            locationBackground: async () => {
                try {
                    // Ensure FG granted first
                    const fg = await Location.getForegroundPermissionsAsync()
                    if (fg.status !== "granted") return "denied"
                    const res = await Location.requestBackgroundPermissionsAsync()
                    return mapExpoPermissionStatus(res.status)
                } catch {
                    return "unknown"
                }
            },
        }

        // Attach into state items so UI consumers can call item.request()
        setItems((prev) => prev.map((it) => ({ ...it, request: requesters[it.id] })))
    }, [])

    React.useEffect(() => {
        buildRequesters()
    }, [buildRequesters])

    // Read current statuses without prompting the OS
    const refresh = React.useCallback(async () => {
        // camera
        try {
            const s = mapVisionCameraStatus(await Camera.getCameraPermissionStatus())
            updateOne("camera", { status: s })
        } catch {}

        // microphone
        try {
            const s = mapVisionCameraStatus(await Camera.getMicrophonePermissionStatus())
            updateOne("microphone", { status: s })
        } catch {}

        // media library
        try {
            const res = await ImagePicker.getMediaLibraryPermissionsAsync(false)
            const status =
                (res as any).accessPrivileges === "limited" || (res as any).status === "limited"
                    ? "limited"
                    : mapExpoPermissionStatus(res.status)
            updateOne("mediaLibrary", { status, canAskAgain: Boolean((res as any).canAskAgain) })
        } catch {}

        // location foreground
        try {
            const fg = await Location.getForegroundPermissionsAsync()
            updateOne("locationForeground", {
                status: mapExpoPermissionStatus(fg.status),
                canAskAgain: Boolean((fg as any).canAskAgain),
            })
        } catch {}

        // location background (only check if FG granted for clearer UX)
        try {
            const fg = await Location.getForegroundPermissionsAsync()
            if (fg.status === "granted") {
                const bg = await Location.getBackgroundPermissionsAsync()
                updateOne("locationBackground", {
                    status: mapExpoPermissionStatus(bg.status),
                    canAskAgain: Boolean((bg as any).canAskAgain),
                })
            } else {
                updateOne("locationBackground", { status: "unknown" })
            }
        } catch {}
    }, [updateOne])

    // Request a single permission by id
    const requestOne = React.useCallback(
        async (id: PermissionId) => {
            const current = items.find((i) => i.id === id)
            if (!current?.request) return "unknown"
            const status = await current.request()
            updateOne(id, { status })
            return status
        },
        [items, updateOne],
    )

    // Recommended request order
    const ORDER: PermissionId[] = React.useMemo(
        () => ["camera", "microphone", "mediaLibrary", "locationForeground", "locationBackground"],
        [],
    )

    const requestAllInOrder = React.useCallback(async () => {
        for (const id of ORDER) {
            const item = items.find((i) => i.id === id)
            if (!item) continue
            if (item.status !== "granted") {
                // For BG location, ensure FG is granted before asking
                if (id === "locationBackground") {
                    const fg = items.find((i) => i.id === "locationForeground")
                    if (fg?.status !== "granted") continue
                }
                const s = await item.request()
                updateOne(id, { status: s })
            }
        }
    }, [ORDER, items, updateOne])

    // Compute "required" gaps
    const requiredMissingIds = React.useMemo<PermissionId[]>(() => {
        return items
            .filter((it) => it.required)
            .filter((it) => {
                // Consider "limited" as sufficient for mediaLibrary to proceed
                if (it.id === "mediaLibrary") {
                    return it.status !== "granted" && it.status !== "limited"
                }
                return it.status !== "granted"
            })
            .map((it) => it.id)
    }, [items])

    const hasMissingRequired = requiredMissingIds.length > 0

    return {
        items,
        refresh,
        requestOne,
        requestAllInOrder,
        hasMissingRequired,
        requiredMissingIds,
        openSettings,
    }
}

// Export defaults for consumers
export const REQUIRED_DEFAULT = DEFAULT_REQUIRED
export default useAppPermissions
