import React from "react"

import ButtonStandart from "@/components/buttons/button-standart"
import MessageSymbol from "../../message.symbol"

/**
 * Botão de reprodução da nota de voz.
 *
 * Usa o `ButtonStandart` em vez de um `Pressable` próprio: a animação de mola ao
 * pressionar é a mesma do resto do app, e copiar as constantes de bounciness e
 * velocidade para cá significaria que um ajuste no padrão deixaria este botão
 * para trás.
 *
 * O ícone é derivado de `isPlaying`, não de um estado interno: quem toca é a
 * tela (só uma nota toca por vez na conversa), e um estado próprio aqui ficaria
 * dessincronizado assim que outra mensagem começasse.
 */
function AudioPlayButton({
    size,
    color,
    backgroundColor,
    isPlaying = false,
    onPress,
}: {
    size: number
    color: string
    backgroundColor: string
    isPlaying?: boolean
    onPress?: () => void
}) {
    return (
        <ButtonStandart
            square
            height={size}
            borderRadius={size / 2}
            backgroundColor={backgroundColor}
            margins={false}
            action={onPress}
            // O padrão reserva folga lateral para rótulo de texto; aqui dentro só
            // há um ícone centralizado, e a folga empurraria o círculo.
            style={{ paddingHorizontal: 0 }}
        >
            <MessageSymbol
                ios={isPlaying ? "pause.fill" : "play.fill"}
                material={isPlaying ? "pause" : "play_arrow"}
                size={size * 0.45}
                color={color}
            />
        </ButtonStandart>
    )
}

export default React.memo(AudioPlayButton)
