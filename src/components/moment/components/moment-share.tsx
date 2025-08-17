import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import ShareIcon from "../../../assets/icons/svgs/arrow_shape_right.svg"
import ButtonStandart from "../../buttons/button-standart"
export default function share({
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled),
}: MomentDateProps) {
    return (
        <ButtonStandart action={() => {}} backgroundColor={backgroundColor} margins={false}>
            <View style={{ bottom: 1 }}>
                <ShareIcon fill={color} width={20} height={20} />
            </View>
        </ButtonStandart>
    )
}
