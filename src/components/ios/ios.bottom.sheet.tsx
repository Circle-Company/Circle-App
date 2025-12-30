import React from "react"
import { Host, BottomSheet } from "@expo/ui/swift-ui"

type SwiftBottomSheetProps = {
    isOpened: boolean
    onIsOpenedChange: (value: boolean) => void
    children: React.ReactNode
}

export function SwiftBottomSheet({ isOpened, onIsOpenedChange, children }: SwiftBottomSheetProps) {
    return (
        <Host
            style={{
                width: "100%",
                position: "absolute",
                bottom: 0,
            }}
        >
            <BottomSheet
                isOpened={isOpened} // PROP PRINCIPAL
                onIsOpenedChange={onIsOpenedChange} // CALLBACK DE MUDANÇA
            >
                {children}
            </BottomSheet>
        </Host>
    )
}
