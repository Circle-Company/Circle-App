import LanguageContext from "@/contexts/language"
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui"
import { frame } from "@expo/ui/swift-ui/modifiers"
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
        <Host colorScheme="dark">
            {/* No SDK 56 as props de layout do expo-ui viraram `modifiers`, e `activationMethod`
                deixou de existir: o long press já é o gatilho padrão do `ContextMenu`. */}
            <ContextMenu modifiers={[frame({ alignment: "center" })]}>
                <ContextMenu.Items>
                    <Button
                        systemImage="trash"
                        role="destructive"
                        label={t("Delete")}
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
                    />
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
