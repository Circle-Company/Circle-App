import React from "react"
import { FlatList, View, useColorScheme } from "react-native"
import RenderDate from "../../../../components/general/render-date"
import { Memory } from "../../../../components/memory"
import { colors } from "../../../../constants/colors"
import sizes from "../../../../constants/sizes"
import RenderNotification from "./components/render-notification"
type RenderNotificationsAllProps = {
    data: any
    date_text: string
    count: number
    enableScroll?: boolean
}
export function ListNotificationsAll({ data, date_text, count }: RenderNotificationsAllProps) {
    const isDarkMode = useColorScheme() === "dark"
    const notifications = data

    const container: any = {
        width: sizes.screens.width,
    }
    const header_container: any = {
        flexDirection: "row",
        width: sizes.screens.width,
        paddingTop: sizes.paddings["1sm"],
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: "center",
        justifyContent: "center",
    }
    const content_container: any = {
        width: sizes.screens.width,
        paddingBottom: sizes.paddings["1lg"],
        borderBottomWidth: 1,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }
    return (
        <View style={container}>
            <View style={header_container}>
                <Memory.HeaderLeft>
                    <RenderDate date={date_text} showIcon={true} />
                </Memory.HeaderLeft>
            </View>
            <FlatList
                scrollEnabled={false}
                style={content_container}
                data={notifications.content}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                    return <RenderNotification key={item.id} notification={item} />
                }}
                ListHeaderComponent={() => {
                    return <View style={{ width: 15 }}></View>
                }}
                ListFooterComponent={() => {
                    return <View style={{ width: 15 }}></View>
                }}
            />
        </View>
    )
}
