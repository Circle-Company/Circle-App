import { Mixpanel, MixpanelType } from "mixpanel-react-native"
import React from "react"
import config from "../config"
import AuthContext from "./Auth"
import PersistedContext from "./Persisted"
import { UserDataReturnsType } from "./Persisted/types"

type trackSignProps = {
    user: UserDataReturnsType
    signType: "SIGN-IN" | "SIGN-UP" | "SIGN-OUT"
}
type TrackingProviderProps = { children: React.ReactNode }
export type TrackingContextsData = {
    mixpanel: MixpanelType
    trackSign: ({ user, signType }: trackSignProps) => void
}

const TrackingContext = React.createContext<TrackingContextsData>({} as TrackingContextsData)

export function Provider({ children }: TrackingProviderProps) {
    const { sessionData } = React.useContext(AuthContext)
    const { session } = React.useContext(PersistedContext)

    const trackAutomaticEvents = false
    const mixpanel = new Mixpanel(config.MIXPANEL_KEY, trackAutomaticEvents)
    mixpanel.init()

    React.useEffect(() => {
        if (session.user) {
            mixpanel.identify(session.user.id.toString())
            mixpanel.getPeople().set({
                username: session.user.username,
                name: session.user.name,
            })
        }
    }, [session.user])

    function trackSign({ signType }: trackSignProps) {
        if (signType == "SIGN-IN") mixpanel.track("Sign In", { platform: "mobile" })
        if (signType == "SIGN-UP") mixpanel.track("Sign Up", { platform: "mobile" })
        if (signType == "SIGN-OUT") mixpanel.track("Sign Out", { platform: "mobile" })
    }

    const contextValue: TrackingContextsData = {
        mixpanel,
        trackSign,
    }

    return <TrackingContext.Provider value={contextValue}>{children}</TrackingContext.Provider>
}
export default TrackingContext
