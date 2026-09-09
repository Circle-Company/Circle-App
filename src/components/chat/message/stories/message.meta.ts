import type { Meta, StoryObj } from "@storybook/react-native"

import { MessageRender } from ".."
import { MessageOptionsInput, MessageRenderProps, MessageSizeProps } from "../message.types"
import { messageSizes } from "../message.sizes"

/**
 * Argumentos das stories: as props do componente mais os controles que fazem
 * sentido ajustar à mão.
 *
 * `size` e `options` são objetos — no painel virariam editor de JSON, inútil
 * para mexer numa medida e olhar o resultado. Aqui eles são decompostos em
 * campos simples e remontados no `render`.
 *
 * Nem toda story mostra todos: o meta base traz só o que serve a qualquer
 * mensagem, e cada arquivo acrescenta os seus (ver `progressControl`,
 * `groupControls`, `sizeControls`).
 */
export type MessageStoryArgs = Omit<MessageRenderProps, "size" | "options"> & {
    /** Preset base — os mesmos três de `messageSizes`. */
    sizePreset?: keyof typeof messageSizes
    /** Sobrescritas do preset, medida a medida. */
    maxWidthRatio?: number
    padding?: number
    borderRadius?: number
    borderRadiusTight?: number
    avatarSize?: number
    gap?: number
    fontSize?: number
    /** Posição na conversa e na sequência do mesmo autor. */
    isGroup?: boolean
    isFirstOfGroup?: boolean
    isLastOfGroup?: boolean
}

const SIZE_KEYS = [
    "maxWidthRatio",
    "padding",
    "borderRadius",
    "borderRadiusTight",
    "avatarSize",
    "gap",
    "fontSize",
] as const

/** Monta o `size` a partir do preset, aplicando só as sobrescritas preenchidas. */
export function buildSize(args: MessageStoryArgs): MessageSizeProps {
    const preset = messageSizes[args.sizePreset ?? "standart"] ?? messageSizes.standart
    const overrides = SIZE_KEYS.reduce<Partial<MessageSizeProps>>((acc, key) => {
        const value = args[key]
        // `undefined` é "não mexi neste controle"; 0 é um valor legítimo.
        if (typeof value === "number") acc[key] = value
        return acc
    }, {})

    return { ...preset, ...overrides }
}

export function buildOptions(args: MessageStoryArgs): MessageOptionsInput {
    const { isGroup, isFirstOfGroup, isLastOfGroup } = args
    return {
        ...(typeof isGroup === "boolean" ? { isGroup } : {}),
        ...(typeof isFirstOfGroup === "boolean" ? { isFirstOfGroup } : {}),
        ...(typeof isLastOfGroup === "boolean" ? { isLastOfGroup } : {}),
    }
}

const range = (min: number, max: number, step: number, category = "Tamanho") => ({
    control: { type: "range" as const, min, max, step },
    table: { category },
})

/**
 * Meta base: só o que serve a qualquer mensagem.
 *
 * O preset de tamanho fica aqui porque trocar entre `compact`/`standart`/`large`
 * é útil em toda story; o ajuste fino de cada medida não, e vive em
 * `sizeControls`.
 */
export const messageMeta = {
    component: MessageRender,
    args: { sizePreset: "standart" },
    argTypes: {
        sizePreset: {
            control: "inline-radio",
            options: Object.keys(messageSizes),
            table: { category: "Tamanho" },
        },
        // Objetos e nós de React: ocupam o painel sem serem ajustáveis à mão.
        data: { table: { disable: true } },
        avatar: { table: { disable: true } },
        messageType: { table: { disable: true } },
        progress: { table: { disable: true } },
        onAction: { table: { disable: true } },
        onPressReaction: { table: { disable: true } },
        onPressReply: { table: { disable: true } },
    },
    render: (args: MessageStoryArgs) =>
        MessageRender({ ...args, size: buildSize(args), options: buildOptions(args) }),
} satisfies Omit<Meta<MessageStoryArgs>, "title">

/** Progresso da reprodução — só faz sentido na nota de voz. */
export const progressControl = {
    // Passo de 0.01: com 28 barras, cada uma cobre ~3,6% da duração, então um
    // passo maior pularia o preenchimento interno da barra — justamente o que
    // esse controle serve para inspecionar.
    progress: { control: { type: "range" as const, min: 0, max: 1, step: 0.01 } },
}

/** Posição na sequência — só faz sentido nas stories de grupo. */
export const groupControls = {
    isGroup: { control: "boolean" as const, table: { category: "Sequência" } },
    isFirstOfGroup: { control: "boolean" as const, table: { category: "Sequência" } },
    isLastOfGroup: { control: "boolean" as const, table: { category: "Sequência" } },
}

/** Ajuste fino de cada medida — só na story de tamanhos. */
export const sizeControls = {
    maxWidthRatio: range(0.3, 1, 0.01),
    padding: range(0, 24, 1),
    borderRadius: range(0, 32, 1),
    borderRadiusTight: range(0, 32, 1),
    avatarSize: range(20, 64, 1),
    gap: range(0, 20, 1),
    fontSize: range(10, 28, 1),
}

export type MessageStory = StoryObj<MessageStoryArgs>
