import BottomSheetContext from "../../../contexts/bottomSheet"
import ButtonStandart from "../../buttons/button-standart"
import ColorTheme from "../../../layout/constants/colors"
import MomentContext from "../context"
import { MomentDateProps } from "../moment-types"
import MoreIcon from "../../../assets/icons/svgs/ellipsis.svg"
import React from "react"
import { RenderReportModal } from "@/features/list-moments/components/feed/render-report-modal-feed"

export default function ReportButton({
    color = String(ColorTheme().text),
}: MomentDateProps) {
    const { expand } = React.useContext(BottomSheetContext)
    const { momentOptions, momentData, momentUserActions} = React.useContext(MomentContext)
    function handlePress() {
        expand({
            children: (
                <RenderReportModal moment={{...momentData, is_liked: momentUserActions.like}} />
            ),
            enablePanDownToClose: true,
            enableHandlePanningGesture: true,
            enableContentPanningGesture: true,
            snapPoints: ["85%","99%"],
            customStyles: {
                modal: {
                    marginHorizontal: 0,
                    width: "100%",
                }
            }
        })
    }
    if (momentOptions.enableReport) {
        return (
            <ButtonStandart action={handlePress} margins={false} style={{
                padding: 0, 
                paddingHorizontal: 8, 
                paddingVertical: 0, 
                marginHorizontal: 0, 
                marginVertical: 0, 
                backgroundColor: "transparent"
            }}>
                <MoreIcon fill={color} width={20} height={20} />
            </ButtonStandart>
        )
    } else return null
}
