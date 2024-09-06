import api from "../.."
import { storage, storageKeys } from "../../../../store"
import { PostTokenProps } from "./types"

async function setToken({ userId, token }: PostTokenProps): Promise<void> {
    await api.post(
        "/notification/token/store",
        {
            userId,
            token,
        },
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

export const routes = {
    setToken,
}
