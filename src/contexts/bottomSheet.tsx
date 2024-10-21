import BottomSheet, { BottomSheetModalProvider, BottomSheetProps } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StatusBar, View, useColorScheme } from "react-native"
import { CustomBackdrop } from "../components/general/bottomSheet/backdrop"
import { colors } from "../layout/constants/colors"
import sizes from "../layout/constants/sizes"
type BottomSheetProviderProps = {
    children: React.ReactNode
}

export type BottomSheetContextData = {
    expand: React.Dispatch<React.SetStateAction<BottomSheetProps | null>>
    collapse: () => void
}

interface CustomBottomSheetProps extends BottomSheetProps {}

const BottomSheetContext = React.createContext<BottomSheetContextData>({} as BottomSheetContextData)

export function Provider({ children }: BottomSheetProviderProps) {
    const isDarkMode = useColorScheme() === "dark"
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [options, setOptions] = useState<CustomBottomSheetProps | null>(null)
    const snapPoints = useMemo(() => options?.snapPoints || [0], [options])

    useEffect(() => {
        if (options) bottomSheetRef.current?.expand()
        else bottomSheetRef.current?.collapse()
    }, [options])

    useEffect(() => {
        if (options) {
            bottomSheetRef.current?.expand()
            // Altera a cor da barra de status para acompanhar o backdrop
            StatusBar.setTranslucent(true)
            StatusBar.setBackgroundColor(isDarkMode ? colors.gray.black : "#6f6f6f")
            StatusBar.setBarStyle(isDarkMode ? "light-content" : "light-content")
        } else {
            bottomSheetRef.current?.collapse()
            // Restaura a cor original da barra de status
            StatusBar.setBackgroundColor(isDarkMode ? colors.gray.black : colors.gray.white)
            StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content")
        }
    }, [options, isDarkMode])

    const collapseBottomSheet = useCallback(() => setOptions(null), [])
    const bottomSheetContext: BottomSheetContextData = useMemo(
        () => ({
            expand: setOptions,
            collapse: collapseBottomSheet,
        }),
        [collapseBottomSheet]
    )

    const modalBackgroundStyle: any = {
        borderRadius: sizes.borderRadius["1xl"] * 0.8,
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        alignItems: "center",
    }

    const modalStyle: any = {
        ...sizes.bottomSheet,
        alignItems: "center",
    }

    const handleStyle: any = {
        height: 10,
    }

    const handleIndicatorStyle: any = {
        backgroundColor: isDarkMode ? colors.gray.grey_07 : colors.gray.grey_03,
    }

    return (
        <BottomSheetModalProvider>
            <BottomSheetContext.Provider value={bottomSheetContext}>
                {children}
                {options && (
                    <BottomSheet
                        index={-1}
                        snapPoints={snapPoints}
                        ref={bottomSheetRef}
                        enablePanDownToClose={options.enablePanDownToClose} // Desabilitando fechar com gesto de deslize
                        enableHandlePanningGesture={options.enableHandlePanningGesture} // Desabilitando gesto no handle
                        enableContentPanningGesture={options.enableContentPanningGesture} // Desabilitando arrastar conteúdo
                        handleIndicatorStyle={handleIndicatorStyle}
                        handleStyle={handleStyle}
                        style={modalStyle}
                        bottomInset={36}
                        detached={true}
                        backdropComponent={() => <CustomBackdrop />}
                        backgroundStyle={modalBackgroundStyle}
                        onClose={() => bottomSheetRef.current?.collapse()}
                    >
                        <View style={{ marginTop: sizes.margins["2sm"] }}>{options.children}</View>
                    </BottomSheet>
                )}
            </BottomSheetContext.Provider>
        </BottomSheetModalProvider>
    )
}

export default BottomSheetContext
