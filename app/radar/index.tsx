import React, { useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native"
import Svg, { Circle } from "react-native-svg"
import { Image } from "expo-image"
import * as Location from "expo-location"
import { Stack } from "expo-router"
import { SymbolView } from "expo-symbols"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useRadarQuery } from "@/queries/radar"
import { RadarPerson } from "@/api/radar/radar.types"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"

type Coords = { latitude: number; longitude: number }
type RadarPersonWithAvatar = RadarPerson & { profilePictureUrl?: string }

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const RADAR_SIZE = Math.min(SCREEN_WIDTH - sizes.paddings["1sm"] * 2, 440)
const RADAR_RADIUS = RADAR_SIZE / 2
const AVATAR_SIZE = 40
const SELF_AVATAR_SIZE = 52
const RING_BASE_RADIUS = RADAR_RADIUS - AVATAR_SIZE / 2 - 4
const RING_RATIOS = [0.5, 0.85, 1.6, 2.4] as const
const LAYER_BY_TIER = [1, 2, 3, 4] as const
const COMPASS_LABELS: Array<{ label: string; bearing: number }> = [
    { label: "N", bearing: 0 },
    { label: "E", bearing: 90 },
    { label: "S", bearing: 180 },
    { label: "W", bearing: 270 },
]
const COMPASS_RATIO = 1.02

const FAKE_RADAR_PEOPLE: RadarPersonWithAvatar[] = [
    {
        userId: "luna.rivera",
        distanceMeters: 42,
        bearingDegrees: 18,
        freshnessMs: 12_000,
        precision: "exact",
        profilePictureUrl: "https://i.pravatar.cc/120?img=47",
    },
    {
        userId: "theo.matsumoto",
        distanceMeters: 128,
        bearingDegrees: 74,
        freshnessMs: 45_000,
        precision: "exact",
        profilePictureUrl: "https://i.pravatar.cc/120?img=12",
    },
    {
        userId: "isa.almeida",
        distanceMeters: 260,
        bearingDegrees: 132,
        freshnessMs: 3 * 60_000,
        precision: "approximate",
        profilePictureUrl: "https://i.pravatar.cc/120?img=32",
    },
    {
        userId: "kai.novak",
        distanceMeters: 340,
        bearingDegrees: 205,
        freshnessMs: 8 * 60_000,
        precision: "approximate",
        profilePictureUrl: "https://i.pravatar.cc/120?img=15",
    },
    {
        userId: "mira.chen",
        distanceMeters: 90,
        bearingDegrees: 250,
        freshnessMs: 25_000,
        precision: "exact",
        profilePictureUrl: "https://i.pravatar.cc/120?img=25",
    },
    {
        userId: "dante.oliveira",
        distanceMeters: 480,
        bearingDegrees: 295,
        freshnessMs: 22 * 60_000,
        precision: "approximate",
        profilePictureUrl: "https://i.pravatar.cc/120?img=59",
    },
    {
        userId: "yuki.tanaka",
        distanceMeters: 175,
        bearingDegrees: 340,
        freshnessMs: 90_000,
        precision: "exact",
        profilePictureUrl: "https://i.pravatar.cc/120?img=68",
    },
    {
        userId: "sasha.ford",
        distanceMeters: 720,
        bearingDegrees: 160,
        freshnessMs: 55 * 60_000,
        precision: "approximate",
        profilePictureUrl: "https://i.pravatar.cc/120?img=43",
    },
]

function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
}

function polarToXY(bearingDeg: number, radius: number) {
    const rad = ((bearingDeg - 90) * Math.PI) / 180
    return {
        x: RADAR_RADIUS + radius * Math.cos(rad),
        y: RADAR_RADIUS + radius * Math.sin(rad),
    }
}

function assignLayers<T extends RadarPerson>(items: T[]): Array<T & { layer: number }> {
    if (items.length === 0) return []
    const sorted = [...items].sort((a, b) => a.distanceMeters - b.distanceMeters)
    const layerByUserId = new Map<string, number>()
    sorted.forEach((p, i) => {
        const tier = Math.min(
            LAYER_BY_TIER.length - 1,
            Math.floor((i / sorted.length) * LAYER_BY_TIER.length),
        )
        layerByUserId.set(p.userId, LAYER_BY_TIER[tier])
    })
    return items.map((p) => ({ ...p, layer: layerByUserId.get(p.userId) ?? LAYER_BY_TIER[0] }))
}

