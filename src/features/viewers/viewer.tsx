import { Animated, ViewStyle } from "react-native"

import EyeIcon from "@/assets/icons/svgs/eye.svg"
import ColorTheme from "@/constants/colors"
import { Viewers } from "@/components/viewers"
import FeedContext from "@/contexts/Feed"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import { dataProps } from "@/components/moment/context/types"
import React from "react"
import ViewMorebutton from "@/components/buttons/view_more"
import { flattenViewers, latestStats, useMomentViewersQuery } from "@/queries/moment.viewers"

type renderViewersProps = {
    moment: dataProps
    focused: boolean
}

export default function RenderViewers({ moment, focused }: renderViewersProps) {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
    const { viewersMomentId, setViewersMomentId } = React.useContext(FeedContext)
    const [animatedOpacityValue] = React.useState(new Animated.Value(1))

    const momentId = String(moment?.id || "")
    const isOpen = viewersMomentId === momentId
    // `GET /moments/:id/viewers` responde 403 para quem não é o autor, então
    // nem o botão nem a query existem fora da própria conta.
    const isOwner =
        !!momentId && String(moment?.user?.id || "") === String(session.account.userId || "")

    const { data, error, isLoading } = useMomentViewersQuery(momentId, {
        enabled: isOwner && isOpen && focused,
    })
    const viewers = React.useMemo(() => flattenViewers(data), [data])
    const stats = React.useMemo(() => latestStats(data), [data])

    React.useEffect(() => {
        if (focused) {
            Animated.timing(animatedOpacityValue, {
                toValue: isOpen ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            }).start()
            if (!isOpen) {
                Animated.timing(animatedOpacityValue, {
                    delay: 0,
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start()
            }
        }
    }, [isOpen, focused, animatedOpacityValue])

    const animated_header_container: ViewStyle = {
        opacity: animatedOpacityValue,
    }

    const iconStyle = { top: 0.6 }

    function handlePress() {
        setViewersMomentId(isOpen ? null : momentId)
    }

    if (!isOwner) return null

    return (
        <Viewers.MainRoot
            data={viewers}
            stats={stats}
            momentId={momentId}
            errorCode={error ? (error.code ?? "UNKNOWN") : undefined}
            loading={isLoading}
        >
            <Viewers.Container focused={focused}>
                <Animated.View style={animated_header_container}>
                    <Viewers.TopRoot>
                        <Viewers.TopLeftRoot>
                            <Viewers.HeaderLeft>
                                <></>
                            </Viewers.HeaderLeft>
                        </Viewers.TopLeftRoot>
                        <Viewers.TopRightRoot>
                            <ViewMorebutton
                                action={handlePress}
                                text={t("Viewers")}
                                icon={
                                    <EyeIcon
                                        style={iconStyle}
                                        fill={ColorTheme().primary.toString()}
                                        width={12}
                                        height={12}
                                    />
                                }
                            />
                        </Viewers.TopRightRoot>
                    </Viewers.TopRoot>
                </Animated.View>

                {isOpen ? (
                    <Viewers.CenterRoot>
                        <Viewers.ListViewers />
                    </Viewers.CenterRoot>
                ) : null}
            </Viewers.Container>
        </Viewers.MainRoot>
    )
}
