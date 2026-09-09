import render_video from "./components/midia_render-video"
import root from "./components/midia_render-root"

/**
 * `RenderImage` saiu daqui: nenhuma tela o montava e ele ainda lia o `midia` no formato
 * antigo (`fullhd_resolution`/`nhd_resolution`), objeto que o contrato do momento não
 * entrega mais. Quando houver moment de imagem para renderizar (`contentType: "image"`),
 * o componente nasce de novo contra o contrato atual — `media` e `thumbnail` em string.
 */
export const MidiaRender = {
    RenderVideo: render_video,
    Root: root,
}
