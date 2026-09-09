import React, { useEffect, useRef } from "react"
import { BackHandler, StyleSheet, View } from "react-native"
import { Link, useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import sizes from "@/constants/sizes"
import FeedContext from "@/contexts/Feed"
import PersistedContext from "@/contexts/Persisted"
import { Moment } from "@/components/moment"
import {
    MomentAuthorHeader,
    MomentBottomGradient,
    MomentComments,
    MomentUnavailable,
    useMomentDetail,
} from "@/features/moments/detail"

const CARD = sizes.moment.standart

export default function MomentFullScreen() {
    const router = useRouter()
    const navigation = useNavigation()
    const hasNavigatedRef = useRef(false)
    const { id, from } = useLocalSearchParams<{ id: string; from?: string }>()
    const { session } = React.useContext(PersistedContext)
    const feed = React.useContext(FeedContext)

    // Snowflake: trafega como string de ponta a ponta, nunca `Number()`.
    const momentId = String(id ?? "")

    // Quem chega aqui veio do feed ou da grade da própria conta — as duas listas que já
    // têm o momento em memória e servem de semente síncrona.
    const { momentData, isUnavailable, errorMessage } = useMomentDetail({
        momentId,
        sources: [feed?.moments, session.account.moments],
    })

    useEffect(() => {
        const username = momentData?.user?.username
        if (username) navigation.setOptions({ title: username } as any)
    }, [momentData?.user?.username, navigation])

    useEffect(() => {
        if (from !== "you") return

        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            const actionType = (e as any)?.data?.action?.type
            if ((actionType === "POP" || actionType === "GO_BACK") && !hasNavigatedRef.current) {
                e.preventDefault()
                hasNavigatedRef.current = true
                router.replace("/(tabs)/you")
            }
        })

        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (hasNavigatedRef.current) return true
            hasNavigatedRef.current = true
            router.replace("/(tabs)/you")
            return true
        })

        return () => {
            unsubscribe && unsubscribe()
            backHandler.remove()
            hasNavigatedRef.current = false
        }
    }, [from, router, navigation])

    return (
        <SafeAreaView style={styles.screen}>
            <View style={{ height: sizes.headers.height * 0.7 }} />
            {momentData && !isUnavailable ? (
                <Moment.Root.Main
                    size={CARD}
                    isFeed={false}
                    isFocused={true}
                    data={momentData}
                    shadow={{ top: false, bottom: true }}
                >
                    {/* O AppleZoomTarget monta apenas UM filho nativo; por isso ele
                        envolve somente o card do vídeo — os comentários ficam fora. */}
                    <Link.AppleZoomTarget>
                        <Moment.Container
                            contentRender={momentData.media}
                            isFocused={true}
                            loading={false}
                            blurRadius={0}
                            forceMute={false}
                            showSlider={true}
                            disableCache={false}
                            disableWatch={false}
                        >
                            <MomentAuthorHeader user={momentData.user} />

                            <Moment.Root.Center />

                            <Moment.Root.Bottom>
                                <Moment.Date />
                            </Moment.Root.Bottom>

                            <MomentBottomGradient />
                        </Moment.Container>
                    </Link.AppleZoomTarget>
                    <MomentComments moment={momentData} />
                </Moment.Root.Main>
            ) : (
                <MomentUnavailable message={errorMessage} />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "flex-start",
        alignItems: "center",
    },
})
