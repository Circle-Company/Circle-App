import React from "react"
import { View, Pressable, useColorScheme} from "react-native"
import { Text } from "../../../components/Themed"

import Sizes from "../../../layout/constants/sizes"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { UserShow } from "../../../components/user_show"
import { Profile } from "../../../components/profile"
import fonts from "../../../layout/constants/fonts"
import { formatNumberWithDots } from "../../../algorithms/numberConversor"
import sizes from "../../../layout/constants/sizes"

type RenderNearToYouCardProps = {
    position: number,
    focused?: boolean,
    user: Object
}

export default function RenderNearToYouCard ({
    position,
    focused = true,
    user
}: RenderNearToYouCardProps) {

    const isDarkMode = useColorScheme() === 'dark'

    const container:any = {
        width: Sizes.card.width,
        height: Sizes.card.height,
        paddingHorizontal:sizes.card.paddingHorizontal,
        paddingVertical: sizes.card.paddingVertical,
        borderRadius: sizes.card.borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_01
    }

    const content_container: any = {
        flex: 1,
        paddingTop: sizes.paddings["1sm"]*0.4,
        alignItems: 'center',
        justifyContent: 'center',
        
    } 

    const distance_container: any = {
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: sizes.paddings["1sm"],
        backgroundColor: ColorTheme().primaryBackground + '50',
        borderRadius: 40
    }

    const distance_num_style: any = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.body * 0.9,
        color: ColorTheme().text,
    }
    const total_followers_num_text_style: any = {
        top: 1,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body*0.8,
        color: ColorTheme().textDisabled
    }

    return (
        <View style={container}>
            <View style={distance_container}>
                <Text style={distance_num_style}>2.2Km</Text>
            </View>
            
            <UserShow.Root data={user}>
                <View style={content_container}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{width: 80, height: 80}}
                        displayOnMoment={false}
                    />
                    <UserShow.Username scale={1} displayOnMoment={false}/>
                    
                    <UserShow.FollowButton isFollowing={false}/>                    
                </View>
            </UserShow.Root>
        </View>
    )
}