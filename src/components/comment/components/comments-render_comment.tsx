import React from "react"
import { View } from "react-native"
import { CommentsRenderCommentProps } from "../comments-types"
import { UserShow } from "../../user_show"
import { useMomentContext } from "../../moment/moment-context"
import { Text } from "../../Themed"
import ColorTheme from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import { timeDifferenceConverter } from "../../../algorithms/dateConversor"

export default function render_comment ({comment, index}: CommentsRenderCommentProps) {
    const {momentSizes} = useMomentContext()
    
    const container:any = {
        flexDirection: 'row',
        marginTop: sizes.margins["1sm"]/2,
        marginBottom: sizes.margins["1sm"]
    }
    const container_left:any = {
        left: -2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginRight: sizes.margins["1sm"]/2
    }
    const container_right:any = {
        left: -2,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center'
    }
    const container_right_top:any = {
        flexDirection: 'row'
    }
    const container_right_center:any = {
    }
    const content_style = {
        marginTop: -2,
        fontSize: fonts.size.body*0.9,
        fontFamily: 'RedHatDisplay-Medium',

    }
    const date_style = {
        marginLeft: 5,
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled
    }

    return (
        <View style={container}>
            <View style={container_left}>
                <UserShow.Root data={comment.user}>
                <UserShow.ProfilePicture
                    pictureDimensions={{width: 28, height:28}}
                    displayOnMoment={false}
                />
                </UserShow.Root>

            </View>
            <View style={container_right}>
                <View style={container_right_top}>
                    <UserShow.Root data={comment.user}>
                        <UserShow.Username
                            displayOnMoment={false}
                            truncatedSize={20}
                            color={ColorTheme().textDisabled}
                            fontFamily={fonts.family.Medium}
                            fontSize={fonts.size.caption1}
                            margin={0}
                        />
                    </UserShow.Root>     
                    <Text style={date_style}>{timeDifferenceConverter({date: String(comment.created_at)})}</Text>                
                </View>
                <View style={container_right_center}>
                    <Text style={content_style}>{comment.content}</Text>                    
                </View>


            </View>

        </View>
    )
}