export default function RadarScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [coords, setCoords] = useState<Coords | null>(null)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [heading, setHeading] = useState(0)

    const requestLocation = async () => {
        try {
            const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync()
            if (status !== Location.PermissionStatus.GRANTED) {
                setPermissionError(
                    !canAskAgain
                        ? t("Enable location in Settings to use Radar")
                        : t("Location permission is required"),
                )
                return
            }
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.LocationAccuracy.Balanced,
            })
            setCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            })
            setPermissionError(null)
        } catch (e) {
            setPermissionError(t("Could not read your location"))
        }
    }

    useEffect(() => {
        requestLocation()
    }, [])

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null
        let cancelled = false
        let lastApplied = 0
        ;(async () => {
            const { status } = await Location.getForegroundPermissionsAsync()
            if (status !== Location.PermissionStatus.GRANTED) return
            subscription = await Location.watchHeadingAsync((h) => {
                if (cancelled) return
                const next = h.trueHeading >= 0 ? h.trueHeading : h.magHeading
                if (typeof next !== "number" || Number.isNaN(next)) return
                const delta = Math.abs(next - lastApplied)
                const wrapped = Math.min(delta, 360 - delta)
                if (wrapped < 1.5) return
                lastApplied = next
                setHeading(next)
            })
        })()
        return () => {
            cancelled = true
            subscription?.remove()
        }
    }, [coords])

    const { data, isLoading } = useRadarQuery({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        enabled: !!coords,
    })

    const people = useMemo(() => {
        const real = data?.people ?? []
        const seen = new Set(real.map((p) => p.userId))
        const merged: RadarPersonWithAvatar[] = [
            ...real,
            ...FAKE_RADAR_PEOPLE.filter((p) => !seen.has(p.userId)),
        ]
        return assignLayers(merged)
    }, [data?.people])

    const maxMeters = useMemo(() => {
        const farthest = people.reduce((acc, p) => Math.max(acc, p.distanceMeters), 0)
        if (farthest === 0) return 500
        return Math.max(farthest * 1.05, 100)
    }, [people])

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerLargeTitleShadowVisible: false,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: "transparent" },
                    headerTintColor: colors.gray.white,
                    headerTitleStyle: {
                        fontFamily: fonts.family["Black-Italic"],
                        fontSize: fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerTitle: t("Radar"),
                    headerBackTitle: t("Back"),
                }}
            />
            <View style={styles.root}>
                {permissionError ? (
                    <View style={styles.permissionWrap}>
                        <SymbolView
                            name="location.slash"
                            tintColor={colors.purple.purple_03}
                            size={48}
                        />
                        <Text style={styles.permissionTitle}>{permissionError}</Text>
                        <Pressable
                            onPress={requestLocation}
                            style={({ pressed }) => [
                                styles.permissionButton,
                                pressed && { opacity: 0.75 },
                            ]}
                        >
                            <Text style={styles.permissionButtonText}>
                                {t("Enable location")}
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.radarWrap}>
                        <View
                            style={{
                                width: RADAR_SIZE,
                                height: RADAR_SIZE,
                                overflow: "visible",
                            }}
                        >
                            <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
                                {RING_RATIOS.map((ratio, i) => (
                                    <Circle
                                        key={i}
                                        cx={RADAR_RADIUS}
                                        cy={RADAR_RADIUS}
                                        r={RING_BASE_RADIUS * ratio}
                                        stroke={
                                            colors.purple.purple_07 +
                                            (ratio > 1 ? "44" : "88")
                                        }
                                        strokeWidth={1}
                                        fill="none"
                                    />
                                ))}
                            </Svg>
                            <SelfMarker
                                profilePictureUrl={session?.user?.profilePicture}
                                label={t("You")}
                            />
                            {COMPASS_LABELS.map(({ label, bearing }) => {
                                const { x, y } = polarToXY(
                                    bearing - heading,
                                    RING_BASE_RADIUS * COMPASS_RATIO,
                                )
                                const isNorth = label === "N"
                                return (
                                    <View
                                        key={label}
                                        pointerEvents="none"
                                        style={[
                                            styles.compassLabel,
                                            { left: x - 12, top: y - 12 },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.compassText,
                                                isNorth && styles.compassNorth,
                                            ]}
                                        >
                                            {label}
                                        </Text>
                                    </View>
                                )
                            })}
                            {people.map((p) => {
                                const ringRatio = RING_RATIOS[p.layer - 1] ?? RING_RATIOS[0]
                                const { x, y } = polarToXY(
                                    p.bearingDegrees - heading,
                                    RING_BASE_RADIUS * ringRatio,
                                )
                                return (
                                    <RadarMarker key={p.userId} person={p} x={x} y={y} />
                                )
                            })}
                            {isLoading && (
                                <View
                                    style={[
                                        StyleSheet.absoluteFill,
                                        { alignItems: "center", justifyContent: "center" },
                                    ]}
                                >
                                    <ActivityIndicator color={colors.purple.purple_04} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.rangeLabel}>
                            {t("Range")}: {formatDistance(maxMeters)}
                        </Text>
                        <Text style={styles.countLabel}>
                            {people.length}{" "}
                            {people.length === 1 ? t("person nearby") : t("people nearby")}
                        </Text>
                    </View>
                )}
            </View>
        </>
    )
}

