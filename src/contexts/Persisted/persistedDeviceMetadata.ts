import { create } from "zustand"
import { storage, storageKeys } from "../../store"
import { DeviceMetadataType } from "./types"
import DeviceInfo from "react-native-device-info"
import { Dimensions, PixelRatio } from "react-native"

const storageKey = storageKeys().deviceMetadata

export interface DeviceMetadataState {
    deviceId: string
    deviceName: string
    platform: string
    version: string
    buildNumber: string
    appVersion: string
    systemVersion: string
    brand: string
    model: string
    carrier: string
    timezone: string
    locale: string
    isTablet: boolean
    hasNotch: boolean
    screenWidth: number
    screenHeight: number
    pixelDensity: number
    fontScale: number
    // Capacidade do dispositivo
    totalMemory: number
    usedMemory: number
    availableMemory: number
    totalDiskCapacity: number
    freeDiskStorage: number
    usedDiskStorage: number
    batteryLevel: number
    isLowPowerModeEnabled: boolean
    cpuArchitecture: string
    deviceType: string
    maxMemory: number
    lastUpdatedAt: string
    setDeviceId: (value: string) => void
    setDeviceName: (value: string) => void
    setPlatform: (value: string) => void
    setVersion: (value: string) => void
    setBuildNumber: (value: string) => void
    setAppVersion: (value: string) => void
    setSystemVersion: (value: string) => void
    setBrand: (value: string) => void
    setModel: (value: string) => void
    setCarrier: (value: string) => void
    setTimezone: (value: string) => void
    setLocale: (value: string) => void
    setIsTablet: (value: boolean) => void
    setHasNotch: (value: boolean) => void
    setScreenWidth: (value: number) => void
    setScreenHeight: (value: number) => void
    setPixelDensity: (value: number) => void
    setFontScale: (value: number) => void
    setTotalMemory: (value: number) => void
    setUsedMemory: (value: number) => void
    setAvailableMemory: (value: number) => void
    setTotalDiskCapacity: (value: number) => void
    setFreeDiskStorage: (value: number) => void
    setUsedDiskStorage: (value: number) => void
    setBatteryLevel: (value: number) => void
    setIsLowPowerModeEnabled: (value: boolean) => void
    setCpuArchitecture: (value: string) => void
    setDeviceType: (value: string) => void
    setMaxMemory: (value: number) => void
    setLastUpdatedAt: (value: string) => void
    set: (value: DeviceMetadataType) => void
    load: () => void
    remove: () => void
    updateAll: () => Promise<DeviceMetadataType | void>
}

const getScreenDimensions = () => {
    const { width, height } = Dimensions.get("window")
    return { width, height }
}

const getCurrentTimestamp = () => new Date().toISOString()

const checkIfMetadataExists = (): boolean => {
    const deviceId = storage.getString(storageKey.deviceId)
    const lastUpdatedAt = storage.getString(storageKey.lastUpdatedAt)

    // Verifica se existe pelo menos o deviceId e um timestamp
    return !!(deviceId && lastUpdatedAt)
}

const isMetadataExpired = (maxAgeInDays: number = 7): boolean => {
    const lastUpdatedAt = storage.getString(storageKey.lastUpdatedAt)

    if (!lastUpdatedAt) return true

    const lastUpdate = new Date(lastUpdatedAt)
    const now = new Date()
    const diffInDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    return diffInDays > maxAgeInDays
}

const initializeMetadata = async (set: any, get: any) => {
    const exists = checkIfMetadataExists()
    const expired = isMetadataExpired()

    if (!exists) {
        console.log("Metadados do dispositivo não encontrados. Coletando e persistindo...")
        try {
            await get().updateAll()
            console.log("Metadados do dispositivo coletados e persistidos com sucesso.")
        } catch (error) {
            console.warn("Erro ao inicializar metadados do dispositivo:", error)
        }
    } else if (expired) {
        console.log("Metadados do dispositivo expirados. Atualizando...")
        try {
            await get().updateAll()
            console.log("Metadados do dispositivo atualizados com sucesso.")
        } catch (error) {
            console.warn("Erro ao atualizar metadados expirados:", error)
        }
    } else {
        console.log("Metadados do dispositivo encontrados e válidos no storage.")
    }
}

