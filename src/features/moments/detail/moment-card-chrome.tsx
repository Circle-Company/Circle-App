import React from "react"
import { StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Moment } from "@/components/moment"
import { UserShow } from "@/components/user_show"
import type { dataProps } from "@/components/moment/context/types"

const CARD = sizes.moment.standart

/**
 * Cabeçalho do card em tela cheia: autor à esquerda, controle de áudio à direita.
 *
 * Idêntico nas duas telas de detalhe até o último prop — inclusive `disableAction` e as
 * dimensões do avatar. Era o tipo de bloco que se copia junto com a tela e depois só uma
 * das cópias recebe o ajuste.
 */
export function MomentAuthorHeader({ user }: { user: dataProps["user"] }) {
    return (
        <Moment.Root.Top>
            <Moment.Root.TopLeft>
                <UserShow.Root data={user}>
                    <UserShow.ProfilePicture
                        disableAction={true}
                        displayOnMoment={true}
                        pictureDimensions={{ width: 30, height: 30 }}
                    />
                    <UserShow.Username pressable={false} fontFamily={fonts.family["Bold-Italic"]} />
                </UserShow.Root>
            </Moment.Root.TopLeft>
            <Moment.Root.TopRight>
                <Moment.AudioControl size={36} />
            </Moment.Root.TopRight>
        </Moment.Root.Top>
    )
}

/**
 * Degradê que escurece a base do card para o texto sobreposto ter contraste.
 *
 * `pointerEvents="none"` não é opcional: o degradê cobre a faixa onde ficam os controles
 * inferiores, e sem isso ele engole o toque. Uma das duas cópias não tinha o prop.
 */
export function MomentBottomGradient() {
    return (
        <LinearGradient
            pointerEvents="none"
            colors={["rgba(0, 0, 0, 0.00)", "rgba(0, 0, 0, 0.4)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
        />
    )
}

const styles = StyleSheet.create({
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: CARD.width,
        height: CARD.height * 0.1,
        zIndex: 0,
    },
})
