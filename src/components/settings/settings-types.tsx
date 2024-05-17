import React from "react"

export type SettignsSectionProps = {
    name: string,
    type: 'COMMON' | 'ACCOUNT'
    content: Array<SettingsiItemObjectProps>
}

export type SettingsiItemObjectProps = {
    name: string,
    navigateTo: string
}

export type SettingsiItemAccountObjectProps = {
    name: string,
    value: string | Object,
    type: 'TEXT' | 'IMAGE'
    navigator: string
    navigateTo: string,
    secure: boolean
}