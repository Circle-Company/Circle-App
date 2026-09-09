import { storage, storageKeys } from "@/store"

import { decodeSub } from "./jwt"
import {
    ActiveSession,
    CURRENT_SCHEMA_VERSION,
    EMPTY_SESSION,
    PersistedSession,
    degrade,
    validate,
} from "./schema"

/**
 * Leitura e escrita de `@circle:session`. Ver `docs/session-management.md` §2.1 e §2.4.
 *
 * O blob inteiro é **uma** chave e **uma** escrita: `accessToken`, `refreshToken` e a
 * geração do par nunca podem ser gravados separadamente, porque um par misto é um refresh
 * token queimado. Hoje são três `storage.set` independentes.
 */

export const SESSION_KEY = `${storageKeys().baseKey}session` as const

/**
 * Migrações v(n) → v(n+1), aplicadas em cadeia sobre um blob **já existente**.
 * Nunca se edita uma migração publicada; adiciona-se a próxima.
 */
const MIGRATIONS: Record<number, (data: any) => any> = {
    // Vazio de propósito: `CURRENT_SCHEMA_VERSION` é 1 e nenhum blob anterior existe.
    // A migração das chaves soltas NÃO mora aqui — ver `migrateFromLegacyKeys`.
}

/**
 * Constrói a sessão a partir das três chaves soltas do modelo antigo.
 *
 * **Não é uma entrada de `MIGRATIONS`, e isso é essencial:** ela precisa rodar justamente
 * quando `@circle:session` ainda não existe. Na cadeia, que só roda sobre um blob já lido,
 * ela nunca seria alcançada.
 *
 * Não apaga as chaves antigas — o rollback para uma build anterior precisa continuar
 * possível. Enquanto as duas representações coexistirem, **o blob é a autoridade**.
 */
export function migrateFromLegacyKeys(): PersistedSession | null {
    try {
        const keys = storageKeys()
        const accessToken = storage.getString(keys.account.jwt.token)
        const refreshToken = storage.getString(keys.account.jwt.refreshToken)

        // O id pode faltar no storage antigo; o `sub` do próprio token é o plano B.
        const userId =
            storage.getString(keys.user.id) || decodeSub(accessToken) || decodeSub(refreshToken)
        if (!userId) return null

        const profile = {
            username: storage.getString(keys.user.username) || "",
            name: storage.getString(keys.user.name) || undefined,
            profilePicture: storage.getString(keys.user.profilePicture) || undefined,
        }

        // Sem o par completo não há sessão a retomar — mas a identidade é preservada, que
        // é o que transforma o próximo login num toque em vez de um cadastro.
        if (!accessToken || !refreshToken) {
            return {
                schemaVersion: CURRENT_SCHEMA_VERSION,
                state: "signed-out",
                identity: { userId },
                profile,
                signedOutAt: new Date().toISOString(),
            }
        }

        const session: ActiveSession = {
            schemaVersion: CURRENT_SCHEMA_VERSION,
            state: "active",
            // `appleUserId` não existe no storage antigo: fica ausente e é preenchido no
            // login seguinte. Conta sem ele nunca dispara a limpeza por troca de Apple ID,
            // falhando para o lado seguro de NÃO apagar dado.
            identity: { userId },
            credentials: {
                accessToken,
                refreshToken,
                generation: 0,
                issuedAt: new Date().toISOString(),
            },
            profile,
            status: {
                accessLevel: storage.getString(keys.account.accessLevel) || "",
                verified: storage.getBoolean(keys.account.verified) === true,
                blocked: storage.getBoolean(keys.account.blocked) === true,
                deleted: storage.getBoolean(keys.account.deleted) === true,
            },
            meta: { signedInAt: new Date().toISOString() },
        }
        return session
    } catch {
        return null
    }
}

/**
 * Estado da sessão em disco. Nunca lança: qualquer falha vira `empty`, e o app sobe
 * deslogado em vez de não subir.
 */
export function readSession(): PersistedSession {
    let raw: string | undefined
    try {
        raw = storage.getString(SESSION_KEY)
    } catch {
        return EMPTY_SESSION
    }

    if (!raw) {
        const migrated = migrateFromLegacyKeys()
        if (!migrated) return EMPTY_SESSION
        writeSession(migrated)
        return migrated
    }

    try {
        let data = JSON.parse(raw)
        let version = typeof data?.schemaVersion === "number" ? data.schemaVersion : 0

        while (version < CURRENT_SCHEMA_VERSION) {
            const step = MIGRATIONS[version]
            if (!step) break // sem caminho de migração: cai no degrade
            data = step(data)
            const next = typeof data?.schemaVersion === "number" ? data.schemaVersion : version + 1
            // Uma migração que não avança a versão viraria laço infinito.
            if (next <= version) break
            version = next
        }

        return validate(data) ?? degrade(data)
    } catch {
        return EMPTY_SESSION
    }
}

/** Uma escrita, atômica do ponto de vista do app. */
export function writeSession(session: PersistedSession): void {
    try {
        storage.set(SESSION_KEY, JSON.stringify(session))
    } catch {
        // noop — não há o que fazer se o storage recusar a escrita
    }
}

/** Usado pelo delete de conta e pelos testes. */
export function clearSession(): void {
    writeSession(EMPTY_SESSION)
}
