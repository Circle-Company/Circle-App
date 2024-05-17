import { FlatList, ScrollView, View } from "react-native"
import React from "react"
import RenderMoment from "./components/render-moments"
import SelectMomentsContext from '../../contexts/selectMoments'
import sizes from "../../layout/constants/sizes"
import { Text } from "../../components/Themed"
import fonts from "../../layout/constants/fonts"
import ColorTheme from "../../layout/constants/colors"

export default function ListSelectMoments() {

    const { all_moments, get_moments } = React.useContext(SelectMomentsContext)

    const item_container = {
        width: sizes.screens.width,
        paddingHorizontal: 8,
    }

    const header_container: any = {
        paddingHorizontal: sizes.paddings["1md"],
        alignItems: 'center',
        justifyContent: 'center',
    }

    const header_text: any = {
        fontSize: fonts.size.footnote*0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled
    }
    

    React.useEffect(() => { get_moments() }, [])
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={header_container}>
                <Text style={header_text}>Select Moments to put in the Memory</Text>
            </View>
            <FlatList
                numColumns={3}
                data={all_moments}
                scrollEnabled={false}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={item_container}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={({item}) => {return <RenderMoment moment={item}/> }}
            />            
        </ScrollView>

    )           
}