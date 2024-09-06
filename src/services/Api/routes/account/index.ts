import api from "../.."
import { storage, storageKeys } from "../../../../store"
import { UpdateCoordinatesProps } from "./types"

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
                    authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
                },
            }
        )
        .catch((err) => {
            console.log(err)
        })
}

export const routes = {
    updateCoordinates,
}
