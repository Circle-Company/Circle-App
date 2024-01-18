import { FlatList } from "react-native"
import { Text, View } from "../../components/Themed"
import React from "react"
import sizes from "../../layout/constants/sizes"
import ColorTheme, { colors } from "../../layout/constants/colors"
import { Loading } from "../../components/loading"
import { useFamousUsersContext } from "../../components/ranking/ranking-context"
import RenderRankingCard from "./components/render-ranking_card"
import RenderRankingHeader from "./components/render-ranking_header"
import { Ranking } from "../../components/ranking"
import ViewMorebutton from "../../components/buttons/view_more"
import { useNavigation } from "@react-navigation/native"

interface RankingResult {

}

export default function ListMostFamousUsers() {
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

    const {fetchData, isConnected} = useFamousUsersContext()
    const [famousResults, setFamousResults] = React.useState<RankingResult[]>([])

    // Use useEffect para atualizar a lista quando o searchTerm mudar
    React.useEffect(() => {
        const fetchDataFromApi = async () => {
        try {
            const data = await fetchData()
            setFamousResults(data.topUsers)
            
        } catch (error) {
            console.error(error)
        }
    }

        fetchDataFromApi();
    }, [fetchData])

    return (
        <View>
            <Ranking.Header>
                <Ranking.HeaderLeft>
                    <RenderRankingHeader text={'Most Famous Users'}/>
                </Ranking.HeaderLeft>
                <Ranking.HeaderRight>
                    <ViewMorebutton action={()=> { navigation.navigate('')}} text="View All"/>
                </Ranking.HeaderRight>
            </Ranking.Header>
            <FlatList
                data={famousResults}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(moment: any) => moment.id}
                renderItem={({item, index}) => {
                    return (
                        <View style={index == 0? container_0: container && index +1 == famousResults.length? container_1: container}>
                            <RenderRankingCard user={item} position={index + 1}/>
                        </View>
                    )                              
                }}
                ListFooterComponent={() => {
                    return (
                            <Loading.Container width={sizes.card.width*0.7} height={sizes.card.height*0.8}>
                                <Loading.ActivityIndicator
                                    interval={10}
                                    size={40}
                                    from_color={String(colors.gray.grey_09)}
                                    to_color={String(colors.gray.grey_07)}
                                />
                            </Loading.Container>               
                    )
                }}
            />
        </View>  
    )
}