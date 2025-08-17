import React from "react"
import LanguageContext from "../contexts/Preferences/language"

interface MyObject {
    created_at?: Date
    updated_at?: Date
    // outras propriedades do objeto
}

interface GroupedObject {
    date: string
    content: MyObject[]
    count: number
}

const DEFAULT_TIME_INTERVAL = 15 * 60 * 1000 // 15 minutos em milissegundos
export enum TimeInterval {
    SECOND = 1000,
    MINUTE = 60 * 1000,
    HOUR = 60 * 60 * 1000,
    DAY = 24 * 60 * 60 * 1000,
    WEEK = 7 * 24 * 60 * 60 * 1000,
    BIMONTH = 2 * 30 * 24 * 60 * 60 * 1000,
    MONTH = 30 * 24 * 60 * 60 * 1000, // Um mês em milissegundos (aproximadamente)
    TRIMESTER = 3 * 30 * 24 * 60 * 60 * 1000,
    SEMESTER = 6 * 30 * 24 * 60 * 60 * 1000,
    YEAR = 365 * 24 * 60 * 60 * 1000,
}

// Hook personalizado para usar as funções de data
export function useDateHelpers() {
    const { t } = React.useContext(LanguageContext)

    const getDateStringRelative = React.useCallback(
        (date: Date, timeInterval: TimeInterval): string => {
            const now = new Date()
            const diff = now.getTime() - date.getTime()

            if (timeInterval === TimeInterval.SECOND) {
                const secondsAgo = Math.floor(diff / timeInterval)
                return secondsAgo === 0
                    ? t("now")
                    : `${secondsAgo} ${secondsAgo === 1 ? t("second") : t("seconds")} ${t("ago")}`
            } else if (timeInterval === TimeInterval.MINUTE) {
                const minutesAgo = Math.floor(diff / timeInterval)
                return minutesAgo === 0
                    ? t("now")
                    : `${minutesAgo} ${minutesAgo === 1 ? t("minute") : t("minutes")} ${t("ago")}`
            } else if (timeInterval === TimeInterval.HOUR) {
                const hoursAgo = Math.floor(diff / timeInterval)
                return hoursAgo === 0
                    ? t("now")
                    : `${hoursAgo} ${hoursAgo === 1 ? t("hour") : t("hours")} ${t("ago")}`
            } else if (timeInterval === TimeInterval.DAY) {
                const daysAgo = Math.floor(diff / timeInterval)
                return getDayString(daysAgo)
            } else if (timeInterval === TimeInterval.WEEK) {
                const weeksAgo = Math.floor(diff / timeInterval)
                return weeksAgo === 0
                    ? t("this week")
                    : weeksAgo === 1
                      ? t("last week")
                      : `${weeksAgo} ${t("weeks ago")}`
            } else if (timeInterval === TimeInterval.BIMONTH) {
                const bimonthsAgo = Math.floor(diff / timeInterval)
                return bimonthsAgo === 0
                    ? t("this two months")
                    : bimonthsAgo === 1
                      ? t("last two months")
                      : `${bimonthsAgo} ${t("two months ago")}`
            } else if (timeInterval === TimeInterval.MONTH) {
                const monthsAgo = Math.floor(diff / timeInterval)
                return monthsAgo === 0
                    ? t("this month")
                    : monthsAgo === 1
                      ? t("last month")
                      : `${monthsAgo} ${t("months ago")}`
            } else if (timeInterval === TimeInterval.TRIMESTER) {
                const trimestersAgo = Math.floor(diff / timeInterval)
                return trimestersAgo === 0
                    ? t("this quarter")
                    : trimestersAgo === 1
                      ? t("last quarter")
                      : `${trimestersAgo} ${t("quarters ago")}`
            } else if (timeInterval === TimeInterval.SEMESTER) {
                const semestersAgo = Math.floor(diff / timeInterval)
                return semestersAgo === 0
                    ? t("this semester")
                    : semestersAgo === 1
                      ? t("last semester")
                      : `${semestersAgo} ${t("semesters ago")}`
            } else if (timeInterval === TimeInterval.YEAR) {
                const currentYear = now.getFullYear()
                const objYear = date.getFullYear()

                if (currentYear === objYear) return t("this year")
                else {
                    const yearsAgo = Math.floor(diff / timeInterval)
                    return yearsAgo === 1 ? t("last year") : `${yearsAgo} ${t("years ago")}`
                }
            } else return t("more than a year ago")
        },
        [t]
    )

    const getDayString = React.useCallback(
        (daysAgo: number): string => {
            if (daysAgo === 0) return t("today")
            else if (daysAgo === 1) return t("yesterday")
            else return `${daysAgo} ${t("days ago")}`
        },
        [t]
    )

    return { getDateStringRelative, getDayString }
}

