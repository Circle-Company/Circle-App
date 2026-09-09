import { useToast, ToastConfig, ToastType } from "./index"
import type { NotificationPayload } from "@/contexts/push.notification"

/**
 * Ponte para a API antiga de `notify`, ainda usada pela câmera.
 *
 * O Toast atual (`ToastConfig`) aceita `title`, `type`, `duration` e `notificationPayload`
 * — e o `StandartToast` renderiza **só o título** e a cor. `message`, `position` e
 * `description` não existem mais do outro lado: eram repassados adiante e descartados em
 * silêncio, porque objeto extra em runtime é simplesmente ignorado. Aqui eles param de ser
 * repassados, para o contrato dizer a verdade sobre o que aparece na tela.
 */
export interface NotifyParams {
    params: {
        title?: string
        /**
         * **Não é exibida.** O toast padrão mostra apenas o título; o campo continua aceito
         * para não quebrar os chamadores, mas quem depende de ver o detalhe precisa colocá-lo
         * no `title`.
         */
        description?: string
        variant?: "success" | "warning"
        config?: {
            duration?: number
            notificationPosition?: "top" | "center" | "bottom"
        }
    }
}

/**
 * `warning` vira `error`: o `ToastType` tem três valores (`success`, `error`,
 * `notification`) e é o vermelho que carrega a semântica de "algo deu errado". Sem
 * `variant`, o tipo fica indefinido e o toast usa o cinza neutro.
 */
function toToastType(variant: NotifyParams["params"]["variant"]): ToastType | undefined {
    if (variant === "success") return "success"
    if (variant === "warning") return "error"
    return undefined
}

function toToastConfig(params: NotifyParams["params"]): ToastConfig {
    return {
        title: params.title,
        type: toToastType(params.variant),
        duration: params.config?.duration,
    }
}

// Export a hook version for use in components
export function useNotify() {
    const toast = useToast()
    return (params: NotifyParams) => toast.show(toToastConfig(params.params))
}

// Global notify function for use outside of React components
let globalNotifyFn: ((config: ToastConfig) => void) | null = null

export function setGlobalNotify(fn: (config: ToastConfig) => void) {
    // Use a ref-like approach to avoid triggering re-renders
    globalNotifyFn = fn
}

/**
 * Enfileira o disparo para o próximo frame. É o que evita um `setState` durante o render de
 * quem chamou — `notify` é chamado de dentro de handlers e de `catch` de request.
 */
function dispatch(config: ToastConfig) {
    const run = () => {
        if (globalNotifyFn) globalNotifyFn(config)
        else console.warn("Toast system not initialized. Make sure ToastProvider is mounted.")
    }

    if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(run)
    else setTimeout(run, 0)
}

// Global notification toast — call this to show a push notification as an in-app toast
export function notifyPush(payload: NotificationPayload, duration = 4000) {
    dispatch({ type: "notification", notificationPayload: payload, duration })
}

export function notify(params: NotifyParams) {
    dispatch(toToastConfig(params.params))
}
