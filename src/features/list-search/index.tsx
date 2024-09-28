import React from "react"
import { FlatList } from "react-native"
import { Search } from "../../components/search"
import { useSearchContext } from "../../components/search/search-context"
interface SearchResult {}

export default function ListSearch() {
    const { searchTerm, fetchData, isConnected } = useSearchContext()
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

        fetchDataFromApi()
    }, [searchTerm, fetchData])

    if (isConnected == false) return <Search.Offline />
    else {
        return (
            <FlatList
                scrollEnabled={false}
                data={searchResults}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => {
                    return <Search.RenderUser user={item} />
                }}
            />
        )
    }
}
