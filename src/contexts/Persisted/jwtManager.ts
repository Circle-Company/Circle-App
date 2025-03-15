import { AppState } from "react-native"
import { apiRoutes } from "../../services/Api"
import { storage, storageKeys } from "../../store"
import { AccountState } from "./persistedAccount"
import { AccountDataType } from "./types"

let timeoutId: NodeJS.Timeout | null = null
let isRefreshing = false
let appStateSubscription: any = null

export function monitorJwtExpiration(sessionAccount: AccountDataType, refreshJwtToken: Function) {
    if (!sessionAccount?.jwtExpiration) return

    const expirationTime = Number(sessionAccount.jwtExpiration) * 1000 // ms
    const now = Date.now()
    const timeRemaining = expirationTime - now

    // Se o token já expirou ou não há tempo válido, não faz nada
    if (timeRemaining <= 0) return

    // 1) Se faltam mais de 60s, agendar para renovar **exatamente** ao fim do prazo
    //    (isso coincide com o teste "deve agendar um timeout para renovar só depois de 2 minutos").
    if (timeRemaining > 60000) {
        timeoutId = setTimeout(() => {
            doImmediateRefresh(refreshJwtToken)
        }, timeRemaining)
    } else {
        // 2) Se faltar <= 60s, renovar imediatamente
        doImmediateRefresh(refreshJwtToken)
    }

    // 3) Listener de mudança de estado do app (foreground/background)
    if (!appStateSubscription) {
        appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                // Se voltou para o app e o token está a 60s de expirar, renova
                const stillRemaining = expirationTime - Date.now()
                if (stillRemaining <= 60000) {
                    doImmediateRefresh(refreshJwtToken)
                }
            } else if (nextAppState === "inactive" || nextAppState === "background") {
                // Cancela timeout se o app for para background
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
            }
        })
    }

    // 4) Retorna cleanup para remover listener e cancelar timeout
    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        if (appStateSubscription) {
            appStateSubscription.remove()
            appStateSubscription = null
        }
    }
}

/** Faz o refresh imediatamente, sem condicional extra */
function doImmediateRefresh(refreshJwtToken: Function) {
    if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
    }
    handleRefreshToken(refreshJwtToken)
}

/** Evita chamadas concorrentes ao refresh */
async function handleRefreshToken(refreshJwtToken: Function) {
    if (isRefreshing) return
    isRefreshing = true
    try {
        await refreshJwtToken({
            username: storage.getString(storageKeys().user.username) || "",
            id: storage.getString(storageKeys().user.id) || "",
        })
    } catch (error) {
        console.error("Error refreshing token:", error)
    } finally {
        isRefreshing = false
    }
}

/** Mantém para compatibilidade com outro fluxo que você usa */
export async function refreshJwtToken(
    { username, id }: { username: string; id: string },
    sessionAccount: AccountState
) {
    if (username && id) {
        try {
            const response = await apiRoutes.auth.refreshToken({ username, id: id.toString() })
            sessionAccount.setJwtToken(response.data.jwtToken)
            sessionAccount.setJwtExpiration(response.data.jwtExpiration)

            // Se quiser recriar o timeout após refresh, pode chamar `monitorJwtExpiration` de novo
        } catch (error) {
            console.error("Failed to refresh token:", error)
            throw error
        }
    }
}
