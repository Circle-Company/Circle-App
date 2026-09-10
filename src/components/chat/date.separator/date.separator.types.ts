export type DateSeparatorProps = {
    /** Rótulo já formatado pela lista do chat ("Hoje", "Ontem", "12 de março"). */
    date: string
    /**
     * A etiqueta está fixada abaixo do header, e não correndo no meio da conversa.
     *
     * Muda o respiro em volta: solta, ela separa dois dias e precisa de ar para marcar a
     * virada; fixada, ela é um rótulo colado no header, e o mesmo respiro só a empurraria
     * para longe dele.
     */
    floating?: boolean
    /**
     * Quanto descer a cópia fixada, em px — a altura do header.
     *
     * A lista prende o sticky em `top: 0` relativo ao ScrollView, sem offset próprio. Sob um
     * header transparente isso é atrás do header. Só a cópia fixada usa este valor; a que
     * corre no meio da conversa é posicionada pelo fluxo.
     */
    stickyTopInset?: number
}
