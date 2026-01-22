import UploadIcon from "@/assets/icons/svgs/arrow_up.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { useToast } from "./Toast"
import { colors } from "../constants/colors"
import api from "@/api"
import PersistedContext from "./Persisted"
import LanguageContext from "./language"

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

export type NewMomentContextsData = {
    uploadMoment: () => Promise<void>
    description: string
    setSelectedVideo: React.Dispatch<React.SetStateAction<Video>>
    setDescription: React.Dispatch<React.SetStateAction<string>>
    requestPermission: () => Promise<boolean>
    endSession: () => void
}

const NewMomentContext = React.createContext<NewMomentContextsData>({} as NewMomentContextsData)

export function Provider({ children }: NewMomentProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [selectedVideo, setSelectedVideo] = React.useState<Video>()
    const [description, setDescription] = React.useState<string>("")
    const [createdMoment, setCreatedMoment] = React.useState<any>({})
    const navigation = useNavigation()
    const toast = useToast()

    async function uploadMoment() {
        try {
            const videoBase64 = await RNFS.readFile(selectedVideo.uri, "base64")
            await api
                .post(
                    "/moment/create",
                    {
                        user_id: session.user.id,
                        moment: {
                            description: description ? description : null,
                            midia: {
                                content_type: "VIDEO",
                                base64: videoBase64,
                            },
                            metadata: {
                                duration: selectedVideo.duration,
                                file_size: selectedVideo.fileSize,
                                file_type: selectedVideo.type,
                            },
                        },
                    },
                    { headers: { Authorization: session.account.jwtToken } },
                )
                .then(function (response) {
                    setCreatedMoment(response.data)
                    toast.success(t("Vídeo enviado com sucesso"), {
                        title: t("Momento Criado"),
                        icon: (
                            <UploadIcon
                                fill={colors.green.green_05.toString()}
                                width={15}
                                height={15}
                            />
                        ),
                    })
                    setDescription("")
                    setSelectedVideo(undefined)
                })
                .catch(function (error) {
                    console.log(error)
                })
        } catch (error) {
            console.log("Erro ao fazer upload do vídeo:", error)
        }
    }

    function endSession() {
        navigation.navigate("BottomTab", { screen: "Home" })
        setDescription("")
        setSelectedVideo(undefined)
    }

    const contextValue: any = {
        description,
        selectedVideo,
        uploadMoment,
        setSelectedVideo,
        setDescription,
        endSession,
    }

    return <NewMomentContext.Provider value={contextValue}>{children}</NewMomentContext.Provider>
}
export default NewMomentContext
