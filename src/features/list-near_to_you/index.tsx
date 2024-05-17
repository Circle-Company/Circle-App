import { FlatList } from "react-native"
import { Text, View } from "../../components/Themed"
import React from "react"
import sizes from "../../layout/constants/sizes"
import ColorTheme, { colors } from "../../layout/constants/colors"
import { Loading } from "../../components/loading"
import { useNearToYouContext } from "../../components/near_to_you/near_to_you-context"
import RenderNearToYouCard from "./components/render-near_to_you_card"
import RenderNearToYouHeader from "./components/render-near_to_you_header"
import { NearToYou } from "../../components/near_to_you"
import ViewMorebutton from "../../components/buttons/view_more"
import { useNavigation } from "@react-navigation/native"

interface nearToYouResultProps {

}

export default function ListNearToYouUsers() {
    const navigation = useNavigation()
    const margin = 5

    const container_0 = {
        marginLeft: ((sizes.screens.width - sizes.card.width + margin*2)/15) - margin ,
        marginRight: margin,
    }
    const container = {
        marginRight: margin,
    }
    const container_1 = {
        
    }

    const {fetchData, isConnected} = useNearToYouContext()
    const [ nearToYouData, setNearToYouData] = React.useState<nearToYouResultProps[]>([])

    // Use useEffect para atualizar a lista quando o searchTerm mudar
    React.useEffect(() => {
        const fetchDataFromApi = async () => {
        try {
            const data = await fetchData()
            setNearToYouData(data.topUsers)
            
        } catch (error) {
            console.error(error)
        }
    }

        fetchDataFromApi();
    }, [fetchData])

    return (
        <View>
            <NearToYou.Header>
                <NearToYou.HeaderLeft>
                    <RenderNearToYouHeader text={'Near to you'}/>
                </NearToYou.HeaderLeft>
            </NearToYou.Header>
            <FlatList
                data={nearToYouData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(moment: any) => moment.id}
                renderItem={({item, index}) => {
                    return (
                        <View style={index == 0? container_0: container && index +1 == famousResults.length? container_1: container}>
                            <RenderNearToYouCard user={item} position={index + 1}/>
                        </View>
                    )                              
                }}
                ListFooterComponent={() => {
                    return (
                            <Loading.Container width={sizes.card.width*0.7} height={sizes.card.height*0.8}>
                                <Loading.ActivityIndicator
                                    size={40}
                                />
                            </Loading.Container>               
                    )
                }}
            />
        </View>  
    )
}