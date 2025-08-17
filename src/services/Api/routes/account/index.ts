import api from "../.."
import { storage, storageKeys } from "../../../../store"
import { UpdateCoordinatesProps } from "./types"

async function findFollowings({ page, limit }: { page: unknown; limit: unknown }): Promise<void> {
    const response = await api.get(`/account/list/followings?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: storage.getString(storageKeys().account.jwt.token) || "",
        },
    })

    return response.data
}

async function updateCoordinates({ userId, coordinates }: UpdateCoordinatesProps): Promise<void> {
    await api
        .put(
            "/account/edit/coordinates",
            {
                user_id: userId,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            },
            {
                headers: {
                    Authorization: storage.getString(storageKeys().account.jwt.token) || "",
                },
            }
        )
        .catch((err) => {
            console.log(err)
        })
}

export const routes = {
    findFollowings,
    updateCoordinates,
}
