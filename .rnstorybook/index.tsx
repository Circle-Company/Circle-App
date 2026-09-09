import { storage } from "@/store"
import { view } from "./storybook.requires"

/**
 * Raiz do Storybook on-device.
 *
 * O storage guarda a última story aberta, para o app voltar nela no reload. O
 * template oficial usa AsyncStorage; aqui isso é a MMKV, que o projeto já usa —
 * não vale adicionar uma segunda dependência nativa de storage só para o
 * Storybook. A API pede promessas, então os métodos síncronos da MMKV são
 * embrulhados.
 *
 * A chave fica fora do `storageKeys()` de propósito: aquilo é o inventário do
 * que o app persiste, e isto é estado de ferramenta de desenvolvimento.
 */
const STORYBOOK_STORAGE_PREFIX = "@circle:storybook:"

const StorybookUIRoot = view.getStorybookUI({
    storage: {
        getItem: async (key: string) =>
            storage.getString(`${STORYBOOK_STORAGE_PREFIX}${key}` as never) ?? null,
        setItem: async (key: string, value: string) => {
            storage.set(`${STORYBOOK_STORAGE_PREFIX}${key}` as never, value)
        },
    },
})

export default StorybookUIRoot
