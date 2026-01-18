import ProfilePictureScreen from "@/pages/app/Settings/public.profile.picture"

export default function ProfilePictureScreen() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const [selectedAsset, setSelectedAsset] = React.useState<ImagePicker.ImagePickerAsset | null>(
        null,
    )
    const { expand } = React.useContext(BottomSheetContext)
    const [loading, setLoading] = React.useState(false)
    const [pickerVisible, setPickerVisible] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const navigation = useNavigation()
    const [isIOSSheetOpen, setIOSSheetOpen] = React.useState(false)

    async function pickFromLibrary() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== "granted") {
                setError("Permissão para acessar a galeria é necessária.")
                return
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
                base64: false,
            })
            if (!result.canceled && result.assets?.length) {
                setSelectedAsset(result.assets[0])
                setPickerVisible(false)
                setError(null)
            }
        } catch (e: any) {
            setError(e?.message ?? "Falha ao abrir a galeria.")
        }
    }

    async function pickFromCamera() {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== "granted") {
                setError("Permissão para usar a câmera é necessária.")
                return
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
                base64: false,
            })
            if (!result.canceled && result.assets?.length) {
                setSelectedAsset(result.assets[0])
                setPickerVisible(false)
                setError(null)
            }
        } catch (e: any) {
            setError(e?.message ?? "Falha ao abrir a câmera.")
        }
    }

    async function updateProfilePicture() {
        if (!selectedAsset) return
        try {
            Keyboard.dismiss()
        } catch {}

        setLoading(true)
        setError(null)

        try {
            const imageBase64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                encoding: FileSystem.EncodingType.Base64,
            })

            const token = session.account.jwtToken
            const auth = token?.startsWith("Bearer ") ? token : token ? `Bearer ${token}` : ""

            await api.put(
                "/account/edit/profile-picture",
                {
                    user_id: session.user.id,
                    midia: { base64: imageBase64 },
                    metadata: {
                        file_name: selectedAsset.fileName || "profile-picture.jpg",
                        file_size: selectedAsset.fileSize || 0,
                        file_type:
                            (selectedAsset as any)?.mimeType || selectedAsset.type || "image/jpeg",
                        resolution_width: selectedAsset.width || 0,
                        resolution_height: selectedAsset.height || 0,
                    },
                },
                auth ? { headers: { Authorization: auth } } : undefined,
            )

            // Atualiza dados locais (ou refetch)
            try {
                await (session.user as any).get?.(session.user.id)
            } catch {}

            setSelectedAsset(null)
            navigation.goBack()
        } catch (e: any) {
            setError(e?.message ?? t("Not possible send your picture"))
        } finally {
            setLoading(false)
        }
    }
    function handlePressViewMore() {
        if (isIOS) {
            setIOSSheetOpen(true)
        } else {
            expand({
                snapPoints: ["60%"],
                enablePanDownToClose: true,
                children: <FetchedCommentsList />,
            })
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.avatarWrapper}>
                <Image
                    source={{
                        uri: selectedAsset?.uri || session.user.profilePicture,
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
                    action={}
                    backgroundColor={String(colors.gray.white)}
                    style={styles.primaryBtn}
                >
                    <Text style={styles.primaryBtnText}>{t("Change Picture")}</Text>
                </ButtonStandart>
            ) : (
                <View style={styles.bottomBar}>
                    <ButtonStandart
                        margins={false}
                        width={sizes.buttons.width * 0.55}
                        height={sizes.buttons.height * 0.9}
                        action={updateProfilePicture}
                        backgroundColor={String(colors.gray.white)}
                        style={styles.primaryBtn}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.primaryBtnText}>Enviando</Text>
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
            {isIOS && isIOSSheetOpen && (
                <SwiftBottomSheet
                    isOpened={isIOSSheetOpen}
                    onIsOpenedChange={(opened) => {
                        if (!opened) setIOSSheetOpen(false)
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.sheetBtn}
                        onPress={pickFromCamera}
                    >
                        <Text style={styles.sheetBtnText}>Abrir câmera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.sheetBtn}
                        onPress={pickFromLibrary}
                    >
                        <Text style={styles.sheetBtnText}>Escolher da galeria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.sheetBtn, styles.sheetCancel]}
                        onPress={() => setPickerVisible(false)}
                    >
                        <Text style={[styles.sheetBtnText, { color: colors.gray.grey_04 }]}>
                            {t("cancel")}
                        </Text>
                    </TouchableOpacity>
                </SwiftBottomSheet>
            )}

            <Modal
                animationType="fade"
                transparent
                visible={pickerVisible}
                onRequestClose={() => setPickerVisible(false)}
            >
                <View style={styles.sheetBackdrop}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{}</Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.sheetBtn}
                            onPress={pickFromCamera}
                        >
                            <Text style={styles.sheetBtnText}>Abrir câmera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.sheetBtn}
                            onPress={pickFromLibrary}
                        >
                            <Text style={styles.sheetBtnText}>Escolher da galeria</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.sheetBtn, styles.sheetCancel]}
                            onPress={() => setPickerVisible(false)}
                        >
                            <Text style={[styles.sheetBtnText, { color: colors.gray.grey_04 }]}>
                                {t("cancel")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderTopWidth: sizes.borders["1md"],
        borderBottomWidth: sizes.borders["1md"],
        borderColor: ColorTheme().backgroundDisabled,
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
