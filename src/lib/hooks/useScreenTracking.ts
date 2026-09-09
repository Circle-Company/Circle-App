import React from "react"
import { usePathname } from "expo-router"

import { trackUserAction } from "@/lib/trackEvent"

/**
 * Normaliza a rota para um nome de tela estável.
 *
 * `/profile/1948572639485` vira `/profile/[id]`. Sem isso cada perfil visitado
 * viraria um valor distinto de `screen_name` e a propriedade explodiria em
 * cardinalidade, ficando inútil para agrupar.
 */
export function normalizeScreenName(pathname: string): string {
    if (!pathname) return "/"
    return (
        pathname
            .split("/")
            .map((segment) => {
                if (!segment) return segment
                // ids do backend são numéricos e longos; uuids têm hífen e 32+ chars
                if (/^\d{6,}$/.test(segment)) return "[id]"
                if (/^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(segment)) return "[id]"
                return segment
            })
            .join("/") || "/"
    )
}

/**
 * Dispara `screen_viewed` a cada mudança de rota. Fica no layout raiz, então
 * cobre toda a navegação do app de uma vez — inclusive telas que ninguém
 * lembrou de instrumentar.
 */
export function useScreenTracking() {
    const pathname = usePathname()
    const lastRef = React.useRef<string | null>(null)

    React.useEffect(() => {
        const screen = normalizeScreenName(pathname ?? "")
        // O expo-router reemite o mesmo pathname em re-render; sem esta guarda
        // uma tela parada geraria eventos repetidos.
        if (!screen || lastRef.current === screen) return
        const previous = lastRef.current
        lastRef.current = screen
        trackUserAction("screen_viewed", {
            screen_name: screen,
            ...(previous ? { previous_screen_name: previous } : {}),
        })
    }, [pathname])
}
