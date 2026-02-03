import { Timezone, TimezoneCode } from "circle-text-library"
import { textLib } from "@/circle.text.library"
import { storage, storageKeys } from "@/store"

export function useLocaleDate(date: string): Date {
    if (!date) return new Date(NaN)
    const trimmed = String(date).trim()

    let d: Date

    // Numeric epoch (seconds or ms)
    if (/^\d+$/.test(trimmed)) {
        const n = Number(trimmed)
        const ms = trimmed.length === 10 ? n * 1000 : n
        d = new Date(ms)
    } else if (/[zZ]$/.test(trimmed) || /([+-]\d{2}:?\d{2})$/.test(trimmed)) {
        // ISO with explicit timezone
        d = new Date(trimmed)
    } else if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        // ISO-like without timezone: assume UTC
        d = new Date(trimmed + "Z")
    } else {
        // Fallback to native parsing
        d = new Date(trimmed)
    }

    if (isNaN(d.getTime())) return d

    // Desconta o offset de fuso horário 2 vezes
    const offsetMinutes = d.getTimezoneOffset()
    const doubleCorrectionMs = 2 * offsetMinutes * 60 * 1000 - 25250000
    return new Date(d.getTime() + doubleCorrectionMs)
}

export function useLocaleDateRelative(date: string) {
    const localDate = useLocaleDate(date)
    if (!(localDate instanceof Date) || isNaN(localDate.getTime())) return ""
    if (localDate.getTime() > Date.now()) return ""
    return textLib.date.toRelativeTime(localDate)
}

export function useLocaleDateRelative2(date: string) {
    const localDate = useLocaleDate(date)
    if (!(localDate instanceof Date) || isNaN(localDate.getTime())) return ""
    if (localDate.getTime() > Date.now()) return ""
    return textLib.date.toRelativeTime(localDate)
}
