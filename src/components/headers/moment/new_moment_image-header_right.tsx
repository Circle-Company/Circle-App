import { useRouter } from "expo-router"
import React from "react"
import { View } from "react-native"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import NewMomentContext from "../../../contexts/newMoment"
import LanguageContext from "../../../contexts/Preferences/language"
import ViewMorebutton from "../../buttons/view_more"

export default function NewMomentImageRight() {
    const { t } = React.useContext(LanguageContext)
    const { selectedImage } = React.useContext(NewMomentContext)

    const router = useRouter()

    const container: any = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
        opacity: selectedImage ? 1 : 0.35,
    }

    return (
        <View style={container}>
            <ViewMorebutton
                action={() => {
                    selectedImage ? router.push("/moment/new-description") : null
                }}
                text={t("Next")}
                scale={1.2}
                fontFamily={selectedImage ? fonts.family.Bold : fonts.family.Semibold}
            />
        </View>
    )
}
