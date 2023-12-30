import React from "react"
import { View } from "react-native"
import { Text } from "../../../Themed"
import { MemoryHeaderLeftProps } from "../../memory-types"
import sizes from "../../../../layout/constants/sizes"
import fonts from "../../../../layout/constants/fonts"
import ColorTheme from "../../../../layout/constants/colors"

export default function header_left ({
    children,
    text = 'Memories',
    number = 0,
}: MemoryHeaderLeftProps) {

    const container:any = {
        alignitems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flex: 1
    }
    const header_text:any = {
        fontSize: fonts.size.body,
        alignSelf: 'center',
        fontFamily: fonts.family.Semibold
    }
    const header_number_container:any = {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ColorTheme().backgroundDisabled,
        paddingHorizontal: sizes.paddings['1sm'],
        paddingVertical: 2,
        marginLeft: sizes.margins['1sm'],
        borderRadius: 40,
        height: sizes.sizes['1md'],
        minWidth: sizes.sizes['1md']
    }
    const header_number:any = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Semibold,
    }
    if(children) {
        return (
            <View style={container}>
                {children}
            </View>
        )
    }else {
        return(
            <View style={container}>
                <Text style={header_text}>{text}</Text>
                <View style={header_number_container}>
                    <Text style={header_number}>{number}</Text>
                </View>
            </View>             
        )

    }
}