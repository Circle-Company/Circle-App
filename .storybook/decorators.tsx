import React from "react"
import { View } from "react-native"

import LanguageContext from "@/contexts/language"
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
const fakeSession: any = {
    account: { userId: STORYBOOK_USER_ID, hiddenMoments: [] },
    user: { id: STORYBOOK_USER_ID, username: "voce", name: "Você" },
    preferences: { content: { muteAudio: false } },
}

const fakePersisted: any = { session: fakeSession }

/** `t` identidade: a story mostra a chave quando falta tradução, e isso é útil. */
const fakeLanguage: any = {
    t: (key: string) => key,
    languagesList: [],
    languageResources: {},
    atualAppLanguage: { code: "pt", name: "Português" },
    changeAppLanguage: async () => {},
}

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
