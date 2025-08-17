import React from "react"
export type SettingsiItemObjectProps = {
    icon?: React.ReactNode
    name: string
    value: string | object
    type: "TEXT" | "IMAGE"
    navigator: string
    navigateTo: string
    secure: boolean
    
}
export type SettignsSectionProps = {
    name: string
    content: Array<SettingsiItemObjectProps>
}


