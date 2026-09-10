import React from "react"
import { View } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import { FlashList } from "@shopify/flash-list"

import type { RenderTarget } from "@shopify/flash-list"

import ChatListRow from "./chat.list.row"
import { ChatListProps, ChatRow, isDivider } from "./chat.list.types"

import { resolveSequence } from "./helpers/chat.list.sequence"
import appSizes from "@/constants/sizes"
import { useRevealGesture } from "./chat.list.reveal"

/**
 * Lista da conversa.
 *
 * Junta o que os componentes de chat não sabem sozinhos: a ordem das linhas, a
 * posição de cada mensagem na sequência do mesmo autor, e o gesto de arrastar
 * para a esquerda que revela o horário de cada uma.
 *
 * O deslocamento do arrasto é uma `Animated.Value` só, compartilhada por todas
 * as linhas: a lista anda inteira, então uma por linha seria o mesmo movimento
 * calculado N vezes por quadro.
 */
export default function ChatList({
    rows,
    myUserId,
    isGroup = false,
    size,
    contentInsetTop = 0,
    contentInsetAdjustmentBehavior = "never",
    disableContentAnchoring = false,
    footer,
    header,
    onStartReached,
    renderAvatar,
    onAction,
    onPressReply,
    onPressReaction,
    onSeek,
    onTogglePlay,
    playingMessageId,
    playingProgress = 0,
}: ChatListProps) {
    const { translateX, gesture } = useRevealGesture()

    const sequence = React.useMemo(() => resolveSequence(rows), [rows])

    /**
     * Id da mensagem mais recente.
     *
     * Percorre de trás para frente e para na primeira que não for divisor: a
     * conversa pode terminar com uma virada de dia ou um aviso do sistema, e
     * nenhum dos dois é a "última mensagem".
     */
    const latestId = React.useMemo(() => {
        for (let index = rows.length - 1; index >= 0; index--) {
            const row = rows[index]
            if (!isDivider(row)) return row.id
        }
        return undefined
    }, [rows])

    const keyExtractor = React.useCallback((row: ChatRow) => row.id, [])

    /**
     * Tipo da linha, para a reciclagem da lista.
     *
     * A FlashList reaproveita views ao rolar. Sem esta pista ela trata todas as linhas como
     * do mesmo tipo e pode reusar a view de uma bolha de texto para desenhar uma nota de voz
     * ou uma virada de dia — árvores completamente diferentes, o que anula o ganho da
     * reciclagem e produz o piscar de conteúdo trocado durante a rolagem.
     *
     * Áudio fica num tipo próprio porque é a linha mais cara: player, traço e avatar.
     */
    const getItemType = React.useCallback((row: ChatRow) => {
        if (isDivider(row)) return row.kind === "date" ? "divider-date" : "divider-system"
        if (row.deletedAt) return "message-deleted"
        return row.contentType === "audio" ? "message-audio" : "message-text"
    }, [])

    /**
     * Índices das viradas de dia, para elas grudarem no topo durante a rolagem.
     *
     * É o divisor de data que deve alinhar com o header — não as mensagens. Enquanto se
     * percorre um dia, a etiqueta daquele dia fica visível; ao chegar no dia seguinte, a
     * nova empurra a anterior para fora. A pílula é opaca e centralizada, então as mensagens
     * passam por trás dela sem sumir atrás de uma faixa.
     *
     * Só as de data: aviso do sistema é um evento pontual da conversa, não um cabeçalho de
     * trecho — grudá-lo no topo diria que tudo abaixo pertence a ele, o que é falso.
     */
    const stickyHeaderIndices = React.useMemo(
        () =>
            rows.reduce<number[]>((indices, row, index) => {
                if (isDivider(row) && row.kind === "date") indices.push(index)
                return indices
            }, []),
        [rows],
    )

    /**
     * O espaço do header é reservado **por nós**, no conteúdo.
     *
     * Deixar isso com o `contentInsetAdjustmentBehavior="automatic"` parece mais simples — o
     * iOS sabe a altura real da barra, safe area incluída — mas põe duas coisas mexendo no
     * mesmo offset: o iOS ajustando o inset depois do layout, e a ancoragem da lista
     * corrigindo o offset conforme as alturas reais das linhas aparecem. As duas correções se
     * perseguem, e o sintoma é a conversa tentando se alinhar ao header enquanto se rola.
     *
     * Com o padding no conteúdo, o espaço do header entra como parte do layout e a ancoragem
     * fica sendo a única a mexer no offset. A altura vem da tela (`contentInsetTop`), que é
     * quem tem o `useHeaderHeight`.
     *
     * Memoizado porque literal inline nasce novo a cada render e conta como prop nova.
     */
    const contentContainerStyle = React.useMemo(
        () => ({ paddingTop: 8 + contentInsetTop, paddingBottom: 8 }),
        [contentInsetTop],
    )

    /**
     * O `renderItem` repassa as props **cruas** e deixa cada linha montar o que é dela.
     *
     * Antes ele criava, por item e por render, o elemento do avatar e quatro closures com o
     * id da mensagem. Como `ChatListRow` é memoizado, prop nova a cada render anulava a
     * memoização: um tique de `playingProgress` — que chega várias vezes por segundo durante
     * a reprodução — redesenhava todas as linhas visíveis.
     *
     * Agora só mudam de fato `isPlaying` e `progress`, e só na linha que está tocando; as
     * demais comparam props iguais e são puladas.
     */
    const renderItem = React.useCallback(
        ({ item, target }: { item: ChatRow; target: RenderTarget }) => {
            const isMessage = !isDivider(item)
            const isRowPlaying = isMessage && item.id === playingMessageId

            return (
                <ChatListRow
                    row={item}
                    sequence={isMessage ? sequence.get(item.id) : undefined}
                    isGroup={isGroup}
                    /*
                     * Só decide o lado quando a tela disse quem está lendo. Sem isso fica
                     * `undefined`, e quem responde é a sessão, dentro do provider.
                     */
                    isMine={
                        myUserId && isMessage ? String(item.author?.id) === myUserId : undefined
                    }
                    isLatest={isMessage && item.id === latestId}
                    // A FlashList renderiza a etiqueta fixada por este mesmo `renderItem`,
                    // marcando o alvo. É como o separador sabe em qual dos dois estados está.
                    isStickyCopy={target === "StickyHeader"}
                    stickyTopInset={contentInsetTop}
                    size={size}
                    translateX={translateX}
                    renderAvatar={renderAvatar}
                    isPlaying={isRowPlaying}
                    progress={isRowPlaying ? playingProgress : 0}
                    onAction={onAction}
                    onPressReply={onPressReply}
                    onPressReaction={onPressReaction}
                    onSeek={onSeek}
                    onTogglePlay={onTogglePlay}
                />
            )
        },
        [
            isGroup,
            myUserId,
            latestId,
            onAction,
            onPressReaction,
            onPressReply,
            onSeek,
            contentInsetTop,
            onTogglePlay,
            playingMessageId,
            playingProgress,
            renderAvatar,
            sequence,
            size,
            translateX,
        ],
    )

    return (
        // O gesto fica no envelope, e não na lista: assim ele observa o
        // movimento sem disputar o `onScroll` dela, e só assume quando o arrasto
        // é horizontal (ver `useRevealGesture`).
        <GestureDetector gesture={gesture}>
            <View style={{ flex: 1, overflow: "hidden" }}>
                <FlashList
                    data={rows}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    getItemType={getItemType}
                    /*
                     * Quanto a lista desenha além da tela, em px.
                     *
                     * O default (250) deixa célula em branco quando se rola rápido: a view entra
                     * antes de ter conteúdo. Uma tela a mais de margem cobre o intervalo entre o
                     * dedo e o desenho. É troca consciente — mais memória e mais trabalho por
                     * quadro, em favor de não ver buraco durante a rolagem.
                     */
                    drawDistance={appSizes.window.height}
                    stickyHeaderIndices={stickyHeaderIndices}
                    contentContainerStyle={contentContainerStyle}
                    contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
                    /*
                     * A conversa abre no fim, e quem monta o que aparece é a lista.
                     *
                     * `startRenderingFromBottom` faz a primeira montagem começar pela mensagem
                     * mais recente. Daí em diante a virtualização é dela: monta o que está
                     * perto da viewport, recicla o que sai, e mede as linhas conforme elas
                     * entram.
                     *
                     * **A ancoragem tem de ficar ligada, e é ela que faz subir o scroll
                     * funcionar.** Subindo, a lista encontra linhas que nunca mediu: a altura
                     * real substitui a estimada, e tudo o que está abaixo teria de deslizar. A
                     * ancoragem é justamente a correção de offset que segura o conteúdo visível
                     * no lugar enquanto isso acontece. Sem ela — e ela esteve desligada nesta
                     * tela — a conversa embaralha ao subir, com as bolhas caindo umas sobre as
                     * outras.
                     */
                    maintainVisibleContentPosition={{
                        disabled: disableContentAnchoring,
                        startRenderingFromBottom: true,
                    }}
                    ListHeaderComponent={header}
                    ListFooterComponent={footer}
                    onStartReached={onStartReached}
                    /*
                     * Meia tela de antecedência: com o padrão, a busca só começa quando o
                     * topo já está à vista, e a conversa trava enquanto a página chega.
                     */
                    onStartReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </GestureDetector>
    )
}

export { REVEAL_WIDTH } from "./chat.list.reveal"
export * from "./chat.list.types"
export { resolveSequence } from "./helpers/chat.list.sequence"
export { useChatAudioPlayback } from "./hooks/useChatAudioPlayback"
