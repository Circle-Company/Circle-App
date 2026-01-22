import { MomentMainRootProps } from "../../moment-types"
import { MomentProvider } from "../../context"

export default function main_root({
    children,
    isFeed,
    isFocused,
    data,
    size,
    shadow,
}: MomentMainRootProps) {
    return (
        <MomentProvider
            isFeed={isFeed}
            isFocused={isFocused}
            data={data}
            size={size}
            shadow={shadow}
        >
            {children}
        </MomentProvider>
    )
}
