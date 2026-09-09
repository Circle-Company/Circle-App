import {
    AccountStatus,
    CURRENT_SCHEMA_VERSION,
    Credentials,
    EMPTY_SESSION,
    Identity,
    PersistedSession,
    ProfileCache,
} from "./schema"
import { SessionEvent } from "./session"

/**
 * O reducer da sessão. Ver `docs/session-management.md` §3.3, §6 e §10.
 *
 * O bundle entra aqui como **opaco**: o reducer o usa apenas por identidade referencial e
 * nunca lê suas entranhas. Essa identidade é o mecanismo central de correção — §6.
 */

/** Só a identidade do objeto importa; o conteúdo é problema de quem o construiu. */
export type OpaqueBundle = { readonly __opaqueBundle: unique symbol } | object

export type State = {
    /** É exatamente o que vai para o storage, sem transformação nenhuma. */
    session: PersistedSession
    currentBundleState: { bundle: OpaqueBundle | null; userId: string | undefined }
    /** Limpo assim que a persistência é agendada. */
    needsPersist: boolean
}

export type Action =
    | {
          type: "signed-in"
          bundle: OpaqueBundle
          identity: Identity
          credentials: Credentials
          profile: ProfileCache
          status: AccountStatus
      }
    | {
          type: "resumed"
          bundle: OpaqueBundle
          identity: Identity
          credentials: Credentials
          profile: ProfileCache
          status: AccountStatus
      }
    | { type: "received-session-event"; bundle: OpaqueBundle; event: SessionEvent }
    | { type: "patched-profile"; profile?: Partial<ProfileCache>; status?: Partial<AccountStatus> }
    | { type: "logged-out" }
    | { type: "account-deleted" }

export const PUBLIC_BUNDLE: null = null

export function initialState(session: PersistedSession): State {
    return {
        session,
        // O app sobe SEMPRE deslogado e só então promove a sessão (§5.1).
        currentBundleState: { bundle: PUBLIC_BUNDLE, userId: undefined },
        needsPersist: false,
    }
}

const nowIso = () => new Date().toISOString()

/** Descarta credenciais e status, preserva quem era. É a transição do logout (§5.7). */
function toSignedOut(session: PersistedSession): PersistedSession {
    if (session.state === "empty") return session
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        state: "signed-out",
        identity: session.identity,
        profile: session.profile,
        signedOutAt: nowIso(),
    }
}

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "signed-in":
        case "resumed": {
            return {
                session: {
                    schemaVersion: CURRENT_SCHEMA_VERSION,
                    state: "active",
                    identity: action.identity,
                    credentials: action.credentials,
                    profile: action.profile,
                    status: action.status,
                    meta: {
                        signedInAt:
                            state.session.state === "active"
                                ? state.session.meta.signedInAt
                                : nowIso(),
                    },
                },
                currentBundleState: { bundle: action.bundle, userId: action.identity.userId },
                needsPersist: true,
            }
        }

        case "received-session-event": {
            // ── O GUARD DE IDENTIDADE (§6) ────────────────────────────────────────────
            // Um bundle obsoleto — de um login superado, de um logout, de uma sessão
            // descartada com request em voo — não pode (a) deslogar a conta corrente nem
            // (b) ressuscitar tokens depois de um logout. É a invariante mais importante
            // do módulo, e é reproduzível no código atual: um refresh em voo durante o
            // logout grava o token novo DEPOIS da limpeza.
            if (action.bundle !== state.currentBundleState.bundle) return state

            const { event } = action

            if (event.type === "update") {
                if (state.session.state !== "active") return state
                return {
                    ...state,
                    session: {
                        ...state.session,
                        credentials: event.credentials,
                        meta: { ...state.session.meta, lastRefreshAt: nowIso() },
                    },
                    needsPersist: true,
                }
            }

            if (event.type === "network-error") {
                // Transitório e desconhecido não tocam no storage: nada que eles façam
                // pode sobreviver a um restart (§10).
                return state
            }

            // expired
            return {
                session: toSignedOut(state.session),
                currentBundleState: { bundle: PUBLIC_BUNDLE, userId: undefined },
                needsPersist: true,
            }
        }

        case "patched-profile": {
            if (state.session.state !== "active") return state
            return {
                ...state,
                session: {
                    ...state.session,
                    profile: { ...state.session.profile, ...action.profile },
                    status: { ...state.session.status, ...action.status },
                },
                needsPersist: true,
            }
        }

        case "logged-out": {
            return {
                session: toSignedOut(state.session),
                currentBundleState: { bundle: PUBLIC_BUNDLE, userId: undefined },
                needsPersist: true,
            }
        }

        case "account-deleted": {
            return {
                session: EMPTY_SESSION,
                currentBundleState: { bundle: PUBLIC_BUNDLE, userId: undefined },
                needsPersist: true,
            }
        }

        default:
            return state
    }
}
