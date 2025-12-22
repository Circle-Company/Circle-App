import React, { useMemo, useRef } from "react"
import {
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  Animated,
} from "react-native"
import { BlurView } from "expo-blur"
import LikeIcon from "@/assets/icons/svgs/heart_2.svg"

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

export interface IOSLikeButtonProps {
  liked?: boolean
  count?: number
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle>

  // Blur/overlay
  radius?: number
  intensity?: number
  tint?: BlurTint
  overlayColor?: string
  likedOverlayColor?: string

  // Content
  iconSize?: number
  iconColor?: string
  textColor?: string
  paddingHorizontal?: number
  paddingVertical?: number

  // Accessibility / test
  accessibilityLabel?: string
  testID?: string

  // Disable interactions
  disabled?: boolean
}

function formatCount(n: number | undefined): string {
  const v = typeof n === "number" ? n : 0
  if (v < 1000) return String(v)
  if (v < 1_000_000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
}

/**
 * iOSLikeButton
 * - iOS: BlurView absoluto (expo-blur) montado desde o primeiro render (sem latência), overlay + conteúdo.
 * - Outras plataformas: fallback com overlay (sem blur) mantendo layout idêntico.
 *
 * Observações de performance:
 * - BlurView e overlay usam pointerEvents="none" e posição absoluta.
 * - O container clipa pelo borderRadius para garantir bordas perfeitas.
 * - Pequena animação de escala para feedback de toque.
 */
const IOSLikeButton: React.FC<IOSLikeButtonProps> = ({
  liked = false,
  count = 0,
  onPress,
  onLongPress,
  style,
  radius = 12,
  intensity = 50,
  tint = "systemMaterialDark",
  overlayColor = "rgba(0,0,0,0.5)",
  likedOverlayColor = "rgba(237,42,42,0.5)", // vermelho com alpha
  iconSize = 16,
  iconColor = "#FFFFFF",
  textColor = "#FFFFFF",
  paddingHorizontal = 12,
  paddingVertical = 8,
  accessibilityLabel = "Like",
  testID,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current

  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.container,
      {
        borderRadius: radius,
      },
      style,
    ],
    [radius, style],
  )

  const contentPaddingStyle = useMemo(
    () => ({
      paddingHorizontal,
      paddingVertical,
    }),
    [paddingHorizontal, paddingVertical],
  )

  const overlayBG = liked ? likedOverlayColor : overlayColor

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      speed: 24,
      bounciness: 0,
      useNativeDriver: true,
    }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 20,
      bounciness: 12,
      useNativeDriver: true,
    }).start()
  }

  const ButtonContent = (
    <Animated.View style={[styles.row, contentPaddingStyle, { transform: [{ scale }] }]}>
      <LikeIcon
        width={liked ? iconSize + 2 : iconSize}
        height={liked ? iconSize + 2 : iconSize}
        fill={iconColor}
      />
      <Text style={[styles.text, { color: textColor }]}>{formatCount(count)}</Text>
    </Animated.View>
  )

  if (Platform.OS === "ios") {
    // iOS com blur nativo (expo-blur), montado desde o primeiro render
    return (
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={containerStyle}
      >
        {/* Blur absoluto, sem latência */}
        <BlurView
          intensity={intensity}
          tint={tint}
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        {/* Overlay absoluto acima do blur para contraste consistente sobre vídeo */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, backgroundColor: overlayBG },
          ]}
        />
        {ButtonContent}
      </Pressable>
    )
  }

  // Fallback para outras plataformas (sem blur, somente overlay)
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={containerStyle}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: overlayBG }]}
      />
      {ButtonContent}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 14,
    // Use a bold-ish default friendly to iOS; substitua por sua família custom se necessário
    fontWeight: "600",
  },
})

export default React.memo(IOSLikeButton)
