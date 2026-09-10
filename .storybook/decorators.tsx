import React from "react"
import { View } from "react-native"

import LanguageContext from "@/contexts/language"
import pt from "@/locales/languages/pt.json"
import PersistedContext from "@/contexts/Persisted"

/**
 * Id do "usuário logado" nas stories.
 *
 * O lado da bolha (`isMine`) é derivado no provider comparando o autor com a
 * sessão — não é uma prop. Sem uma sessão fake toda mensagem apareceria como
 * recebida, e metade dos estados ficaria impossível de ver.
 */
export const STORYBOOK_USER_ID = "1"

/**
 * Sessão mínima, só com o que o provider da mensagem lê.
 *
 * Deliberadamente parcial: montar o `PersistedProvider` de verdade puxaria
 * zustand, MMKV e a árvore de queries, e uma story não deveria precisar de nada
 * disso para desenhar uma bolha.
 */
// Os `as never` abaixo são o preço de montar um objeto parcial: os contextos do
// app declaram sessão e idioma inteiros, e completá-los aqui só para desenhar
// uma bolha traria justamente as dependências que a story quer evitar.
const fakeSession = {
    account: { userId: STORYBOOK_USER_ID, hiddenMoments: [] },
    user: { id: STORYBOOK_USER_ID, username: "voce", name: "Você" },
    preferences: { content: { muteAudio: false } },
}

const fakePersisted = { session: fakeSession } as never

/**
 * Traduz pelo `pt.json` de verdade, com a chave como último recurso.
 *
 * Um `t` identidade era mais simples, mas fazia a story mentir: o rodapé
 * mostrava "Read" onde o app mostra "lido", e uma chave sem tradução passaria
 * despercebida justamente por parecer igual a todas as outras.
 */
const fakeLanguage = {
    t: (key: string) => (pt as Record<string, string>)[key] ?? key,
    languagesList: [],
    languageResources: {},
    atualAppLanguage: { code: "pt", name: "Português" },
    changeAppLanguage: async () => {},
} as never

/**
 * Respiro em volta da story.
 *
 * Sem fundo próprio: o `useColorTheme` do app devolve sempre o tema escuro, e
 * pintar o canvas com ele deixava tudo sobre preto. Quem escolhe o fundo passa a
 * ser o Storybook (barra de backgrounds na toolbar), que é onde essa decisão
 * cabe — assim dá para conferir a bolha sobre claro e sobre escuro sem tocar no
 * código.
 */
export function withCanvas(Story: React.ComponentType) {
    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
            <Story />
        </View>
    )
}

export function withAppContexts(Story: React.ComponentType) {
    return (
        <PersistedContext.Provider value={fakePersisted}>
            <LanguageContext.Provider value={fakeLanguage}>
                <Story />
            </LanguageContext.Provider>
        </PersistedContext.Provider>
    )
}
