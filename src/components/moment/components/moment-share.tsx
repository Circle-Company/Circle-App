import React from "react"
import { View, Text, Pressable } from "react-native"

import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import { timeDifferenceConverter } from '../../../algorithms/dateConversor'
import sizes from "../../../layout/constants/sizes"
import ShareIcon from '../../../assets/icons/svgs/arrow_shape_right.svg'
import ButtonStandart from "../../buttons/button-standart"
export default function share ({
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: MomentDateProps) {
    const { moment } = useMomentContext()
    
    return (
        <ButtonStandart action={() => {}} backgroundColor={backgroundColor} margins={false}>
            <View style={{bottom: 1}}>
                <ShareIcon fill={color} width={20} height={20}/>
            </View>
             
        </ButtonStandart>
           

    )
}