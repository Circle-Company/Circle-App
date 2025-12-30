/**
 * Camera Module
 *
 * This module has been migrated to Expo Router.
 * The navigation is now handled in app/(tabs)/create/_layout.tsx
 *
 * This file re-exports the main components for convenience.
 */

export { CameraPage } from "./pages/camera"
export { PermissionsPage } from "./pages/permissions"
export { MediaPage } from "./pages/share"
export { DevicesPage } from "./pages/devices"

export { CameraProvider, useCameraContext } from "./context"

export type { Routes, CameraRoutes } from "./routes"
export { CAMERA_ROUTES } from "./routes"

// Default export for backward compatibility with (tabs)/create
import { CameraPage } from "./pages/camera"
export default CameraPage
