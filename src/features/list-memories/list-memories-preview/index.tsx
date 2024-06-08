import React from 'react';
import { View, FlatList, RefreshControl, useColorScheme} from 'react-native';
import { Memory } from '../../../components/memory';
import RenderMemory from '../components/render-memory';
import ViewMorebutton from '../../../components/buttons/view_more';
import { useNavigation } from '@react-navigation/native';
import RenderMemoriesCount from '../components/render-memories_count';
import api from '../../../services/api';
import AnyMemoryCard from './components/any_memory-card';
import { Loading } from '../../../components/loading';
import sizes from '../../../layout/constants/sizes';
import EndReached from './components/end-reached';
import NetworkContext from '../../../contexts/network';
import OfflineCard from '../../../components/general/offline';
import { colors } from '../../../layout/constants/colors';
import { userReciveDataProps } from '../../../components/user_show/user_show-types';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import MemoryContext from '../../../contexts/memory';
import PersistedContext from '../../../contexts/Persisted';

type RenderMemoriesPreviewProps = {
    enableScroll?: boolean
    isAccountScreen?: boolean
    user: userReciveDataProps
};

export default function ListMemoriesPreview({isAccountScreen = false, user}: RenderMemoriesPreviewProps) {
    const [memories, setMemories] = React.useState([])
    const { session } = React.useContext(PersistedContext)
    const [loading, setLoading] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(3)
    const [refreshing, setRefreshing] = React.useState(false)
    const [endReached, setEndReached] = React.useState(false)
    const { setAllMemoriesUserId } = React.useContext(MemoryContext)
    const { networkStats } = React.useContext(NetworkContext)
    const isDarkMode = useColorScheme() === 'dark'

    const fetchData = async () => {
        await api.post(`/memory/get-user-memories?page=${page}&pageSize=${pageSize}`, { user_id: user.id })
            .then(function (response) {
                if (page === 1) setMemories(response.data.memories);
                else {
                    setMemories([...memories, ...response.data.memories]);
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
        if(networkStats !== 'OFFLINE'){
            setLoading(true)
            fetchData()
            .finally(() => {
                setLoading(false)
                setRefreshing(false)         
            })            
        }
    }, [networkStats])

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

    const navigation = useNavigation();

    const container = {};
    const content_container: any = {
        flexDirection: 'row',
    };

    if(networkStats == 'OFFLINE' && memories.length == 0) return <OfflineCard height={(sizes.screens.height - sizes.headers.height) / 2}/>

    if (loading) return (
        <Loading.Container width={sizes.screens.width} height={sizes.screens.height/2.2}>
            <Loading.ActivityIndicator/>
        </Loading.Container>
    );
    if (memories.length === 0) return <AnyMemoryCard isAccountScreen={isAccountScreen}/>;
    return (
        <View style={container}>
            <Memory.Header>
                <Memory.HeaderLeft>
                    <RenderMemoriesCount count={memories.length} />
                </Memory.HeaderLeft>
                <Memory.HeaderRight>
                    <ViewMorebutton action={() => {
                        navigation.navigate('MemoriesNavigator', { screen: 'Memories' })
                        setAllMemoriesUserId(isAccountScreen? session.user.id : user.id)
                    }} text="View All" />
                </Memory.HeaderRight>
            </Memory.Header>
            <FlatList
                style={content_container}
                data={memories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onEndReachedThreshold={0.3}
                onEndReached={async () => {fetchData()}}
                refreshControl={
                    <RefreshControl
                        progressBackgroundColor={String(isDarkMode? colors.gray.grey_08 : colors.gray.grey_02)}
                        colors={[String(isDarkMode? colors.gray.grey_04: colors.gray.grey_04), '#00000000']}
                        refreshing={refreshing}
                        onRefresh={async() => await handleRefresh()}
                    />
                }
                ListHeaderComponent={() => {return <View style={{ width: 15 }} />}}
                ListFooterComponent={() => {
                    if(endReached) return (
                        <EndReached
                            width={sizes.moment.tiny.width * 1.2}
                            height={sizes.moment.tiny.height * 0.9}
                            text='No more Memories'
                        />
                    )
                    else return (
                        <Loading.Container width={sizes.moment.tiny.width} height={sizes.moment.tiny.height}>
                            <Loading.ActivityIndicator/>
                        </Loading.Container>
                    )
                }}
                renderItem={({ item, index }) => {
                    return(
                    <Animated.View entering={FadeInLeft.duration(200)}>
                        <RenderMemory memory={item} user_id={user.id} />
                    </Animated.View>
                    
                    )
                }}



            />
        </View>
    );
}
