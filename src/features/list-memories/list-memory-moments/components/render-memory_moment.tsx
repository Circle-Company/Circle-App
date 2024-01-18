import React from 'react'
import { View } from 'react-native'
import { momentReciveDataProps } from '../../../../components/moment/moment-types'
import { MomentActions } from '../../../../components/moment/moment-actions'
import { Moment } from '../../../../components/moment'
import sizes from '../../../../layout/constants/sizes'
import { colors } from '../../../../layout/constants/colors'

type RenderMemoryMomenProps = {
    moment: momentReciveDataProps,
    viewed: boolean
}
export function RenderMemoryMoment ({ moment, viewed }: RenderMemoryMomenProps) {

    const top_container: any = {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: sizes.margins['1md'],
        marginBottom: sizes.margins['2sm']
    }
    const footer_container: any = {
        marginTop: sizes.margins['1sm'],
        flexDirection: 'row',
        paddingHorizontal: sizes.paddings['1sm']/2
    }
    const footer_left_container: any = {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flex: 1
    }
    const footer_right_container: any = {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    }


    if(viewed) MomentActions.View({moment_id: Number(moment.id)})
    return (
        <Moment.Root.Main data={moment} sizes={sizes.moment.small}>
            <View style={top_container}>
                <Moment.Date color={String(colors.gray.white)} backgroundColor={String(colors.gray.grey_07)}/>
            </View>            


            <Moment.Container contentRender={moment.midia} focused={true}>
            <Moment.Root.Center>
                <Moment.Description/>
            </Moment.Root.Center>
            </Moment.Container>
            <View style={footer_container}>
                <View style={footer_left_container}>
                    <Moment.LikeButton isLiked={false} backgroundColor={String(colors.gray.grey_07)}/>
                </View>
                <View style={footer_right_container}>
                    <View style={{marginRight: sizes.margins['2sm']}}>
                        <Moment.ShareButton color={String(colors.gray.white)} backgroundColor={String(colors.gray.grey_07)}/>
                        
                    </View>
                    <Moment.MoreButton color={String(colors.gray.white)} backgroundColor={String(colors.gray.grey_07)}/>
                    
                </View>
                    
            </View>
        </Moment.Root.Main>

    )
}