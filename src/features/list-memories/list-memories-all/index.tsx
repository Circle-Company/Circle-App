import React from 'react';
import { groupObjectsByDate, TimeInterval } from '../../../algorithms/separateArrByDate';
import { Text, View, ActivityIndicator, RefreshControl, ScrollView, useColorScheme, FlatList } from 'react-native';
import ColorTheme, { colors } from '../../../layout/constants/colors';
import { ListMemoriesAll } from './components/list-memories-date_group';
import api from '../../../services/api';
import { Loading } from '../../../components/loading';
import sizes from '../../../layout/constants/sizes';
import EndReached from './components/end-reached';
import NetworkContext from '../../../contexts/network';
import OfflineCard from '../../../components/general/offline';

export default function ListMemoriesAllSeparatedbyDate() {
    
    const [allMemories, setAllMemories] = React.useState<Object[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(30);
    const [loading, setLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [endReached, setEndReached] = React.useState(false);
    const isDarkMode = useColorScheme() === 'dark'
    const {networkStats} = React.useContext(NetworkContext)

    const fetchData = async () => {
        await api.post(`/memory/get-user-memories?page=${page}&pageSize=${pageSize}`, { user_id: 1 })
            .then(function (response) {
                if (page === 1) {
                    setAllMemories(response.data.memories);
                } else {
                    setAllMemories([...allMemories, ...response.data.memories]);
                    if(pageSize > response.data.memories.length) setEndReached(true)
                    else setEndReached(false)
                }setPage(page + 1)
            })
            .catch(function (error) { console.log(error) });
    };

    React.useEffect(() => {
        setLoading(true)
        fetchData()
        .finally(() => {
        setLoading(false)
        setRefreshing(false)            
        })
    }, [])

    React.useEffect(() => {
        fetchData();
    }, [networkStats]);

    const handleRefresh = async () => {
        setPage(1)
        setLoading(true)
        await fetchData()
        .finally(() => {
            setTimeout(() => {
            setLoading(false)
            setRefreshing(false)         
            }, 200)
        })
    };

    const data_to_render = groupObjectsByDate(allMemories, TimeInterval.DAY);

    if(networkStats == 'OFFLINE' && allMemories.length == 0) return <OfflineCard height={(sizes.screens.height - sizes.headers.height)}/>
    if (loading) return (
        <Loading.Container width={sizes.screens.width} height={sizes.screens.height - sizes.headers.height}>
            <Loading.ActivityIndicator/>
        </Loading.Container>
    )

    return (
        <FlatList
            data={data_to_render}
            showsVerticalScrollIndicator={false}
            onEndReached={async() => {await fetchData()}}
            onEndReachedThreshold={0.1}
            refreshControl={
                <RefreshControl
                    progressBackgroundColor={String(isDarkMode? colors.gray.grey_08 : colors.gray.grey_02)}
                    colors={[String(isDarkMode? colors.gray.grey_04: colors.gray.grey_04), '#00000000']}
                    refreshing={refreshing}
                    onRefresh={async() => await handleRefresh()}
                />
            }

            renderItem={({item, index}) => {
                return (
                    <ListMemoriesAll
                        key={index}
                        data={item}
                        date_text={item.date}
                        count={item.count}
                    />
                );                
            }}
            ListFooterComponent={() => {
                if(endReached) return (<EndReached text='No more Memories'/>)
                else return (
                    <Loading.Container width={sizes.screens.width} height={sizes.headers.height * 2}>
                        <Loading.ActivityIndicator/>
                    </Loading.Container>
                )
            }}
        />
    );
}
