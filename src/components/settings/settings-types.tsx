import React from "react"
export type SettingsiItemObjectProps = {
    icon?: React.ReactNode
    name: string
    value?: string | object
    type?: "IMAGE" | "Switch" | "CUSTOM" | "TEXT"
    secure?: boolean

    rightComponent?: React.ReactNode
    onPress?: () => void | Promise<void>
}
export type SettignsSectionProps = {
    name: string
    content: Array<SettingsiItemObjectProps>
}
