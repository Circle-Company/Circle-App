import type { DeepPartial, Theme } from "stream-chat-expo"

import { colors } from "@/constants/colors"

/**
 * O tema do SDK do Stream nas cores do Circle.
 *
 * **A v9 trocou a paleta plana (`colors.accent_blue`, `colors.white_snow`…) por tokens
 * semânticos**, gerados do design system do Stream — e o `ThemeProvider` escolhe entre o
 * conjunto claro e o escuro pelo `useColorScheme()` **do aparelho**.
 *
 * Esse padrão está errado para este app, e é o que este arquivo corrige: o Circle é preto
 * sempre, não acompanha o modo do sistema. Sem os tokens abaixo, quem estiver com o aparelho
 * no modo claro abre a conversa branca enquanto o resto do app segue preto.
 *
 * **Os valores são do Circle, não o `darkSemantics` do Stream.** Importar o conjunto escuro
 * dele resolveria o modo claro e deixaria a conversa cinza-escura contra o preto do app —
 * meio caminho. E o único jeito de alcançá-lo seria um import de caminho interno
 * (`lib/module/theme`), que não é API pública e quebra na próxima versão menor.
 *
 * `DeepPartial`: só os tokens listados mudam. Os que dependem de outros já foram resolvidos
 * pelo SDK antes deste objeto ser mesclado, então cada valor aqui é uma cor literal.
 */
export const chatSdkTheme: DeepPartial<Theme> = {
    semantics: {
        // ── Superfícies ────────────────────────────────────────────────────────────────
        backgroundCoreApp: colors.gray.black,
        backgroundCoreElevation0: colors.gray.black,
        backgroundCoreElevation1: colors.gray.grey_09,
        backgroundCoreElevation2: colors.gray.grey_08,
        backgroundCoreElevation3: colors.gray.grey_07,
        backgroundCoreSurfaceDefault: colors.gray.black,
        backgroundCoreSurfaceCard: colors.gray.grey_09,
        backgroundCoreSurfaceSubtle: colors.gray.grey_09,
        backgroundCoreSurfaceStrong: colors.gray.grey_08,
        backgroundCoreInverse: colors.gray.white,
        backgroundUtilityHover: colors.gray.grey_08,
        backgroundUtilityPressed: colors.gray.grey_07,
        backgroundUtilitySelected: colors.gray.grey_08,
        backgroundUtilityDisabled: colors.gray.grey_09,

        // ── Bordas ─────────────────────────────────────────────────────────────────────
        borderCoreDefault: colors.gray.grey_08,
        borderCoreSubtle: colors.gray.grey_09,
        borderCoreStrong: colors.gray.grey_07,
        borderCoreOnSurface: colors.gray.grey_08,

        // ── Texto ──────────────────────────────────────────────────────────────────────
        textPrimary: colors.gray.white,
        textSecondary: colors.gray.grey_04,
        textTertiary: colors.gray.grey_05,
        textDisabled: colors.gray.grey_06,
        textOnAccent: colors.gray.white,
        textOnInverse: colors.gray.black,
        textLink: colors.blue.blue_05,

        // ── Acento ─────────────────────────────────────────────────────────────────────
        accentPrimary: colors.blue.blue_05,
        accentError: colors.red.red_05,
        accentSuccess: colors.green.green_05,

        // ── A conversa ─────────────────────────────────────────────────────────────────
        // `incoming` é a bolha de quem recebe; `outgoing`, a de quem envia. Os dois pares
        // (fundo + texto) andam juntos: trocar só o fundo produz texto ilegível na bolha.
        chatBgIncoming: colors.gray.grey_09,
        chatBgOutgoing: colors.blue.blue_05,
        chatTextIncoming: colors.gray.white,
        chatTextOutgoing: colors.gray.white,
        chatBorderIncoming: colors.gray.grey_08,
        chatBorderOutgoing: colors.blue.blue_05,
        chatBgAttachmentIncoming: colors.gray.grey_08,
        chatBgAttachmentOutgoing: colors.blue.blue_05,
        chatTextTimestamp: colors.gray.grey_04,
        chatTextUsername: colors.gray.grey_03,
        chatTextSystem: colors.gray.grey_04,
        chatTextRead: colors.blue.blue_05,
        chatTextTypingIndicator: colors.gray.grey_04,
        chatTextLink: colors.blue.blue_05,

        // ── Campo de escrita ───────────────────────────────────────────────────────────
        inputTextDefault: colors.gray.white,
        inputTextPlaceholder: colors.gray.grey_04,
        inputTextIcon: colors.gray.grey_04,
        inputSendIcon: colors.blue.blue_05,
        inputSendIconDisabled: colors.gray.grey_06,

        // ── Presença ───────────────────────────────────────────────────────────────────
        presenceBgOnline: colors.green.green_05,
        presenceBgOffline: colors.gray.grey_06,
        presenceBorder: colors.gray.black,

        systemCaret: colors.blue.blue_05,
        systemText: colors.gray.white,
    },
    messageList: {
        container: { backgroundColor: colors.gray.black },
    },
}
