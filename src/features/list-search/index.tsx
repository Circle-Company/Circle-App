import React from "react"
import { FlatList } from "react-native"
import { Search } from "../../components/search"
import { useSearchContext } from "../../components/search/search-context"
interface SearchResult {}

export default function ListSearch() {
    const [isLoading, setIsLoading] = React.useState(false)
    const { searchTerm, fetchData, isConnected } = useSearchContext()
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])

    // Use useEffect para atualizar a lista quando o searchTerm mudar
    React.useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                setIsLoading(true)
                const data = await fetchData(searchTerm)
                setSearchResults(data)
                setIsLoading(false)
            } catch (error: any) {
                setIsLoading(false)
                throw new Error(error)
            }
        }

        fetchDataFromApi()
    }, [searchTerm, fetchData])

    if (isConnected == false) return <Search.Offline />
    if (searchTerm.length == 0) return <Search.NotTyping />
    if (isLoading) return <Search.LoadingCard />
    if ((searchTerm && searchResults?.length == 0) || (undefined && !isLoading))
        return <Search.EmptyListCard />
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
