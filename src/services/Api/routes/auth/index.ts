import api from "../.."

async function refreshToken({ username, id }: { username: string; id: string }) {
    return await api.post(`/auth/refresh-token`, { username, id })
}

export const routes = {
    refreshToken,
}
