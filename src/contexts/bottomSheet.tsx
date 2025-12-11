import BottomSheet, {
    BottomSheetBackdropProps,
    BottomSheetModalProvider,
    BottomSheetProps,
} from "@gorhom/bottom-sheet"
import React, {
    createContext,
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { FlexAlignType, StyleSheet, useColorScheme, View, ViewStyle } from "react-native"

import { CustomBackdrop } from "../components/general/bottomSheet/backdrop"
import { colors } from "../constants/colors"
import sizes from "../constants/sizes"

type BottomSheetProviderProps = {
    children: React.ReactNode
}

// Estendendo o tipo para incluir estilos personalizados
interface CustomBottomSheetOptions extends BottomSheetProps {
    customStyles?: {
        modalBackground?: Partial<ViewStyle>
        modal?: Partial<ViewStyle>
        handle?: Partial<ViewStyle>
        handleIndicator?: Partial<ViewStyle>
    }
    enablePanDownToClose?: boolean
    enableHandlePanningGesture?: boolean
    enableContentPanningGesture?: boolean
    snapPoints?: string[]
    children: React.ReactNode
}

export type BottomSheetContextData = {
    expand: Dispatch<SetStateAction<CustomBottomSheetOptions | null>>
    collapse: () => void
}

const BottomSheetContext = createContext<BottomSheetContextData>({} as BottomSheetContextData)

export function Provider({ children }: BottomSheetProviderProps) {
    const isDarkMode = useColorScheme() === "dark"
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [options, setOptions] = useState<CustomBottomSheetOptions | null>(null)

    const snapPoints = useMemo(() => options?.snapPoints || [0], [options])

    // Abrir/fechar bottom sheet quando as opções mudarem
    useEffect(() => {
        if (options) bottomSheetRef.current?.expand()
        else bottomSheetRef.current?.close()
    }, [options])

    // Antes: manipulava StatusBar nativa via métodos estáticos (removido para evitar conflitos)
    // Caso precise alterar StatusBar, faça via props/contexto no componente customizado.

    const collapseBottomSheet = useCallback(() => setOptions(null), [])

    const bottomSheetContext = useMemo(
        () => ({
            expand: setOptions,
            collapse: collapseBottomSheet,
        }),
        [collapseBottomSheet],
    )

    // Componente de backdrop customizado
    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => <CustomBackdrop {...props} />,
        [],
    )

    // Estilos do BottomSheet
    const styles = useMemo(
        () =>
            StyleSheet.create({
                contentContainer: {
                    marginTop: sizes.margins["2sm"],
                },
                handle: {
                    height: 10,
                    ...(options?.customStyles?.handle || {}),
                },
                handleIndicator: {
                    backgroundColor: isDarkMode ? colors.gray.grey_07 : colors.gray.grey_03,
                    ...(options?.customStyles?.handleIndicator || {}),
                },
                modal: {
                    ...sizes.bottomSheet,
                    alignItems: "center" as FlexAlignType,
                    ...(options?.customStyles?.modal || {}),
                },
                modalBackground: {
                    alignItems: "center" as FlexAlignType,
                    backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
                    borderRadius: sizes.borderRadius["1xl"] * 0.8,
                    ...(options?.customStyles?.modalBackground || {}),
                },
            }),
        [isDarkMode, options?.customStyles],
    )

    return (
        <BottomSheetModalProvider>
            <BottomSheetContext.Provider value={bottomSheetContext}>
                {children}
                {options && (
                    <BottomSheet
                        ref={bottomSheetRef}
                        index={-1}
                        snapPoints={snapPoints}
                        enablePanDownToClose={options.enablePanDownToClose}
                        enableHandlePanningGesture={options.enableHandlePanningGesture}
                        enableContentPanningGesture={options.enableContentPanningGesture}
                        handleIndicatorStyle={styles.handleIndicator}
                        handleStyle={styles.handle}
                        style={styles.modal}
                        bottomInset={36}
                        detached
                        backdropComponent={renderBackdrop}
                        backgroundStyle={styles.modalBackground}
                        onClose={collapseBottomSheet}
                    >
                        <View style={styles.contentContainer}>{options.children}</View>
                    </BottomSheet>
                )}
            </BottomSheetContext.Provider>
        </BottomSheetModalProvider>
    )
}

export default BottomSheetContext
