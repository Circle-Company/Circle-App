import { useLayoutState } from "@shopify/flash-list"

/**
 * `useState` para tudo que muda **o tamanho** da mensagem.
 *
 * Este é o ponto que faltava para o espaçamento parar de dançar na conversa.
 *
 * A FlashList v2 posiciona cada célula em coordenada absoluta (`top: y`), com `y` somado a
 * partir das alturas medidas das anteriores. Quem mede é o `onLayout` da célula, ou seja: o
 * **nativo** avisa a lista depois do fato. Enquanto esse aviso não chega, as células seguintes
 * continuam nas posições calculadas com a altura antiga.
 *
 * Um `useState` comum dentro de um item cria exatamente esse intervalo: o React re-renderiza,
 * a altura muda, e a lista só descobre no `onLayout` seguinte — o `validateItemSize` dela
 * chama um novo layout ao notar a divergência, mas um quadro depois. Numa mensagem isolada
 * ninguém vê; numa lista rolando, é a mensagem de baixo aparecendo colada ou afastada e
 * corrigindo sozinha um instante depois.
 *
 * O `useLayoutState` é o mesmo `useState` com um `recyclerViewContext.layout()` no setter: a
 * lista recalcula no mesmo commit, antes da pintura. Fora de uma FlashList o contexto não
 * existe e o hook vira `useState` puro — então os componentes de mensagem continuam
 * funcionando em qualquer lugar (stories, prévia, tela sem lista).
 *
 * **A regra tem duas metades, e a segunda custou caro.**
 *
 * 1. Use aqui o estado que muda o tamanho da mensagem **depois** de a lista já ter assentado:
 *    seleção pelo long press, texto editado, reação otimista. São mudanças raras, disparadas
 *    por gesto de quem está lendo.
 *
 * 2. **Não** use aqui estado que dispara em rajada durante a montagem — medida de largura,
 *    decodificação assíncrona do traço da nota de voz, medida da bolha para hospedar o menu.
 *    Cada setter destes é um `layout()`, e `layout()` é um re-render da lista inteira. A
 *    FlashList tolera 40 renders sem commit (`RenderTimeTracker.maxRendersWithoutCommit`);
 *    passando disso ela avisa no console e commita com os tamanhos que tiver — e aí as
 *    células ficam em `y` errado, desenhadas umas por cima das outras. Um setter por mensagem
 *    montada estoura esse limite na primeira rolagem. Para esses, `useState` normal: a lista
 *    percebe pelo `onLayout` da célula e corrige sozinha.
 */
export const useSizeState = useLayoutState
