import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { Profile } from "../../profile"
import { useColorScheme, View, Text} from "react-native"
import { UserShow } from "../../user_show"
import { SearchRenderItemReciveDataObjectProps } from "../search-types"
import { formatNumberWithDots } from "../../../algorithms/numberConversor"
import LanguageContext from "../../../contexts/Preferences/language"
import React from "react"
import Animated, { FadeInDown } from "react-native-reanimated"
export default function render_user({user}: SearchRenderItemReciveDataObjectProps) {
    const {t} = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === 'dark'

    const container: any = {
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"]*0.7,
        height: sizes.sizes["3lg"]*0.85,
        alignItems: 'flex-start',
        justifyContent: 'center',
    }
    const container_left: any = {
        alignItems: 'flex-start',
        justifyContent: 'center',
    }
    const container_center: any = {
        top: -2,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    }
    const container_center_bottom: any = {
        top: -4,
        flexDirection: 'row',
        alignItems: 'flex-start',
    }
    const total_followers_num_style: any = {
        marginLeft: sizes.margins["1sm"],
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled
    }

    const dot_style: any = {
        color: ColorTheme().textDisabled
    }
    const container_right: any = {
        alignItems: 'flex-end',
        justifyContent: 'center',
    }
    
    return (
        <Animated.View entering={FadeInDown.duration(200)} style={container}>
            <UserShow.Root data={user}>
                <View style={container_left}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{width: 50, height: 50}}
                        displayOnMoment={false}
                    />
                </View>
                <View style={container_center}>
                    <UserShow.Username
                        truncatedSize={20}
                        fontSize={fonts.size.subheadline}
                        displayOnMoment={false}
                    />
                    <View style={container_center_bottom}>
                        <Profile.MainRoot data={user}>
                            {user.name &&
                                <Profile.Name
                                    fontFamily={fonts.family.Medium}
                                    fontSize={fonts.size.body}
                                    color={String(ColorTheme().textDisabled)}
                                />
                            }
                            {user.name && user.statistic.total_followers_num > 0?
                                <Text style={dot_style}>•</Text> : null
                            }
                            {user.statistic.total_followers_num > 0 &&
                                <Text style={total_followers_num_style}>
                                    {formatNumberWithDots(user.statistic.total_followers_num)}
                                    {user.statistic.total_followers_num> 1? ' ' + t('followers'): ' ' + t('follower')}
                                </Text>
                            }
                        </Profile.MainRoot>                        
                    </View>
                </View>
            </UserShow.Root>            
        </Animated.View>
    )
}