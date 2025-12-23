import { PermissionsAndroid, Platform } from "react-native"
import UploadIcon from "@/assets/icons/svgs/arrow_up.svg"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import { MemoryObjectProps } from "@/components//memory/memory-types"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import * as FileSystem from "expo-file-system"
import { useToast } from "./Toast"
import { colors } from "../constants/colors"
import api from "../services/Api"
import PersistedContext from "./Persisted"
import LanguageContext from "./Preferences/language"

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
    tags: TagProps[]
    description: string
    selectedMemory: MemoryObjectProps
    setSelectedVideo: React.Dispatch<React.SetStateAction<Video>>
    setDescription: React.Dispatch<React.SetStateAction<string>>
    requestPermission: () => Promise<boolean>
    endSession: () => void
}

const NewMomentContext = React.createContext<NewMomentContextsData>({} as NewMomentContextsData)

export function Provider({ children }: NewMomentProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [selectedImage, setSelectedImage] = React.useState<any>()
    const [selectedVideo, setSelectedVideo] = React.useState<Video>()
    const [description, setDescription] = React.useState<string>("")
    const [tags, setTags] = React.useState<TagProps[]>([])
    const [allMemories, setAllMemories] = React.useState<MemoryObjectProps[]>([])
    const [selectedMemory, setSelectedMemory] = React.useState<MemoryObjectProps | null>()
    const [createdMoment, setCreatedMoment] = React.useState<any>({})
    const navigation = useNavigation()
    const toast = useToast()

    async function requestPermission() {
        try {
            if (Platform.OS === "android") {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]

                const granted = await PermissionsAndroid.requestMultiple(permissions)

                if (
                    granted["android.permission.CAMERA"] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
                        PermissionsAndroid.RESULTS.GRANTED &&
                    granted["android.permission.READ_EXTERNAL_STORAGE"] ===
                        PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log("Permissões concedidas")
                } else {
                    console.log("Permissões negadas")
                }
            }
        } catch (err) {
            console.warn(err)
        }
    }

    async function uploadMoment() {
        if (selectedImage) {
            const IMG = selectedImage.assets[0]
            const imageBase64 = await FileSystem.readAsStringAsync(IMG.uri, {
                encoding: "base64",
            })
            await api
                .post(
                    "/moment/create",
                    {
                        user_id: session.user.id,
                        moment: {
                            description: description ? description : null,
                            midia: {
                                content_type: "IMAGE",
                                base64: imageBase64,
                            },
                            metadata: {
                                duration: IMG.duration,
                                file_name: IMG.fileName,
                                file_size: IMG.fileSize,
                                file_type: IMG.type,
                                resolution_width: IMG.width,
                                resolution_height: IMG.height,
                            },
                            tags,
                        },
                    },
                    { headers: { Authorization: session.account.jwtToken } },
                )
                .then(function (response) {
                    setCreatedMoment(response.data)
                    toast.success(t("Moment Has been uploaded with success"), {
                        title: t("Moment Created"),
                        icon: (
                            <UploadIcon
                                fill={colors.green.green_05.toString()}
                                width={15}
                                height={15}
                            />
                        ),
                    })
                    setTags([])
                    setDescription("")
                    setSelectedMemory(null)
                })
                .catch(function (error) {
                    console.log(error)
                })
        } else if (selectedVideo) {
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
                                tags,
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
                        setTags([])
                        setDescription("")
                        setSelectedMemory(null)
                        setSelectedVideo(undefined)
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            } catch (error) {
                console.log("Erro ao fazer upload do vídeo:", error)
            }
        }
    }

    async function addToMemory() {
        if (createdMoment) {
            await api
                .post(
                    "/memory/add-moment",
                    {
                        memory_id: selectedMemory?.id,
                        moments_list: [{ id: createdMoment.id }],
                    },
                    { headers: { Authorization: session.account.jwtToken } },
                )
                .then(function (response) {
                    setTags([])
                    setDescription("")
                    setSelectedMemory(null)
                    toast.success(t("Memory Has been created with success"), {
                        title: t("Memory Created"),
                        icon: (
                            <CheckIcon
                                fill={colors.green.green_05.toString()}
                                width={15}
                                height={15}
                            />
                        ),
                    })
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    function endSession() {
        navigation.navigate("BottomTab", { screen: "Home" })
        setDescription("")
        setSelectedImage(undefined)
        setSelectedVideo(undefined)
        setTags([])
    }

    const contextValue: any = {
        description,
        tags,
        selectedImage,
        selectedVideo,
        allMemories,
        selectedMemory,
        setSelectedMemory,
        uploadMoment,
        setSelectedImage,
        setSelectedVideo,
        addToMemory,
        setDescription,
        endSession,
    }

    return <NewMomentContext.Provider value={contextValue}>{children}</NewMomentContext.Provider>
}
export default NewMomentContext
