import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react"
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native"

export type InputProps = Omit<TextInputProps, "onChange"> & {
    /**
     * Controlled value. If provided, the component behaves as controlled.
     */
    value?: string
    /**
     * Uncontrolled default value. Used when `value` is undefined.
     */
    defaultValue?: string
    /**
     * Called whenever the text changes.
     */
    onChangeText?: (text: string) => void
    /**
     * Optional wrapper style for the container View.
     */
    containerStyle?: StyleProp<ViewStyle>
}

export type InputRef = {
    /**
     * Focus the input programmatically.
     */
    focus: () => void
    /**
     * Remove focus from the input programmatically.
     */
    blur: () => void
    /**
     * Clear the input content programmatically.
     */
    clear: () => void
    /**
     * Check if the input is focused.
     */
    isFocused: () => boolean
    /**
     * Get the current value (text) of the input.
     */
    getValue: () => string
    /**
     * Set the current value (text) of the input programmatically.
     * For controlled usage, this will trigger onChangeText (if provided).
     * For uncontrolled usage, this updates internal state.
     */
    setValue: (text: string) => void
    /**
     * Obtain the underlying native TextInput ref.
     */
    getNativeRef: () => TextInput | null
}

/**
 * Generic, reusable Input component.
 * - Supports controlled and uncontrolled usage
 * - Exposes imperative API via forwardRef
 * - No icons or extra content: plain input ready for composition
 */
const Input = forwardRef<InputRef, InputProps>(
    (
        { value: controlledValue, defaultValue, onChangeText, containerStyle, style, ...rest },
        ref,
    ) => {
        const nativeRef = useRef<TextInput>(null)
        const isControlled = controlledValue !== undefined
        const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? "")

        const currentValue = isControlled ? controlledValue! : uncontrolledValue

        const handleChangeText = useCallback(
            (text: string) => {
                if (!isControlled) setUncontrolledValue(text)
                onChangeText?.(text)
            },
            [isControlled, onChangeText],
        )

        useImperativeHandle(
            ref,
            (): InputRef => ({
                focus: () => nativeRef.current?.focus(),
                blur: () => nativeRef.current?.blur(),
                clear: () => {
                    if (!isControlled) setUncontrolledValue("")
                    nativeRef.current?.clear()
                    onChangeText?.("")
                },
                isFocused: () => Boolean(nativeRef.current?.isFocused()),
                getValue: () => currentValue ?? "",
                setValue: (text: string) => {
                    if (!isControlled) {
                        setUncontrolledValue(text)
                    } else {
                        onChangeText?.(text)
                    }
                },
                getNativeRef: () => nativeRef.current ?? null,
            }),
            [currentValue, isControlled, onChangeText],
        )

        const wrapperStyle = useMemo(
            () => [styles.container, containerStyle] as StyleProp<ViewStyle>,
            [containerStyle],
        )

        return (
            <View style={wrapperStyle}>
                <TextInput
                    ref={nativeRef}
                    value={currentValue}
                    onChangeText={handleChangeText}
                    style={[styles.input, style]}
                    {...rest}
                />
            </View>
        )
    },
)

Input.displayName = "Input"

/**
 * Simple hook to manage input state in a controlled way.
 * Usage:
 *   const { value, onChangeText, setValue } = useInput("");
 *   <Input value={value} onChangeText={onChangeText} />
 */
export function useInput(initial = "") {
    const [value, setValue] = useState(initial)
    const onChangeText = useCallback((text: string) => setValue(text), [])
    return { value, setValue, onChangeText }
}

export default Input

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        fontSize: 16,
        color: "#ffffff",
        backgroundColor: "rgba(255,255,255,0.06)",
    },
})
