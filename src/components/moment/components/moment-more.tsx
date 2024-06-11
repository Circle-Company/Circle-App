import React from "react"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import MomentContext from "../context"
import MoreIcon from '../../../assets/icons/svgs/ellipsis.svg'
import ButtonStandart from "../../buttons/button-standart"
import BottomSheetContext from "../../../contexts/bottomSheet"
import { Text } from "../../Themed"
export default function more ({
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: MomentDateProps) {
    const { expand, collapse} = React.useContext(BottomSheetContext)
    const { momentOptions } = React.useContext(MomentContext)
    function handlePress() {
        expand({children: <Text>oiee</Text>, snapPoints: ["20%"]})
    }
    
    return (
        <ButtonStandart action={handlePress} backgroundColor={backgroundColor} margins={false}>
            <MoreIcon fill={color} width={20} height={20}/> 
        </ButtonStandart>
    )
}