import React from "react"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentDateProps } from "../moment-types"
import MomentContext from "../context"
import MoreIcon from '../../../assets/icons/svgs/ellipsis.svg'
import ButtonStandart from "../../buttons/button-standart"
import BottomSheetContext from "../../../contexts/bottomSheet"
import { Text } from "../../Themed"
import Options from "./moment-options"
import BottomTabsContext from "../../../contexts/bottomTabs"
import MemoryContext from "../../../contexts/memory"

export default function more ({
    color = String(ColorTheme().text),
    backgroundColor= String(ColorTheme().backgroundDisabled)
}: MomentDateProps) {
    const { memory } = React.useContext(MemoryContext)
    const { currentTab } = React.useContext(BottomTabsContext)
    const { expand, collapse} = React.useContext(BottomSheetContext)
    const { momentOptions, momentData} = React.useContext(MomentContext)
    function handlePress() {
        expand({children: <Options momentData={momentData} memory={memory} momentOptions={momentOptions} currentTab={currentTab}/>, snapPoints: ["16%"]})
    }

    if(memory.isAccountScreen) {
        return (
            <ButtonStandart action={handlePress} backgroundColor={backgroundColor} margins={false}>
                <MoreIcon fill={color} width={20} height={20}/> 
            </ButtonStandart>
        )
    } else return null
}