import type { Preview } from "@storybook/react-native-web-vite"

import { withAppContexts, withCanvas } from "./decorators"

const preview: Preview = {
    // Contextos por fora, respiro por dentro.
    decorators: [withCanvas, withAppContexts],
    parameters: {
        /**
         * Fundos selecionáveis na toolbar. O padrão é o cinza da lista de
         * conversa das telas de referência — a bolha recebida é quase branca, e
         * sobre branco puro ela some.
         */
        backgrounds: {
            default: "chat",
            values: [
                { name: "chat", value: "#F2F2F7" },
                { name: "claro", value: "#FFFFFF" },
                { name: "escuro", value: "#000000" },
            ],
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
}

export default preview
