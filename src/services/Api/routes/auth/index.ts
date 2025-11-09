import { SignInProps, SignUpProps, refreshTokenProps } from "./styles"

import api from "../.."

async function refreshToken({ username, id }: refreshTokenProps) {
    return await api.post("/auth/refresh-token", { username, id })
}

async function signIn({ username, password }: SignInProps): Promise<void> {
    await api.post("/signin", { username, password })
}

async function signUp({ username, password }: SignUpProps): Promise<void> {
    await api.post("/auth/signup", { username, password })
}

export const routes = {
    refreshToken,
    signIn,
    signUp,
}
