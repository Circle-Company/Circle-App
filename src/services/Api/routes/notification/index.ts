import api from "../.."
import { PostTokenProps } from "./types"

async function setToken({ userId, token }: PostTokenProps): Promise<void> {
    console.log("fetch api setToken", { userId, token })
    await api.post("/notification/token/store", {
        userId,
        token,
    })
}

export const routes = {
    setToken,
}
