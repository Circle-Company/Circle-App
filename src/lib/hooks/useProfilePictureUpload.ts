import React from "react"
import { ActionSheetIOS, Alert, Keyboard, Platform } from "react-native"
import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"

import api from "@/api"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"

/**
 * Escolha e envio da foto de perfil, compartilhado entre a tela de ajustes e a
 * etapa de onboarding do cadastro. As duas mandam para `POST
 * /account/profile-picture` e precisam do mesmo tratamento de permissão,
 * conversão para JPEG e base64 — duplicar isso seria pedir para as duas telas
 * divergirem no primeiro ajuste.
 */
export function useProfilePictureUpload() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)

    const [selectedAsset, setSelectedAsset] = React.useState<ImagePicker.ImagePickerAsset | null>(
        null,
    )
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    async function pickFromLibrary() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== "granted") {
                setError(t("Permission to access the gallery is required"))
                return
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
                base64: true,
            })
            if (!result.canceled && result.assets?.length) {
                setSelectedAsset(result.assets[0])
                setError(null)
            }
        } catch (e: any) {
            setError(e?.message ?? t("Failed to open the gallery"))
        }
    }

    async function pickFromCamera() {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
                setError(t("Permission to use the camera is required"))
                return
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
                base64: true,
            })
            if (!result.canceled && result.assets?.length) {
                setSelectedAsset(result.assets[0])
                setError(null)
            }
        } catch (e: any) {
            setError(e?.message ?? t("Failed to open the camera"))
        }
    }

    /** Menu nativo de origem da imagem: câmera ou galeria. */
    function showPicker() {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title: t("Change Picture"),
                    userInterfaceStyle: "dark",
                    options: [t("Open Camera"), t("Choose from Library"), t("Cancel")],
                    cancelButtonIndex: 2,
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) pickFromCamera()
                    else if (buttonIndex === 1) pickFromLibrary()
                },
            )
        } else {
            Alert.alert(
                t("Change Picture"),
                "",
                [
                    { text: t("Open Camera"), onPress: pickFromCamera },
                    { text: t("Choose from Library"), onPress: pickFromLibrary },
                    { text: t("Cancel"), style: "cancel" },
                ],
                { cancelable: true },
            )
        }
    }

    /** `true` só quando o upload confirmou. Quem chama decide o que fazer depois. */
    async function upload(): Promise<boolean> {
        if (!selectedAsset) return false
        try {
            Keyboard.dismiss()
        } catch {}

        setLoading(true)
        setError(null)

        try {
            const manipulated = await ImageManipulator.manipulateAsync(selectedAsset.uri, [], {
                compress: 0.9,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
            })
            const imageBase64 = manipulated.base64 || ""

            const formData = new FormData()
            formData.append("imageData", `data:image/jpeg;base64,${imageBase64}`)

            // Só o `Content-Type`: o `Authorization` é do interceptor (§3.2).
            await api.post("/account/profile-picture", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            // Atualiza os dados locais para a foto nova aparecer sem reabrir o app.
            try {
                await (session.account as any).get?.(session.account.userId)
            } catch {}

            setSelectedAsset(null)
            return true
        } catch (e: any) {
            console.error("ProfilePicture: upload error", e)
            setError(e?.message ?? t("Not possible send your picture"))
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        selectedAsset,
        setSelectedAsset,
        loading,
        error,
        pickFromLibrary,
        pickFromCamera,
        showPicker,
        upload,
    }
}
