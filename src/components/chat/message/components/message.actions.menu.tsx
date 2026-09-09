import React from "react"
import type { SFSymbols7_0 } from "sf-symbols-typescript"
import { Alert, Platform, Pressable } from "react-native"
import { Button, ContextMenu, Host as SwiftUIHost } from "@expo/ui/swift-ui"
import { frame } from "@expo/ui/swift-ui/modifiers"
import { DropdownMenu, DropdownMenuItem, Host as ComposeHost } from "@expo/ui/jetpack-compose"

import ColorTheme from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import { MessageActionType, MessageActionsMenuProps } from "../message.types"

type ActionItem = {
    action: MessageActionType
    label: string
    /** SF Symbol do item no menu do iOS. */
    systemImage: SFSymbols7_0
    enabled: boolean
    destructive?: boolean
}

/**
 * Menu de ações da mensagem, com renderização **nativa** nos dois sistemas:
 * `ContextMenu` (SwiftUI) no iOS e `DropdownMenu` (Jetpack Compose) no Android.
 *
 * O componente envolve a bolha e vira o gatilho do long press.
 *
 * Montar a lista é responsabilidade daqui, e não de quem usa o `Message`: o que
 * pode ser feito com a mensagem já está decidido nas `options` (posse, tipo de
 * conteúdo, apagada). Deixar isso na tela faria cada tela reconstruir — e
 * eventualmente divergir sobre — a mesma regra de permissão.
 */
export default function ActionsMenu({ children, onAction }: MessageActionsMenuProps) {
    const { data, options } = React.useContext(MessageContext)
    const { t } = React.useContext(LanguageContext)
    const colors = ColorTheme()

    const items: ActionItem[] = (
        [
            {
                action: "REPLY",
                label: t("Reply"),
                systemImage: "arrowshape.turn.up.left",
                enabled: options.enableReply,
            },
            {
                action: "FORWARD",
                label: t("Forward"),
                systemImage: "arrowshape.turn.up.right",
                enabled: options.enableForward,
            },
            {
                action: "COPY",
                label: t("Copy"),
                systemImage: "doc.on.doc",
                enabled: options.enableCopy,
            },
            {
                action: "EDIT",
                label: t("Edit"),
                systemImage: "pencil",
                enabled: options.enableEdit,
            },
            {
                action: data.pinned ? "UNPIN" : "PIN",
                label: data.pinned ? t("Unpin") : t("Pin"),
                systemImage: "pin",
                enabled: options.enablePin,
            },
            {
                action: "DELETE",
                label: t("Delete"),
                systemImage: "trash",
                enabled: options.enableDelete,
                destructive: true,
            },
        ] as ActionItem[]
    ).filter((item) => item.enabled)

    // Apagar é irreversível: confirma antes de repassar, como no menu do moment.
    const handlePress = React.useCallback(
        (item: ActionItem) => {
            if (item.action !== "DELETE") {
                onAction?.(item.action)
                return
            }
            Alert.alert(t("Delete Message"), t("You will permanently remove it."), [
                { text: t("Cancel"), style: "cancel" },
                { text: t("Delete"), style: "destructive", onPress: () => onAction?.("DELETE") },
            ])
        },
        [onAction, t],
    )

    // Mensagem sem nenhuma ação disponível (apagada, por exemplo): a bolha passa
    // direto, sem gatilho de menu.
    if (!items.length) return <>{children}</>

    if (Platform.OS === "android") {
        return (
            <AndroidMenu items={items} onPressItem={handlePress} destructiveColor={colors.error}>
                {children}
            </AndroidMenu>
        )
    }

    return (
        <SwiftUIHost matchContents>
            {/* No SDK 56 as props de layout do expo-ui viraram `modifiers`, e
                `activationMethod` deixou de existir: o long press já é o gatilho
                padrão do `ContextMenu`. */}
            <ContextMenu modifiers={[frame({ alignment: "center" })]}>
                <ContextMenu.Items>
                    {items.map((item) => (
                        <Button
                            key={item.action}
                            systemImage={item.systemImage}
                            role={item.destructive ? "destructive" : undefined}
                            label={item.label}
                            onPress={() => handlePress(item)}
                        />
                    ))}
                </ContextMenu.Items>

                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </SwiftUIHost>
    )
}

/**
 * Menu do Android.
 *
 * O `DropdownMenu` é controlado à mão (`expanded` + `onDismissRequest`) porque o
 * gatilho automático do componente abre no **toque**, e numa lista de conversa o
 * toque pertence à mensagem — abrir ações aí atrapalharia a leitura. Com o
 * controle explícito o gatilho vira o long press, igual ao iOS.
 */
function AndroidMenu({
    children,
    items,
    onPressItem,
    destructiveColor,
}: {
    children: React.ReactNode
    items: ActionItem[]
    onPressItem: (item: ActionItem) => void
    destructiveColor: string
}) {
    const [expanded, setExpanded] = React.useState(false)

    return (
        <ComposeHost matchContents>
            <DropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
                <DropdownMenu.Items>
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.action}
                            elementColors={
                                item.destructive ? { textColor: destructiveColor } : undefined
                            }
                            onClick={() => {
                                setExpanded(false)
                                onPressItem(item)
                            }}
                        >
                            <DropdownMenuItem.Text>{item.label}</DropdownMenuItem.Text>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenu.Items>

                <DropdownMenu.Trigger>
                    <Pressable onLongPress={() => setExpanded(true)} delayLongPress={250}>
                        {children}
                    </Pressable>
                </DropdownMenu.Trigger>
            </DropdownMenu>
        </ComposeHost>
    )
}
