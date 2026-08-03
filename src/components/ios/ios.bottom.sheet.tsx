import React from "react"
import { Dimensions, View } from "react-native"
import { Host, BottomSheet, Group } from "@expo/ui/swift-ui"
import {
    frame,
    presentationDetents,
    presentationDragIndicator,
    type PresentationDetent,
} from "@expo/ui/swift-ui/modifiers"

type SwiftBottomSheetProps = {
    isOpened: boolean
    onIsOpenedChange: (value: boolean) => void
    children: React.ReactNode
    snapPoints?: number[]
    /**
     * Ative quando o conteúdo da sheet for React Native (e não SwiftUI).
     * O SwiftUI dimensiona a view hospedada pelo tamanho intrínseco dela, então
     * sem um frame explícito o conteúdo RN encolhe e fica colado à esquerda.
     */
    fillContent?: boolean
    /**
     * Espaço no topo do conteúdo RN para não ficar sob o indicador de arraste
     * (grabber) da sheet. Só se aplica quando `fillContent` está ativo.
     */
    contentTopInset?: number
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
    fillContent = false,
    contentTopInset = 28,
}: SwiftBottomSheetProps) {
    const detents = snapPoints.map(toDetent)

    // Tamanho que a sheet ocupa no maior snap point — usado para dar um frame
    // explícito ao conteúdo React Native hospedado dentro do SwiftUI.
    const window = Dimensions.get("window")
    const largestSnapPoint = Math.max(0.05, Math.min(1, Math.max(...snapPoints)))
    const contentWidth = window.width
    const contentHeight = window.height * largestSnapPoint

    const modifiers = [presentationDetents(detents), presentationDragIndicator("visible")]
    if (fillContent) {
        modifiers.push(
            frame({ width: contentWidth, height: contentHeight, alignment: "top" }),
        )
    }

    return (
        <Host
            colorScheme="dark"
            style={{ position: "absolute", width: 0, height: 0 }}
            pointerEvents="box-none"
        >
            <BottomSheet isPresented={isOpened} onIsPresentedChange={onIsOpenedChange}>
                <Group modifiers={modifiers}>
                    {fillContent ? (
                        <View
                            style={{
                                width: contentWidth,
                                height: contentHeight,
                                paddingTop: contentTopInset,
                            }}
                        >
                            {children}
                        </View>
                    ) : (
                        children
                    )}
                </Group>
            </BottomSheet>
        </Host>
    )
}
