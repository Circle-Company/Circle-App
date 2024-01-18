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

type RenderRankingCardProps = {
    position: number,
    focused?: boolean,
    user: Object
}

export default function RenderRankingCard ({
    position,
    focused = true,
    user
}: RenderRankingCardProps) {

    const isDarkMode = useColorScheme() === 'dark'

    const container:any = {
        paddingHorizontal:sizes.card.paddingHorizontal,
        paddingVertical: sizes.card.paddingVertical,
        borderRadius: sizes.card.borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode? colors.gray.grey_09: colors.gray.grey_01
    }

    const content_container: any = {
        alignItems: 'center',
        justifyContent: 'center',
        
    } 
    const profile_container: any = {
        width: Sizes.card.width - Sizes.card.paddingHorizontal*2,
        backgroundColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02,
        paddingHorizontal: Sizes.paddings["1sm"],
        marginTop: Sizes.margins["1sm"],
        paddingVertical: Sizes.paddings['1sm']*0.5,
        borderRadius: Sizes.borderRadius["1md"],
        alignItems: 'center',
        justifyContent: 'center',
    }

    const total_followers_num_style: any = {
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.headline * 0.9,
        color: ColorTheme().text
    }
    const total_followers_num_text_style: any = {
        top: 1,
        fontFamily: fonts.family.Semibold,
        fontSize: fonts.size.body*0.8,
        color: ColorTheme().textDisabled
    }

    return (
        <View style={container}>

            <UserShow.Root data={user}>
                <View style={content_container}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{width: 70, height: 70}}
                        displayOnMoment={false}
                    />
                    <UserShow.Username scale={1.2} displayOnMoment={false}/>
                    <Profile.MainRoot data={user}>
                        <View style={profile_container}>
                                <Text style={total_followers_num_style}>
                                    {formatNumberWithDots(user.statistic.total_followers_num)}
                                </Text>
                                
                                <Text style={total_followers_num_text_style}>
                                    {user.statistic.total_followers_num> 1? ' followers': ' follower'}
                                </Text>    
                        </View>

                        </Profile.MainRoot>                     
                </View>
            </UserShow.Root>
        </View>
    )
}