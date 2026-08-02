import React from "react"
import { Host, BottomSheet, Group } from "@expo/ui/swift-ui"
import {
    presentationDetents,
    presentationDragIndicator,
    type PresentationDetent,
} from "@expo/ui/swift-ui/modifiers"

type SwiftBottomSheetProps = {
    isOpened: boolean
    onIsOpenedChange: (value: boolean) => void
    children: React.ReactNode
    snapPoints?: number[]
}

const toDetent = (n: number): PresentationDetent => {
    if (n >= 1) return "large"
    if (Math.abs(n - 0.5) < 0.001) return "medium"
    return { fraction: Math.max(0.05, Math.min(1, n)) }
}

export function SwiftBottomSheet({
    isOpened,
    onIsOpenedChange,
    children,
    snapPoints = [0.5, 1],
}: SwiftBottomSheetProps) {
    const detents = snapPoints.map(toDetent)

    return (
        <Host
            colorScheme="dark"
            style={{ position: "absolute", width: 0, height: 0 }}
            pointerEvents="box-none"
        >
            <BottomSheet isPresented={isOpened} onIsPresentedChange={onIsOpenedChange}>
                <Group
                    modifiers={[
                        presentationDetents(detents),
                        presentationDragIndicator("visible"),
                    ]}
                >
                    {children}
                </Group>
            </BottomSheet>
        </Host>
    )
}
