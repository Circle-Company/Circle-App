import api from "../.."
import { UpdateCoordinatesProps } from "./types"

async function updateCoordinates({ userId, coordinates }: UpdateCoordinatesProps): Promise<void> {
    await api
        .put("/account/edit/coordinates", {
            user_id: userId,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
        })
        .catch((err) => {
            console.log(err)
        })
}

export const routes = {
    updateCoordinates,
}
