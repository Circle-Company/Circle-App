import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import * as Location from "expo-location"
import { useFocusEffect } from "expo-router"
import { SymbolView } from "expo-symbols"

import { Text } from "@/components/Themed"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import GeolocationContext from "@/contexts/geolocation"
import LanguageContext from "@/contexts/language"
import { PopularList } from "@/features/popular/popular.list"

type Coords = { latitude: number; longitude: number }

/**
 * "Populares na sua região": lista de pessoas próximas que você ainda pode
 * convidar, ordenada por popularidade. Contrato em docs/popular-nearby.md.
 *
 * A tela depende de coordenadas, então a permissão de localização é pré-requisito:
 * sem ela não há o que pedir ao backend, e o card de permissão toma o lugar da
 * lista. As coordenadas são relidas a cada foco — o `staleTime` da query evita
 * que isso vire uma chamada nova a cada volta.
 */
export default function PopularScreen() {
    const { t } = React.useContext(LanguageContext)
    const { foregroundStatus, canAskAgainForeground, requestForegroundPermission, openSettings } =
        React.useContext(GeolocationContext)

    const [coords, setCoords] = React.useState<Coords | null>(null)
    const [readFailed, setReadFailed] = React.useState(false)

    const readCoords = React.useCallback(async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync()
            if (status !== Location.PermissionStatus.GRANTED) return
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.LocationAccuracy.Balanced,
            })
            setCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            })
            setReadFailed(false)
        } catch (e) {
            console.log("[popular] could not read location", e)
            setReadFailed(true)
        }
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            readCoords()
        }, [readCoords]),
    )

    async function handleEnableLocation() {
        if (!canAskAgainForeground) {
            await openSettings()
            return
        }
        const granted = await requestForegroundPermission()
        if (granted) await readCoords()
    }

    const root: ViewStyle = {
        flex: 1,
        backgroundColor: colors.gray.black,
    }

    const cardContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.9,
        borderRadius: sizes.borderRadius["1lg"] * 1.4,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
    }

    const cardTitle: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const cardDescription: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
    }

    const buttonLabel: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    // `!=` de propósito: cobre null (ainda não checado) e undefined (contexto
    // sem provider). Só mostramos o card quando a permissão foi de fato negada.
    const needsPermission =
        foregroundStatus != null && foregroundStatus !== Location.PermissionStatus.GRANTED

    if (needsPermission || readFailed) {
        return (
            <View style={root}>
                <View style={cardContainer}>
                    <SymbolView
                        name="location.slash"
                        tintColor={colors.purple.purple_03}
                        size={40}
                    />
                    <Text style={cardTitle}>{t("Location is required")}</Text>
                    <Text style={cardDescription}>
                        {t("We use your location to find popular people near you.")}
                    </Text>
                    <View style={{ marginTop: sizes.margins["1md"] }}>
                        <ButtonStandart
                            action={handleEnableLocation}
                            margins={false}
                            height={sizes.buttons.height * 0.42}
                            backgroundColor={colors.gray.white}
                        >
                            <Text style={buttonLabel}>
                                {canAskAgainForeground ? t("Enable location") : t("Open Settings")}
                            </Text>
                        </ButtonStandart>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={root}>
            <PopularList
                latitude={coords?.latitude ?? null}
                longitude={coords?.longitude ?? null}
            />
        </View>
    )
}
