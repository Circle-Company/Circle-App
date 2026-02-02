import { Timezone, TimezoneCode } from "circle-text-library"
import { textLib } from "@/circle.text.library"
import { storage, storageKeys } from "@/store"

export function useLocaleDate(date: string): Date {
    const d = new Date(date)

    // offset em minutos (ex: UTC-3 => 180)
    const offsetMinutes = d.getTimezoneOffset()

    // 2x offset em ms
    const correctionMs = offsetMinutes * 60 * 1000

    return new Date(d.getTime() + correctionMs)
}

export function useLocaleDateRelative(date: string) {
    const localDate = useLocaleDate(date)
    if (!(localDate instanceof Date) || isNaN(localDate.getTime())) return ""
    if (localDate.getTime() > Date.now()) return ""
    return textLib.date.toRelativeTime(localDate)
}

export function useLocaleDateRelative2(date: string) {
    return textLib.date.toRelativeTime(new Date(date))
}
