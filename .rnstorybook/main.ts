import type { StorybookConfig } from "@storybook/react-native"

/**
 * Storybook on-device: as stories rodam dentro do dev build, não no navegador.
 *
 * É o único formato que serve a este projeto — boa parte dos componentes é
 * nativa (`@expo/ui`, vision-camera, MMKV), e num Storybook web eles não
 * renderizam. O efeito colateral bom é que a story vira também o lugar onde dá
 * para conferir o menu de contexto do iOS e do Android de verdade.
 */
const main: StorybookConfig = {
    // As stories moram junto do componente, e não numa pasta central: assim
    // renomear ou mover um componente leva a story junto.
    stories: ["../src/**/*.stories.?(ts|tsx|js|jsx)"],
    deviceAddons: ["@storybook/addon-ondevice-controls", "@storybook/addon-ondevice-actions"],
}

export default main
