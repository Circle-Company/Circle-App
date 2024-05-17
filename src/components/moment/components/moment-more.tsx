import React from "react"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import MomentContext from "../context"
import MoreIcon from '../../../assets/icons/svgs/ellipsis.svg'
import ButtonStandart from "../../buttons/button-standart"

export default function more ({
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: MomentDateProps) {
    const { momentData } = React.useContext(MomentContext)
    
    return (
        <ButtonStandart action={() => {}} backgroundColor={backgroundColor} margins={false}>
            <MoreIcon fill={color} width={20} height={20}/>  
        </ButtonStandart>
    )
}