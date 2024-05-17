import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsProviderProps = { children: React.ReactNode };

export type SettingsContextData = {
    pushNotificationsEnabled: boolean;
    soundsEnabled: boolean;
    vibrationsEnabled: boolean;
    togglePushNotifications: () => Promise<void>;
    toggleSounds: () => Promise<void>;
    toggleVibrations: () => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextData>(
    {} as SettingsContextData
);

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = React.useState<boolean>(false);
    const [soundsEnabled, setSoundsEnabled] = React.useState<boolean>(false);
    const [vibrationsEnabled, setVibrationsEnabled] = React.useState<boolean>(false);

    React.useEffect(() => {
        // Carregar as configurações do AsyncStorage ao inicializar o aplicativo
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const pushNotifications = await AsyncStorage.getItem("pushNotificationsEnabled");
            const sounds = await AsyncStorage.getItem("soundsEnabled");
            const vibrations = await AsyncStorage.getItem("vibrationsEnabled");
            if (pushNotifications !== null) setPushNotificationsEnabled(JSON.parse(pushNotifications));
            if (sounds !== null) setSoundsEnabled(JSON.parse(sounds));
            if (vibrations !== null) setVibrationsEnabled(JSON.parse(vibrations));
        } catch (error) {
            console.error("Error loading app settings:", error);
        }
    };

    const togglePushNotifications = async () => {
        const newValue = !pushNotificationsEnabled;
        setPushNotificationsEnabled(newValue);
        await AsyncStorage.setItem("pushNotificationsEnabled", JSON.stringify(newValue));
    };

    const toggleSounds = async () => {
        const newValue = !soundsEnabled;
        setSoundsEnabled(newValue);
        await AsyncStorage.setItem("soundsEnabled", JSON.stringify(newValue));
    };

    const toggleVibrations = async () => {
        const newValue = !vibrationsEnabled;
        setVibrationsEnabled(newValue);
        await AsyncStorage.setItem("vibrationsEnabled", JSON.stringify(newValue));
    };

    const contextValue: SettingsContextData = {
        pushNotificationsEnabled,
        soundsEnabled,
        vibrationsEnabled,
        togglePushNotifications,
        toggleSounds,
        toggleVibrations,
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

export default SettingsContext;
