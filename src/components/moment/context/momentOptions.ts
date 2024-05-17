import { MomentOptionsProps } from "./types"

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