import More from "@/assets/icons/svgs/arrow_left.svg"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { View, ViewStyle } from "react-native"
import ColorTheme from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import ViewProfileContext from "../../../contexts/viewProfile"
import { Skeleton } from "../../skeleton"
import { UserShow } from "../../user_show"
import HeaderButton from "../headerButton"

export default function ProfileHeaderLeft() {
    const { userProfile } = React.useContext(ViewProfileContext)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        setIsLoading(true),
            setTimeout(() => {
                setIsLoading(false)
            }, 400)
    }, [])
    const navigation = useNavigation()

    const container: ViewStyle = {
        flexDirection: "row",
    }

    return (
        <View style={container}>
            <HeaderButton action={() => navigation.goBack()} marginLeft square>
                <More fill={String(ColorTheme().text)} width={18} height={18} />
            </HeaderButton>
            <View style={{ marginLeft: sizes.margins["2sm"] }}>
                <UserShow.Root data={userProfile}>
                    {isLoading ? (
                        <Skeleton.View
                            delay={0}
                            duration={400}
                            style={{
                                marginTop: sizes.margins["2sm"] * 1.4,
                                width: 100,
                                height: 14,
                                marginLeft: sizes.margins["2sm"],
                                borderRadius: 50,
                            }}
                        />
                    ) : (
                        <UserShow.Username displayOnMoment={false} scale={1.3} />
                    )}
                </UserShow.Root>
            </View>
        </View>
    )
}