function SelfMarker({
    profilePictureUrl,
    label,
}: {
    profilePictureUrl?: string | null
    label: string
}) {
    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                left: RADAR_RADIUS - SELF_AVATAR_SIZE / 2,
                top: RADAR_RADIUS - SELF_AVATAR_SIZE / 2,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: SELF_AVATAR_SIZE,
                    height: SELF_AVATAR_SIZE,
                    borderRadius: SELF_AVATAR_SIZE / 2,
                    borderWidth: 3,
                    borderColor: colors.purple.purple_04,
                    backgroundColor: colors.gray.grey_08,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {profilePictureUrl ? (
                    <Image
                        source={{ uri: profilePictureUrl }}
                        style={{ width: SELF_AVATAR_SIZE, height: SELF_AVATAR_SIZE }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <SymbolView
                        name="person.fill"
                        tintColor={colors.gray.grey_04}
                        size={SELF_AVATAR_SIZE * 0.55}
                    />
                )}
            </View>
            <View style={styles.selfBadge}>
                <Text style={styles.selfBadgeText}>{label}</Text>
            </View>
        </View>
    )
}

function RadarMarker({
    person,
    x,
    y,
}: {
    person: RadarPersonWithAvatar
    x: number
    y: number
}) {
    const isExact = person.precision === "exact"
    const initial = person.userId.charAt(0).toUpperCase()
    return (
        <View
            style={{
                position: "absolute",
                left: x - AVATAR_SIZE / 2,
                top: y - AVATAR_SIZE / 2,
                alignItems: "center",
            }}
        >
            <View
                style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    borderWidth: 2,
                    borderColor: isExact
                        ? colors.purple.purple_04
                        : colors.purple.purple_02 + "cc",
                    backgroundColor: colors.gray.grey_08,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    opacity: isExact ? 1 : 0.85,
                }}
            >
                {person.profilePictureUrl ? (
                    <Image
                        source={{ uri: person.profilePictureUrl }}
                        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                ) : (
                    <Text style={styles.avatarInitial}>{initial}</Text>
                )}
            </View>
            <View style={styles.usernameBadge}>
                <Text
                    style={styles.usernameText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    @{person.userId}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.gray.black,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1md"],
    },
    radarWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    selfBadge: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: colors.purple.purple_04,
    },
    selfBadgeText: {
        color: colors.gray.white,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.caption2,
    },
    compassLabel: {
        position: "absolute",
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    compassText: {
        color: colors.gray.grey_03,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.caption1,
        letterSpacing: 0.5,
    },
    compassNorth: {
        color: colors.purple.purple_03,
    },
    avatarInitial: {
        color: colors.gray.white,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body,
    },
    usernameBadge: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        maxWidth: 96,
        borderRadius: 6,
        backgroundColor: colors.gray.black + "cc",
    },
    usernameText: {
        color: colors.gray.white,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.caption2,
        textAlign: "center",
    },
    rangeLabel: {
        marginTop: sizes.margins["2md"],
        color: colors.gray.grey_03,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.footnote,
    },
    countLabel: {
        marginTop: 4,
        color: colors.gray.grey_04,
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.footnote,
    },
    permissionWrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: sizes.paddings["1md"],
        gap: sizes.margins["1sm"],
    },
    permissionTitle: {
        color: colors.gray.white,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body,
        textAlign: "center",
    },
    permissionButton: {
        marginTop: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1sm"],
        backgroundColor: colors.purple.purple_05,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: colors.gray.white,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body,
    },
})
