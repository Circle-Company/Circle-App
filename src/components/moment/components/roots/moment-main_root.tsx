import { MomentMainRootProps } from "../../moment-types"
import { MomentProvider } from "../../context"

export default function main_root({
    children,
    isFeed,
    isFocused,
    momentData,
    momentSize,
}: MomentMainRootProps) {
    return (
        <MomentProvider
            isFeed={isFeed}
            isFocused={isFocused}
            momentData={momentData}
            momentSize={momentSize}
        >
            {children}
        </MomentProvider>
    )
}
