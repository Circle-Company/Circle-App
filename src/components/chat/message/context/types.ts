import { MessageDataState } from "./data.context"
import { MessageOptionsState } from "./options.context"
import { MessageActionsState } from "./actions.context"
import { MessageSizeProps } from "../message.types"

export type MessageContextsData = {
    data: MessageDataState
    size: MessageSizeProps
    options: MessageOptionsState
    actions: MessageActionsState
}
