import React, { useMemo } from "react"
import {
  Platform,
  UIManager,
  requireNativeComponent,
  StyleSheet,
  View as RNView,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native"
import BlurredBackground from "../general/blurred-background"

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

export interface LikeBlurBackgroundProps extends ViewProps {
  children?: React.ReactNode
  /**
   * Blur intensity (0-100+). Defaults to 50.
   * Native prop name: intensity
   */
  intensity?: number
  /**
   * Native blur tint (iOS). Defaults to "systemMaterialDark".
   * Native prop name: tint
   */
  tint?: BlurTint
  /**
   * Overlay color applied above the blur (use hex/rgb/rgba).
   * Native prop name: overlayColor
   */
  overlayColor?: string
  /**
   * Corner radius for clipping the content and the blur.
   * Native prop name: cornerRadius
   */
  radius?: number
  /**
   * When true, disables blur/overlay and only renders children.
   * Native prop name: disabled
   */
  disabled?: boolean
  /**
   * Optional style for the outer container (position, size).
   * Note: overflow and borderRadius are controlled by props to ensure proper clipping.
   */
  style?: StyleProp<ViewStyle>
  /**
   * testID for E2E/UI tests
   */
  testID?: string
}

type NativeLikeRowProps = {
  intensity?: number
  tint?: BlurTint
  overlayColor?: string
  cornerRadius?: number
  disabled?: boolean
  style?: any
}

const NATIVE_VIEW_NAME = "ExpoLikeRow"

// Detect native availability at runtime
const hasNativeIOS =
  Platform.OS === "ios" &&
  (typeof UIManager.getViewManagerConfig === "function"
    ? UIManager.getViewManagerConfig(NATIVE_VIEW_NAME) != null
    : // Older RN fallback (string index may exist on UIManager)
      (UIManager as any)[NATIVE_VIEW_NAME] != null)

// Require native component if available
const NativeLikeRow: React.ComponentType<NativeLikeRowProps> | null = hasNativeIOS
  ? // @ts-ignore – resolved at runtime
    requireNativeComponent<NativeLikeRowProps>(NATIVE_VIEW_NAME)
  : null

/**
 * LikeBlurBackground
 *
 * iOS:
 *  - Uses the native SwiftUI view (ExpoLikeRow) when available for better performance.
 *  - Falls back to a JS BlurView wrapper if native view is not available.
 *
 * Android / others:
 *  - Uses the JS BlurView wrapper (BlurredBackground).
 *
 * The blur is rendered behind the children using absolute positioning, and
 * the container clips by the given corner radius.
 */
export const LikeBlurBackground: React.FC<LikeBlurBackgroundProps> = ({
  children,
  intensity = 50,
  tint = "systemMaterialDark",
  overlayColor = "rgba(0,0,0,0.5)",
  radius = 12,
  disabled = false,
  style,
  testID,
  ...props
}) => {
  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      {
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
      },
      style,
    ],
    [radius, style],
  )

  if (hasNativeIOS && NativeLikeRow) {
    return (
      <RNView testID={testID} style={containerStyle} {...props}>
        <NativeLikeRow
          style={StyleSheet.absoluteFill}
          intensity={intensity}
          tint={tint}
          overlayColor={overlayColor}
          cornerRadius={radius}
          disabled={disabled}
        />
        {children}
      </RNView>
    )
  }

  // Fallback for Android or when native view is not present on iOS
  return (
    <BlurredBackground
      testID={testID}
      intensity={intensity}
      // Map to a cross-platform default tint:
      tint={Platform.OS === "ios" ? tint : "dark"}
      overlayColor={overlayColor}
      radius={radius}
      disabled={disabled}
      style={containerStyle}
      {...props}
    >
      {children}
    </BlurredBackground>
  )
}

export default React.memo(LikeBlurBackground)
