import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/Preferences/language"
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui"
import React from "react"
import { Alert } from "react-native"

export function DropDownMenuIOS({
    children,
    onDelete,
}: {
    children?: React.ReactNode
    onDelete?: () => void
}) {
    const { t } = React.useContext(LanguageContext)

    return (
        <Host>
            <ContextMenu activationMethod="longPress" frame={{ alignment: "center" }}>
                <ContextMenu.Items>
                    <Button
                        systemImage="trash"
                        role="destructive"
                        onPress={() =>
                            Alert.alert(t("Delete Moment"), t("You will permanently remove it."), [
                                { text: t("Cancel"), style: "cancel" },
                                {
                                    text: t("Delete"),
                                    style: "destructive",
                                    onPress: () => onDelete?.(),
                                },
                            ])
                        }
                    >
                        {t("Delete")}
                    </Button>
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
