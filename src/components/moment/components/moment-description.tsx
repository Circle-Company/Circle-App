import React from "react"
import { View, Text, Pressable } from "react-native"

import Sizes from "../../../layout/constants/sizes"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { MomentUsernameProps } from "../moment-types"
import { useMomentContext } from "../moment-context"
import { truncated } from "../../../algorithms/processText"

export default function description ({
}: MomentUsernameProps) {
    const { moment } = useMomentContext()

    const [viewMore, setViewMore] = React.useState(false)
    const [description, setDescription] = React.useState(moment.description)

    const truncatedDescription = truncated({text:String(moment.description), size: 50})

    React.useEffect(() => {
        setDescription(truncatedDescription)
    }, [])

    function useViewMore() {
        if(viewMore) {
            setViewMore(false)
            setDescription(truncatedDescription) 
        }else {
            setViewMore(true)
            setDescription(moment.description)            
        }
    }

    const container:any = {
        margin: Sizes.margins["1sm"],
    }
    const description_style:any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        textShadowColor: '#00000070',
        textShadowOffset: { width: 0.3, height: 0.7 },
        textShadowRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

    const viewMore_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.transparent.white_80,
    }


    
    return (
        <View style={container}>
            <Text style={description_style}>{description}
                {moment.description?.length <= 50? null:
                    <Pressable onPress={() => useViewMore()}>
                        <Text style={viewMore_style}>{viewMore? 'Less': 'More'}</Text>
                    </Pressable>              
                }
            </Text>  
        </View>
    )
}