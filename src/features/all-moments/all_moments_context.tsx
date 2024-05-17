import React from "react"
import api from "../../services/api"
import AuthContext from "../../contexts/auth"
import {useNavigation} from '@react-navigation/native'
import TouchID from 'react-native-simple-biometrics'

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
    const { user } = React.useContext(AuthContext)
    const [selectedMoments, setSelectedMoments] = React.useState<Moment[]>([])

    async function deleteMoments (memory_id: number) {
        try{
            const isAuthenticated = await TouchID.requestBioAuth("make sure it's you", `You're deleting the selected Moments`)
            if (isAuthenticated) {
                const filtered_moments = selectedMoments.map((item) => {return {id: item.id}})
                console.log('store_moments: ', memory_id, filtered_moments)
                await api.post(`/memory/add-moment`, { memory_id, moments_list: [...filtered_moments] })
                .then(function (response) { return response.data })
                .catch(function (error) { console.log(error)})   
                setSelectedMoments([])
                useNavigation().goBack()                
            } else {
                setSelectedMoments([])
                useNavigation().goBack() 
            }
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