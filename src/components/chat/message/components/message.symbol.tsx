import React from "react"
import { SymbolView } from "expo-symbols"
import type { AndroidSymbol, SFSymbol } from "expo-symbols"

export type MessageSymbolProps = {
    /** Nome no SF Symbols (iOS). */
    ios: SFSymbol
    /** Nome equivalente no Material Symbols (Android e web). */
    material: AndroidSymbol
    size: number
    color: string
}

/**
 * Ícone da mensagem.
 *
 * Envolve o `SymbolView` por dois motivos:
 *
 * 1. O nome do símbolo é diferente em cada plataforma (SF Symbols no iOS,
 *    Material Symbols no resto), e repetir esse par em cada uso convidaria a
 *    esquecer um dos lados — e o esquecido só apareceria no aparelho.
 * 2. Símbolo é ícone, não texto: `size` e `tintColor` são as duas coisas que
 *    todo uso precisa, e o resto da API não interessa aqui.
 */
function MessageSymbol({ ios, material, size, color }: MessageSymbolProps) {
    return (
        <SymbolView
            name={{ ios, android: material, web: material }}
            size={size}
            tintColor={color}
            resizeMode="scaleAspectFit"
        />
    )
}

export default React.memo(MessageSymbol)
