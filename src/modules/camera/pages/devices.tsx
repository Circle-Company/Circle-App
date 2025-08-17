import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import IonIcon from "@expo/vector-icons/Ionicons"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import type { ListRenderItemInfo, SectionListData } from "react-native"
import { SectionList, StyleSheet, Text, View } from "react-native"
import { PressableOpacity } from "react-native-pressable-opacity"
import type { CameraDevice } from "react-native-vision-camera"
import { useCameraDevices } from "react-native-vision-camera"
import { CONTENT_SPACING, SAFE_AREA_PADDING } from "../constants"
import { usePreferredCameraDevice } from "../hooks/usePreferredCameraDevice"
import type { Routes } from "../routes"

const keyExtractor = (item: CameraDevice): string => item.id

interface SectionType {
    position: CameraDevice["position"] | "preferred"
}
type SectionData = SectionListData<CameraDevice, SectionType>

interface DeviceProps {
    device: CameraDevice
    onPress: () => void
}

function Device({ device, onPress }: DeviceProps): React.ReactElement {
    const maxPhotoRes = useMemo(
        () =>
            device.formats.reduce((prev, curr) => {
                if (curr.photoWidth * curr.photoHeight > prev.photoWidth * prev.photoHeight)
                    return curr
                return prev
            }),
        [device.formats],
    )
    const maxVideoRes = useMemo(
        () =>
            device.formats.reduce((prev, curr) => {
                if (curr.videoWidth * curr.videoHeight > prev.videoWidth * prev.videoHeight)
                    return curr
                return prev
            }),
        [device.formats],
    )
    const deviceTypes = useMemo(
        () => device.physicalDevices.map((t) => t.replace("-camera", "")).join(" + "),
        [device.physicalDevices],
    )

    return (
        <PressableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.horizontal}>
                <IonIcon name="camera" size={18} color="black" />
                <Text style={styles.deviceName} numberOfLines={3}>
                    {device.name} <Text style={styles.devicePosition}>({device.position})</Text>
                </Text>
            </View>
            <Text style={styles.deviceTypes}>{deviceTypes}</Text>
            <View style={styles.horizontal}>
                <IonIcon name="camera" size={12} color="black" />
                <Text style={styles.resolutionText}>
                    {maxPhotoRes.photoWidth}x{maxPhotoRes.photoHeight}
                </Text>
            </View>
            <View style={styles.horizontal}>
                <IonIcon name="videocam" size={12} color="black" />
                <Text style={styles.resolutionText}>
                    {maxVideoRes.videoWidth}x{maxVideoRes.videoHeight} @ {maxVideoRes.maxFps} FPS
                </Text>
            </View>
            <Text style={styles.deviceId} numberOfLines={2} ellipsizeMode="middle">
                {device.id}
            </Text>
        </PressableOpacity>
    )
}

type Props = NativeStackScreenProps<Routes, "Devices">
export function DevicesPage({ navigation }: Props): React.ReactElement {
    const devices = useCameraDevices()
    const [preferredDevice, setPreferredDevice] = usePreferredCameraDevice()

    const sections = useMemo((): SectionData[] => {
        return [
            {
                position: "preferred",
                data: preferredDevice != null ? [preferredDevice] : [],
            },
            {
                position: "back",
                data: devices.filter((d) => d.position === "back"),
            },
            {
                position: "front",
                data: devices.filter((d) => d.position === "front"),
            },
            {
                position: "external",
                data: devices.filter((d) => d.position === "external"),
            },
        ]
    }, [devices, preferredDevice])

    const onDevicePressed = useCallback(
        (device: CameraDevice) => {
            setPreferredDevice(device)
            navigation.navigate("CameraPage")
        },
        [navigation, setPreferredDevice],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<CameraDevice>) => {
            return <Device device={item} onPress={() => onDevicePressed(item)} />
        },
        [onDevicePressed],
    )

    const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => {
        if (section.data.length === 0) return null
        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.position.toUpperCase()}</Text>
            </View>
        )
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.horizontal}>
                    <PressableOpacity style={styles.backButton} onPress={navigation.goBack}>
                        <IonIcon name="chevron-back" size={35} color="black" />
                    </PressableOpacity>
                    <Text style={styles.header}>Camera Settingss</Text>
                </View>
                <Text style={styles.subHeader}>
                    These are all detected Camera devices on your phone. This list will
                    automatically update as you plug devices in or out.
                </Text>
            </View>

            <SectionList
                style={styles.list}
                contentContainerStyle={styles.listContent}
                sections={sections}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        marginTop: sizes.headers.height * 0.8,
        backgroundColor: colors.gray.black,
    },
    headerContainer: {
        width: sizes.screens.width,
        paddingTop: SAFE_AREA_PADDING.paddingTop,
        paddingLeft: SAFE_AREA_PADDING.paddingLeft,
        paddingRight: SAFE_AREA_PADDING.paddingRight,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        width: sizes.screens.width,
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.Bold,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    subHeader: {
        marginTop: 10,
        fontSize: 14,
        maxWidth: "100%",
    },
    list: {
        marginTop: CONTENT_SPACING,
    },
    listContent: {},
    sectionHeader: {
        paddingHorizontal: CONTENT_SPACING / 2,
        paddingVertical: 5,
    },
    sectionHeaderText: {
        opacity: 0.4,
        fontSize: 16,
    },
    itemContainer: {
        paddingHorizontal: CONTENT_SPACING,
        paddingVertical: 7,
        backgroundColor: "#f2f",
    },
    deviceName: {
        fontSize: 17,
        marginLeft: 5,
        flexShrink: 1,
        fontWeight: "bold",
    },
    devicePosition: {
        opacity: 0.4,
    },
    deviceId: {
        fontSize: 12,
        opacity: 0.4,
    },
    deviceTypes: {
        fontSize: 12,
        opacity: 0.4,
    },
    horizontal: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        marginTop: 7,
    },
    resolutionText: {
        marginLeft: 5,
        fontSize: 12,
    },
})
