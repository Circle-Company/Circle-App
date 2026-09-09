import React from "react"
import { Text, type TextStyle } from "react-native"

import fonts from "@/constants/fonts"

/** Duração da nota, em `m:ss`. */
function AudioDuration({
    seconds,
    color,
    fontSize,
}: {
    seconds: number
    color: string
    fontSize: number
}) {
    const label = React.useMemo(() => formatDuration(seconds), [seconds])

    const style: TextStyle = {
        fontSize,
        fontFamily: fonts.family.Regular,
        color,
    }

    return <Text style={style}>{label}</Text>
}

export function formatDuration(seconds: number): string {
    const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
    const minutes = Math.floor(safe / 60)
    return `${minutes}:${String(Math.floor(safe % 60)).padStart(2, "0")}`
}

export default React.memo(AudioDuration)
