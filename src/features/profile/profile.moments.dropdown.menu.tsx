import MomentContext from "@/components/moment/context"
import LanguageContext from "@/contexts/language"
import { useToast } from "@/contexts/Toast"
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui"
import React from "react"
import { Alert } from "react-native"

export function ProfileDropDownMenuIOS({
    children,
    onHide,
    onReport,
}: {
    children?: React.ReactNode
    onHide?: () => void
    onReport?: () => void
}) {
    const momentCtx = React.useContext(MomentContext) as any
    const options = momentCtx?.options
    const { t } = React.useContext(LanguageContext)
    const toast = useToast()

    async function handlePressHide() {
        if (!options) {
            onHide?.()
            return
        }
        if (!options.hide) {
            options.setHide?.(true)
            onHide?.()
            toast.success(t("Moment hidden"))
        } else {
            onHide?.()
        }
    }

    return (
        <Host>
            <ContextMenu activationMethod="longPress" frame={{ alignment: "center" }}>
                <ContextMenu.Items>
                    <Button systemImage="eye.slash" role="default" onPress={handlePressHide}>
                        {t("Hide Moment")}
                    </Button>
                    <Button
                        systemImage="exclamationmark.shield"
                        role="destructive"
                        onPress={() => {}}
                    >
                        {t("Report")}
                    </Button>
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
