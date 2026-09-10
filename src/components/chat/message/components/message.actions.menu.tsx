import React from "react"
import type { SFSymbols7_0 } from "sf-symbols-typescript"
import {
    Alert,
    Platform,
    Pressable,
    View,
    type LayoutChangeEvent,
    type ViewStyle,
} from "react-native"
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
 * Menu de ações da mensagem, nativo nos dois sistemas: `ActionSheetIOS` no iOS e
 * `DropdownMenu` (Jetpack Compose) no Android. O gatilho é o long press sobre a
 * bolha.
 *
 * **O relevo do long press vem do `ContextMenu`**, igual ao card do feed
 * (`ProfileDropDownMenuIOS`). A diferença é que lá o card tem tamanho fixo, e a
 * bolha não tem: ela depende do texto.
 *
 * Usar `matchContents` para resolver isso criava um círculo — o host media zero,
 * a bolha calculava a própria largura sobre esse zero, e o host continuava zero.
 * O sintoma era a conversa sem bolha nenhuma, só as reações (que são irmãs do
 * host) aparecendo. Por isso aqui a bolha é **medida em RN primeiro** e só então
 * hospedada, com o tamanho já conhecido — que é a condição em que o menu do feed
 * funciona.
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

    /**
     * Tamanho da bolha, medido em RN antes de hospedar.
     *
     * `null` enquanto não mediu: nesse primeiro quadro a bolha renderiza sem menu, o que é
     * o necessário para ela poder se medir. Depois disso o host recebe a medida pronta e o
     * long press passa a valer.
     */
    const [box, setBox] = React.useState<{ width: number; height: number } | null>(null)

    const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout
        if (width <= 0 || height <= 0) return
        setBox((previous) =>
            previous &&
            Math.abs(previous.width - width) < 1 &&
            Math.abs(previous.height - height) < 1
                ? previous
                : { width, height },
        )
    }, [])

    /**
     * O gatilho do menu é uma camada a mais entre a linha e a bolha, e por padrão
     * ela estica: a bolha ficava encostada à esquerda dentro de um gatilho largo,
     * o que na mensagem enviada aparecia como um vão sobrando à direita.
     *
     * Este `View` faz a camada abraçar a bolha e alinhá-la ao lado certo, para o
     * gatilho ser transparente para o layout.
     */
    const align: ViewStyle = {
        alignSelf: options.isMine ? "flex-end" : "flex-start",
        alignItems: options.isMine ? "flex-end" : "flex-start",
        maxWidth: "100%",
    }

    // Mensagem sem nenhuma ação disponível (apagada, por exemplo): a bolha passa
    // direto, sem gatilho de menu.
    if (!items.length) return <View style={align}>{children}</View>

    if (Platform.OS === "android") {
        return (
            <View style={align}>
                <AndroidMenu
                    items={items}
                    onPressItem={handlePress}
                    destructiveColor={colors.error}
                >
                    {children}
                </AndroidMenu>
            </View>
        )
    }

    // Primeiro quadro: sem menu, só para a bolha poder se medir.
    if (!box) {
        return (
            <View style={align} onLayout={handleLayout}>
                {children}
            </View>
        )
    }

    return (
        <View style={[align, { width: box.width, height: box.height }]}>
            {/* Tamanho explícito nos dois lados — no `Host` e no `frame` — é o que evita
                o `matchContents`. O card do feed não precisa disto porque já nasce com
                tamanho fixo; a bolha chega aqui medida. */}
            <SwiftUIHost colorScheme="dark" style={{ width: box.width, height: box.height }}>
                <ContextMenu modifiers={[frame({ width: box.width, height: box.height })]}>
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

                    <ContextMenu.Trigger>
                        {/* `onLayout` continua ligado: mensagem editada ou reação nova muda a
                            altura, e o host precisa acompanhar. */}
                        <View onLayout={handleLayout}>{children}</View>
                    </ContextMenu.Trigger>
                </ContextMenu>
            </SwiftUIHost>
        </View>
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
