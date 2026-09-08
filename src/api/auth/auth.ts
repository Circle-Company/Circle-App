import { signWithAppleProps } from "./auth.types"

import api from "@/api"

async function refreshToken({ refreshToken }: { refreshToken: string }) {
    return api.get("/auth/refresh-token", {
        headers: { Authorization: refreshToken },
    })
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
    signWithApple,
    signWithAppleAlreadyExists,
}
