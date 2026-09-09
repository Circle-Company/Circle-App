import type { AxiosInstance } from "axios"

import type { Session } from "./session"

/**
 * O par (sessão, transporte). Ver `docs/session-management.md` §3.2.
 *
 * O ponto do bundle não é agrupar duas coisas por conveniência: é fazer com que **cada**
 * client tenha uma e apenas uma sessão dona dos seus tokens. Hoje existe um `AxiosInstance`
 * global cujo interceptor lê o token do MMKV a cada request — e é daí que saem as duas
 * corridas do §0.1: uma request pode sair com um token lido antes da rotação, e um refresh
 * em voo de uma sessão que o usuário já encerrou pode ressuscitar tokens depois do logout.
 *
 * Amarrado ao bundle, o interceptor lê `bundle.session.accessToken` — não há mais janela
 * entre ler e enviar — e um bundle obsoleto simplesmente não tem sessão viva para consultar.
 */

/** Autenticado: há tokens, e os interceptors deste client falam com **esta** sessão. */
export type SessionBundle = {
    session: Session
    client: AxiosInstance
}

/**
 * Deslogado. O client existe (rotas públicas continuam funcionando), mas qualquer caminho
 * que exija credencial precisa falhar **antes de qualquer I/O** — ver `assertAuthenticated`.
 */
export type PublicBundle = {
    session: null
    client: AxiosInstance
}

export type AnyBundle = SessionBundle | PublicBundle

/**
 * Fábrica do transporte, **injetada**. Este módulo nunca importa axios em runtime: quem
 * monta interceptors, base URL e timeouts é `src/api`. Aqui só existe a amarração — o que
 * mantém o bundle testável sem rede e sem o mock global de axios do `test-setup`.
 *
 * ⚠️ A fábrica recebe o bundle **antes** de `client` estar preenchido (ver `buildBundle`).
 * Ler `bundle.client` de dentro dela, de forma síncrona, devolve `undefined`; dentro de um
 * interceptor — que roda muito depois — é seguro.
 */
export type ClientFactory<B extends AnyBundle> = (bundle: B) => AxiosInstance

/**
 * Lançado pelo client público quando alguém tenta uma rota autenticada sem sessão.
 *
 * Vale mais do que o 401 opaco que o servidor devolveria: o app hoje monta rota autenticada
 * sem token e o interceptor precisa adivinhar o que houve (`"401 sem token nem
 * refreshToken"`). Aqui a falha nomeia a causa, acontece no device e não gasta uma request.
 */
export class NotAuthenticatedError extends Error {
    constructor(detail?: string) {
        super(
            detail
                ? `Requisição autenticada sem sessão: ${detail}`
                : "Requisição autenticada sem sessão",
        )
        this.name = "NotAuthenticatedError"
    }
}

/**
 * Monta o bundle autenticado.
 *
 * O objeto nasce sem `client` de propósito: os interceptors precisam da referência do
 * bundle (é ela que o guard de identidade do §6 compara), e o bundle precisa do client —
 * um ciclo. Quebramos entregando a referência estável primeiro e preenchendo o campo
 * depois; a alternativa (passar só a `Session`) tiraria do interceptor exatamente a
 * identidade que ele precisa comparar.
 */
export function buildBundle(
    session: Session,
    createClient: ClientFactory<SessionBundle>,
): SessionBundle {
    const bundle = { session } as SessionBundle
    bundle.client = createClient(bundle)
    return bundle
}

/** O equivalente deslogado. `session: null` é literal, não `undefined`: é o discriminante. */
export function buildPublicBundle(createClient: ClientFactory<PublicBundle>): PublicBundle {
    const bundle = { session: null } as PublicBundle
    bundle.client = createClient(bundle)
    return bundle
}

export function isSessionBundle(bundle: AnyBundle | null | undefined): bundle is SessionBundle {
    return !!bundle && bundle.session !== null
}

/**
 * O guard que o interceptor de request do client público chama **antes** de tocar na rede.
 *
 * Também recusa bundle descartado e sessão morta: depois de um logout ainda existem
 * closures segurando o bundle antigo (uma query em voo, um retry agendado), e deixá-las
 * seguir com o transporte de uma sessão encerrada é justamente o cenário (b) do §6 —
 * tokens de uma sessão que o usuário já terminou voltando à vida.
 */
export function assertAuthenticated(
    bundle: AnyBundle | null | undefined,
): asserts bundle is SessionBundle {
    if (!bundle) throw new NotAuthenticatedError("bundle ausente")
    if (bundle.session === null) throw new NotAuthenticatedError("bundle público")
    if (disposed.has(bundle)) throw new NotAuthenticatedError("bundle descartado")

    // Leitura tolerante: o `Session` real expõe `isDestroyed`, mas quem chama isto está
    // dentro do caminho de erro e não pode quebrar por causa de um dublê incompleto.
    if ((bundle.session as { isDestroyed?: boolean }).isDestroyed === true) {
        throw new NotAuthenticatedError("sessão descartada")
    }
}

// ── Descarte ───────────────────────────────────────────────────────────────────────────
// O kill switch mora fora do bundle, num WeakMap, por dois motivos: o bundle continua
// sendo um objeto de dados puro (comparável por identidade, serializável em log) e o
// registro não impede o GC de recolher bundles que ninguém mais referencia.

const killSwitches = new WeakMap<AnyBundle, () => void>()
const disposed = new WeakSet<AnyBundle>()

/**
 * Registra o teardown do bundle: cancelar o timer de refresh proativo, soltar
 * interceptors, abortar requests em voo. Um registro novo substitui o anterior.
 */
export function registerBundleKillSwitch(bundle: AnyBundle, kill: () => void): void {
    killSwitches.set(bundle, kill)
}

export function isBundleDisposed(bundle: AnyBundle | null | undefined): boolean {
    return !!bundle && disposed.has(bundle)
}

/**
 * Descarta o bundle: roda o kill switch e mata a sessão.
 *
 * **Idempotente e nunca lança**, e as duas coisas são requisito, não cortesia. O descarte
 * roda no pós-commit de um `useEffect` (§5.9) e no `finally` do logout (§5.7) — se ele
 * lançasse, o logout pararia no meio e a sessão sobreviveria ao próprio encerramento. Por
 * isso a marcação vem **antes** da execução: um kill switch que dispare outro descarte,
 * direta ou indiretamente, encontra o bundle já marcado e para ali.
 */
export function disposeBundle(bundle: AnyBundle | null | undefined): void {
    if (!bundle || disposed.has(bundle)) return

    disposed.add(bundle)

    const kill = killSwitches.get(bundle)
    killSwitches.delete(bundle)

    try {
        kill?.()
    } catch (error) {
        console.warn("Kill switch do bundle lançou; ignorado", error)
    }

    try {
        // Depois disto a sessão não consegue mais rodar refresh — é o que impede um bundle
        // obsoleto de consumir o refresh token da sessão viva (§3.1, ponto 2).
        bundle.session?.kill()
    } catch (error) {
        console.warn("kill() da sessão lançou; ignorado", error)
    }
}
