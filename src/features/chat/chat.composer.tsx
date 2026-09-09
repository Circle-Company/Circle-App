import React from "react"
import { Pressable, View } from "react-native"
import { Host, TextInput, useNativeState } from "@expo/ui"
import { SymbolView } from "expo-symbols"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

/**
 * O pacote declara `ObservableState` duas vezes, e a que o import de `@expo/ui` resolve
 * (`build/universal/State.d.ts`) expõe só `value`. A outra
 * (`build/State/useNativeState.d.ts`) declara também `get()`/`set()`, que a própria
 * documentação descreve como a alternativa compatível com o React Compiler. Os métodos
 * existem no runtime — o que falta é a declaração no caminho universal.
 *
 * Sem eles, escrever `text.value` da thread JS dispara `react-hooks/immutability`, que é
 * exatamente a regra que esses métodos existem para satisfazer. Este tipo cobre a lacuna sem
 * mudar comportamento nenhum.
 */
type NativeTextState = {
    value: string
    get(): string
    set(next: string): void
}

type ChatComposerProps = {
    placeholder: string
    onSend: (text: string) => void
}

/**
 * O campo de escrita da conversa.
 *
 * **Usa o `TextInput` do `@expo/ui`, não o do React Native**: ele é SwiftUI de verdade no iOS
 * e Jetpack Compose no Android, e o `value` é um `ObservableState` (`useNativeState`) em vez
 * de uma string. A diferença prática é que digitar **não passa pelo React** — o
 * `onChangeText` roda como worklet na thread de UI e escreve direto no estado nativo, sem
 * ciclo de render. É o que elimina o engasgo de digitação que um `TextInput` controlado do RN
 * tem em lista longa.
 *
 * Consequência disso no desenho deste componente: o botão de enviar **não** reage ao texto
 * ficar vazio ou não. Para isso ele precisaria de um estado React, que voltaria a renderizar
 * a cada tecla — exatamente o que se está evitando. Então o botão está sempre visível e a
 * validação acontece no toque, lendo `text.get()`.
 *
 * O `@expo/ui` já é usado no app (`profile.dropdown.menu.tsx`, `profile.report.modal.tsx`) e
 * o pod está no build, então isto não acrescenta dependência nativa nova.
 */
export function ChatComposer({ placeholder, onSend }: ChatComposerProps) {
    const insets = useSafeAreaInsets()
    const text = useNativeState("") as NativeTextState

    const handleChangeText = React.useCallback(
        (value: string) => {
            "worklet"
            // Atribuição direta, e não `set()`: dentro de um worklet a escrita em `value` é
            // síncrona na thread de UI, que é o ponto do componente inteiro. É a forma que a
            // documentação do `@expo/ui` usa aqui.
            // eslint-disable-next-line react-hooks/immutability
            text.value = value
        },
        [text],
    )

    const handleSend = React.useCallback(() => {
        const value = text.get().trim()
        if (!value) return
        onSend(value)
        // Escrita a partir da thread JS é agendada para a de UI, não imediata. Aqui isso não
        // importa: o campo esvaziar um frame depois do envio é imperceptível.
        text.set("")
    }, [onSend, text])

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 8,
                paddingHorizontal: sizes.paddings["2sm"],
                paddingTop: 8,
                // A barra encosta na borda inferior quando o teclado está fechado; com ele
                // aberto o inset já está coberto pelo teclado e some.
                paddingBottom: 8 + insets.bottom,
                backgroundColor: colors.gray.black,
                borderTopWidth: 0.5,
                borderTopColor: colors.gray.grey_08,
            }}
        >
            <View
                style={{
                    flex: 1,
                    minHeight: 38,
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    borderRadius: 19,
                    backgroundColor: colors.gray.grey_08,
                }}
            >
                <Host matchContents>
                    <TextInput
                        value={text}
                        onChangeText={handleChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={colors.gray.grey_04}
                        multiline
                        // Teto de linhas: passar disso a barra cobriria a conversa que ela
                        // serve para responder.
                        numberOfLines={5}
                        returnKeyType="default"
                        textStyle={{
                            color: colors.gray.white,
                            fontSize: fonts.size.callout,
                        }}
                    />
                </Host>
            </View>

            <Pressable
                onPress={handleSend}
                hitSlop={8}
                accessibilityRole="button"
                style={({ pressed }) => ({
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.blue.blue_05,
                    opacity: pressed ? 0.7 : 1,
                })}
            >
                <SymbolView name="arrow.up" size={18} tintColor={colors.gray.white} />
            </Pressable>
        </View>
    )
}
