import { signWithAppleProps } from "./auth.types"

import api from "@/api"

// Não há função de refresh aqui de propósito: o refresh é single-flight e vive dentro do
// interceptor de resposta (`doRefreshToken` em `src/api/index.ts`), que é o único lugar
// com acesso à fila de requests pendentes. Uma segunda porta de entrada para o refresh
// significaria duas rotações concorrentes do mesmo token.

async function signWithApple(
    { username, appleSign }: { username: string; appleSign: signWithAppleProps },
    headers?: Record<string, string>,
) {
    return api.post("/auth/apple", { username, appleSign }, { headers })
}

async function signWithAppleAlreadyExists(
    { user }: { user: signWithAppleProps["user"] },
    headers?: Record<string, string>,
) {
    return api.post("/auth/apple/exists", { user }, { headers })
}

/**
 * Revoga **todos** os refresh tokens em aberto do usuário.
 *
 * Três coisas que o contrato do backend deixa explícitas e que mudam como isto é chamado:
 *
 * 1. O header carrega o **access token** (rota autenticada normal), não o refresh.
 * 2. É **idempotente**: chamar de novo devolve `revokedTokens: 0` e 200, não erro.
 * 3. **Não invalida o access token atual**, que segue aceito até o próprio `exp` (até 10h).
 *    Ou seja: o signout garante que a sessão não se *renova*, não que ela morra no mesmo
 *    segundo. Quem efetiva o logout para o usuário é a limpeza local — por isso a chamada é
 *    best-effort e a limpeza vai num `finally`.
 */
async function signOut(accessToken?: string) {
    // O token vai explícito porque quem chama está prestes a apagar o storage: a chamada
    // não pode depender de um estado que já não vai existir.
    return api.post(
        "/auth/signout",
        undefined,
        accessToken
            ? // `ownAuth`: o interceptor não deve sobrescrever este header — a sessão viva
              // já foi descartada quando esta chamada sai.
              ({ headers: { Authorization: `Bearer ${accessToken}` }, ownAuth: true } as any)
            : undefined,
    )
}

export const routes = {
    signWithApple,
    signWithAppleAlreadyExists,
    signOut,
}
