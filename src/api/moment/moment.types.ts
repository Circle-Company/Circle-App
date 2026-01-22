import { InteractionType } from "@/components/moment/context/moment.actions"

export interface BaseAction {
    momentId: string
    authorizationToken: string
}

export interface watchTimeAction extends BaseAction {
    watchTime: number
}

export interface commentAction extends BaseAction {
    content: string
    mentions: Array<string>
    parentId: string
}
