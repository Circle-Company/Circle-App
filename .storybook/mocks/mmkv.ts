/**
 * Stub web da `react-native-mmkv` (storage nativo), com um Map em memória.
 *
 * O suficiente para os módulos que a importam no topo não quebrarem o bundle do
 * Storybook. Nenhuma story depende do que está guardado.
 */
class MMKVMock {
    private data = new Map<string, string | number | boolean>()

    getString = (key: string) => this.data.get(key) as string | undefined
    getNumber = (key: string) => this.data.get(key) as number | undefined
    getBoolean = (key: string) => this.data.get(key) as boolean | undefined
    set = (key: string, value: string | number | boolean) => {
        this.data.set(key, value)
    }
    remove = (key: string) => this.data.delete(key)
    delete = (key: string) => this.data.delete(key)
    contains = (key: string) => this.data.has(key)
    getAllKeys = () => Array.from(this.data.keys())
    clearAll = () => this.data.clear()
    addOnValueChangedListener = () => ({ remove: () => {} })
}

export const MMKV = MMKVMock
export default { MMKV: MMKVMock }

/** A v4 da MMKV expõe `createMMKV`, que é o que o `src/store` usa. */
export const createMMKV = () => new MMKVMock()
