import ShareIcon from "@/assets/icons/svgs/arrow_shape_right.svg"
import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import ButtonStandart from "../../buttons/button-standart"
import { Text } from "../../Themed"
import { useProfileContext } from "../profile-context"
import { ProfileShareProps } from "../profile-types"
export default function share({
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled),
}: ProfileShareProps) {
    const { user } = useProfileContext()

    const container: any = {
        flexDirection: "row",
        alignitems: "center",
        justifyContent: "center",
    }

    const text_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
    }

    const icon_container: any = {
        marginLeft: sizes.margins["1sm"],
        top: 2,
    }
    return (
        <ButtonStandart
            action={() => {}}
            backgroundColor={backgroundColor}
            margins={false}
            width={sizes.buttons.width / 3.6}
        >
            <View style={container}>
                <Text style={text_style}>Share</Text>
                <View style={icon_container}>
                    <ShareIcon fill={color} width={16} height={16} />
                </View>
            </View>
        </ButtonStandart>
    )
}
