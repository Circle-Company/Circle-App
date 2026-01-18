import api from "@/api"
import { BaseAction } from "./moment.types"

export async function exclude(props: BaseAction): Promise<void> {
    await api.delete(`/moments/${props.momentId}`)
}
