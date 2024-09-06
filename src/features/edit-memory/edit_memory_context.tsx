import React from "react"
import { notify } from "react-native-notificated"
import TouchID from "react-native-simple-biometrics"
import CheckIcon from "../../assets/icons/svgs/check_circle.svg"
import ErrorIcon from "../../assets/icons/svgs/exclamationmark_circle.svg"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import MemoryContext from "../../contexts/memory"
import { colors } from "../../layout/constants/colors"
import api from "../../services/Api"

type EditMemoryProviderProps = {
    children: React.ReactNode
}

type Moment = {
    id: number
    midia: {
        fullhd_resolution: string
    }
}

export type EditMemoryContextsData = {
    title: String
    editTitle: () => Promise<void>
    deleteMemory: () => Promise<void>
    addMoments: () => Promise<void>
    setTitle: React.Dispatch<React.SetStateAction<string>>
    putMomentOnList: (moment: Moment) => void
    deleteMomentFromList: (moment: Moment) => void
    selectedMoments: Moment[]
}

const EditMemoryContext = React.createContext<EditMemoryContextsData>({} as EditMemoryContextsData)

export function EditMemoryProvider({ children }: EditMemoryProviderProps) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { memory } = React.useContext(MemoryContext)
    const [title, setTitle] = React.useState(
        memory.title ? memory.title : t("memory title") + "..."
    )
    const [selectedMoments, setSelectedMoments] = React.useState<Moment[]>([])

    function putMomentOnList(moment: Moment) {
        const isMomentAlreadySelected = selectedMoments.some((m: Moment) => m.id === moment.id)
        if (!isMomentAlreadySelected) {
            setSelectedMoments((prevSelectedMoments) => [...prevSelectedMoments, moment])
        }
    }

    function deleteMomentFromList(moment: Moment) {
        if (selectedMoments.length > 0)
            setSelectedMoments((prevSelectedMoments) =>
                prevSelectedMoments.filter((m: Moment) => m.id !== moment.id)
            )
    }

    async function addMoments() {
        const moments_ids_list = selectedMoments.map((i: any) => {
            return { id: i.id }
        })
        try {
            await api
                .post(
                    `/memory/add-moment`,
                    {
                        memory_id: memory.id,
                        moments_list: moments_ids_list,
                    },
                    { headers: { authorization_token: session.account.jwtToken } }
                )
                .then(() => {
                    notify("toast", {
                        params: {
                            description: t("Moments successfully added to memory"),
                            title: t("Moments Added"),
                            icon: (
                                <CheckIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                    setSelectedMoments([])
                })
                .catch(() => {
                    notify("toast", {
                        params: {
                            description: t("We can't add these moments to memory"),
                            title: t("Error"),
                            icon: (
                                <ErrorIcon
                                    fill={colors.red.red_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                })
        } catch (err: any) {
            console.error(err)
        }
    }

    async function editTitle() {
        try {
            await api
                .post(
                    `/memory/edit/title`,
                    {
                        user_id: session.user.id,
                        memory_id: memory.id,
                        title,
                    },
                    { headers: { authorization_token: session.account.jwtToken } }
                )
                .then(() => {
                    notify("toast", {
                        params: {
                            description: t("Memory title edited successfully"),
                            title: t("Title Edited"),
                            icon: (
                                <CheckIcon
                                    fill={colors.green.green_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                })
                .catch(() => {
                    notify("toast", {
                        params: {
                            description: t("We were unable to edit the memory title"),
                            title: t("Error"),
                            icon: (
                                <ErrorIcon
                                    fill={colors.red.red_05.toString()}
                                    width={15}
                                    height={15}
                                />
                            ),
                        },
                    })
                })
        } catch (err: any) {
            console.error(err)
        }
    }

    async function deleteMemory() {
        try {
            const isAuthenticated = await TouchID.requestBioAuth(
                t("Make sure it's you"),
                t("You're deleting this memory")
            )
            if (isAuthenticated) {
                await api
                    .post(
                        `/memory/delete`,
                        {
                            user_id: session.user.id,
                            memory_id: memory.id,
                        },
                        { headers: { authorization_token: session.account.jwtToken } }
                    )
                    .then(() => {
                        notify("toast", {
                            params: {
                                description: t("Memory deleted successfully"),
                                title: t("Memory Deleted"),
                                icon: (
                                    <CheckIcon
                                        fill={colors.green.green_05.toString()}
                                        width={15}
                                        height={15}
                                    />
                                ),
                            },
                        })
                    })
                    .catch(() => {
                        notify("toast", {
                            params: {
                                description: t("We can't delete the memory"),
                                title: t("Error"),
                                icon: (
                                    <ErrorIcon
                                        fill={colors.red.red_05.toString()}
                                        width={15}
                                        height={15}
                                    />
                                ),
                            },
                        })
                    })
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    const contextValue: EditMemoryContextsData = {
        title,
        setTitle,
        deleteMemory,
        editTitle,
        putMomentOnList,
        deleteMomentFromList,
        addMoments,
        selectedMoments,
    }
    return <EditMemoryContext.Provider value={contextValue}>{children}</EditMemoryContext.Provider>
}
export default EditMemoryContext
