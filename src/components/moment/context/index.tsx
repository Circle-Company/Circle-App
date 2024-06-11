import React from "react"
import { MomentContextsData, MomentProviderProps } from './types'
import sizes from "../../../layout/constants/sizes"
import { useMomentUserActions } from "./momentUserActions"
import { useMomentData } from "./momentData"
import { useMomentOptions } from "./momentOptions"
import PersistedContext from "../../../contexts/Persisted"

const MomentContext = React.createContext<MomentContextsData>({} as MomentContextsData)

export function MomentProvider({
    children,
    isFeed,
    isFocused,
    momentData,
    momentSize = sizes.moment.standart
}: MomentProviderProps) {

    const { session } = React.useContext(PersistedContext)
    const momentDataStore = useMomentData()
    const momentUserActionsStore = useMomentUserActions()
    const momentOptionsStore = useMomentOptions()

    const isMe = momentData.user?.id? session.user.id == momentData.user.id? true : false : true

    React.useEffect(() => { momentDataStore.setMomentData(momentData) }, [momentData])
    React.useEffect(() => {
        momentUserActionsStore.setMomentUserActions({
            liked: false,
            shared: false,
            viewed: false,
            clickIntoMoment: false,
            watchTime: 0,
            clickProfile: false,
            commented: false,
            likeComment: false,
            skipped: false,
            showLessOften: false,
            reported: false
        })
        momentOptionsStore.setMomentOptions({
            isFeed: isFeed,
            isFocused: isFocused,
            enableAnalyticsView: isMe,
            enableModeration: true,
            enableStoreActions: isMe,
            enableTranslation: true
        })
    }, [])

    const contextValue: any = {
        momentOptions: momentOptionsStore,
        momentSize: momentSize,
        momentData: momentDataStore,
        momentUserActions: momentUserActionsStore
    }

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>
}
export default MomentContext