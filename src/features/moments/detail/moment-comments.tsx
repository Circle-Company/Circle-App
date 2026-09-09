import React from "react"
import { StyleSheet, View } from "react-native"

import sizes from "@/constants/sizes"
import ZeroComments from "@/components/comment/components/comments-zero_comments"
import RenderCommentFeed from "@/features/moments/feed/render-comment-feed"
import type { dataProps } from "@/components/moment/context/types"

/**
 * Bloco de comentários abaixo do card, nas telas de detalhe.
 *
 * O que decide entre a lista e o estado vazio é o **comentário em destaque**: quando não há
 * nenhum, o backend **omite a chave** `topComment` do JSON — não manda `null` (§3 do
 * contrato). Por isso o teste é de veracidade, e não `=== null`, que nunca dispararia.
 */
type MomentCommentsProps = {
    moment: dataProps
    /** Tela da própria conta: o estado vazio some com o convite a comentar. */
    isAccount?: boolean
}

export function MomentComments({ moment, isAccount = false }: MomentCommentsProps) {
    if (moment.topComment) return <RenderCommentFeed moment={moment} focused={true} />

    return (
        <View style={styles.zeroComments}>
            <ZeroComments isAccount={isAccount} moment={moment} />
        </View>
    )
}

const styles = StyleSheet.create({
    zeroComments: {
        alignSelf: "center",
        marginTop: sizes.margins["2sm"],
    },
})
