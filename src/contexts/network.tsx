import WifiIcon from "@/assets/icons/svgs/wifi.svg"
import WifiSlashIcon from "@/assets/icons/svgs/wifi_slash.svg"
import { addNetworkStateListener, getNetworkStateAsync, NetworkStateType } from "expo-network"
import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useToast } from "./Toast"
import { colors } from "../constants/colors"
import LanguageContext from "./language"

type NetworkProviderProps = { children: ReactNode }

/**
 * Describes the shape of the Network context.
 *
 * Example:
 *   import { NetworkContext } from "@/contexts/network"
 *   import React from "react"
 *
 *   function MyComponent() {
 *     const { networkStats } = React.useContext(NetworkContext)
 *     if (networkStats === "OFFLINE") {
 *       // Show an offline banner, disable actions, etc.
 *     }
 *     return null
 *   }
 */
export type NetworkContextData = {
    networkStats: "ONLINE" | "OFFLINE" | "RECONNECTING"
}

/**
 * React context for network status.
 *
 * Example:
 *   import { NetworkContext } from "@/contexts/network"
 *   import React from "react"
 *
 *   export function StatusBadge() {
 *     const { networkStats } = React.useContext(NetworkContext)
 *     return <Text>{networkStats}</Text>
 *   }
 */
export const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData)

/**
 * Network Provider: subscribes to Expo Network state changes and exposes a high-level
 * "networkStats" value ("ONLINE" | "OFFLINE" | "RECONNECTING") via context. Also
 * triggers visual toasts on state transitions.
 *
 * Usage:
 *   import { Provider as NetworkProvider } from "@/contexts/network"
 *
 *   export default function App() {
 *     return (
 *       <NetworkProvider>
 *         <YourApp />
 *       </NetworkProvider>
 *     )
 *   }
 *
 * Consuming:
 *   import { NetworkContext } from "@/contexts/network"
 *   const { networkStats } = React.useContext(NetworkContext)
 */
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
        let previousConnected: boolean | null = isConnected
        let previousReachable: boolean | null = isInternetReachable
        let previousType: any = null
        let isMounted = true

        async function init() {
            try {
                const initial = await getNetworkStateAsync()
                previousConnected = initial.isConnected ?? null
                previousReachable = initial.isInternetReachable ?? null
                previousType = initial.type ?? null
                if (!isMounted) return
                setIsConnected(previousConnected)
                setIsInternetReachable(previousReachable)
                if (appStarted) setAppStarted(false)
            } catch {}
        }
        init()

        let firstEvent = true
        const subscription = addNetworkStateListener((state) => {
            const currentConnected = state.isConnected ?? null
            const currentReachable = state.isInternetReachable ?? null
            const currentType = state.type ?? null

            // Conectividade efetiva: precisa estar conectado e a internet não pode estar explicitamente inalcançável
            const prevEffective = previousConnected === true && previousReachable !== false
            const currEffective = currentConnected === true && currentReachable !== false

            // Ignora o primeiro evento (estado inicial) para evitar toasts indevidos
            if (firstEvent) {
                previousConnected = currentConnected
                previousReachable = currentReachable
                previousType = currentType
                setIsConnected(currentConnected)
                setIsInternetReachable(currentReachable)
                firstEvent = false
                return
            }

            // Transições de efetivo ONLINE/OFFLINE
            if (prevEffective !== currEffective) {
                if (currEffective === false) {
                    // Foi para OFFLINE
                    toast.show({
                        title: t("You are Offline"),
                        type: "error",
                        duration: 1000,
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
                } else if (currEffective === true) {
                    // Voltou para ONLINE
                    toast.show({
                        title: t("Connected to Internet"),
                        type: "success",
                        duration: 1000,
                        backgroundColor: colors.green.green_05,
                        icon: (
                            <WifiIcon fill={colors.gray.white.toString()} width={12} height={12} />
                        ),
                    })
                    setNetworkStatus("ONLINE")
                }
            } else {
                // Sem mudança efetiva; se a internet voltou a ficar alcançável enquanto continuou conectado, mostra "Reconnecting"
                if (
                    previousReachable === false &&
                    currentReachable === true &&
                    currentConnected === true
                ) {
                    toast.show({
                        title: t("Reconnecting..."),
                        duration: 1000,
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

            // Handle UNKNOWN type change with neutral toast
            if (previousType !== currentType && currentType === NetworkStateType.UNKNOWN) {
                toast.show({
                    title: t("Reconnecting..."),
                    duration: 1000,
                    backgroundColor: colors.gray.grey_06,
                    icon: <WifiIcon fill={colors.gray.white.toString()} width={12} height={12} />,
                })
            }

            previousConnected = currentConnected
            previousReachable = currentReachable
            previousType = currentType
            setIsConnected(currentConnected)
            setIsInternetReachable(currentReachable)
        })

        return () => {
            isMounted = false
            subscription?.remove?.()
        }
    }, [t])

    return (
        <NetworkContext.Provider value={{ networkStats: networkStatus }}>
            {children}
        </NetworkContext.Provider>
    )
}
