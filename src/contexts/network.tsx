import React from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToastNetworkStats from "../components/toast_network_stats";
import { View } from "react-native";

type NetworkProviderProps = { children: React.ReactNode };

export type NetworkContextData = {
  networkStats: "ONLINE" | "OFFLINE" | "RECONNECTING";
  reconnect: () => Promise<void>;
};

const NetworkContext = React.createContext<NetworkContextData>(
  {} as NetworkContextData
);

export function NetworkProvider({ children }: NetworkProviderProps) {
  const netInfo = useNetInfo();
  const [networkStats, setNetworkStats] = React.useState<
    "ONLINE" | "OFFLINE" | "RECONNECTING"
  >("ONLINE");
  const [showNetworkStats, setShowNetworkStats] = React.useState<boolean>(
    !netInfo.isConnected
  );

  function tryConnection() {
    if (netInfo.isConnected) {
      setNetworkStats("ONLINE");
      if(showNetworkStats) setShowNetworkStats(false);
      else setShowNetworkStats(true)
    } else {
      setNetworkStats("OFFLINE");
      setShowNetworkStats(true);
    }
  }

  React.useEffect(() => {
    tryConnection()
  }, [netInfo.isConnected]);


  React.useEffect(() => {
    if(!netInfo.isConnected) {
        setNetworkStats("OFFLINE")
        setShowNetworkStats(true);
    }

  }, [netInfo])

  const reconnect = async () => {
    setNetworkStats("ONLINE");
  };

  return (
    <NetworkContext.Provider
      value={{
        networkStats,
        reconnect,
      }}
    >
      <ToastNetworkStats showStats={showNetworkStats} type={networkStats} />

      {children}
      
      
    </NetworkContext.Provider>
  );
}

export default NetworkContext;
