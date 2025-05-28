import LanguageContext from "../contexts/Preferences/language"
import React from "react"

interface TimeDifferenceConverterProps {
    date: string
    small?: boolean
}

export function useTimeDifferenceConverter() {
    const { t } = React.useContext(LanguageContext)
    
    return React.useCallback(({
        date,
        small = true,
    }: TimeDifferenceConverterProps): string => {
        const currentDate = new Date()
        const inputDateObj = new Date(date)

        const timeDiff = Math.abs(currentDate.getTime() - inputDateObj.getTime())

        const seconds = Math.floor(timeDiff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        const weeks = Math.floor(days / 7)

        if (weeks > 0) {
            if (small) return `${weeks}${t("w")}`
            return `${weeks} ${weeks === 1 ? t("week") : t("weeks")} ${t("ago")}`
        } else if (days > 0) {
            if (small) return `${days}${t("d")}`
            return `${days} ${days === 1 ? t("day") : t("days")} ${t("ago")}`
        } else if (hours > 0) {
            if (small) return `${hours}${t("h")}`
            return `${hours} ${hours === 1 ? t("hour") : t("hours")} ${t("ago")}`
        } else if (minutes > 0) {
            if (small) return `${minutes}${t("min")}`
            return `${minutes} ${minutes === 1 ? t("minute") : t("minutes")} ${t("ago")}`
        } else {
            if (small) return `${seconds}${t("s")}`
            return `${seconds} ${seconds === 1 ? t("second") : t("seconds")} ${t("ago")}`
        }
    }, [t])
}

// Função auxiliar para compatibilidade com código existente
export function timeDifferenceConverter({
    date,
    small = true,
}: TimeDifferenceConverterProps): string {
    const currentDate = new Date()
    const inputDateObj = new Date(date)

    const timeDiff = Math.abs(currentDate.getTime() - inputDateObj.getTime())

    const seconds = Math.floor(timeDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)

    if (weeks > 0) {
        if (small) return `${weeks}w`
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
    } else if (days > 0) {
        if (small) return `${days}d`
        return `${days} ${days === 1 ? "day" : "days"} ago`
    } else if (hours > 0) {
        if (small) return `${hours}h`
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else if (minutes > 0) {
        if (small) return `${minutes}min`
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else {
        if (small) return `${seconds}s`
        return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`
    }
}
