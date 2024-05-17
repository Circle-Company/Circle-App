import DeviceInfo, {LocationProviderInfo} from 'react-native-device-info'

export type getDeviceInfoProps = {
    brand: string,
    buildNumber: string,
    deviceId: string,
    deviceType: string,
    deviceName: string,
    systemName: string,
    systemVersion: string,
    hardware: string,
    uniqueId: string,
    userAgent: string,
    totalMemory: number,
    maxMemory: number,
    totalDiskCapacity: number,
    freeDiskStorage: number,
    androidId: string,
    apiLevel: number,
    carrier: string,
    hasNotch: boolean,
    hasDynamicIsland: boolean,
    ipAddress: string,
    macAddress: string,
    phoneNumber: string,
    serialNumber: string,
    availableLocationProviders: LocationProviderInfo
}

export default async function getDeviceInfo(){
    const deviceInfo: getDeviceInfoProps = {
        brand: DeviceInfo.getBrand(),
        buildNumber: DeviceInfo.getBuildNumber(),
        deviceId: DeviceInfo.getDeviceId(),
        deviceType: DeviceInfo.getDeviceType(),
        deviceName: await DeviceInfo.getDeviceName(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        hardware: await DeviceInfo.getHardware(),
        uniqueId: await DeviceInfo.getUniqueId(),
        userAgent: await DeviceInfo.getUserAgent(),
        totalMemory: await DeviceInfo.getTotalMemory(),
        maxMemory: await DeviceInfo.getMaxMemory(),
        totalDiskCapacity: await DeviceInfo.getTotalDiskCapacity(),
        freeDiskStorage: await DeviceInfo.getFreeDiskStorage(),
        androidId: await DeviceInfo.getAndroidId(),
        apiLevel: await DeviceInfo.getApiLevel(),
        carrier: await DeviceInfo.getCarrier(),
        hasNotch: DeviceInfo.hasNotch(),
        hasDynamicIsland: DeviceInfo.hasDynamicIsland(),
        ipAddress: await DeviceInfo.getIpAddress(),
        macAddress: await DeviceInfo.getMacAddress(),
        phoneNumber: await DeviceInfo.getPhoneNumber(),
        serialNumber: await DeviceInfo.getSerialNumber(),
        availableLocationProviders: await DeviceInfo.getAvailableLocationProviders()
    }

    return deviceInfo
}