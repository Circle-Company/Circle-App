import { Action, State, initialState, reducer } from "./reducer"
import { PersistedSession } from "./schema"
import { readSession, writeSession } from "./storage"

/**
 * O store da sessão. Ver `docs/session-management.md` §5.4.
 *
 * A propriedade que importa: **a persistência é síncrona ao dispatch, não ao render.**
 * Grava antes de notificar os listeners, então nenhum componente chega a ver um estado que
 * ainda não está em disco. Com MMKV isso é uma chamada síncrona barata — é a vantagem
 * concreta sobre o `AsyncStorage`, que precisa agendar a escrita e conviver com a janela
 * até ela concluir.
 */

type Listener = (state: State) => void

export class SessionStore {
    private state: State
    private listeners = new Set<Listener>()

    constructor(
        session: PersistedSession = readSession(),
        private readonly persist: (session: PersistedSession) => void = writeSession,
    ) {
        this.state = initialState(session)
    }

    getState(): State {
        return this.state
    }

    getSession(): PersistedSession {
        return this.state.session
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    dispatch(action: Action): State {
        const next = reducer(this.state, action)

        // Ação que não mudou nada (o guard de identidade rejeitou, por exemplo) não
        // notifica ninguém nem escreve no disco.
        if (next === this.state) return this.state

        this.state = next

        if (next.needsPersist) {
            this.persist(next.session)
            // Limpo aqui, e não no reducer, para que o reducer continue puro.
            this.state = { ...next, needsPersist: false }
        }

        this.notify()
        return this.state
    }

    private notify(): void {
        // Um listener que lança não pode impedir os outros de receber — nem deixar o store
        // num estado meio notificado.
        for (const listener of Array.from(this.listeners)) {
            try {
                listener(this.state)
            } catch (error) {
                console.warn("Listener de sessão lançou; ignorado", error)
            }
        }
    }
}
