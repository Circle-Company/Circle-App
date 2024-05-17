import ColorTheme, { colors } from "../../../layout/constants/colors"
import sizes from "../../../layout/constants/sizes"
import { Text } from "../../Themed"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import EyeSlash from '../../../assets/icons/svgs/eye_slash-outline.svg'
import Link from '../../../assets/icons/svgs/link.svg'
import Exclamation from '../../../assets/icons/svgs/exclamationmark_circle.svg'
import fonts from "../../../layout/constants/fonts"
import { Modalize } from 'react-native-modalize'
import React from 'react'
import { MomentDataProps, MomentStatisticsProps } from "../context/types"

type OptionsProps = {
    momentData: MomentDataProps
    showStatisticSection: boolean
    statistics: MomentStatisticsProps
    getStatistics: () => Promise<void>
    setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function options ({
    setShowOptionsModal
}:OptionsProps) {
    const isDarkMode = useColorScheme() === 'dark'
    const modalizeRef = React.useRef<Modalize>(null)
    const width = sizes.screens.width
    
    const container: any = {
        width,
        borderTopLeftRadius: sizes.borderRadius["1lg"],
        borderTopRightRadius: sizes.borderRadius["1lg"],
        backgroundColor: isDarkMode? colors.gray.grey_08 : colors.gray.white,
        paddingVertical: sizes.paddings["1sm"],
    }

    const statisticContainer: any = {
        height: sizes.headers.height * 1.5,
        width: sizes.screens.width,
    }

    const item_container: any = {
        height: sizes.sizes["3md"],
        alignItems: 'center',
        paddingHorizontal: sizes.paddings["2sm"] * 1.3,
        flexDirection: 'row',
    }

    const text_item: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        marginLeft: sizes.margins["1md"]
    }
    
    const iconmomentSize = 16
    const Items = [
        {
            title: 'Copy Link',
            icon: <Link style={{top: 1}} fill={ColorTheme().text.toString()} width={iconmomentSize} height={iconmomentSize}/>,
            action: () => {}
        },
        {
            title: 'Show Less Often',
            icon: <EyeSlash style={{top: 1}} fill={ColorTheme().text.toString()} width={iconmomentSize} height={iconmomentSize}/>,
            action: () => {}
        },
        {
            title: 'Report',
            icon: <Exclamation style={{top: 1}} fill={ColorTheme().text.toString()} width={iconmomentSize} height={iconmomentSize}/>,
            action: () => {}
        }      
    ]

    function HeaderComponent() {
        return (
            <View style={statisticContainer}>
                <Text>Analytics</Text>
            </View> 
        )
    }


    return (
        <Modalize
        modalStyle={container}
        modalHeight={sizes.headers.height * 6}
        useNativeDriver={true}
        onOverlayPress={() => setShowOptionsModal(false)}
        withHandle={false}
        disableScrollIfPossible={true}
        closeOnOverlayTap={true}
        ref={modalizeRef}
        HeaderComponent = {<HeaderComponent/>}
        flatListProps={{
            data: Items,
            ItemSeparatorComponent: (() => {return <View style={{flex: 1, height: 1, backgroundColor: ColorTheme().backgroundDisabled.toString()}}/>}),
            renderItem: ({item}) => {
                return (
                    <TouchableOpacity style={item_container}>
                        {item.icon}
                        <Text style={text_item}>{item.title}</Text>
                    </TouchableOpacity  >
                )
            }}
        }
        >
        </Modalize>
    )

}