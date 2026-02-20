export interface BaseAction {
    momentId: string
    authorizationToken: string
}

export interface watchTimeAction extends BaseAction {
    watchTime: number
}

export interface reportAction {
    momentId: string
    reason: string
    description: string
}

export interface commentAction extends BaseAction {
    content: string
    mentions: Array<string>
    parentId: string
}
