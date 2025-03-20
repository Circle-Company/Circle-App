import { AccountState } from "@/contexts/persisted/persistedAccount"
import { apiRoutes } from "@/services/Api"
/**
 * Realiza o refresh do token, evitando chamadas concorrentes.
 *
 * @param refreshJwtToken - Função assíncrona para renovar o token.
 */
export async function refreshJwtToken(
    { username, id }: { username: string; id: string },
    sessionAccount: AccountState
) {
    if (username && id)
        try {
            const response = await apiRoutes.auth.refreshToken({
                username,
                id: id.toString(),
            })
            sessionAccount.setJwtToken(response.data.jwtToken)
            sessionAccount.setJwtExpiration(response.data.jwtExpiration)
        } catch (error) {
            console.error("Falha ao renovar o token:", error)
            throw error
        }
}
