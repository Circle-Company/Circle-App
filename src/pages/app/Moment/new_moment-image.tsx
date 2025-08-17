import RenderSelectFromGalleryButton from "@/features/new_moment/render-select_button copy"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import { MidiaRender } from "../../../components/midia_render"
import NewMomentContext from "../../../contexts/newMoment"
import RenderSelectButton from "../../../features/new_moment/render-select_button"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"

export default function NewMomentImageScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const { selectedImage, handleLaunchImageLibrary } = React.useContext(NewMomentContext)

    const [image, setImage] = React.useState(selectedImage)

    React.useEffect(() => {
        if (selectedImage) setImage(selectedImage.assets[0].uri)

        console.log(selectedImage)
    }, [selectedImage])

    const container = {
        paddingTop: sizes.paddings["1md"],
        alignItems: "center",
        flex: 1,
    }

    const midia_container = {
        overflow: "hidden",
        marginBottom: sizes.margins["1md"],
    }

    const image_container = {
        overflow: "hidden",
        borderRadius: sizes.moment.standart.borderRadius * 0.6,
        borderWidth: 1.5,
        borderColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_02,
    }

    const selectButtonContainer: any = {
        width: sizes.screens.width,
        height: "90%",
        alignItems: "center",
        justifyContent: "center",
    }

    return (
        <View style={container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={midia_container}>
                {image && (
                    <View style={image_container}>
                        <MidiaRender.Root
                            data={{ fullhd_resolution: image }}
                            content_sizes={{
                                ...sizes.moment.standart,
                                borderRadius: sizes.moment.standart.borderRadius * 0.6,
                            }}
                        >
                            <MidiaRender.RenderImage />
                        </MidiaRender.Root>
                    </View>
                )}
            </View>

            {image ? (
                <RenderSelectButton />
            ) : (
                <View style={selectButtonContainer}>
                    <RenderSelectFromGalleryButton />
                </View>
            )}
        </View>
    )
}
