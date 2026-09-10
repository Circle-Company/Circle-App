import React from "react"
import { Text } from "react-native"

/**
 * Stub web do `expo-symbols`.
 *
 * O build web do pacote importa `PlatformColor`, que o `react-native-web` não
 * exporta — sem este stub o bundle do Storybook nem chega a montar. Fora isso,
 * os símbolos reais são SF Symbols (fonte do sistema) e Material Symbols (fonte
 * remota), nenhum dos dois disponível aqui.
 *
 * O stub desenha um glifo unicode aproximado, só para a story mostrar que há um
 * ícone naquele ponto e com aquele tamanho. A aparência real se confere no
 * dispositivo, com `npm run storybook:ios`.
 */
const GLYPHS: Record<string, string> = {
    play_arrow: "▶",
    pause: "❚❚",
    check: "✓",
    done_all: "✓✓",
    schedule: "◌",
    error: "!",
    forward: "↱",
    reply: "↰",
}

export function SymbolView({
    name,
    size = 24,
    tintColor,
}: {
    name: string | { ios?: string; android?: string; web?: string }
    size?: number
    tintColor?: string
    [key: string]: unknown
}) {
    const key = typeof name === "string" ? name : (name.web ?? name.android ?? "")
    return (
        <Text style={{ fontSize: size, lineHeight: size * 1.2, color: tintColor }}>
            {GLYPHS[key] ?? "□"}
        </Text>
    )
}

export type SFSymbol = string
export type AndroidSymbol = string
