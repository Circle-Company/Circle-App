import { router } from "expo-router"
import React from "react"

type NewMomentProviderProps = {
    children: React.ReactNode
}

export type TagProps = {
    title: string
}

export type Video = {
    uri: string
    duration?: number
    fileSize?: number
    type?: string
}

/**
 * O `contextValue` era tipado como `any`, e isso escondia duas divergências entre o
 * contrato e o que o provider entrega:
 *
 * - `requestPermission` estava declarado, **nunca implementado e nunca consumido**. Um
 *   membro fantasma é pior que um ausente: quem confiasse nele receberia `undefined` e
 *   quebraria ao chamar. Removido.
 * - `selectedVideo` é entregue mas não estava no tipo, então ninguém o via daqui.
 *
 * `selectedVideo` é opcional porque o estado nasce vazio — só existe depois da gravação.
 */
export type NewMomentContextsData = {
    uploadMoment: () => Promise<void>
    selectedVideo: Video | undefined
    setSelectedVideo: React.Dispatch<React.SetStateAction<Video | undefined>>
    endSession: () => void
}

const NewMomentContext = React.createContext<NewMomentContextsData>({} as NewMomentContextsData)

export function Provider({ children }: NewMomentProviderProps) {
    const [selectedVideo, setSelectedVideo] = React.useState<Video>()

    /**
     * ⚠️ **Não implementada, e nunca chamada.**
     *
     * O corpo original lia o vídeo com `RNFS.readFile` e fazia `POST /moment/create`. Só que
     * `RNFS` é um identificador indefinido — `react-native-fs` não está no `package.json` —
     * então a primeira linha lançava `ReferenceError` em qualquer execução. E nenhuma tela
     * consome `uploadMoment`: quem publica um momento hoje é `modules/camera`
     * (`hooks/shareMoment.ts`), por outro endpoint.
     *
     * Não portei para `expo-file-system` (que **está** instalado) de propósito: seria
     * inventar comportamento a partir de código que nunca rodou, e a API mudou no SDK 56. A
     * decisão — portar ou apagar o fluxo — é de produto, não de tipo. O que mudou aqui é só
     * a honestidade da falha: em vez de um `ReferenceError` obscuro, uma mensagem que diz o
     * que falta e para onde ir. O `POST` morto saiu junto; está no histórico do git.
     */
    async function uploadMoment(): Promise<void> {
        throw new Error(
            "uploadMoment não está implementado: dependia de react-native-fs, que não está " +
                "instalado. Para publicar um momento, use o fluxo da câmera (modules/camera).",
        )
    }

    function endSession() {
        // "BottomTab"/"Home" eram nomes de uma navegação que este app não usa mais; a rota
        // real do expo-router é a aba de momentos.
        router.replace("/(tabs)/moments")
        setSelectedVideo(undefined)
    }

    const contextValue = React.useMemo(
        () => ({
            selectedVideo,
            uploadMoment,
            setSelectedVideo,
            endSession,
        }),
        [selectedVideo],
    )

    return <NewMomentContext.Provider value={contextValue}>{children}</NewMomentContext.Provider>
}
export default NewMomentContext
