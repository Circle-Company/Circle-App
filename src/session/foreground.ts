import { AppState, type AppStateStatus } from "react-native"
import NetInfo from "@react-native-community/netinfo"

import { decodeExp, now } from "./jwt"
import { createRevalidationBarrier, type RevalidationBarrier } from "./revalidation"
import { peekSession, refreshCurrentSession, setBarrier } from "./runtime"

/**
 * Liga a barreira de revalidação ao ciclo de vida do app. Ver `docs/session-management.md`
 * §5.5 — este é o módulo que fecha o sintoma que motivou o redesenho inteiro (§0.1).
 *
 * A diferença que ele faz: hoje o app **descobre** que o token morreu recebendo N × 401 ao
 * voltar do background. Com a barreira, ele **sabe antes** de disparar a primeira request.
 * A rajada de 401 deixa de existir em vez de ser tratada.
 *
 * Fica separado de `runtime.ts` de propósito: aqui dentro há `react-native` e NetInfo, e
 * `src/api/index.ts` não pode arrastar nenhum dos dois — ele roda no vitest.
 */

let installed: (() => void) | null = null

function createProductionBarrier(): RevalidationBarrier {
    return createRevalidationBarrier({
        // O relógio corrigido pelo header `Date` do servidor (§4): decidir expiração com
        // relógio adiantado desloga usuário com sessão válida.
        now,
        isConnected: async () => {
            try {
                const state = await NetInfo.fetch()
                // `null` (indeterminado) conta como conectado: barrar requests por uma
                // dúvida do NetInfo seria pior que deixá-las falharem em rede.
                return state.isConnected !== false
            } catch {
                return true
            }
        },
        schedule: (fn, ms) => {
            const id = setTimeout(fn, ms)
            return { cancel: () => clearTimeout(id) }
        },
        getSession: () => peekSession(),
        refresh: () => refreshCurrentSession(),
        onTerminal: (verdict) => {
            // O timer proativo não tem para quem propagar. Quem desloga é o handler de
            // sessão expirada, que a própria `Session` já acionou ao morrer.
            console.warn("Refresh proativo terminou em veredito terminal", verdict.kind)
        },
    })
}

/**
 * Instala o listener de `AppState` e devolve a função de desinstalação.
 *
 * Idempotente: chamar duas vezes não instala dois listeners — em React 18+ um provider pode
 * montar, desmontar e remontar em desenvolvimento, e dois listeners significariam duas
 * revalidações concorrentes.
 */
export function installForegroundRevalidation(): () => void {
    if (installed) return installed

    const barrier = createProductionBarrier()
    setBarrier(barrier)

    // `null` = não sabemos quando foi para background; a barreira trata como suspensão
    // longa, que é o lado seguro.
    let backgroundedAt: number | null = null

    const handler = (state: AppStateStatus) => {
        if (state === "active") {
            barrier.onForeground(backgroundedAt).catch(() => {
                // Veredito terminal: a `Session` já emitiu `expired` e o AuthProvider já
                // está deslogando. Engolir aqui evita uma unhandled rejection em cima disso.
            })
            backgroundedAt = null
            scheduleNextProactiveRefresh(barrier)
            return
        }

        if (state === "background" || state === "inactive") {
            backgroundedAt = Date.now()
            // O timer não sobrevive à suspensão de forma confiável, e mantê-lo armado só
            // gera trabalho ao acordar. Quem decide de novo é o `active` acima.
            barrier.cancelProactiveRefresh()
        }
    }

    const subscription = AppState.addEventListener("change", handler)

    // O app pode já estar em foreground quando isto monta (cold start): agenda o proativo
    // sem esperar a primeira transição.
    scheduleNextProactiveRefresh(barrier)

    installed = () => {
        try {
            subscription?.remove()
        } catch {
            // noop
        }
        barrier.cancelProactiveRefresh()
        setBarrier(null)
        installed = null
    }

    return installed
}

/** Reagenda o refresh proativo a partir do `exp` do access token corrente. */
function scheduleNextProactiveRefresh(barrier: RevalidationBarrier): void {
    const session = peekSession()
    if (!session) return

    const exp = decodeExp(session.credentials.accessToken)
    if (exp === null) return

    barrier.scheduleProactiveRefresh(exp * 1000)
}
