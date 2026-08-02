import React from "react"
import { Pressable, View, Text, StyleSheet } from "react-native"
import { SymbolView } from "expo-symbols"
import { useRouter } from "expo-router"
import Fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"
import { usePushNotifications } from "@/contexts/push.notification"
import BellFill from "@/assets/icons/svgs/bell_fill.svg"
import sizes from "@/constants/sizes"

// Botão de notificações usado como headerRight.
// Sem não-lidas: apenas o sino preenchido.
// Com não-lidas: o botão inteiro vira uma pílula vermelha com o número à
// esquerda do sino.
export function InboxHeaderButton() {
    const router = useRouter()
    const { unreadCount } = usePushNotifications()
    // `unreadCount` agora vem do estado real de leitura (persistido), então o
    // antigo `&& !inboxVisited` só atrapalhava: uma vez aberta a inbox, ele
    // escondia o badge de notificações novas até o app reiniciar.
    const hasUnread = unreadCount > 0

    const bellIcon = (size: number) => (
        <SymbolView
            name="bell.fill"
            tintColor={colors.gray.white}
            size={size}
            fallback={<BellFill width={size + 2} height={size + 2} fill={colors.gray.white} />}
        />
    )

    return (
        <Pressable
            onPress={() => router.push("/inbox")}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            accessibilityRole="button"
            accessibilityLabel="Inbox"
        >
            {hasUnread ? (
                <View style={styles.row}>
                    <View style={styles.countBadge}>
                        <Text style={styles.count}>
                            {unreadCount > 99 ? "99+" : unreadCount.toString()}
                        </Text>
                    </View>
                    {bellIcon(22)}
                </View>
            ) : (
                bellIcon(22)
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: sizes.paddings["1sm"] * 0.8,
    },
    countBadge: {
        backgroundColor: colors.red.red_05,
        borderRadius: 20,
        minWidth: 24,
        height: 24,
        paddingHorizontal: sizes.paddings["1sm"] * 0.5,
        alignItems: "center",
        justifyContent: "center",
    },
    count: {
        color: colors.gray.white,
        fontSize: 12,
        fontFamily: Fonts.family["Black"],
        lineHeight: 14,
    },
})
