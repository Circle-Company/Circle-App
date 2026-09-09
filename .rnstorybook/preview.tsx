import type { Preview } from "@storybook/react-native"

import { withAppContexts, withCanvas } from "../.storybook/decorators"

/**
 * Preview do Storybook on-device.
 *
 * Compartilha os decorators com o Storybook web (`.storybook/decorators`): as
 * mesmas stories precisam ver a mesma sessão fake e o mesmo canvas, senão os
 * dois divergem e um deles passa a mentir.
 */
const preview: Preview = {
    decorators: [withCanvas, withAppContexts],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
}

export default preview
