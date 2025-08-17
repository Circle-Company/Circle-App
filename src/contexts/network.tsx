import NetInfo from "@react-native-community/netinfo"
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { notify } from "react-native-notificated"
import WifiIcon from "../assets/icons/svgs/wifi.svg"
import WifiSlashIcon from "../assets/icons/svgs/wifi_slash.svg"
import { colors } from "../layout/constants/colors"
import LanguageContext from "./Preferences/language"

type NetworkProviderProps = { children: ReactNode }

export type NetworkContextData = {
    networkStats: "ONLINE" | "OFFLINE" | "RECONNECTING"
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData)

export function Provider({ children }: NetworkProviderProps) {
    const [networkStatus, setNetworkStatus] = useState<"ONLINE" | "OFFLINE" | "RECONNECTING">(
        "ONLINE"
    )
    const [isConnected, setIsConnected] = useState<boolean | null>(null)
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)
    const [appStarted, setAppStarted] = useState<boolean>(true)
    const { t } = useContext(LanguageContext)

    useEffect(() => {
        let previousState = isConnected
        const previousIsInternetReachable = isInternetReachable

        const unsubscribe = NetInfo.addEventListener((state) => {
            const currentState = state.isConnected
            const currentIsInternetReachable = state.isInternetReachable

            // Exibir apenas o último estado de conexão
            if (previousState !== currentState) {
                if (currentState === false) {
                    // Se desconectou, exibe "Offline"
                    notify("tiny", {
                        params: {
                            title: t("You are Offline"),
                            backgroundColor: colors.red.red_05,
                            titleColor: colors.gray.white,
                            icon: (
                                <WifiSlashIcon
                                    fill={colors.gray.white.toString()}
                                    width={12}
                                    height={12}
                                />
                            ),
                        },
                    })
                    setNetworkStatus("OFFLINE")
                } else if (currentState === true && previousState === false) {
                    // Se reconectou, exibe "Online"
                    notify("tiny", {
                        params: {
                            title: t("Connected to Internet"),
                            backgroundColor: colors.green.green_05,
                            titleColor: colors.gray.white,
                            icon: (
                                <WifiIcon
                                    fill={colors.gray.white.toString()}
                                    width={12}
                                    height={12}
                                />
                            ),
                        },
                    })
                    setNetworkStatus("ONLINE")
                }
            }

            if (previousIsInternetReachable !== currentIsInternetReachable) {
                if (currentIsInternetReachable === true && previousIsInternetReachable === false) {
                    // Exibe "Reconnecting" apenas se houver mudança no estado de alcançabilidade da Internet
                    notify("tiny", {
                        params: {
                            title: t("Reconnecting..."),
                            backgroundColor: colors.yellow.yellow_05,
                            titleColor: colors.gray.white,
                            icon: (
                                <WifiSlashIcon
                                    fill={colors.gray.white.toString()}
                                    width={12}
                                    height={12}
                                />
                            ),
                        },
                    })
                    setNetworkStatus("RECONNECTING")
                }
            }

            previousState = currentState
            setIsConnected(currentState)
            if (appStarted) setAppStarted(false)
        })

        return () => {
            unsubscribe()
        }
    }, [isConnected])

    return (
        <NetworkContext.Provider value={{ networkStats: networkStatus }}>
            {children}
        </NetworkContext.Provider>
    )
}

export default NetworkContext
