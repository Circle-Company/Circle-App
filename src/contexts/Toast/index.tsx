import React, { createContext, useContext, useState, useCallback } from "react"
import { StyleSheet, View, Platform } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
    runOnUI,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"

import { setGlobalNotify } from "./notify"
import { colors } from "@/constants/colors"
import { Toast as StandartToast } from "./standart"

const ENTER_DURATION = 220
const EXIT_DURATION = 180
const DISMISS_THRESHOLD = 40
const TOP_OFFSET_IOS = 60
const TOP_OFFSET_ANDROID = 32

export type ToastType = "success" | "error"

export interface ToastConfig {
    title?: string
    type?: ToastType
    duration?: number
}

interface Toast extends ToastConfig {
    id: string
}

interface ToastContextData {
    show: (config: ToastConfig) => void
    hide: (id?: string) => void
    success: (title: string, config?: Omit<ToastConfig, "title">) => void
    error: (title: string, config?: Omit<ToastConfig, "title">) => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}

interface ToastItemProps {
    toast: Toast
    onDismiss: () => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const translateY = useSharedValue(-100)
    const scale = useSharedValue(0.95)
    const dragY = useSharedValue(0)

    const dismissToast = useCallback(() => {
        runOnUI(() => {
            "worklet"
            scale.value = withTiming(0.96, { duration: EXIT_DURATION })
            translateY.value = withTiming(-60, { duration: EXIT_DURATION }, () =>
                runOnJS(onDismiss)(),
            )
        })()
    }, [onDismiss])

    React.useEffect(() => {
        runOnUI(() => {
            "worklet"
            translateY.value = withSpring(0, {
                damping: 14,
                stiffness: 160,
                mass: 0.9,
                overshootClamping: false,
            })
            scale.value = withSpring(1, {
                damping: 14,
                stiffness: 160,
                mass: 0.9,
                overshootClamping: false,
            })
        })()

        if (toast.duration !== Infinity) {
            const timer = setTimeout(() => {
                dismissToast()
            }, toast.duration || 2200)
            return () => clearTimeout(timer)
        }
    }, [dismissToast, toast.duration])

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            "worklet"
            if (event.translationY < 0) {
                dragY.value = event.translationY
            }
        })
        .onEnd((event) => {
            "worklet"
            const shouldDismiss = Math.abs(event.translationY) > DISMISS_THRESHOLD

            if (shouldDismiss) {
                scale.value = withTiming(0.96, { duration: EXIT_DURATION })
                translateY.value = withTiming(-60, { duration: EXIT_DURATION }, () =>
                    runOnJS(onDismiss)(),
                )
            } else {
                dragY.value = withTiming(0, { duration: EXIT_DURATION })
            }
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value + dragY.value }, { scale: scale.value }],
    }))

    const getTint = () => {
        switch (toast.type) {
            case "success":
                return colors.green.green_05
            case "error":
                return colors.red.red_05
            default:
                return colors.gray.grey_04
        }
    }

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[animatedStyle]}>
                <StandartToast title={toast.title ?? ""} tint={getTint()} />
            </Animated.View>
        </GestureDetector>
    )
}

export function Provider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const show = useCallback((config: ToastConfig) => {
        const id = Math.random().toString(36).substring(7)
        const newToast: Toast = {
            id,
            duration: config.duration !== undefined ? config.duration : 2200,
            ...config,
        }
        setToasts((prev) => [...prev, newToast])
    }, [])

    const hide = useCallback((id?: string) => {
        if (id) {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        } else {
            setToasts([])
        }
    }, [])

    const success = useCallback(
        (title: string, config?: Omit<ToastConfig, "title">) => {
            show({ title, type: "success", ...config })
        },
        [show],
    )

    const error = useCallback(
        (title: string, config?: Omit<ToastConfig, "title">) => {
            show({ title, type: "error", ...config })
        },
        [show],
    )
    // Setup global notify function once on mount
    React.useLayoutEffect(() => {
        setGlobalNotify(show)
    }, [show])

    const topToasts = toasts

    return (
        <ToastContext.Provider value={{ show, hide, success, error }}>
            {children}

            {topToasts.length > 0 && (
                <View style={[styles.container, styles.topContainer]} pointerEvents="box-none">
                    {topToasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={() => hide(toast.id)} />
                    ))}
                </View>
            )}
        </ToastContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
    },
    topContainer: {
        top: Platform.OS === "ios" ? TOP_OFFSET_IOS : TOP_OFFSET_ANDROID,
    },
})

export default ToastContext
