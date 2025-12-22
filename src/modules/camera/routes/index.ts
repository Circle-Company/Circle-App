// Camera module route types for Expo Router

export type CameraRoutes = {
    index: undefined
    permissions: undefined
    media: {
        videoUri: string
        duration?: string
        width?: string
        height?: string
    }
}

// Legacy route names mapping (for backward compatibility)
export type Routes = {
    PermissionsPage: undefined
    CameraPage: undefined
    MediaPage: {
        videoUri: string
        duration?: number
        width?: number
        height?: number
    }
}

// Expo Router paths
export const CAMERA_ROUTES = {
    INDEX: "/(tabs)/create",
    PERMISSIONS: "/(tabs)/create/permissions",
    MEDIA: "/(tabs)/create/media",
} as const
