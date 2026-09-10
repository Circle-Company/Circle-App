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

/**
 * ── DIAGNÓSTICO, TEMPORÁRIO ─────────────────────────────────────────────────────────────
 *
 * Com `true`, o iOS renderiza a bolha crua: sem medida em dois tempos, sem `Host`, sem
 * `ContextMenu`. A altura da linha fica definitiva já no primeiro quadro.
 *
 * Existe para responder **uma** pergunta: a sobreposição das bolhas ao subir o scroll vem da
 * medida em dois tempos do menu nativo, ou não?
 *
 *   - sumiu   ⇒ é a medida. O menu volta, e o conserto é nela.
 *   - continua ⇒ o menu está inocente, e o problema é da lista.
 *
 * De qualquer forma isto **sai**: é instrumento de teste, não o novo comportamento. O menu
 * nativo segue inteiro logo abaixo, intocado.
 */
const BYPASS_NATIVE_MENU: boolean = false

type ActionItem = {
    action: MessageActionType
    label: string
    /** SF Symbol do item no menu do iOS. */
    systemImage: SFSymbols7_0
    enabled: boolean
    destructive?: boolean
}

/**
 * Menu de ações da mensagem, nativo nos dois sistemas: `ContextMenu` (SwiftUI) no iOS e
 * `DropdownMenu` (Jetpack Compose) no Android. O gatilho é o long press sobre a
 * bolha.
 *
 * **O relevo do long press vem do `ContextMenu` do SwiftUI**, igual ao card do feed
 * (`ProfileDropDownMenuIOS`).
 *
 * O `Host` do `@expo/ui` **não mede filho RN**: com `matchContents` ele reporta zero, e a
 * bolha nasce 0×0. O que funciona no feed é o `Host` receber tamanho explícito — lá o card já
 * tem tamanho fixo por preset. A bolha não tem: depende do texto.
 *
 * Daí a medida em dois tempos. O primeiro quadro renderiza a bolha **solta**, no fluxo normal,
 * só para ela se medir; a partir do segundo ela vai hospedada, dentro de uma caixa com o
 * tamanho já conhecido — então entre um quadro e outro a altura da linha não muda.
 *
 * **Mede-se uma vez, e fora do host.** Medir também lá dentro realimenta a própria medida e
 * vira um laço que derruba o layout da lista inteira — ver o comentário no `ContextMenu.Trigger`.
 *
 * Já tentei deixar a bolha em fluxo e pôr o host como camada absoluta por cima, para o layout
 * nunca depender dele. Também não serve: o host precisa ficar **no fluxo**, ocupando o espaço
 * que desenha.
 *
 * A medida é **presa à mensagem** (ver `signature`) e vive no estado desta instância. Isso é o
 * que a torna segura numa lista que recicla views: sem a amarra, a linha reciclada apareceria
 * com o tamanho da anterior.
 *
 * Já tentei guardá-la num cache global por mensagem, para medir uma vez só na vida. Não
 * funciona: a altura da bolha não depende só do conteúdo — depende da posição no bloco (o nome
 * do autor aparece ou não), de ser conversa de grupo e da largura disponível. A mesma mensagem
 * tem alturas legítimas diferentes, e uma primeira medida ruim ficava gravada para sempre.
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
     * Tamanho da bolha, medido em RN.
     *
     * `null` enquanto não mediu: nesse primeiro quadro a bolha aparece sem menu, que é o
     * necessário para ela poder se medir. Depois disso a camada de cima assume, com a medida
     * pronta, e o long press passa a valer.
     *
     * A medida é **presa à mensagem** (`signature`) e vive no estado desta instância: sem a
     * amarra, a linha reciclada apareceria com o tamanho da anterior.
     */

    /**
     * Assinatura do que altera o tamanho da bolha. Muda ⇒ vale medir de novo.
     *
     * Reações e rodapé ficam **fora** do gatilho, então não entram aqui: incluí-los provocaria
     * remedição por algo que não mexe no que está hospedado.
     */
    const signature = `${data.id}:${data.content ?? ""}:${data.editedAt ?? ""}:${data.deletedAt ?? ""}`
    const [box, setBox] = React.useState<{
        signature: string
        width: number
        height: number
    } | null>(null)

    const measured = box && box.signature === signature ? box : null

    const handleLayout = React.useCallback(
        (event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout
            if (width <= 0 || height <= 0) return
            setBox((previous) =>
                previous &&
                previous.signature === signature &&
                Math.abs(previous.width - width) < 1 &&
                Math.abs(previous.height - height) < 1
                    ? previous
                    : { signature, width, height },
            )
        },
        [signature],
    )

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

    // ── DIAGNÓSTICO, TEMPORÁRIO ──────────────────────────────────────────────────────────
    // Ver `BYPASS_NATIVE_MENU` no topo do arquivo. Para desfazer, é só o `false`.
    if (BYPASS_NATIVE_MENU) return <View style={align}>{children}</View>

    // Primeiro quadro: a bolha solta, só para poder se medir.
    if (!measured) {
        return (
            <View style={align} onLayout={handleLayout}>
                {children}
            </View>
        )
    }

    return (
        // A caixa em fluxo tem o tamanho medido, e é ela que a lista enxerga: entre o quadro
        // de medida e este a altura não muda.
        <View style={[align, { width: measured.width, height: measured.height }]}>
            {/* Tamanho explícito no `Host` e no `frame`: é a condição em que o menu do feed
                funciona, e a única que o `Host` respeita — `matchContents` reporta zero. */}
            <SwiftUIHost
                colorScheme="dark"
                style={{ width: measured.width, height: measured.height }}
            >
                <ContextMenu
                    modifiers={[frame({ width: measured.width, height: measured.height })]}
                >
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

                    {/*
                        Sem `onLayout` aqui dentro — e isso é o ponto mais delicado do
                        arquivo.

                        Dentro do host a bolha se mede contra o tamanho que o host recebeu,
                        que veio da medida anterior. Medir de novo ali realimenta o mesmo
                        valor que a produziu: cada medida escreve o estado, o host muda de
                        tamanho, a bolha mede outra vez. É um laço, e ele não fica contido na
                        mensagem — cada volta faz a lista recalcular layout. A FlashList
                        aguenta 40 renders sem commit; passando disso ela avisa no console e
                        commita com os tamanhos que tiver, e as células vão parar umas por
                        cima das outras.

                        Remedir quando o conteúdo muda continua funcionando, e por outro
                        caminho: a `signature` muda, `measured` volta a ser nulo, e o quadro
                        seguinte é o de medida — no fluxo, fora do host, onde medir é seguro.
                    */}
                    <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
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
