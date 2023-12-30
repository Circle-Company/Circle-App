import React from "react"

export type SettignsSectionProps = {
    name: string,
    content: Array<SettingsiItemObjectProps>
}

export type SettingsiItemObjectProps = {
    name: string,
    navigateTo: string
}