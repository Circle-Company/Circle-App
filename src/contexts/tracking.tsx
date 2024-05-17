import React from "react"
import { getTrackingStatus, requestTrackingPermission, TrackingStatus} from 'react-native-tracking-transparency'
import { Mixpanel, MixpanelType} from "mixpanel-react-native"
import getDeviceInfo from "../services/deviceInfo"
import AuthContext from "./auth";
type TrackingProviderProps = { children: React.ReactNode }
export type TrackingContextsData = {
    mixpanel: MixpanelType,
}

const TrackingContext = React.createContext<TrackingContextsData>({} as TrackingContextsData)

export function TrackingProvider({children}: TrackingProviderProps) {
    const { user } = React.useContext(AuthContext)

    const trackAutomaticEvents = false;
    const mixpanel = new Mixpanel("Your Token", trackAutomaticEvents);
    mixpanel.init(true);

    const contextValue: any = { mixpanel }

    return (
        <TrackingContext.Provider value={contextValue}>
            {children}
        </TrackingContext.Provider>
    )
}
export default TrackingContext