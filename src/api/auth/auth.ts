import { SignInProps, SignUpProps, signWithAppleProps } from "./auth.types"

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

export const routes = {
    refreshToken,
    signIn,
    signUp,
    signWithApple,
    signWithAppleAlreadyExists,
}
