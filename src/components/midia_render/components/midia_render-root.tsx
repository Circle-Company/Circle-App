import React from "react"
import { View } from "react-native"
import MidiaRenderContext from "../midia_render-context"
import { MidiaRenderMainRootProps } from "../midia_render-types"

export default function root({ children, data, content_sizes }: MidiaRenderMainRootProps) {
    const container: any = {
        width: content_sizes.width,
        height: content_sizes.height,
        zIndex: 0,
    }
    return (
        <MidiaRenderContext.Provider value={{ midia: data, content_sizes: content_sizes }}>
            {/*
                Aqui existiam dois gradientes presos a `video.overlayShadow?.hideTop/hideBottom`.
                Esse campo não existe mais no `MomentVideoState` — virou `shadow.top/bottom`, com
                o sentido invertido — então a condição lia `undefined == false`, que é `false`, e
                **nenhum dos dois renderizava** desde a renomeação.

                Não foram religados de propósito: quem quer o escurecimento já o desenha por
                conta própria (`MomentBottomGradient` nas telas de detalhe, o `LinearGradient` do
                `render-moment-feed`). Reativá-los aqui somaria um segundo gradiente por cima do
                que já está na tela.
            */}
            <View style={container}>{children}</View>
        </MidiaRenderContext.Provider>
    )
}
