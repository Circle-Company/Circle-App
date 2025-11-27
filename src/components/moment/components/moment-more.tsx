import BottomSheetContext from "../../../contexts/bottomSheet"
import ButtonStandart from "../../buttons/button-standart"
import ColorTheme from "../../../constants/colors"
import MomentContext from "../context"
import { MomentDateProps } from "../moment-types"
import MoreIcon from "@/assets/icons/svgs/ellipsis.svg"
import React from "react"

export default function More({
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled),
}: MomentDateProps) {
    const { expand } = React.useContext(BottomSheetContext)
    const { momentOptions, momentData } = React.useContext(MomentContext)

    if (momentOptions.enableAnalyticsView) {
        return (
            <ButtonStandart backgroundColor={backgroundColor} margins={false}>
                <MoreIcon fill={color} width={20} height={20} />
            </ButtonStandart>
        )
    } else return null
}
