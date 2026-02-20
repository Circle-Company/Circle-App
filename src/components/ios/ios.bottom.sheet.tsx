import React from "react"
import { Host, BottomSheet, HStack } from "@expo/ui/swift-ui"
import { View } from "react-native"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"

type SwiftBottomSheetProps = {
    isOpened: boolean
    onIsOpenedChange: (value: boolean) => void
    children: React.ReactNode
    snapPoints?: number[]
}

export function SwiftBottomSheet({
    isOpened,
    onIsOpenedChange,
    children,
    snapPoints = [0.5, 1],
}: SwiftBottomSheetProps) {
    return (
        <Host>
            <BottomSheet
                presentationDragIndicator="visible"
                presentationDetents={snapPoints}
                isOpened={isOpened} // PROP PRINCIPAL
                onIsOpenedChange={onIsOpenedChange} // CALLBACK DE MUDANÇA
                modifiers={[
                    {
                        $type: "background",
                        material: "systemMaterialDark",
                    },
                ]}
            >
                <HStack>{children}</HStack>
            </BottomSheet>
        </Host>
    )
}
