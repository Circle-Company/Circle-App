import React from "react"
import { Text, View } from "react-native"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"

type ChatSpeechBubbleProps = {
    text: string
    /**
     * Quantas mensagens **além** da exibida estão sem ler. Vira um `+X` em negrito dentro do
     * balão; zero ou menos não mostra nada.
     */
    extraCount?: number
    maxWidth: number
}

const TAIL_SIZE = 7

/** Teto de exibição: acima disso a diferença entre 99 e 340 não muda nada para quem lê, e o
 * número passa a competir com a mensagem pelo espaço do balão. */
const MAX_EXTRA = 99

/**
 * O balão de fala que sobrepõe o avatar no grid.
 *
 * **É ocasional:** só aparece quando aquela pessoa falou por último e ainda não foi
 * respondida. Quem decide isso é a célula (`chat.conversation.cell.tsx`), não este
 * componente — aqui só se desenha.
 *
 * Por ser overlay, ele **não ocupa espaço no fluxo**: a célula o posiciona de forma absoluta
 * sobre o avatar. Isso é o que mantém todas as células da mesma altura mesmo com só algumas
 * tendo balão — e altura desigual numa `FlatList` com `numColumns` desalinha a grade inteira.
 */
export function ChatSpeechBubble({ text, extraCount = 0, maxWidth }: ChatSpeechBubbleProps) {
    const extra = Math.min(extraCount, MAX_EXTRA)

    return (
        <View style={{ alignItems: "center" }}>
            <View
                style={{
                    maxWidth,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: colors.gray.grey_07,
                    // Sobre a foto, o balão precisa se destacar do que estiver atrás — daí a
                    // sombra, que não existiria se ele vivesse no fundo preto da tela.
                    shadowColor: colors.gray.black,
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                }}
            >
                <Text
                    // Duas linhas é o teto: o balão cobre o avatar, e passar disso esconde o
                    // rosto que a célula existe para mostrar.
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={{
                        fontFamily: fonts.family.Regular,
                        fontSize: fonts.size.caption1,
                        lineHeight: fonts.size.caption1 * 1.25,
                        textAlign: "center",
                        color: colors.gray.grey_02,
                    }}
                >
                    {text}
                </Text>

                {/*
                 * O `+X` fica **fora** do `Text` da mensagem, e não concatenado nele.
                 *
                 * Concatenar seria mais simples e estaria errado: com o corte em duas linhas,
                 * a primeira coisa a ser engolida pelas reticências numa mensagem longa seria
                 * justamente o contador — o dado mais importante do balão desaparecendo
                 * exatamente quando há mais a ler.
                 */}
                {extra > 0 ? (
                    <Text
                        style={{
                            marginTop: 1,
                            fontFamily: fonts.family.Bold,
                            fontSize: fonts.size.caption1,
                            lineHeight: fonts.size.caption1 * 1.25,
                            textAlign: "center",
                            color: colors.gray.white,
                        }}
                    >
                        {`+${extra}`}
                    </Text>
                ) : null}
            </View>

            {/*
             * O rabinho é um triângulo feito com bordas — sem SVG, sem asset. As laterais
             * transparentes com a borda de cima colorida apontam para baixo, na direção do
             * avatar que está atrás.
             */}
            <View
                style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: TAIL_SIZE,
                    borderRightWidth: TAIL_SIZE,
                    borderTopWidth: TAIL_SIZE,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: colors.gray.grey_07,
                }}
            />
        </View>
    )
}
