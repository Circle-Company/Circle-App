import { Timezone, TimezoneCode } from "circle-text-library"
import { storage, storageKeys } from "../../store"

import { textLib } from "@/shared/circle.text.library"

export function useLocaleDate(date: string) {
    const localTZ = new Timezone()
    if (storage.getString(storageKeys().preferences.timezoneCode)) {
        localTZ.setLocalTimezone(
            TimezoneCode[
                storage.getString(
                    storageKeys().preferences.timezoneCode,
                ) as keyof typeof TimezoneCode
            ] as TimezoneCode,
        )
    } else localTZ.setLocalTimezone(TimezoneCode.UTC)

    return localTZ.UTCToLocal(new Date(date))
}

export function useLocaleDateRelative(date: string) {
    const localDate = useLocaleDate(String(date))
    return textLib.date.toRelativeTime(localDate)
}
