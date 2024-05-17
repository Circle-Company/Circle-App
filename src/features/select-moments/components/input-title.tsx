import React from "react"
import { View } from "../../../components/Themed"
import { Text, TextInput } from "react-native"
import sizes from "../../../layout/constants/sizes"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import SelectMomentsContext from "../../../contexts/selectMoments"
type RenderMomentProps = {
}

export default function TitleInput({
}: RenderMomentProps) {

    const {setTitle, title} = React.useContext(SelectMomentsContext)

    const container = {
        width: 258,
    }

    const input_container = {
        width: 258,
        height: sizes.headers.height,
        backgroundColor: ColorTheme().backgroundDisabled,
        borderRadius: 258 /2,
        marginTop: sizes.margins["2sm"],
        paddingVertical: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1md"]* 0.7,
        alignItems: 'flex-start',
        justifyContent: 'center'
    }

    const text_style: any = {
        marginLeft: sizes.margins["3sm"],
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text
    }

    const input_style : any = {
        top: 2,
        fontFamily: fonts.family.Semibold,
        width: 258 - (sizes.paddings["1md"]* 0.7) * 2,
        height: sizes.headers.height - sizes.paddings["1sm"] * 2,
    }

    const handleInputChange = (text: string) => { setTitle(text) }

    return (
        <View style = {container}>
            <Text style={text_style}>Title ✏️</Text>            
        
            <View style = {input_container}>
                <TextInput
                    value={title}
                    onChangeText={handleInputChange}
                    numberOfLines={1}
                    maxLength={30}
                    style={input_style}
                    placeholder="New Memory"
                    placeholderTextColor={String(ColorTheme().textDisabled)}
                />
            </View>
        </View>
    )
}