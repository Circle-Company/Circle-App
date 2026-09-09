/**
 * Qual tela mostrar quando a sessão morreu. Ver `docs/session-management.md` §5.8.
 *
 * Com conta única e entrada só por Apple Sign-In, o device já sabe de quem era a sessão
 * (§2.3, estado `signed-out`) e guarda a âncora do Apple ID (§2.6, `identity.appleUserId`).
 * Isso permite trocar a tela de login em branco por um botão "entrar como @fulano".
 *
 * Duas honestidades que o §5.8 faz questão de registrar, e que este módulo NÃO contorna:
 *
 *   1. **Não é re-autenticação silenciosa.** O Apple não devolve `identityToken` novo sem
 *      gesto do usuário — `signInAsync` sempre apresenta a folha do sistema. O que se
 *      economiza é a digitação e a escolha de fluxo: vira um toque com Face ID, não um
 *      cadastro. Quem chama isto aqui decide a *tela*, não pula autenticação nenhuma.
 *
 *   2. **`getCredentialStateAsync` é local e instantâneo.** Ele responde "esta credencial
 *      ainda está autorizada neste device", sem rede. Serve para escolher a tela, e NUNCA
 *      para decidir se a sessão do backend é válida — a autoridade sobre a sessão continua
 *      sendo o backend (§5.6). `AUTHORIZED` aqui não é sinônimo de "está logado".
 *
 * Ordem de prioridade: isto é o **último** recurso. O refresh proativo (§5.5) existe para
 * que o refresh token quase nunca expire, e a classificação de falhas (§5.6) para que rede
 * ruim nunca seja confundida com expiração. Esta decisão só cobre o que sobrar dos dois.
 */

import type { PersistedSession } from "@/session/schema"

/**
 * Espelho de `AppleAuthenticationCredentialState`.
 *
 * Duplicado de propósito: o teste roda em happy-dom, sem nativo, e importar o pacote só
 * para ler quatro inteiros congelados pela Apple faria a suíte depender de um módulo que
 * não carrega fora do device.
 */
export const APPLE_CREDENTIAL_REVOKED = 0
export const APPLE_CREDENTIAL_AUTHORIZED = 1
export const APPLE_CREDENTIAL_NOT_FOUND = 2
export const APPLE_CREDENTIAL_TRANSFERRED = 3

/** Consulta local do estado da credencial. Injetável — ver `defaultGetCredentialState`. */
export type GetCredentialState = (appleUserId: string) => Promise<number>

export type EntryScreenDeps = {
    getCredentialState?: GetCredentialState
}

export type FullLoginReason =
    /** `state: "empty"` — o device não lembra de ninguém. */
    | "NO_SESSION"
    /** Conta migrada da Fase 1: nunca guardou `appleUserId`, então não há o que perguntar. */
    | "NO_APPLE_ANCHOR"
    /** Sem `username` guardado não há como escrever "entrar como @fulano". */
    | "NO_PROFILE_NAME"
    /** O usuário revogou o app em Ajustes → Apple ID. */
    | "CREDENTIAL_REVOKED"
    /** Credencial desconhecida neste device. */
    | "CREDENTIAL_NOT_FOUND"
    /** Migração de team id do app. */
    | "CREDENTIAL_TRANSFERRED"
    /** Valor fora da tabela — build futura do `expo-apple-authentication`. */
    | "CREDENTIAL_UNKNOWN"
    /** O nativo lançou: iOS antigo, simulador, módulo ausente. */
    | "CREDENTIAL_CHECK_FAILED"

export type EntryScreen =
    /** Sessão viva: segue para o app. */
    | { kind: "app" }
    /** "Entrar como @username" com um botão. O toque é que chama `signInAsync`. */
    | { kind: "one-tap"; username: string; appleUserId: string }
    | {
          kind: "full-login"
          reason: FullLoginReason
          /**
           * O usuário revogou o app no Apple ID: o dado por-usuário residual (§2.6) tem que
           * sair antes da próxima sessão. É sinal para o chamador, não algo que este módulo
           * execute — decidir tela e apagar storage são responsabilidades de vidas
           * diferentes.
           */
          clearUserScopedData: boolean
      }

const fullLogin = (reason: FullLoginReason, clearUserScopedData = false): EntryScreen => ({
    kind: "full-login",
    reason,
    clearUserScopedData,
})

/**
 * Adaptador padrão. O import é **dinâmico** por dois motivos: o módulo nativo só existe no
 * device, e o vitest importa este arquivo em happy-dom. Como o teste sempre injeta a
 * dependência, este caminho nunca é avaliado lá.
 */
export const defaultGetCredentialState: GetCredentialState = async (appleUserId) => {
    const AppleAuthentication = await import("expo-apple-authentication")
    return AppleAuthentication.getCredentialStateAsync(appleUserId)
}

/**
 * Traduz a sessão persistida na tela de entrada, consultando o Apple **só quando a resposta
 * pode mudar a decisão**.
 *
 * Nunca lança: uma exceção do nativo aqui derrubaria a navegação do cold start, e o
 * degradado certo é o login completo — que sempre funciona.
 */
export async function decideEntryScreen(
    session: PersistedSession,
    deps: EntryScreenDeps = {},
): Promise<EntryScreen> {
    if (session.state === "active") return { kind: "app" }
    if (session.state === "empty") return fullLogin("NO_SESSION")

    const appleUserId = session.identity.appleUserId
    // Conta migrada da Fase 1 (§5.8, honestidade 3): a regra checa o campo, não o presume.
    // Sem âncora não há pergunta a fazer ao Apple — e fazê-la custaria um round-trip inútil.
    if (!appleUserId) return fullLogin("NO_APPLE_ANCHOR")

    // O `username` tem fallback para "" no schema, então um perfil corrompido produziria
    // uma tela dizendo "entrar como @" — pior que o login completo, que ao menos é honesto
    // sobre não saber quem é. Sem nome para mostrar, não há atalho a oferecer.
    if (!session.profile.username) return fullLogin("NO_PROFILE_NAME")

    const getCredentialState = deps.getCredentialState ?? defaultGetCredentialState

    let credentialState: number
    try {
        credentialState = await getCredentialState(appleUserId)
    } catch {
        return fullLogin("CREDENTIAL_CHECK_FAILED")
    }

    switch (credentialState) {
        case APPLE_CREDENTIAL_AUTHORIZED:
            return {
                kind: "one-tap",
                username: session.profile.username,
                appleUserId,
            }
        case APPLE_CREDENTIAL_REVOKED:
            // Revogar no Apple ID é o usuário dizendo que este app não é mais dele.
            return fullLogin("CREDENTIAL_REVOKED", true)
        case APPLE_CREDENTIAL_NOT_FOUND:
            return fullLogin("CREDENTIAL_NOT_FOUND")
        case APPLE_CREDENTIAL_TRANSFERRED:
            return fullLogin("CREDENTIAL_TRANSFERRED")
        default:
            return fullLogin("CREDENTIAL_UNKNOWN")
    }
}
