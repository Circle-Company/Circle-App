import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"
import { MomentBottomRootProps } from "../../../moment-types"

export default function bottom_root({ children }: MomentBottomRootProps) {
    // Fixado de forma absoluta no rodapé do MomentContainer. Em fluxo normal,
    // o Bottom dependia do Center (flex: 1) empurrá-lo pra baixo; no feed (item
    // dentro da FlatList horizontal escalada) essa conta de flex falhava e o
    // Bottom transbordava pra fora do container. Absoluto ele fica sempre preso
    // à base, dentro do overflow: hidden — não tem como escapar.
    const container: any = {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1sm"] * 1.4,
    }

    return <View style={container}>{children}</View>
}
