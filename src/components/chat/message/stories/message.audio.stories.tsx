import { UPDATE_STORY_ARGS } from "storybook/internal/core-events"
import { addons } from "storybook/preview-api"

import {
    type MessageStory,
    type MessageStoryArgs,
    messageMeta,
    progressControl,
} from "./message.meta"
import { baseMessage, me, sampleWaveform } from "./message.mock"

const meta = {
    ...messageMeta,
    title: "Chat/Message/Áudio",
    // O progresso da reprodução só existe aqui.
    argTypes: { ...messageMeta.argTypes, ...progressControl },
    /**
     * O componente é controlado: arrastar a bolinha emite `onSeek`, e quem manda
     * no player é a tela. Na story esse papel cabe ao arg `progress` — o mesmo
     * canal que o `play` usa —, então arrastar move de verdade e o slider do
     * painel acompanha.
     */
    render: (args: MessageStoryArgs, { id }: { id: string }) =>
        messageMeta.render({
            ...args,
            onSeek: (progress: number) =>
                addons
                    .getChannel()
                    .emit(UPDATE_STORY_ARGS, { storyId: id, updatedArgs: { progress } }),
        }),
}

export default meta

type Story = MessageStory

/** Nota de voz com waveform pronta. Use o controle `progress` para ver o avanço. */
export const WithWaveform: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "9",
            contentType: "audio",
            content: null,
            media: {
                url: "file:///mock/voice-note.wav",
                duration: 14,
                waveform: sampleWaveform,
            },
        },
        progress: 0.4,
    },
}

export const Sent: Story = {
    args: {
        ...WithWaveform.args,
        data: {
            ...WithWaveform.args!.data!,
            id: "10",
            author: me,
            status: "delivered",
        },
    },
}

/**
 * Reprodução animada.
 *
 * O componente é controlado por fora — quem toca o áudio é a tela —, então aqui
 * o papel do player cabe ao `play`: ele avança o arg `progress` em tempo real,
 * na duração declarada no `media`, e a story anima sozinha ao abrir.
 *
 * A atualização vai pelo canal do Storybook (`UPDATE_STORY_ARGS`) porque o
 * contexto do `play` expõe os args como leitura; assim o painel de controles
 * acompanha o valor enquanto o traço se preenche, e arrastar o slider durante a
 * reprodução continua funcionando.
 *
 * `requestAnimationFrame`, e não `setInterval`, para o avanço acompanhar os
 * quadros do navegador — com intervalo fixo o traço andaria em degraus, e é
 * justamente a continuidade que esta story existe para mostrar.
 */
export const Playing: Story = {
    args: { ...WithWaveform.args, progress: 0, isPlaying: true },
    play: async ({ id, args, abortSignal }) => {
        const channel = addons.getChannel()
        const duration = (args.data?.media?.duration ?? 10) * 1000
        const startedAt = performance.now()

        /**
         * Reporta a posição a cada 250ms, como um player de verdade — o
         * `expo-audio` emite nessa ordem de grandeza.
         *
         * Antes isto rodava a cada quadro, e era um teste desonesto: escondia o
         * engasgo que aparece quando os avisos chegam espaçados, e ainda forçava
         * um render do React por quadro. Com `isPlaying`, o traço corre sozinho
         * entre um aviso e outro.
         */
        await new Promise<void>((resolve) => {
            const timer = setInterval(() => {
                const progress = Math.min(1, (performance.now() - startedAt) / duration)
                channel.emit(UPDATE_STORY_ARGS, { storyId: id, updatedArgs: { progress } })

                if (progress >= 1 || abortSignal.aborted) {
                    clearInterval(timer)
                    channel.emit(UPDATE_STORY_ARGS, {
                        storyId: id,
                        updatedArgs: { isPlaying: false },
                    })
                    resolve()
                }
            }, 250)

            // Trocar de story no meio da reprodução aborta o : sem isso o
            // laço continuaria emitindo args de uma story que saiu de tela.
            abortSignal.addEventListener(
                "abort",
                () => {
                    clearInterval(timer)
                    resolve()
                },
                { once: true },
            )
        })
    },
}
