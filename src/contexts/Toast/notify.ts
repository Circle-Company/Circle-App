import { useToast, ToastConfig } from "./index"

// Backward compatibility interface for the old notify API
export interface NotifyParams {
    params: {
        title?: string
        description?: string
        variant?:
            | "success"
            | "error"
            | "warning"
            | "info"
            | "toast"
            | "tiny"
            | "notification"
            | "alert"
        config?: {
            duration?: number
            notificationPosition?: "top" | "center" | "bottom"
        }
    }
}

// Export a hook version for use in components
export function useNotify() {
    const toast = useToast()

    return (params: NotifyParams) => {
        const { title, description, variant = "toast", config } = params.params

        toast.show({
            title,
            message: description,
            type: variant,
            duration: config?.duration,
            position: config?.notificationPosition,
        })
    }
}

// Global notify function for use outside of React components
let globalNotifyFn: ((config: ToastConfig) => void) | null = null

export function setGlobalNotify(fn: (config: ToastConfig) => void) {
    // Use a ref-like approach to avoid triggering re-renders
    globalNotifyFn = fn
}

export function notify(params: NotifyParams) {
    const { title, description, variant = "toast", config } = params.params

    // Queue the notification to avoid setState during render
    if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
            if (globalNotifyFn) {
                globalNotifyFn({
                    title,
                    message: description,
                    type: variant,
                    duration: config?.duration,
                    position: config?.notificationPosition,
                })
            } else {
                console.warn("Toast system not initialized. Make sure ToastProvider is mounted.")
            }
        })
    } else {
        // Fallback for environments without requestAnimationFrame
        setTimeout(() => {
            if (globalNotifyFn) {
                globalNotifyFn({
                    title,
                    message: description,
                    type: variant,
                    duration: config?.duration,
                    position: config?.notificationPosition,
                })
            } else {
                console.warn("Toast system not initialized. Make sure ToastProvider is mounted.")
            }
        }, 0)
    }
}
