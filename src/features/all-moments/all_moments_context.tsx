import React from "react"
import api from "../../services/api"
import TouchID from 'react-native-simple-biometrics'
import LanguageContext from "../../contexts/Preferences/language"
import { colors } from "../../layout/constants/colors"
import { notify } from "react-native-notificated"
import CheckIcon from '../../assets/icons/svgs/check_circle.svg'
import ErrorIcon from '../../assets/icons/svgs/exclamationmark_circle.svg'

type AllMomentsProviderProps = {
    children: React.ReactNode
}

type Moment = {
    id: number
    midia: {
        fullhd_resolution: string
    }
}
export type AllMomentsContextsData = {
    deleteMoments(): Promise<void>
    put_moment_on_list: () => void
    delete_moment_from_list: () => void
    selectedMoments: Moment[]
}

const AllMomentsContext = React.createContext<AllMomentsContextsData>({} as AllMomentsContextsData)

export function AllMomentsProvider({children}: AllMomentsProviderProps) {
    const { t } = React.useContext(LanguageContext)
    const [selectedMoments, setSelectedMoments] = React.useState<Moment[]>([])

    async function deleteMoments() {
        try{
            const isAuthenticated = await TouchID.requestBioAuth(t("Make sure it's you"), t("You're deleting the selected Moments"))
            if (isAuthenticated) {
                const filtered_moments = selectedMoments.map((item) => {return item.id})
                await api.post(`/moment/delete-list`, { moment_ids_list: [...filtered_moments] })
                .then(() => {
                    notify('toast', {
                        params: {
                            description: t('Moments has been deleted with success'),
                            title: t('Moments Deleted'),
                            icon: <CheckIcon fill={colors.green.green_05.toString()} width={15} height={15}/>
                        }
                    }),
                    setSelectedMoments([])
                })
                .catch(() => {
                    notify('toast', {
                        params: {
                            description: t("We can't delete your Moments"),
                            title: t('Error'),
                            icon: <ErrorIcon fill={colors.red.red_05.toString()} width={15} height={15}/>
                        }
                    })
                })                
            } else setSelectedMoments([])
        } catch(err) { console.error(err) } 
    }

    async function putMomentOnList (moment: Moment) {
        const isMomentAlreadySelected = selectedMoments.some((m: Moment) => m.id === moment.id);
        if (!isMomentAlreadySelected) {
            setSelectedMoments(prevSelectedMoments => [...prevSelectedMoments, moment]);
        }
    }

    async function deleteMomentFromList (moment: Moment) {
        if(selectedMoments.length > 0) setSelectedMoments(prevSelectedMoments => prevSelectedMoments.filter((m: Moment) => m.id !== moment.id))
    }

    const contextValue: any = {
        deleteMoments,
        put_moment_on_list: putMomentOnList,
        delete_moment_from_list: deleteMomentFromList,
        selectedMoments: selectedMoments,
        memory_moments: selectedMoments.slice(Math.max(selectedMoments.length - 3, 0)).reverse()
    }
    return (
        <AllMomentsContext.Provider value={contextValue}>
            {children}
        </AllMomentsContext.Provider>
    )
}
export default AllMomentsContext