export function groupObjectsByDate(
    objects: MyObject[],
    timeInterval: number = DEFAULT_TIME_INTERVAL
): GroupedObject[] {
    const groupedObjects = new Map<string, GroupedObject>()
    // Agrupar objetos pela data de criação ou atualização
    objects?.forEach((obj) => {
        let dateProperty: Date | undefined

        if (obj.created_at) {
            dateProperty = new Date(obj.created_at)
        } else if (obj.updated_at) {
            dateProperty = new Date(obj.updated_at)
        }

        if (dateProperty) {
            const dateString = getDateStringRelativeStatic(dateProperty, timeInterval)

            if (!groupedObjects.has(dateString)) {
                groupedObjects.set(dateString, { date: dateString, content: [], count: 0 })
            }

            const group = groupedObjects.get(dateString)!
            group.content.push(obj)
            group.count += 1
        }
    })

    // Converter o Map em um array de objetos
    const result = Array.from(groupedObjects.values())

    return result
}

// Função estática para compatibilidade
function getDateStringRelativeStatic(date: Date, timeInterval: TimeInterval): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (timeInterval === TimeInterval.SECOND) {
        const secondsAgo = Math.floor(diff / timeInterval)
        return secondsAgo === 0
            ? "now"
            : `${secondsAgo} ${secondsAgo === 1 ? "second" : "seconds"} ago`
    } else if (timeInterval === TimeInterval.MINUTE) {
        const minutesAgo = Math.floor(diff / timeInterval)
        return minutesAgo === 0
            ? "now"
            : `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`
    } else if (timeInterval === TimeInterval.HOUR) {
        const hoursAgo = Math.floor(diff / timeInterval)
        return hoursAgo === 0 ? "now" : `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`
    } else if (timeInterval === TimeInterval.DAY) {
        const daysAgo = Math.floor(diff / timeInterval)
        return getDayStringStatic(daysAgo)
    } else if (timeInterval === TimeInterval.WEEK) {
        const weeksAgo = Math.floor(diff / timeInterval)
        return weeksAgo === 0 ? "this week" : weeksAgo === 1 ? "last week" : `${weeksAgo} weeks ago`
    } else if (timeInterval === TimeInterval.MONTH) {
        const monthsAgo = Math.floor(diff / timeInterval)
        return monthsAgo === 0
            ? "this month"
            : monthsAgo === 1
              ? "last month"
              : `${monthsAgo} months ago`
    } else if (timeInterval === TimeInterval.YEAR) {
        const currentYear = now.getFullYear()
        const objYear = date.getFullYear()
        if (currentYear === objYear) return "this year"
        else {
            const yearsAgo = Math.floor(diff / timeInterval)
            return yearsAgo === 1 ? "last year" : `${yearsAgo} years ago`
        }
    } else return "more than a year ago"
}

function getDayStringStatic(daysAgo: number): string {
    if (daysAgo === 0) return "today"
    else if (daysAgo === 1) return "yesterday"
    else return `${daysAgo} days ago`
}
