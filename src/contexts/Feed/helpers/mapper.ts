// feedMapper.ts
import { MomentProps } from "../types"

export function mapper(
    ids: string[],
    moments: MomentProps[],
    fallback: MomentProps[],
): MomentProps[] {
    return ids
        .map((id) => moments.find((m) => m.id === id) ?? fallback.find((m) => m.id === id))
        .filter((m): m is MomentProps => !!m)
}
