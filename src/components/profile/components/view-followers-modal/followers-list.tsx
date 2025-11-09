import { FlatList, Text, View } from "react-native"

import BottomSheetContext from "../../../../contexts/bottomSheet"
import LanguageContext from "../../../../contexts/Preferences/language"
import { Loading } from "../../../loading"
import PersistedContext from "../../../../contexts/Persisted"
import { ProfileReciveDataProps } from "../../profile-types"
import React from "react"
import { UserShow } from "../../../user_show"
import api from "../../../../services/Api"
import sizes from "../../../../constants/sizes"
import { userReciveDataProps } from "../../../user_show/user_show-types"

type FollowersListProps = {
    user: ProfileReciveDataProps
}

interface userType extends userReciveDataProps {
    you_follow: boolean
}

export function FollowersList({ user }: FollowersListProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { collapse } = React.useContext(BottomSheetContext)

    const [page, setPage] = React.useState(0)
    const [pageSize, setPageSize] = React.useState(10)
    const [endReached, setEndReached] = React.useState(false)
    const [followers, setFollowers] = React.useState([] as userType[])
    const [loading, setLoading] = React.useState(false)

    const width =
        sizes.screens.width - (sizes.paddings["2sm"] * 2 + sizes.bottomSheet.marginHorizontal * 2)

    async function fetchData() {
        if (user?.statistics?.total_followers_num > 0) {
            setLoading(true)
            await api
                .get(`/user/${user.id}/followers?page=${page}&pageSize=${pageSize}`, {
                    headers: { Authorization: session.account.jwtToken },
                })
                .then(function (response) {
                    if (page === 1) setFollowers(response.data.users)
                    else {
                        setFollowers([...followers, ...response.data.users])
                        if (pageSize > response.data.users.length) setEndReached(true)
                        else setEndReached(false)
                    }
                    setPage(page + 1)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    React.useEffect(() => {
        async function fetch() {
            await fetchData()
        }
        fetch()
    }, [])

    return (
        <FlatList
            style={{ width }}
            data={followers}
            ListHeaderComponent={() => {
                return <View style={{ width, height: sizes.margins["1md"] }} />
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
                return (
                    <View
                        style={{
                            width,
                            alignItems: "flex-start",
                            paddingBottom: sizes.paddings["1sm"],
                        }}
                    >
                        <UserShow.Root data={item} executeBeforeClick={collapse}>
                            <UserShow.ProfilePicture
                                displayOnMoment={false}
                                pictureDimensions={{ width: 35, height: 35 }}
                            />
                            <UserShow.Username displayOnMoment={false} />
                            <UserShow.FollowButton
                                hideOnFollowing={true}
                                isFollowing={item.you_follow}
                            />
                        </UserShow.Root>
                    </View>
                )
            }}
            ListFooterComponent={() => {
                if (endReached)
                    return <Text>{t("The user has no more followers to display.")}</Text>
                else
                    return (
                        <Loading.Container width={width} height={sizes.headers.height * 2}>
                            <Loading.ActivityIndicator />
                        </Loading.Container>
                    )
            }}
        />
    )
}
