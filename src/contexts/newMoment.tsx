import { useNavigation } from "@react-navigation/native"
import React from "react"
import { PermissionsAndroid, Platform } from "react-native"
import RNFS from "react-native-fs"
import { ImagePickerResponse, launchImageLibrary } from "react-native-image-picker"
import { useNotifications } from "react-native-notificated"
import UploadIcon from "../assets/icons/svgs/arrow_up.svg"
import CheckIcon from "../assets/icons/svgs/check_circle.svg"
import { MemoryObjectProps } from "../components/memory/memory-types"
import { colors } from "../layout/constants/colors"
import api from "../services/Api"
import PersistedContext from "./Persisted"
import LanguageContext from "./Preferences/language"

type NewMomentProviderProps = {
    children: React.ReactNode
}

export type TagProps = {
    title: string
}

type Image = {
    uri: string
}
export type NewMomentContextsData = {
    uploadMoment: () => Promise<void>
    tags: TagProps[]
    description: string
    selectedImage: Image
    allMemories: MemoryObjectProps[]
    selectedMemory: MemoryObjectProps
    setSelectedImage: React.Dispatch<React.SetStateAction<ImagePickerResponse>>
    setDescription: React.Dispatch<React.SetStateAction<string>>
    setSelectedMemory: React.Dispatch<React.SetStateAction<MemoryObjectProps>>
    addTag: (tag: TagProps) => void
    removeTag: (index: number) => void
    requestPermission: () => Promise<boolean>
    handleLaunchImageLibrary: () => Promise<void>
    getAllMemories: () => Promise<void>
    handleImagePickerResponse: () => Promise<void>
    addToMemory: () => Promise<Object>
    endSession: () => void
}

const NewMomentContext = React.createContext<NewMomentContextsData>({} as NewMomentContextsData)

export function Provider({ children }: NewMomentProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const [selectedImage, setSelectedImage] = React.useState<any>()
    const [description, setDescription] = React.useState<string>("")
    const [tags, setTags] = React.useState<TagProps[]>([])
    const [allMemories, setAllMemories] = React.useState<MemoryObjectProps[]>([])
    const [selectedMemory, setSelectedMemory] = React.useState<MemoryObjectProps | null>()
    const [createdMoment, setCreatedMoment] = React.useState<any>({})
    const navigation = useNavigation()
    const { notify } = useNotifications()

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
            const imageBase64 = await RNFS.readFile(IMG.uri, "base64")
            await api
                .post(
                    `/moment/create`,
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
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .then(function (response) {
                    setCreatedMoment(response.data)
                    notify("toast", {
                        params: {
                            description: t("Moment Has been uploaded with success"),
                            title: t("Moment Created"),
                            icon: (
                                <UploadIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                    setTags([])
                    setDescription("")
                    setSelectedMemory(null)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    async function addToMemory() {
        if (createdMoment) {
            await api
                .post(
                    `/memory/add-moment`,
                    {
                        memory_id: selectedMemory?.id,
                        moments_list: [{ id: createdMoment.id }],
                    },
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .then(function (response) {
                    setTags([])
                    setDescription("")
                    setSelectedMemory(null)
                    notify("toast", {
                        params: {
                            description: t("Memory Has been created with success"),
                            title: t("Memory Created"),
                            icon: (
                                <CheckIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    async function handleLaunchImageLibrary() {
        requestPermission().then(() => {
            launchImageLibrary(
                {
                    mediaType: "photo",
                    selectionLimit: 1,
                },
                handleImagePickerResponse
            )
        })
    }

    const handleImagePickerResponse = async (response: ImagePickerResponse) => {
        if (response.didCancel) {
            console.log("User cancelled image picker")
        } else if (response.errorCode) {
            console.log("ImagePicker Error: ", response.errorMessage)
        } else {
            try {
                // const convertedBase64 = await HEICtoJPEG(response.assets[0].base64)
                setSelectedImage(response)
                console.log("selectedimage --------------------", selectedImage)
            } catch (error) {
                console.log("Error converting HEIC to JPEG:", error)
            }
        }
    }

    function addTag(tag: TagProps) {
        setTags([...tags, tag])
    }

    function removeTag(index: number) {
        setTags(tags.filter((_, i) => i !== index))
    }

    async function getAllMemories() {
        try {
            const response = await api
                .post(
                    `memory/get-user-memories`,
                    { user_id: session.user.id },
                    { headers: { Authorization: session.account.jwtToken } }
                )
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    console.log(error)
                })
            await setAllMemories(response.memories)
            await setSelectedMemory(response.memories[0])
        } catch (err) {
            console.error(err)
        }
    }

    function endSession() {
        navigation.navigate("BottomTab", { screen: "Home" })
        setDescription("")
        setSelectedImage(undefined)
        setTags([])
    }

    const contextValue: any = {
        description,
        tags,
        selectedImage,
        allMemories,
        selectedMemory,
        setSelectedMemory,
        uploadMoment,
        setSelectedImage,
        addTag,
        removeTag,
        addToMemory,
        setDescription,
        requestPermission,
        handleLaunchImageLibrary,
        handleImagePickerResponse,
        getAllMemories,
        endSession,
    }

    return <NewMomentContext.Provider value={contextValue}>{children}</NewMomentContext.Provider>
}
export default NewMomentContext
