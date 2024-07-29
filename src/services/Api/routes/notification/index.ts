import api from "../.."
import { PostTokenProps } from "./types"

async function setToken({ userId, token }: PostTokenProps): Promise<void> {
    await api.post("/notification/token/store", {
        userId,
        token,
    })
}

export const routes = {
    setToken,
}
