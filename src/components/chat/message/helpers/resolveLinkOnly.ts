/**
 * Detecta a mensagem que é **só** um link.
 *
 * A distinção importa porque muda o que a bolha desenha: um link no meio de uma frase é
 * parte do texto, mas uma mensagem que é apenas o endereço não tem nada a dizer além do
 * destino — então ela vira um alvo, com o endereço em destaque e uma linha explicando o que
 * acontece ao tocar.
 *
 * A regra é conservadora de propósito: **só** conta quando o conteúdo inteiro, sem espaços
 * nas pontas, é um único endereço. Uma frase com link dentro continua sendo texto comum, e o
 * texto do usuário nunca é reinterpretado por engano.
 */

/**
 * Endereço http(s) sem espaço.
 *
 * Sem tentar cobrir todo o RFC: o objetivo é reconhecer o que uma pessoa cola numa conversa,
 * não validar URL. Casos exóticos caem no texto comum, que é o lado seguro — pior que não
 * destacar um link é destacar como link algo que não é.
 */
const LINK_ONLY = /^https?:\/\/[^\s]+$/i

/** O endereço, quando a mensagem inteira é um link; `null` caso contrário. */
export function resolveLinkOnly(content: string | null | undefined): string | null {
    if (!content) return null

    const trimmed = content.trim()
    if (!trimmed) return null

    return LINK_ONLY.test(trimmed) ? trimmed : null
}

export const isLinkOnly = (content: string | null | undefined): boolean =>
    resolveLinkOnly(content) !== null

/**
 * O endereço como ele é exibido: sem `https://` nem `http://`.
 *
 * O protocolo não diz nada a quem lê — é ruído no começo de toda mensagem-link, e come o
 * espaço que o domínio deveria ocupar. O valor original continua intacto no `content`, que é
 * o que se abre ao tocar: encurtar é decisão de exibição, não de dado.
 */
export function formatLinkForDisplay(url: string): string {
    return url.replace(/^https?:\/\//i, "")
}
