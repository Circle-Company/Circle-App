import React from "react";
import { Text, View } from "../../../../components/Themed";
import HeaderButton from "../../../../components/headers/headerButton";
import SelectMomentsContext from "../../../../contexts/selectMoments";
import {useNavigation} from '@react-navigation/native'
import fonts from "../../../../layout/constants/fonts";
import ColorTheme, { colors } from "../../../../layout/constants/colors";
import sizes from "../../../../layout/constants/sizes";
import NewMoment from '../../../../assets/icons/svgs/memory.svg'
import ViewProfileContext from "../../../../contexts/viewProfile";

type AnyMemoryCardProps = {
    isAccountScreen?: boolean
}

export default function AnyMemoryCard({isAccountScreen = false}: AnyMemoryCardProps) {
    const { userProfile } = React.useContext(ViewProfileContext)
    const {setFrom} = React.useContext(SelectMomentsContext)
    const navigation = useNavigation()

    function handlePress() {
        setFrom('NEW_MEMORY')
        navigation.navigate('MemoriesNavigator', { screen: 'NewMemorySelectMoments' })
    }

    const container: any = {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
    const title: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        marginBottom: sizes.margins['1md']
    }
    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: colors.gray.white.toString(),
        marginRight: sizes.margins['2sm']
    }

    const username = userProfile? `@${userProfile.username}` : 'This user'

    const titleText = isAccountScreen? "You don't have any memory": `${username} don't have any memory`

    return(
        <View style={container}>
            <View style={{top: sizes.sizes["1md"], alignItems: 'center'}}>
                <Text style={title}>{titleText}</Text>
                {isAccountScreen &&
                    <HeaderButton
                        action={handlePress}
                        marginLeft={false}
                        
                        color={ColorTheme().primary.toString()}
                        width={140}
                        marginRight={false}
                    >
                        <Text style={text}>New Memory</Text>
                        <NewMoment fill={colors.gray.white.toString()} width={16} height={16}/>
                    </HeaderButton>
                }

            </View>                
            </View>

    )
}