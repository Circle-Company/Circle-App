import type { Meta, StoryObj } from "@storybook/react-native"

import { DateSeparator } from ".."

/**
 * Etiqueta de dia entre blocos da lista.
 *
 * O rótulo chega pronto: quem decide onde a virada de dia acontece — e como ela
 * se escreve em cada idioma — é a lista do chat, não o componente.
 */
const meta = {
    title: "Chat/DateSeparator",
    component: DateSeparator,
} satisfies Meta<typeof DateSeparator>

export default meta

type Story = StoryObj<typeof meta>

export const ShortLabel: Story = {
    args: { date: "Hoje" },
}

/** Rótulo longo: a etiqueta cresce com o texto, sem quebrar nem cortar. */
export const LongLabel: Story = {
    args: { date: "Quinta-feira, 12 de março de 2026" },
}
