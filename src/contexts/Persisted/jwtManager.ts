import { AppState } from "react-native"
import { apiRoutes } from "../../services/Api"
import { storage, storageKeys } from "../../store"
import { AccountState } from "./persistedAccount"
import { AccountDataType } from "./types"

let timeoutId: NodeJS.Timeout | null = null
let isRefreshing = false // Variável para controlar o estado de refresh
let lastRefreshTime = 0 // Controle do tempo da última atualização

export function monitorJwtExpiration(sessionAccount: AccountDataType, refreshJwtToken: Function) {
    const expirationTime = Number(sessionAccount.jwtExpiration) * 1000 // Em milissegundos
    const renewalThreshold = 60000 // 60 segundos antes de expirar
    const seventyPercentTime = (expirationTime - Date.now()) * 0.7 // 70% do tempo total

    const timeRemaining = expirationTime - Date.now()

    if (timeRemaining > renewalThreshold) {
        storage.set(storageKeys().account.jwt.expiration, expirationTime.toString())

        if (timeoutId) clearTimeout(timeoutId) // Evita múltiplos timeouts

        timeoutId = setTimeout(async () => {
            if (shouldRefresh(seventyPercentTime)) {
                await handleRefreshToken(refreshJwtToken)
                storage.delete(storageKeys().account.jwt.expiration) // Limpa após a renovação
            }
        }, timeRemaining - renewalThreshold)
    } else if (timeRemaining <= renewalThreshold) {
        if (shouldRefresh(seventyPercentTime)) {
            handleRefreshToken(refreshJwtToken)
        }
    }

    const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === "active") {
            if (shouldRefresh(seventyPercentTime)) {
                handleRefreshToken(refreshJwtToken)
            }

            const storedExpirationTime = storage.getString(storageKeys().account.jwt.expiration)

            if (storedExpirationTime) {
                const storedTimeRemaining = parseInt(storedExpirationTime) - Date.now()
                if (storedTimeRemaining <= renewalThreshold) {
                    if (shouldRefresh(seventyPercentTime)) {
                        handleRefreshToken(refreshJwtToken)
                    }
                } else {
                    if (timeoutId) clearTimeout(timeoutId)
                    timeoutId = setTimeout(() => {
                        if (shouldRefresh(seventyPercentTime)) {
                            handleRefreshToken(refreshJwtToken)
                        }
                    }, storedTimeRemaining - renewalThreshold)
                }
            }
        } else if (nextAppState === "inactive" || nextAppState === "background") {
            if (timeoutId) {
                clearTimeout(timeoutId) // Cancela o timeout ao fechar ou minimizar o app
                timeoutId = null
            }
        }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        subscription.remove() // Remove o listener
    }
}

// Verifica se já passou 70% do tempo restante antes de tentar o refresh
function shouldRefresh(seventyPercentTime: number) {
    const currentTime = Date.now()
    if (currentTime - lastRefreshTime >= seventyPercentTime) {
        lastRefreshTime = currentTime
        return true // Pode fazer o refresh
    }
    return false // Ainda não passou 70% do tempo
}

async function handleRefreshToken(refreshJwtToken: Function) {
    if (isRefreshing) return // Evita múltiplas chamadas

    isRefreshing = true

    try {
        await refreshJwtToken({
            username: storage.getString(storageKeys().user.username) || "",
            id: storage.getNumber(storageKeys().user.id) || 0,
        })
    } catch (error) {
        console.error("Error refreshing token:", error)
    } finally {
        isRefreshing = false // Reseta o estado de refresh
    }
}

export async function refreshJwtToken(
    { username, id }: { username: string; id: number },
    sessionAccount: AccountState
) {
    if (username && id !== 0) {
        try {
            const response = await apiRoutes.auth.refreshToken({ username, id })
            sessionAccount.setJwtToken(response.data.jwtToken)
            sessionAccount.setJwtExpiration(response.data.jwtExpiration)

            timeoutId = null
        } catch (error) {
            console.error("Failed to refresh token:", error)
            throw error
        }
    }
}
