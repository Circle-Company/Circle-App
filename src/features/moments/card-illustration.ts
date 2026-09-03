import { useSafeAreaInsets } from "react-native-safe-area-context"

import sizes from "@/constants/sizes"

/** Nav bar + folga curta, mesma convenção do feed e do módulo da câmera. */
const NAV_BAR_HEIGHT = 54
/** Tab bar nativa flutuante + home indicator. */
const TAB_BAR_RESERVE = 83
/**
 * Tudo do card que não é a ilustração: paddings do container, título,
 * descrição de até 3 linhas e o botão com suas margens.
 */
const CARD_CHROME_HEIGHT = 270
/** Piso: abaixo disso a ilustração vira ruído. */
const MIN_ILLUSTRATION = 140

/**
 * Lado da ilustração dos cards do feed.
 *
 * Em telas altas devolve os mesmos 90% da largura de sempre — o `min` não
 * morde. Em telas baixas encolhe até o card caber: iPhone SE/8 e, principalmente,
 * o canvas de 375x667 que o iPad usa ao rodar o app no modo de compatibilidade
 * (o app é iPhone-only, `supportsTablet: false`). Sem esse limite a descrição e
 * o botão vazam por baixo da tab bar — foi assim que a revisão da App Store
 * reprovou a build, testando num iPad.
 */
export function useCardIllustrationSize(): number {
    const insets = useSafeAreaInsets()
    const available =
        sizes.window.height - insets.top - NAV_BAR_HEIGHT - TAB_BAR_RESERVE - CARD_CHROME_HEIGHT

    return Math.max(MIN_ILLUSTRATION, Math.min(sizes.screens.width * 0.9, available))
}
