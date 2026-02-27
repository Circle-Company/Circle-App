import MomentContext from "@/components/moment/context"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui"
import React from "react"

export function ProfileDropDownMenuIOS({ children }: { children?: React.ReactNode }) {
    const { session } = React.useContext(PersistedContext)
    const { options, data } = React.useContext(MomentContext)
    const { t } = React.useContext(LanguageContext)

    async function handlePressHide() {
        const nextIsHidden = !options.isHidden
        options.setIsHidden(nextIsHidden)
        if (nextIsHidden) session.account.addHiddenMoment(data.id)
        else session.account.removeHiddenMoment(data.id)
    }

    async function handlePressReport() {
        options.setShowReportModal(true)
    }

    return (
        <Host>
            <ContextMenu activationMethod="longPress" frame={{ alignment: "center" }}>
                <ContextMenu.Items>
                    <Button
                        systemImage={options.isHidden ? "eye" : "eye.slash"}
                        role="default"
                        onPress={handlePressHide}
                    >
                        {t(options.isHidden ? "Show Moment" : "Hide Moment")}
                    </Button>
                    <Button
                        systemImage="exclamationmark.shield"
                        role="destructive"
                        onPress={handlePressReport}
                    >
                        {t("Report")}
                    </Button>
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
