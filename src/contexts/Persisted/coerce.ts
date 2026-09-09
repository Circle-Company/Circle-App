/**
 * Normalização compartilhada pelas três stores persistidas.
 *
 * Escalares e coleções viviam em dois arquivos (`coerce.ts` e `helpers.ts`) com a mesma
 * razão de existir e os mesmos chamadores — a divisão só obrigava `account/` a importar de
 * dois lugares para fazer uma coisa só. Estão juntos, em duas seções.
 *
 * A regra que tudo aqui segue: **entrada com o tipo errado vira o vazio, nunca `undefined`,
 * `NaN` ou exceção.** O estado de uma store não pode ter buraco — senão cada leitor
 * precisa se defender sozinho, e é aí que nasce o `?? ""` espalhado pela UI. Do outro
 * lado, o storage é dado de disco que sobreviveu a versões antigas do app: tratá-lo como
 * confiável é como o cold start quebra.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Escalares
//
// Estavam duplicados em `account/state.ts`, `metrics/state.ts` e `preferences/state.ts`
// com divergências entre as cópias, que é como esse tipo de duplicação sempre termina:
// a de `preferences` aceitava fallback, a de `account` não.
// ─────────────────────────────────────────────────────────────────────────────

export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

export const asString = (value: unknown, fallback = ""): string =>
    typeof value === "string" && value.length > 0 ? value : fallback

export const asNumber = (value: unknown, fallback = 0): number =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback

/** `true` só quando gravado como `true`. Ausente vira `false` — o padrão de todo `disable*`
 * e de toda flag: a experiência completa é o default, e desligar é escolha explícita. */
export const asBoolean = (value: unknown): boolean => value === true

// ─────────────────────────────────────────────────────────────────────────────
// Coleções
//
// O mesmo `Array.from(new Set(...map(String)))` estava reescrito em seis ações de
// `persist.account.ts`, cada uma com uma variação sutil. Concentrar aqui é o que permite
// que o teto do §2.5 seja aplicado em **um** lugar, e não esquecido na sétima ação.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tetos das coleções persistidas (`docs/session-management.md` §2.5).
 *
 * O motivo não é economia de disco: essas listas são parseadas no caminho crítico do cold
 * start, e sem teto crescem para sempre — cada like adiciona um id que nunca sai. O app
 * ficaria mais lento quanto mais o usuário o usasse.
 *
 * `hidden` não aparece aqui **de propósito**: esconder um momento é intenção explícita do
 * usuário, e descartar a entrada mais antiga por teto ressuscitaria na tela um conteúdo
 * que ele mandou sumir.
 */
export const COLLECTION_LIMITS = {
    liked: 5000,
    readNotifications: 1000,
    moments: 200,
} as const

/**
 * Mantém os `max` itens mais **recentes**. As coleções são apendadas no fim, então o
 * começo da lista é o que há de mais antigo — e é o que sai.
 *
 * Devolve o mesmo array quando não há nada a descartar, para o chamador poder pular a
 * escrita no storage comparando referência.
 */
export function capList<T>(list: T[], max: number): T[] {
    if (max <= 0) return []
    if (list.length <= max) return list
    return list.slice(list.length - max)
}

/** Converte qualquer coisa numa lista de ids em string, sem repetição e preservando ordem. */
export function normalizeIds(value: unknown): string[] {
    if (!Array.isArray(value)) return []

    const seen = new Set<string>()
    const result: string[] = []
    for (const item of value) {
        // `null`/`undefined` viram "null"/"undefined" no `String()` e poluiriam a lista.
        if (item === null || item === undefined) continue
        const id = String(item)
        if (id.length === 0 || seen.has(id)) continue
        seen.add(id)
        result.push(id)
    }
    return result
}

/** Lê uma chave que guarda `JSON string[]`. Storage corrompido nunca derruba o cold start. */
export function parseIdList(json: string | null | undefined): string[] {
    if (!json) return []
    try {
        return normalizeIds(JSON.parse(json))
    } catch {
        return []
    }
}

/** Lê uma chave que guarda `JSON T[]` de objetos (os momentos do account). */
export function parseObjectList<T>(json: string | null | undefined): T[] {
    if (!json) return []
    try {
        const parsed = JSON.parse(json)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((item): item is T => isObject(item))
    } catch {
        return []
    }
}

/**
 * Acrescenta um id no fim, sem duplicar. Devolve a **mesma referência** quando o id já
 * estava lá: é o que permite `addLikedMoment` não escrever no MMKV a cada toque repetido.
 */
export function appendUnique(list: string[], id: string): string[] {
    const sid = String(id)
    if (list.includes(sid)) return list
    return [...list, sid]
}

/** Idem, para um lote (o inbox marca várias notificações como lidas de uma vez). */
export function mergeUnique(list: string[], ids: readonly string[]): string[] {
    const merged = normalizeIds([...list, ...ids])
    return merged.length === list.length ? list : merged
}

/** Remove um id. Devolve a mesma referência quando ele não estava na lista. */
export function removeId(list: string[], id: string): string[] {
    const sid = String(id)
    if (!list.includes(sid)) return list
    return list.filter((item) => item !== sid)
}
