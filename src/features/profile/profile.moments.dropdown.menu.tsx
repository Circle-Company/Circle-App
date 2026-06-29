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
                        label={t(options.isHidden ? "Show Moment" : "Hide Moment")}
                        onPress={handlePressHide}
                    />
                    <Button
                        systemImage="exclamationmark.shield"
                        role="destructive"
                        label={t("Report")}
                        onPress={handlePressReport}
                    />
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
