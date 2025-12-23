import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { StyleSheet, View, Platform } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    Easing,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import sizes from "../../constants/sizes"
import { setGlobalNotify } from "./notify"

export type ToastType =
    | "toast"
    | "tiny"
    | "notification"
    | "alert"
    | "success"
    | "error"
    | "warning"
    | "info"

export type ToastPosition = "top" | "center" | "bottom"

export interface ToastConfig {
    title?: string
    message?: string
    type?: ToastType
    duration?: number
    position?: ToastPosition
    icon?: React.ReactNode
    color?: string
    backgroundColor?: string
}

interface Toast extends ToastConfig {
    id: string
}

interface ToastContextData {
    show: (config: ToastConfig) => void
    hide: (id?: string) => void
    toast: (message: string, config?: Omit<ToastConfig, "message">) => void
    success: (message: string, config?: Omit<ToastConfig, "message">) => void
    error: (message: string, config?: Omit<ToastConfig, "message">) => void
    warning: (message: string, config?: Omit<ToastConfig, "message">) => void
    info: (message: string, config?: Omit<ToastConfig, "message">) => void
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
    const translateY = useSharedValue(toast.position === "bottom" ? 100 : -100)
    const opacity = useSharedValue(0)
    const dragY = useSharedValue(0)

    React.useEffect(() => {
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 })
        opacity.value = withTiming(1, { duration: 200 })

        if (toast.duration !== Infinity) {
            const timer = setTimeout(() => {
                dismissToast()
            }, toast.duration || 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const dismissToast = useCallback(() => {
        translateY.value = withSpring(
            toast.position === "bottom" ? 100 : -100,
            { damping: 15, stiffness: 150 },
            () => runOnJS(onDismiss)(),
        )
        opacity.value = withTiming(0, { duration: 200 })
    }, [onDismiss, toast.position])

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            "worklet"
            const direction = toast.position === "bottom" ? 1 : -1
            if (
                (direction === 1 && event.translationY > 0) ||
                (direction === -1 && event.translationY < 0)
            ) {
                dragY.value = event.translationY
            }
        })
        .onEnd((event) => {
            "worklet"
            const direction = toast.position === "bottom" ? 1 : -1
            const threshold = 50
            const shouldDismiss = Math.abs(event.translationY) > threshold

            if (shouldDismiss) {
                translateY.value = withSpring(
                    direction * 100,
                    { damping: 15, stiffness: 150 },
                    () => runOnJS(onDismiss)(),
                )
                opacity.value = withTiming(0, { duration: 200 })
            } else {
                dragY.value = withSpring(0, { damping: 15, stiffness: 150 })
            }
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value + dragY.value }],
        opacity: opacity.value,
    }))

    const getBackgroundColor = () => {
        if (toast.backgroundColor) return toast.backgroundColor
        switch (toast.type) {
            case "success":
                return "#4CAF50"
            case "error":
                return "#F44336"
            case "warning":
                return "#FF9800"
            case "info":
                return "#2196F3"
            default:
                return "#333"
        }
    }

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    styles.toastContainer,
                    {
                        backgroundColor: getBackgroundColor(),
                        maxWidth: sizes.toasts?.small?.width || 350,
                    },
                    animatedStyle,
                ]}
            >
                {toast.icon && <View style={styles.iconContainer}>{toast.icon}</View>}
                <View style={styles.textContainer}>
                    {toast.title && (
                        <Animated.Text style={styles.title}>{toast.title}</Animated.Text>
                    )}
                    {toast.message && (
                        <Animated.Text style={styles.message}>{toast.message}</Animated.Text>
                    )}
                </View>
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
            position: config.position || "top",
            duration: config.duration !== undefined ? config.duration : 3000,
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

    const toast = useCallback(
        (message: string, config?: Omit<ToastConfig, "message">) => {
            show({ message, type: "toast", ...config })
        },
        [show],
    )

    const success = useCallback(
        (message: string, config?: Omit<ToastConfig, "message">) => {
            show({ message, type: "success", ...config })
        },
        [show],
    )

    const error = useCallback(
        (message: string, config?: Omit<ToastConfig, "message">) => {
            show({ message, type: "error", ...config })
        },
        [show],
    )

    const warning = useCallback(
        (message: string, config?: Omit<ToastConfig, "message">) => {
            show({ message, type: "warning", ...config })
        },
        [show],
    )

    const info = useCallback(
        (message: string, config?: Omit<ToastConfig, "message">) => {
            show({ message, type: "info", ...config })
        },
        [show],
    )

    // Setup global notify function once on mount
    React.useLayoutEffect(() => {
        setGlobalNotify(show)
    }, [show])

    const topToasts = toasts.filter((t) => t.position === "top")
    const centerToasts = toasts.filter((t) => t.position === "center")
    const bottomToasts = toasts.filter((t) => t.position === "bottom")

    return (
        <ToastContext.Provider value={{ show, hide, toast, success, error, warning, info }}>
            {children}

            {topToasts.length > 0 && (
                <View style={[styles.container, styles.topContainer]} pointerEvents="box-none">
                    {topToasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={() => hide(toast.id)} />
                    ))}
                </View>
            )}

            {centerToasts.length > 0 && (
                <View style={[styles.container, styles.centerContainer]} pointerEvents="box-none">
                    {centerToasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onDismiss={() => hide(toast.id)} />
                    ))}
                </View>
            )}

            {bottomToasts.length > 0 && (
                <View style={[styles.container, styles.bottomContainer]} pointerEvents="box-none">
                    {bottomToasts.map((toast) => (
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
        top: Platform.OS === "ios" ? 60 : 20,
    },
    centerContainer: {
        top: "45%",
    },
    bottomContainer: {
        bottom: Platform.OS === "ios" ? 60 : 20,
    },
    toastContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 250,
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    message: {
        color: "#FFFFFF",
        fontSize: 14,
    },
})

export default ToastContext
