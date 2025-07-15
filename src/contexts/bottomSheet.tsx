import BottomSheet, { BottomSheetBackdropProps, BottomSheetModalProvider, BottomSheetProps } from "@gorhom/bottom-sheet"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StatusBar, StyleSheet, View, ViewStyle, useColorScheme } from "react-native"

import { FlexAlignType } from "react-native"
import { CustomBackdrop } from "../components/general/bottomSheet/backdrop"
import { colors } from "../layout/constants/colors"
import sizes from "../layout/constants/sizes"

type BottomSheetProviderProps = {
    children: React.ReactNode
}

// Estendendo o tipo para incluir estilos personalizados
interface CustomBottomSheetOptions extends BottomSheetProps {
    customStyles?: {
        modalBackground?: Partial<ViewStyle>;
        modal?: Partial<ViewStyle>;
        handle?: Partial<ViewStyle>;
        handleIndicator?: Partial<ViewStyle>;
    }
}

export type BottomSheetContextData = {
    expand: React.Dispatch<React.SetStateAction<CustomBottomSheetOptions | null>>
    collapse: () => void
}

const BottomSheetContext = React.createContext<BottomSheetContextData>({} as BottomSheetContextData)

export function Provider({ children }: BottomSheetProviderProps) {
    const isDarkMode = useColorScheme() === "dark"
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [options, setOptions] = useState<CustomBottomSheetOptions | null>(null)
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

    // Componente renderizável de backdrop
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => <CustomBackdrop {...props} />,
        []
    )

    // Estilos do BottomSheet
    const styles = useMemo(() => {
        return StyleSheet.create({
            contentContainer: {
                marginTop: sizes.margins["2sm"]
            },
            handle: {
                height: 10,
                ...(options?.customStyles?.handle || {})
            },
            handleIndicator: {
                backgroundColor: isDarkMode ? colors.gray.grey_07 : colors.gray.grey_03,
                ...(options?.customStyles?.handleIndicator || {})
            },
            modal: {
                ...sizes.bottomSheet,
                alignItems: "center" as FlexAlignType,
                ...(options?.customStyles?.modal || {})
            },
            modalBackground: {
                alignItems: "center" as FlexAlignType,
                backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
                borderRadius: sizes.borderRadius["1xl"] * 0.8,
                ...(options?.customStyles?.modalBackground || {})
            }
        })
    }, [isDarkMode, options?.customStyles])

    return (
        <BottomSheetModalProvider>
            <BottomSheetContext.Provider value={bottomSheetContext}>
                {children}
                {options && (
                    <BottomSheet
                        index={-1}
                        snapPoints={snapPoints}
                        ref={bottomSheetRef}
                        enablePanDownToClose={options.enablePanDownToClose}
                        enableHandlePanningGesture={options.enableHandlePanningGesture}
                        enableContentPanningGesture={options.enableContentPanningGesture}
                        handleIndicatorStyle={styles.handleIndicator}
                        handleStyle={styles.handle}
                        style={styles.modal}
                        bottomInset={36}
                        detached={true}
                        backdropComponent={renderBackdrop}
                        backgroundStyle={styles.modalBackground}
                        onClose={() => bottomSheetRef.current?.collapse()}
                    >
                        <View style={styles.contentContainer}>{options.children}</View>
                    </BottomSheet>
                )}
            </BottomSheetContext.Provider>
        </BottomSheetModalProvider>
    )
}

export default BottomSheetContext
