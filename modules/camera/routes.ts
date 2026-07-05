// Camera module route types for Expo Router

export type CameraRoutes = {
    index: undefined
    permissions: undefined
}

// Legacy route names mapping (for backward compatibility)
export type Routes = {
    PermissionsPage: undefined
    CameraPage: undefined
}

// Expo Router paths
export const CAMERA_ROUTES = {
    INDEX: "/(tabs)/create",
} as const
