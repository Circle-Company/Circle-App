import React, { useMemo } from "react"
import { Platform, StyleProp, View, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"

/**
 * Supported BlurTint values from expo-blur.
 * Keeping the union here avoids coupling to specific SDK typings while preserving DX.
 */
type BlurTint =
  | "light"
  | "dark"
  | "default"
  | "systemMaterial"
  | "systemThinMaterial"
  | "systemUltraThinMaterial"
  | "systemChromeMaterial"
  | "systemMaterialDark"
  | "systemThinMaterialDark"
  | "systemUltraThinMaterialDark"
  | "systemChromeMaterialDark"
  | "systemMaterialLight"
  | "systemThinMaterialLight"
  | "systemUltraThinMaterialLight"
  | "systemChromeMaterialLight"

export interface BlurredBackgroundProps {
  children?: React.ReactNode
  /**
   * Blur intensity (0-100+). Defaults to 50.
   */
  intensity?: number
  /**
   * Blur tint (platform-aware).
   * Defaults to "systemMaterialDark" on iOS and "dark" on Android.
   */
  tint?: BlurTint
  /**
   * Overlay color (behind children and above the blur), e.g. "#000" or "rgba(0,0,0,1)".
   * Defaults to "#000".
   */
  overlayColor?: string
  /**
   * Overlay opacity (0-1). Defaults to 0.5.
   * Only applied when overlayColor doesn't already include an alpha channel.
   */
  overlayOpacity?: number
  /**
   * Border radius to clip the blur/overlay. Defaults to 0.
   */
  radius?: number
  /**
   * Additional styles for the container (position is forced to "relative", overflow is "hidden").
   */
  style?: StyleProp<ViewStyle>
  /**
   * When true, disables blur/overlay and only renders children.
   */
  disabled?: boolean
  /**
   * Optional testID for testing.
   */
  testID?: string
}

/**
 * BlurredBackground
 *
 * A reusable wrapper that renders:
 * - An absolute BlurView behind content (with optional overlay for contrast)
 * - Your children above the overlays
 *
 * Notes:
 * - Uses absolute overlays to avoid layout jank.
 * - Keeps container overflow hidden to respect borderRadius.
 * - Works well over dynamic content like videos or images.
 */
export const BlurredBackground: React.FC<BlurredBackgroundProps> = ({
  children,
  intensity = 50,
  tint,
  overlayColor = "#000",
  overlayOpacity = 0.5,
  radius = 0,
  style,
  disabled = false,
  testID,
}) => {
  const platformTint: BlurTint = useMemo<BlurTint>(() => {
    if (tint) return tint
    // Reasonable defaults per platform
    return Platform.OS === "ios" ? "systemMaterialDark" : ("dark" as BlurTint)
  }, [tint])

  const absoluteFill = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: radius,
    }),
    [radius],
  )

  const containerStyle = useMemo(
    () =>
      [
        {
          position: "relative" as const,
          overflow: "hidden" as const,
          borderRadius: radius,
        },
        style,
      ] as StyleProp<ViewStyle>,
    [radius, style],
  )

  const resolvedOverlayBG = useMemo(() => {
    // If overlayColor already has alpha (rgba/hsla/#AARRGGBB), use as-is
    if (hasAlphaChannel(overlayColor)) return overlayColor
    // Otherwise, apply provided overlayOpacity
    return applyOpacity(overlayColor, overlayOpacity)
  }, [overlayColor, overlayOpacity])

  if (disabled) {
    return (
      <View testID={testID} style={containerStyle}>
        {children}
      </View>
    )
  }

  return (
    <View testID={testID} style={containerStyle}>
      {/* Absolute blur layer */}
      <BlurView intensity={intensity} tint={platformTint} pointerEvents="none" style={absoluteFill} />

      {/* Absolute overlay above blur (for consistent contrast) */}
      <View pointerEvents="none" style={[absoluteFill, { backgroundColor: resolvedOverlayBG }]} />

      {/* Content */}
      {children}
    </View>
  )
}

/**
 * Quick check if a color string already contains an alpha channel.
 * Supports rgba(...), hsla(...), and #AARRGGBB / #ARGB forms.
 */
function hasAlphaChannel(color: string): boolean {
  const c = color.trim().toLowerCase()
  if (c.startsWith("rgba(") || c.startsWith("hsla(")) return true
  // #ARGB (4 chars) or #AARRGGBB (9 chars)
  if (c.startsWith("#") && (c.length === 5 || c.length === 9)) return true
  return false
}

/**
 * Apply opacity to a hex or named color by converting to rgba().
 * Falls back to rgba(0,0,0,opacity) when conversion fails.
 */
function applyOpacity(color: string, opacity: number): string {
  try {
    const { r, g, b } = toRGB(color)
    const o = clamp(opacity, 0, 1)
    return `rgba(${r}, ${g}, ${b}, ${o})`
  } catch {
    const o = clamp(opacity, 0, 1)
    return `rgba(0,0,0,${o})`
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Convert a CSS color to RGB.
 * Supports:
 * - #RGB, #RRGGBB
 * - Named colors fallback via canvas-like mapping can be extended here if desired.
 */
function toRGB(color: string): { r: number; g: number; b: number } {
  const c = color.trim()

  // #RGB
  const shortHex = /^#([a-fA-F0-9]{3})$/
  const longHex = /^#([a-fA-F0-9]{6})$/

  if (shortHex.test(c)) {
    const [, hex] = c.match(shortHex) as RegExpMatchArray
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return { r, g, b }
  }

  if (longHex.test(c)) {
    const [, hex] = c.match(longHex) as RegExpMatchArray
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return { r, g, b }
  }

  // Basic named colors support (extend if needed)
  const named: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    transparent: [0, 0, 0],
  }

  const lower = c.toLowerCase()
  if (named[lower]) {
    const [r, g, b] = named[lower]
    return { r, g, b }
  }

  // Fallback: try rgb(...) form
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  const m = c.match(rgb)
  if (m) {
    return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) }
  }

  throw new Error(`Unsupported color format: ${color}`)
}

export default React.memo(BlurredBackground)
