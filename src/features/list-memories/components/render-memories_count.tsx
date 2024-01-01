import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { View } from "react-native"
import { Text } from "../../../components/Themed"
import MemoryIcon from '../../../assets/icons/svgs/memory.svg'

type RenderMemoriesCountProps = {
    count: number,
    backgroundColor?: string,
    color?: string
}

export default function RenderMemoriesCount ({
    count,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    color = String(ColorTheme().text)
}: RenderMemoriesCountProps) {
    const container:any = {
        height: sizes.sizes["2md"]*0.9,
        borderRadius: (sizes.sizes["2md"]*0.9)/2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizes.paddings["2sm"],
        backgroundColor,
        flexDirection: 'row'
    }
    const description_style:any = {
        fontSize: fonts.size.body*0.8,
        fontFamily: fonts.family.Semibold,
        color
    }
    
    return (
        <View style={container}>
            <MemoryIcon fill={color} width={14} height={14} style={{marginRight: sizes.margins["1sm"]*1.4}}/>
            <Text style={description_style}>{count}</Text>  
        </View>
    )
}