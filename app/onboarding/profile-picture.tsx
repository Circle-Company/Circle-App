import React from "react"
import { Image, Pressable, StyleSheet, TextStyle, View } from "react-native"
import { useRouter } from "expo-router"
import { SymbolView } from "expo-symbols"

import ButtonStandart from "@/components/buttons/button-standart"
import { Loading } from "@/components/loading"
import { Text } from "@/components/Themed"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import { useProfilePictureUpload } from "@/lib/hooks/useProfilePictureUpload"
import { trackUserAction } from "@/lib/trackEvent"

/**
 * Etapa de foto de perfil do cadastro. Aparece na primeira entrada na parte
 * logada, logo depois de a conta ser criada — e só aí: quem já tinha conta
 * nunca teve a marca `profilePictureOnboardingPending` ligada.
 *
 * A tela precisa de sessão autenticada porque o upload usa o JWT, e é por isso
 * que ela vive aqui e não no fluxo `(auth)`, antes da conta existir.
 */
export default function OnboardingProfilePictureScreen() {
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()
    const setPending = usePreferencesStore((s) => s.setProfilePictureOnboardingPending)

    const { selectedAsset, loading, error, showPicker, upload } = useProfilePictureUpload()

    /** Fecha a etapa: baixa a marca e entra no app. Não rastreia — quem chama é
     * que sabe se foi envio ou pulo. */
    function finish() {
        setPending(false)
        router.replace("/(tabs)/create")
    }

    async function handleUpload() {
        const ok = await upload()
        if (!ok) return
        trackUserAction("profile_picture_onboarding_completed")
        finish()
    }

    function handleSkip() {
        trackUserAction("profile_picture_onboarding_skipped", {
            // Escolheu uma foto e mesmo assim pulou: é um pulo diferente de
            // quem nem abriu o seletor, e separa desistência de desinteresse.
            had_selected_photo: !!selectedAsset,
        })
        finish()
    }

    const description: TextStyle = {
        marginHorizontal: sizes.margins["1lg"],
        marginBottom: sizes.margins["1md"],
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
    }

    return (
        <View style={styles.container}>
            <Text style={description}>
                {t("A photo helps people recognize you. You can change it later in settings.")}
            </Text>

            <Pressable onPress={showPicker} style={styles.avatarWrapper}>
                {selectedAsset ? (
                    <Image source={{ uri: selectedAsset.uri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarEmpty]}>
                        <SymbolView
                            name="person.fill"
                            tintColor={colors.gray.grey_04}
                            size={AVATAR_SIZE * 0.35}
                        />
                    </View>
                )}
            </Pressable>

            {error ? (
                <Text style={styles.errorText} selectable={false}>
                    {error}
                </Text>
            ) : null}

            <View style={styles.actions}>
                {!selectedAsset ? (
                    <ButtonStandart
                        margins={false}
                        height={sizes.buttons.height * 0.7}
                        action={showPicker}
                        backgroundColor={String(colors.gray.white)}
                        style={styles.primaryBtn}
                    >
                        <Text style={styles.primaryBtnText}>{t("Choose a photo")}</Text>
                    </ButtonStandart>
                ) : (
                    <ButtonStandart
                        margins={false}
                        height={sizes.buttons.height * 0.7}
                        action={handleUpload}
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
                )}

                <Pressable
                    onPress={handleSkip}
                    disabled={loading}
                    hitSlop={12}
                    style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}
                >
                    <Text style={styles.skipText}>{t("Skip for now")}</Text>
                </Pressable>
            </View>
        </View>
    )
}

const AVATAR_SIZE = sizes.screens.width - sizes.margins["1xxl"] * 2

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.gray.black,
        paddingTop: sizes.paddings["1lg"],
    },
    avatarWrapper: {
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
    avatarEmpty: {
        alignItems: "center",
        justifyContent: "center",
    },
    actions: {
        alignItems: "center",
        gap: sizes.margins["1md"],
    },
    primaryBtn: {
        paddingHorizontal: sizes.paddings["1lg"],
    },
    primaryBtnText: {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    skip: {
        paddingVertical: sizes.paddings["1sm"],
    },
    skipText: {
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body,
        color: colors.gray.grey_04,
    },
    errorText: {
        marginBottom: sizes.margins["1md"],
        marginHorizontal: sizes.margins["1lg"],
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.footnote,
        color: colors.red.red_05,
        textAlign: "center",
    },
})
