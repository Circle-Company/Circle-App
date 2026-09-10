import React from "react"
import { Text, View } from "react-native"
import { Image } from "expo-image"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"

type ChatAvatarProps = {
    size: number
    profilePicture?: string
    /** Só para o fallback: a inicial exibida quando não há foto. */
    name?: string
    online?: boolean
}

/**
 * Avatar circular do chat.
 *
 * Não reaproveita `UserShowProfilePicture` de propósito: aquele componente é acoplado ao
 * `UserShowContext` e navega por conta própria no toque, o que dentro de uma célula de grid
 * roubaria o toque que precisa abrir a conversa.
 */
export function ChatAvatar({ size, profilePicture, name, online }: ChatAvatarProps) {
    const initial = (name || "").trim().charAt(0).toUpperCase()
    // O indicador segue a proporção do avatar para funcionar igual no grid (grande) e num
    // header de conversa (pequeno).
    const dotSize = Math.max(10, Math.round(size * 0.22))

    return (
        <View style={{ width: size, height: size }}>
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: colors.gray.grey_07,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {profilePicture ? (
                    <Image
                        source={{ uri: profilePicture }}
                        style={{ width: size, height: size }}
                        contentFit="cover"
                        transition={120}
                    />
                ) : (
                    <Text
                        style={{
                            fontFamily: fonts.family.Semibold,
                            fontSize: Math.round(size * 0.38),
                            color: colors.gray.grey_04,
                        }}
                    >
                        {initial}
                    </Text>
                )}
            </View>

            {online ? (
                <View
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: colors.green.green_05,
                        // A borda é da cor do fundo, não uma cor própria: é o que separa o
                        // ponto do avatar sem desenhar um anel visível.
                        borderWidth: Math.max(2, Math.round(dotSize * 0.18)),
                        borderColor: colors.gray.black,
                    }}
                />
            ) : null}
        </View>
    )
}
