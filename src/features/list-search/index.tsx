import { FlatList } from "react-native"
import { Text, View } from "../../components/Themed"
import React from "react"
import search_list from "../../data/search_list.json"
import { Search } from "../../components/search"
import { UserShow } from "../../components/user_show"
import { useSearchContext } from "../../components/search/search-context"
import NearToYouUsers from "../list-near_to_you"
import NearToYouContext, { NearToYouContextProvider } from "../../components/near_to_you/near_to_you-context"
interface SearchResult {

}

export default function ListSearch() {

    const { searchTerm, fetchData, isConnected} = useSearchContext()
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])

    // Use useEffect para atualizar a lista quando o searchTerm mudar
    React.useEffect(() => {
        const fetchDataFromApi = async () => {
        try {
            const data = await fetchData(searchTerm)
            setSearchResults(data)
            
        } catch (error) {
            console.error(error)
        }
    }

        fetchDataFromApi();
    }, [searchTerm, fetchData])

    
    if(isConnected == false) return <Search.Offline/>
    else {
        return (
            <View>
                <FlatList
                scrollEnabled={false}
                data={searchResults}
                keyExtractor={(item: any) => item.id}
                renderItem={({item}) => {
                    return (
                        <Search.RenderUser user={item}/>
                    )
                }}
                />
            </View>
        )           
    }
}