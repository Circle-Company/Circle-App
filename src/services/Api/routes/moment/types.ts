import { InteractionType } from "@/components/moment/context/momentUserActions"

export type MomentActionProps = {
    momentId: string
    authorizationToken: string
}

export type MomentActionPropsWithReportType = MomentActionProps & {
    reportType: InteractionType
}

export type MomentActionPropsWithCommentType = MomentActionProps & {
    commentId: string
}
