import React from "react"
import { getTrackingStatus, requestTrackingPermission, TrackingStatus} from 'react-native-tracking-transparency'
import { Mixpanel, MixpanelType} from "mixpanel-react-native"
import getDeviceInfo from "../services/deviceInfo"
import AuthContext from "./auth"
import config from "../config"
import { UserDataReturnsType } from "./Persisted/types"

type trackSignProps = {
    user: UserDataReturnsType,
    signType: 'SIGN-IN' | 'SIGN-UP' | 'SIGN-OUT'
}
type TrackingProviderProps = { children: React.ReactNode }
export type TrackingContextsData = {
    mixpanel: MixpanelType
    trackSign: ({user, signType}: trackSignProps) => void
}



const TrackingContext = React.createContext<TrackingContextsData>({} as TrackingContextsData)

export function Provider({children}: TrackingProviderProps) {
    const { sessionData } = React.useContext(AuthContext)

    const trackAutomaticEvents = false
    const mixpanel = new Mixpanel(config.MIXPANEL_KEY, trackAutomaticEvents);
    mixpanel.init() 

    React.useEffect(() => {
        if(sessionData.user){
            mixpanel.identify(sessionData.user.id.toString())
            mixpanel.getPeople().set({
                "username": sessionData.user.username,
                "name": sessionData.user.name,
                "verification": sessionData.user.verifyed
            })
        }
    }, [])


    function trackSign({user, signType}: trackSignProps){
        if(signType == 'SIGN-IN') mixpanel.track('Sign In', { platform: 'mobile' })
        if(signType == 'SIGN-UP') mixpanel.track('Sign Up', { platform: 'mobile' })
        if(signType == 'SIGN-OUT') mixpanel.track('Sign Out', { platform: 'mobile' })
    }

    const contextValue: TrackingContextsData = {
        mixpanel,
        trackSign
    }

    return (
        <TrackingContext.Provider value={contextValue}>
            {children}
        </TrackingContext.Provider>
    )
}
export default TrackingContext