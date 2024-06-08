import React from "react"
import api from "../../../services/api"
import AuthContext from "../../../contexts/auth"
import { MomentContextsData, MomentProviderProps } from './types'
import sizes from "../../../layout/constants/sizes"
import { useMomentUserActions } from "./momentUserActions"
import { useMomentData } from "./momentData"
import MomentOptionsClass from "./momentOptions"
import PersistedContext from "../../../contexts/Persisted"
import { use } from "i18next"

const MomentContext = React.createContext<MomentContextsData>({} as MomentContextsData)

export function MomentProvider({
    children,
    isFeed,
    isFocused,
    momentData,
    momentSize = sizes.moment.standart
}: MomentProviderProps) {

    const { session } = React.useContext(PersistedContext)
    const [ comment, setComment ] = React.useState<string>('')

    const momentDataStore = useMomentData()
    const momentUserActionsStore = useMomentUserActions()

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
    }, [])

    async function sendComment() {

    }

    async function sendUserInteraction() {

    }

    const contextValue: any = {
        momentOptions: new MomentOptionsClass({
            enableAnalyticsView: true,
            enableStoreActions: true,
            enableTranslation: true,
            enableModeration: true,
            isFeed: isFeed,
            isFocused: isFocused
        }),
        momentFunctions: {
            sendComment,
            setComment,
            sendUserInteraction
        },
        momentSize: momentSize,
        momentData: momentDataStore,
        momentUserActions: momentUserActionsStore
    }

    return <MomentContext.Provider value={contextValue}>{children}</MomentContext.Provider>
}
export default MomentContext