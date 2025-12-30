import WifiIcon from "@/assets/icons/svgs/wifi.svg"
import WifiSlashIcon from "@/assets/icons/svgs/wifi_slash.svg"
import NetInfo from "@react-native-community/netinfo"
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useToast } from "./Toast"
import { colors } from "../constants/colors"
import LanguageContext from "./language"

type NetworkProviderProps = { children: ReactNode }

export type NetworkContextData = {
    networkStats: "ONLINE" | "OFFLINE" | "RECONNECTING"
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData)

export function Provider({ children }: NetworkProviderProps) {
    const [networkStatus, setNetworkStatus] = useState<"ONLINE" | "OFFLINE" | "RECONNECTING">(
        "ONLINE",
    )
    const [isConnected, setIsConnected] = useState<boolean | null>(null)
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)
    const [appStarted, setAppStarted] = useState<boolean>(true)
    const { t } = useContext(LanguageContext)
    const toast = useToast()

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
                    toast.show({
                        title: t("You are Offline"),
                        type: "error",
                        duration: 1000,
                        position: "top",
                        backgroundColor: colors.red.red_05,
                        icon: (
                            <WifiSlashIcon
                                fill={colors.gray.white.toString()}
                                width={12}
                                height={12}
                            />
                        ),
                    })
                    setNetworkStatus("OFFLINE")
                } else if (currentState === true && previousState === false) {
                    // Se reconectou, exibe "Online"
                    toast.show({
                        title: t("Connected to Internet"),
                        type: "success",
                        duration: 1000,
                        position: "top",
                        backgroundColor: colors.green.green_05,
                        icon: (
                            <WifiIcon fill={colors.gray.white.toString()} width={12} height={12} />
                        ),
                    })
                    setNetworkStatus("ONLINE")
                }
            }

            if (previousIsInternetReachable !== currentIsInternetReachable) {
                if (currentIsInternetReachable === true && previousIsInternetReachable === false) {
                    // Exibe "Reconnecting" apenas se houver mudança no estado de alcançabilidade da Internet
                    toast.show({
                        title: t("Reconnecting..."),
                        type: "warning",
                        duration: 1000,
                        position: "top",
                        backgroundColor: colors.yellow.yellow_05,
                        icon: (
                            <WifiSlashIcon
                                fill={colors.gray.white.toString()}
                                width={12}
                                height={12}
                            />
                        ),
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
