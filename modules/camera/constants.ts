import { Dimensions, Platform } from "react-native"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { CommonResolutions } from "react-native-vision-camera"

import sizes from "@/constants/sizes"

export const CONTENT_SPACING = 15

const SAFE_BOTTOM =
    Platform.select({
        ios: StaticSafeAreaInsets.safeAreaInsetsBottom,
    }) ?? 0

export const SAFE_AREA_PADDING = {
    paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_SPACING,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + CONTENT_SPACING,
    paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_SPACING,
    paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
}

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 10

export const SCREEN_WIDTH = Dimensions.get("window").width
export const SCREEN_HEIGHT = Platform.select<number>({
    android: Dimensions.get("screen").height - StaticSafeAreaInsets.safeAreaInsetsBottom,
    ios: Dimensions.get("window").height,
}) as number

// Capture Button
export const CAPTURE_BUTTON_SIZE = 85

// Control Button like Flash
export const CONTROL_BUTTON_SIZE = 45

// ---- Timing & recording ------------------------------------------------

export const MAX_RECORDING_TIME_SEC = 30
export const ZOOM_RESET_ANIM_MS = 220
export const ZOOM_INDICATOR_FADE_MS = 150
// Half-gap between the top indicators when both chips are on screen at
// once. Each chip translates this many px away from center so they meet
// in the middle instead of overlapping. Tuned by eye — chips are ~55px
// wide (zoom) and ~110px wide (flash), so 40 gives a tight ~4-8px gap
// between their edges.
export const TOP_INDICATOR_HALF_GAP_PX = 40
// Clips shorter than this are treated as accidental taps → silently
// discarded (with a warning notify). Duration comes back from
// onMediaCaptured in seconds.
export const MIN_PUBLISHABLE_SEC = 5
// Cancel-window duration between the recording ending and the real share
// firing. The CancelShareCard exposes the whole window as a countdown bar.
export const SHARE_CANCEL_WINDOW_MS = 5000

// ---- Layout ------------------------------------------------------------

export const CAMERA_WIDTH = sizes.moment.full.width
export const CAMERA_HEIGHT = sizes.moment.full.height
export const CAMERA_RADIUS = 40
export const BOTTOM_BAR_OFFSET = CONTENT_SPACING * 7
export const FLIP_HINT_ABOVE_BAR = 96
// Standard native-stack nav bar height. Applied as top padding on the root
// container so the preview sits below the (transparent) header — same
// vertical position it had before headerTransparent was turned on.
export const NAV_BAR_HEIGHT = 46
// Extra breathing room above the preview so the viewfinder sits a hair
// below the header + top indicator chips.
export const PREVIEW_TOP_OFFSET = 8

// ---- Video output ------------------------------------------------------

// Module-scope constant so useVideoOutput's memo deps (compared with
// Object.is) never see a fresh reference between renders.
export const VIDEO_OUTPUT_CONFIG = {
    targetResolution: CommonResolutions.FHD_16_9,
    enableAudio: false,
    // Keeps recording alive across a camera flip mid-shot.
    enablePersistentRecorder: true,
} as const
