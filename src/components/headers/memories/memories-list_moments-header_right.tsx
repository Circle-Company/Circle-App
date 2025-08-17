import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import MemoryContext from "../../../contexts/memory"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import ViewMorebutton from "../../buttons/view_more"

export default function MemoriesListMomentsHeaderRight({ user_id }: { user_id: number }) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { memory } = React.useContext(MemoryContext)
    const navigation = useNavigation()

    const container: any = {
        flexDirection: "row",
        marginRight: sizes.margins["3sm"],
    }

    if (memory.user.id == session.user.id)
        return (
            <View style={container}>
                <ViewMorebutton
                    action={() => {
                        navigation.navigate("MemoriesNavigator", { screen: "EditMemory" })
                    }}
                    text={t("Edit")}
                    scale={1.2}
                    fontFamily={fonts.family.Semibold}
                />
            </View>
        )
    else return null
}