export const useDeviceMetadataStore = create<DeviceMetadataState>((set, get) => ({
    deviceId: storage.getString(storageKey.deviceId) || "",
    deviceName: storage.getString(storageKey.deviceName) || "",
    platform: storage.getString(storageKey.platform) || "",
    version: storage.getString(storageKey.version) || "",
    buildNumber: storage.getString(storageKey.buildNumber) || "",
    appVersion: storage.getString(storageKey.appVersion) || "",
    systemVersion: storage.getString(storageKey.systemVersion) || "",
    brand: storage.getString(storageKey.brand) || "",
    model: storage.getString(storageKey.model) || "",
    carrier: storage.getString(storageKey.carrier) || "",
    timezone: storage.getString(storageKey.timezone) || "",
    locale: storage.getString(storageKey.locale) || "",
    isTablet: storage.getBoolean(storageKey.isTablet) || false,
    hasNotch: storage.getBoolean(storageKey.hasNotch) || false,
    screenWidth: storage.getNumber(storageKey.screenWidth) || 0,
    screenHeight: storage.getNumber(storageKey.screenHeight) || 0,
    pixelDensity: storage.getNumber(storageKey.pixelDensity) || 1,
    fontScale: storage.getNumber(storageKey.fontScale) || 1,
    // Capacidade do dispositivo
    totalMemory: storage.getNumber(storageKey.totalMemory) || 0,
    usedMemory: storage.getNumber(storageKey.usedMemory) || 0,
    availableMemory: storage.getNumber(storageKey.availableMemory) || 0,
    totalDiskCapacity: storage.getNumber(storageKey.totalDiskCapacity) || 0,
    freeDiskStorage: storage.getNumber(storageKey.freeDiskStorage) || 0,
    usedDiskStorage: storage.getNumber(storageKey.usedDiskStorage) || 0,
    batteryLevel: storage.getNumber(storageKey.batteryLevel) || 0,
    isLowPowerModeEnabled: storage.getBoolean(storageKey.isLowPowerModeEnabled) || false,
    cpuArchitecture: storage.getString(storageKey.cpuArchitecture) || "",
    deviceType: storage.getString(storageKey.deviceType) || "",
    maxMemory: storage.getNumber(storageKey.maxMemory) || 0,
    lastUpdatedAt: storage.getString(storageKey.lastUpdatedAt) || "",

    setDeviceId: (value: string) => {
        storage.set(storageKey.deviceId, value)
        set({ deviceId: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setDeviceName: (value: string) => {
        storage.set(storageKey.deviceName, value)
        set({ deviceName: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setPlatform: (value: string) => {
        storage.set(storageKey.platform, value)
        set({ platform: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setVersion: (value: string) => {
        storage.set(storageKey.version, value)
        set({ version: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setBuildNumber: (value: string) => {
        storage.set(storageKey.buildNumber, value)
        set({ buildNumber: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setAppVersion: (value: string) => {
        storage.set(storageKey.appVersion, value)
        set({ appVersion: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setSystemVersion: (value: string) => {
        storage.set(storageKey.systemVersion, value)
        set({ systemVersion: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setBrand: (value: string) => {
        storage.set(storageKey.brand, value)
        set({ brand: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setModel: (value: string) => {
        storage.set(storageKey.model, value)
        set({ model: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setCarrier: (value: string) => {
        storage.set(storageKey.carrier, value)
        set({ carrier: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setTimezone: (value: string) => {
        storage.set(storageKey.timezone, value)
        set({ timezone: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setLocale: (value: string) => {
        storage.set(storageKey.locale, value)
        set({ locale: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setIsTablet: (value: boolean) => {
        storage.set(storageKey.isTablet, value)
        set({ isTablet: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setHasNotch: (value: boolean) => {
        storage.set(storageKey.hasNotch, value)
        set({ hasNotch: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setScreenWidth: (value: number) => {
        storage.set(storageKey.screenWidth, value)
        set({ screenWidth: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setScreenHeight: (value: number) => {
        storage.set(storageKey.screenHeight, value)
        set({ screenHeight: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setPixelDensity: (value: number) => {
        storage.set(storageKey.pixelDensity, value)
        set({ pixelDensity: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setFontScale: (value: number) => {
        storage.set(storageKey.fontScale, value)
        set({ fontScale: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setLastUpdatedAt: (value: string) => {
        storage.set(storageKey.lastUpdatedAt, value)
        set({ lastUpdatedAt: value })
    },
    setTotalMemory: (value: number) => {
        storage.set(storageKey.totalMemory, value)
        set({ totalMemory: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setUsedMemory: (value: number) => {
        storage.set(storageKey.usedMemory, value)
        set({ usedMemory: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setAvailableMemory: (value: number) => {
        storage.set(storageKey.availableMemory, value)
        set({ availableMemory: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setTotalDiskCapacity: (value: number) => {
        storage.set(storageKey.totalDiskCapacity, value)
        set({ totalDiskCapacity: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setFreeDiskStorage: (value: number) => {
        storage.set(storageKey.freeDiskStorage, value)
        set({ freeDiskStorage: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setUsedDiskStorage: (value: number) => {
        storage.set(storageKey.usedDiskStorage, value)
        set({ usedDiskStorage: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setBatteryLevel: (value: number) => {
        storage.set(storageKey.batteryLevel, value)
        set({ batteryLevel: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setIsLowPowerModeEnabled: (value: boolean) => {
        storage.set(storageKey.isLowPowerModeEnabled, value)
        set({ isLowPowerModeEnabled: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setCpuArchitecture: (value: string) => {
        storage.set(storageKey.cpuArchitecture, value)
        set({ cpuArchitecture: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setDeviceType: (value: string) => {
        storage.set(storageKey.deviceType, value)
        set({ deviceType: value, lastUpdatedAt: getCurrentTimestamp() })
    },
    setMaxMemory: (value: number) => {
        storage.set(storageKey.maxMemory, value)
        set({ maxMemory: value, lastUpdatedAt: getCurrentTimestamp() })
    },

    set: (value: DeviceMetadataType) => {
        const timestamp = getCurrentTimestamp()
        set({ ...value, lastUpdatedAt: timestamp })

        // Salvar no storage
        storage.set(storageKey.deviceId, value.deviceId)
        storage.set(storageKey.deviceName, value.deviceName)
        storage.set(storageKey.platform, value.platform)
        storage.set(storageKey.version, value.version)
        storage.set(storageKey.buildNumber, value.buildNumber)
        storage.set(storageKey.appVersion, value.appVersion)
        storage.set(storageKey.systemVersion, value.systemVersion)
        storage.set(storageKey.brand, value.brand)
        storage.set(storageKey.model, value.model)
        storage.set(storageKey.carrier, value.carrier)
        storage.set(storageKey.timezone, value.timezone)
        storage.set(storageKey.locale, value.locale)
        storage.set(storageKey.isTablet, value.isTablet)
        storage.set(storageKey.hasNotch, value.hasNotch)
        storage.set(storageKey.screenWidth, value.screenWidth)
        storage.set(storageKey.screenHeight, value.screenHeight)
        storage.set(storageKey.pixelDensity, value.pixelDensity)
        storage.set(storageKey.fontScale, value.fontScale)
        // Capacidade do dispositivo
        storage.set(storageKey.totalMemory, value.totalMemory)
        storage.set(storageKey.usedMemory, value.usedMemory)
        storage.set(storageKey.availableMemory, value.availableMemory)
        storage.set(storageKey.totalDiskCapacity, value.totalDiskCapacity)
        storage.set(storageKey.freeDiskStorage, value.freeDiskStorage)
        storage.set(storageKey.usedDiskStorage, value.usedDiskStorage)
        storage.set(storageKey.batteryLevel, value.batteryLevel)
        storage.set(storageKey.isLowPowerModeEnabled, value.isLowPowerModeEnabled)
        storage.set(storageKey.cpuArchitecture, value.cpuArchitecture)
        storage.set(storageKey.deviceType, value.deviceType)
        storage.set(storageKey.maxMemory, value.maxMemory)
        storage.set(storageKey.lastUpdatedAt, timestamp)
    },

    load: () => {
        set({
            deviceId: storage.getString(storageKey.deviceId) || "",
            deviceName: storage.getString(storageKey.deviceName) || "",
            platform: storage.getString(storageKey.platform) || "",
            version: storage.getString(storageKey.version) || "",
            buildNumber: storage.getString(storageKey.buildNumber) || "",
            appVersion: storage.getString(storageKey.appVersion) || "",
            systemVersion: storage.getString(storageKey.systemVersion) || "",
            brand: storage.getString(storageKey.brand) || "",
            model: storage.getString(storageKey.model) || "",
            carrier: storage.getString(storageKey.carrier) || "",
            timezone: storage.getString(storageKey.timezone) || "",
            locale: storage.getString(storageKey.locale) || "",
            isTablet: storage.getBoolean(storageKey.isTablet) || false,
            hasNotch: storage.getBoolean(storageKey.hasNotch) || false,
            screenWidth: storage.getNumber(storageKey.screenWidth) || 0,
            screenHeight: storage.getNumber(storageKey.screenHeight) || 0,
            pixelDensity: storage.getNumber(storageKey.pixelDensity) || 1,
            fontScale: storage.getNumber(storageKey.fontScale) || 1,
            // Capacidade do dispositivo
            totalMemory: storage.getNumber(storageKey.totalMemory) || 0,
            usedMemory: storage.getNumber(storageKey.usedMemory) || 0,
            availableMemory: storage.getNumber(storageKey.availableMemory) || 0,
            totalDiskCapacity: storage.getNumber(storageKey.totalDiskCapacity) || 0,
            freeDiskStorage: storage.getNumber(storageKey.freeDiskStorage) || 0,
            usedDiskStorage: storage.getNumber(storageKey.usedDiskStorage) || 0,
            batteryLevel: storage.getNumber(storageKey.batteryLevel) || 0,
            isLowPowerModeEnabled: storage.getBoolean(storageKey.isLowPowerModeEnabled) || false,
            cpuArchitecture: storage.getString(storageKey.cpuArchitecture) || "",
            deviceType: storage.getString(storageKey.deviceType) || "",
            maxMemory: storage.getNumber(storageKey.maxMemory) || 0,
            lastUpdatedAt: storage.getString(storageKey.lastUpdatedAt) || "",
        })
    },

    remove: () => {
        // Remover do storage
        storage.delete(storageKey.deviceId)
        storage.delete(storageKey.deviceName)
        storage.delete(storageKey.platform)
        storage.delete(storageKey.version)
        storage.delete(storageKey.buildNumber)
        storage.delete(storageKey.appVersion)
        storage.delete(storageKey.systemVersion)
        storage.delete(storageKey.brand)
        storage.delete(storageKey.model)
        storage.delete(storageKey.carrier)
        storage.delete(storageKey.timezone)
        storage.delete(storageKey.locale)
        storage.delete(storageKey.isTablet)
        storage.delete(storageKey.hasNotch)
        storage.delete(storageKey.screenWidth)
        storage.delete(storageKey.screenHeight)
        storage.delete(storageKey.pixelDensity)
        storage.delete(storageKey.fontScale)
        // Capacidade do dispositivo
        storage.delete(storageKey.totalMemory)
        storage.delete(storageKey.usedMemory)
        storage.delete(storageKey.availableMemory)
        storage.delete(storageKey.totalDiskCapacity)
        storage.delete(storageKey.freeDiskStorage)
        storage.delete(storageKey.usedDiskStorage)
        storage.delete(storageKey.batteryLevel)
        storage.delete(storageKey.isLowPowerModeEnabled)
        storage.delete(storageKey.cpuArchitecture)
        storage.delete(storageKey.deviceType)
        storage.delete(storageKey.maxMemory)
        storage.delete(storageKey.lastUpdatedAt)

        // Reset do estado
        set({
            deviceId: "",
            deviceName: "",
            platform: "",
            version: "",
            buildNumber: "",
            appVersion: "",
            systemVersion: "",
            brand: "",
            model: "",
            carrier: "",
            timezone: "",
            locale: "",
            isTablet: false,
            hasNotch: false,
            screenWidth: 0,
            screenHeight: 0,
            pixelDensity: 1,
            fontScale: 1,
            // Capacidade do dispositivo
            totalMemory: 0,
            usedMemory: 0,
            availableMemory: 0,
            totalDiskCapacity: 0,
            freeDiskStorage: 0,
            usedDiskStorage: 0,
            batteryLevel: 0,
            isLowPowerModeEnabled: false,
            cpuArchitecture: "",
            deviceType: "",
            maxMemory: 0,
            lastUpdatedAt: "",
        })
    },

    updateAll: async () => {
        try {
            const { width, height } = getScreenDimensions()
            const timestamp = getCurrentTimestamp()

            // Obter dados de capacidade
            const totalMemory = await DeviceInfo.getTotalMemory()
            const usedMemory = await DeviceInfo.getUsedMemory()
            const availableMemory = totalMemory - usedMemory
            const totalDiskCapacity = await DeviceInfo.getTotalDiskCapacity()
            const freeDiskStorage = await DeviceInfo.getFreeDiskStorage()
            const usedDiskStorage = totalDiskCapacity - freeDiskStorage
            const batteryLevel = await DeviceInfo.getBatteryLevel()
            const isLowPowerModeEnabled = await DeviceInfo.isBatteryCharging()
                .then(() => false)
                .catch(() => false)
            const maxMemory = await DeviceInfo.getMaxMemory()

            const metadata: DeviceMetadataType = {
                deviceId: await DeviceInfo.getUniqueId(),
                deviceName: await DeviceInfo.getDeviceName(),
                platform: DeviceInfo.getSystemName(),
                version: DeviceInfo.getVersion(),
                buildNumber: DeviceInfo.getBuildNumber(),
                appVersion: DeviceInfo.getVersion(),
                systemVersion: DeviceInfo.getSystemVersion(),
                brand: DeviceInfo.getBrand(),
                model: DeviceInfo.getModel(),
                carrier: await DeviceInfo.getCarrier(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
                locale: Intl.NumberFormat().resolvedOptions().locale || "",
                isTablet: DeviceInfo.isTablet(),
                hasNotch: DeviceInfo.hasNotch(),
                screenWidth: width,
                screenHeight: height,
                pixelDensity: PixelRatio.get(),
                fontScale: PixelRatio.getFontScale(),
                // Capacidade do dispositivo
                totalMemory,
                usedMemory,
                availableMemory,
                totalDiskCapacity,
                freeDiskStorage,
                usedDiskStorage,
                batteryLevel,
                isLowPowerModeEnabled,
                cpuArchitecture: await DeviceInfo.supportedAbis().then(
                    (abis: string[]) => abis[0] || "",
                ),
                deviceType: DeviceInfo.getDeviceType(),
                maxMemory,
                lastUpdatedAt: timestamp,
            }

            // Salvar metadados coletados
            get().set(metadata)

            // Recarregar estado a partir do storage para garantir sincronização
            get().load()

            console.log(
                `Metadados atualizados: RAM ${Math.round(totalMemory / 1024 / 1024 / 1024)}GB, ` +
                    `Disponível ${Math.round((availableMemory / totalMemory) * 100)}%, ` +
                    `Bateria ${Math.round(batteryLevel * 100)}%, ` +
                    `Storage ${Math.round(freeDiskStorage / 1024 / 1024 / 1024)}GB livre`,
            )

            return metadata
        } catch (error) {
            console.warn("Erro ao atualizar metadados do dispositivo:", error)
            throw error
        }
    },
}))

// Inicializar metadados após a criação do store
setTimeout(() => {
    const store = useDeviceMetadataStore.getState()
    initializeMetadata(useDeviceMetadataStore.setState, () => store)
}, 0)
