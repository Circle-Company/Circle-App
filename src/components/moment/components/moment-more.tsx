import React from "react"
import MoreIcon from "../../../assets/icons/svgs/ellipsis.svg"
import BottomSheetContext from "../../../contexts/bottomSheet"
import MemoryContext from "../../../contexts/memory"
import ColorTheme from "../../../layout/constants/colors"
import ButtonStandart from "../../buttons/button-standart"
import MomentContext from "../context"
import { MomentDateProps } from "../moment-types"
import Options from "./moment-options"

export default function more({
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled),
}: MomentDateProps) {
    const { memory } = React.useContext(MemoryContext)
    const { expand } = React.useContext(BottomSheetContext)
    const { momentOptions, momentData } = React.useContext(MomentContext)
    function handlePress() {
        expand({
            children: (
                <Options momentOptions={momentOptions} momentData={momentData} memory={memory} />
            ),
            snapPoints: ["39%"],
        })
    }
    if (momentOptions.enableAnalyticsView) {
        return (
            <ButtonStandart action={handlePress} backgroundColor={backgroundColor} margins={false}>
                <MoreIcon fill={color} width={20} height={20} />
            </ButtonStandart>
        )
    } else return null
}
