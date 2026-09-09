import { clearUserScopedData } from "@/contexts/Persisted/scopes"

import { readSession } from "./storage"

/**
 * A âncora de identidade do §2.6.
 *
 * O buraco que isto fecha: `clearSessionDataPreservingTutorial()` roda no **logout**, mas
 * não no **login**. Se um segundo Apple ID entra num aparelho onde o primeiro nunca deslogou
 * — trocou de conta, vendeu o celular, emprestou — os likes, as notificações lidas e as
 * métricas do anterior seguem lá, agora atribuídos a outra pessoa. É bug de privacidade,
 * não de conveniência, e conta única é justamente o cenário onde ele acontece (item 4 do §0).
 */

export type IncomingIdentity = {
    /** `credential.user` do Apple — a âncora estável por (Apple ID × app). */
    appleUserId?: string
    /** id do backend, quando já se sabe. */
    userId?: string
}

export type IdentityDecision = {
    /** `true` quando o dado por-usuário residual é de outra pessoa. */
    isDifferentPerson: boolean
    reason: "no-previous-session" | "same-person" | "apple-id-changed" | "user-id-changed"
}

/**
 * Compara quem está entrando com quem o device lembra.
 *
 * A comparação é por **dois** campos porque `appleUserId` só existe a partir do primeiro
 * login pós-migração (§12, Fase 1). Uma conta migrada não o tem, e presumir "é a mesma
 * pessoa" seria escolher o lado errado; presumir "é outra" apagaria dado de quem só
 * atualizou o app. Daí a regra ser: só decide "outra pessoa" quando **algum** identificador
 * está presente nos dois lados e diverge.
 */
export function decideIdentityChange(incoming: IncomingIdentity): IdentityDecision {
    const session = readSession()
    if (session.state === "empty") {
        return { isDifferentPerson: false, reason: "no-previous-session" }
    }

    const previous = session.identity

    if (incoming.appleUserId && previous.appleUserId) {
        return incoming.appleUserId === previous.appleUserId
            ? { isDifferentPerson: false, reason: "same-person" }
            : { isDifferentPerson: true, reason: "apple-id-changed" }
    }

    if (incoming.userId && previous.userId) {
        return incoming.userId === previous.userId
            ? { isDifferentPerson: false, reason: "same-person" }
            : { isDifferentPerson: true, reason: "user-id-changed" }
    }

    // Nada comparável dos dois lados (conta migrada sem `appleUserId`, login sem `userId`
    // ainda conhecido): falha para o lado de NÃO apagar. Perder dado de quem só atualizou
    // o app é dano garantido; o vazamento é possibilidade — e a próxima entrada, já com a
    // âncora gravada, decide corretamente.
    return { isDifferentPerson: false, reason: "same-person" }
}

/**
 * Roda no login, **antes** de gravar a sessão nova: apaga o que é do usuário e preserva o
 * que é do aparelho (§2.2). Devolve a decisão para quem chama poder logar/telemetrar.
 */
export function clearResidualDataIfDifferentPerson(incoming: IncomingIdentity): IdentityDecision {
    const decision = decideIdentityChange(incoming)

    if (decision.isDifferentPerson) {
        clearUserScopedData()
    }

    return decision
}
