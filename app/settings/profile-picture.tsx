import { useNavigation } from "expo-router"
import React from "react"
import { Image, Platform, StyleSheet, View } from "react-native"
import ButtonStandart from "@/components/buttons/button-standart"
import { Loading } from "@/components/loading"
import { Text } from "@/components/Themed"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/language"
import { useProfilePictureUpload } from "@/lib/hooks/useProfilePictureUpload"

export default function ProfilePictureScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const navigation = useNavigation()

    // Escolha e envio moram no hook, compartilhados com a etapa de onboarding
    // do cadastro (app/onboarding/profile-picture.tsx).
    const {
        selectedAsset,
        loading,
        error,
        showPicker: handlePressViewMore,
        upload,
    } = useProfilePictureUpload()

    async function updateProfilePicture() {
        const ok = await upload()
        if (ok) navigation.goBack()
    }

    return (
        <View style={styles.container}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{
                        uri: selectedAsset?.uri || session.account.profilePicture,
                    }}
                    style={styles.avatar}
                />
            </View>

            {error ? (
                <Text style={styles.errorText} selectable={false}>
                    {error}
                </Text>
            ) : null}

            {!selectedAsset ? (
                <ButtonStandart
                    margins={false}
                    height={sizes.buttons.height * 0.7}
                    action={handlePressViewMore}
                    backgroundColor={String(colors.gray.white)}
                    style={styles.primaryBtn}
                >
                    <Text style={styles.primaryBtnText}>{t("Change Picture")}</Text>
                </ButtonStandart>
            ) : (
                <View style={styles.bottomBar}>
                    <ButtonStandart
                        margins={false}
                        width={sizes.buttons.width * 0.4}
                        height={sizes.buttons.height * 0.7}
                        action={updateProfilePicture}
                        backgroundColor={String(colors.gray.white)}
                        style={styles.primaryBtn}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.primaryBtnText}>{t("Uploading")}</Text>
                                <Loading.Container width={40} height={30}>
                                    <Loading.ActivityIndicator size={10} />
                                </Loading.Container>
                            </View>
                        ) : (
                            <Text style={styles.primaryBtnText}>{t("Upload")}</Text>
                        )}
                    </ButtonStandart>
                </View>
            )}
        </View>
    )
}

const AVATAR_SIZE = sizes.screens.width - sizes.margins["1xxl"] * 2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#000",
    },
    avatarWrapper: {
        marginTop: sizes.paddings["1lg"],
        marginBottom: sizes.paddings["1lg"],
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 6,
        borderColor: ColorTheme().backgroundDisabled,
        backgroundColor: ColorTheme().backgroundDisabled,
    },
    editFab: {
        position: "absolute",
        bottom: sizes.margins["2sm"],
        right: sizes.margins["2sm"],
        backgroundColor: colors.gray.white,
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
    },
    primaryBtn: {
        marginTop: sizes.margins["1sm"],
        paddingVertical: sizes.paddings["1sm"],
    },
    primaryBtnText: {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.black,
    },
    linkBtnText: {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
    },
    uploadText: {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white,
    },
    bottomBar: {
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
        paddingVertical: sizes.paddings["1sm"],
    },
    loadingContainer: {
        marginLeft: sizes.margins["3sm"],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.6,
    } as any,
    loadingText: {
        color: colors.gray.white,
        fontSize: fonts.size.caption1,
        flex: 1,
    },
    errorText: {
        color: ColorTheme().error,
        fontSize: fonts.size.caption1,
        marginBottom: sizes.margins["1sm"],
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
        opacity: 0.9,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: "#00000066",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    sheet: {
        width: sizes.screens.width,
        backgroundColor: colors.gray.black,
        paddingVertical: sizes.paddings["1md"],
        paddingHorizontal: sizes.paddings["1md"],
        borderTopLeftRadius: sizes.borderRadius["1md"],
        borderTopRightRadius: sizes.borderRadius["1md"],
        borderWidth: Platform.OS === "ios" ? 0 : 1,
        borderColor: colors.gray.grey_09,
    },
    sheetTitle: {
        color: colors.gray.white,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        marginBottom: sizes.margins["1sm"],
    },
    sheetBtn: {
        paddingVertical: sizes.paddings["1sm"],
        alignItems: "center",
        borderRadius: sizes.borderRadius["1sm"],
        backgroundColor: "#1a1a1a",
        marginBottom: sizes.margins["1sm"],
        marginHorizontal: sizes.margins["1md"],
    },
    sheetBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Medium,
    },
    sheetCancel: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.gray.grey_09,
    },
})
