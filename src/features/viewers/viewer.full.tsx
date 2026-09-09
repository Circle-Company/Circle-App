import { Viewers } from "@/components/viewers"
import MomentContext from "@/components/moment/context"
import React from "react"
import { flattenViewers, latestStats, useMomentViewersQuery } from "@/queries/moment.viewers"

export default function RenderViewersFull() {
    const { data: moment, options } = React.useContext(MomentContext)
    const momentId = String(moment?.id || "")

    const { data, error, isLoading } = useMomentViewersQuery(momentId)
    const viewers = React.useMemo(() => flattenViewers(data), [data])
    const stats = React.useMemo(() => latestStats(data), [data])

    return (
        <Viewers.MainRoot
            data={viewers}
            stats={stats}
            momentId={momentId}
            errorCode={error ? (error.code ?? "UNKNOWN") : undefined}
            loading={isLoading}
        >
            <Viewers.Container focused={options.isFocused}>
                <Viewers.CenterRoot>
                    <Viewers.ListViewers />
                </Viewers.CenterRoot>
            </Viewers.Container>
        </Viewers.MainRoot>
    )
}
