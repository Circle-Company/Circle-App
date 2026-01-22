import { SignInProps, SignUpProps } from "./auth.types"

import api from "@/api"

async function refreshToken({ refreshToken }: { refreshToken: string }) {
    return api.get("/auth/refresh-token", {
        headers: { Authorization: refreshToken },
    })
}

async function signIn({ username, password }: SignInProps, headers?: Record<string, string>) {
    return api.post("/auth/signin", { username, password }, { headers })
}

async function signUp({ username, password }: SignUpProps, headers?: Record<string, string>) {
    return api.post("/auth/signup", { username, password }, { headers })
}

export const routes = {
    refreshToken,
    signIn,
    signUp,
}
