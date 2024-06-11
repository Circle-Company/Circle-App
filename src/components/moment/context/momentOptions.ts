import React from "react"
import { MomentOptionsProps } from "./types"

export interface MomentOptionsState extends MomentOptionsProps {
    showOptionsModal: boolean
    setShowOptionsModal:React.Dispatch<React.SetStateAction<boolean>>
    setEnableAnalyticsView:React.Dispatch<React.SetStateAction<boolean>>
    setEnableStoreActions:React.Dispatch<React.SetStateAction<boolean>>
    setEnableTranslation:React.Dispatch<React.SetStateAction<boolean>>
    setEnableModeration:React.Dispatch<React.SetStateAction<boolean>>
    setIsFeed:React.Dispatch<React.SetStateAction<boolean>>
    setIsFocused:React.Dispatch<React.SetStateAction<boolean>>
    setMomentOptions: (momentOptionsProps: MomentOptionsProps) => void
}

export function useMomentOptions(): MomentOptionsState {
    const [ showOptionsModal, setShowOptionsModal] = React.useState<boolean>(false)
    const [ enableAnalyticsView, setEnableAnalyticsView] = React.useState<boolean>(false)
    const [ enableStoreActions, setEnableStoreActions] = React.useState<boolean>(false)
    const [ enableTranslation, setEnableTranslation ] = React.useState<boolean>(false)
    const [ enableModeration, setEnableModeration ] = React.useState<boolean>(false)
    const [ isFeed, setIsFeed ] = React.useState<boolean>(false)
    const [ isFocused, setIsFocused ] = React.useState<boolean>(false)


    function setMomentOptions(momentOptionsProps: MomentOptionsProps) {
        setShowOptionsModal(false)
        setEnableAnalyticsView(momentOptionsProps.enableAnalyticsView)
        setEnableStoreActions(momentOptionsProps.enableStoreActions)
        setEnableTranslation(momentOptionsProps.enableTranslation)
        setIsFeed(momentOptionsProps.isFeed)
        setIsFocused(momentOptionsProps.isFocused)
    }

    React.useEffect(() => {
        setIsFocused(isFocused)
    }, [ isFocused])
    
    return {
        showOptionsModal,
        enableAnalyticsView,
        enableStoreActions,
        enableTranslation,
        enableModeration,
        isFeed,
        isFocused,
        setShowOptionsModal,
        setEnableAnalyticsView,
        setEnableStoreActions,
        setEnableTranslation,
        setEnableModeration,
        setIsFeed,
        setIsFocused,
        setMomentOptions
    }
}

export default class MomentOptionsClass {
    public readonly enableAnalyticsView: boolean
    public readonly enableStoreActions: boolean
    public readonly enableTranslation: boolean
    public readonly enableModeration: boolean
    public isFeed: boolean
    public isFocused: boolean

    constructor({
        enableAnalyticsView,
        enableStoreActions,
        enableTranslation,
        enableModeration,
        isFeed,
        isFocused
    }: MomentOptionsProps) {
        this.enableAnalyticsView = enableAnalyticsView
        this.enableStoreActions = enableStoreActions
        this.enableTranslation = enableTranslation
        this.enableModeration = enableModeration
        this.isFeed = isFeed
        this.isFocused = isFocused
    }
}