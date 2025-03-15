import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Pressable, View } from "react-native"
import MomentIcon from "../../../assets/icons/svgs/bolt.svg"
import { Text } from "../../../components/Themed"
import { Memory } from "../../../components/memory"
import { MemoryObjectProps } from "../../../components/memory/memory-types"
import { Moment } from "../../../components/moment"
import { userReciveDataProps } from "../../../components/user_show/user_show-types"
import MemoryContext from "../../../contexts/memory"
import { truncated } from "../../../helpers/processText"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

type RenderMemoryProps = {
    memory: MemoryObjectProps
    user: userReciveDataProps
    pressable?: boolean
    scale?: number
    marginRight?: number
    textMarginTop?: number
    fontSize?: number
    dinamicMargin?: boolean
    icon?: boolean
}

export default function render_memory({
    memory,
    user,
    pressable = true,
    scale = 1,
    marginRight = 36,
    textMarginTop = sizes.margins["1sm"] * 0.7,
    fontSize = fonts.size.body,
    dinamicMargin = true,
    icon = false,
}: RenderMemoryProps) {
    const { setMemory } = React.useContext(MemoryContext)
    const navigation: any = useNavigation()
    const container: any = {
        marginRight: dinamicMargin
            ? (memory.moments.length == 1 && marginRight - 23 * scale) ||
              (memory.moments.length == 2 && marginRight - 5 * scale) ||
              (memory.moments.length == 3 && marginRight + 5 * scale)
            : marginRight,
    }
    const c0 = {
        zIndex: 3,
        transform: [{ scale }],
    }
    const c1 = {
        position: "absolute",
        zIndex: 2,
        left: 35 * scale,
        transform: [{ scale: 0.8 * scale }],
    }
    const c2 = {
        position: "absolute",
        zIndex: 1,
        left: 60 * scale,
        transform: [{ scale: 0.6 * scale }],
    }

    const text_container: any = {
        marginTop: textMarginTop * scale,
        alignItems: "center",
    }
    const text_style = {
        fontSize: fontSize * scale,
        fontFamily: fonts.family.Bold,
    }
    const icon_container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: sizes.paddings["1sm"] * 0.2,
        paddingLeft: sizes.paddings["1sm"] * 0.6,
        paddingRight: sizes.paddings["1sm"],
        backgroundColor: colors.gray.grey_08,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ffffff20",
    }

    const headerContainer: any = {
        position: "absolute",
        zIndex: 2,
        top: 12,
        left: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    }

    const badge: any = {
        backgroundColor: ColorTheme().error,
        width: 7,
        height: 7,
        borderRadius: 5,
        marginLeft: 3,
    }

    const icon_text: any = {
        marginLeft: 4,
        fontSize: fontSize * scale * 0.8,
        fontFamily: fonts.family.Medium,
        color: colors.gray.white,
    }

    async function handlePressed(memoryData: any) {
        if (pressable) {
            console.log("handlePressed: ", user)
            setMemory({ user, ...memoryData })
            navigation.navigate("MemoriesNavigator", { screen: "Memory" })
        }
    }

    return (
        <View style={container}>
            <Memory.MainRoot data={memory}>
                {memory.moments.map((moment, index) => {
                    const container: any =
                        (index == 0 && c0) || (index == 1 && c1) || (index == 2 && c2)
                    return (
                        <Moment.Root.Main
                            key={moment.id}
                            momentData={moment}
                            sizes={sizes.moment.tiny}
                        >
                            <Pressable
                                style={container}
                                onPress={() => {
                                    handlePressed(memory)
                                }}
                            >
                                {icon && (
                                    <View style={headerContainer}>
                                        <View style={icon_container}>
                                            <MomentIcon
                                                fill={`${colors.gray.white}`}
                                                width={10}
                                                height={10}
                                            />
                                            <Text style={icon_text}>
                                                {memory.total_moments_num}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                <Memory.Container
                                    contentRender={moment.midia}
                                    focused={Boolean(index !== 0)}
                                >
                                    {index == 0 && (
                                        <Memory.CenterRoot>
                                            <Memory.Title />
                                        </Memory.CenterRoot>
                                    )}
                                </Memory.Container>
                            </Pressable>
                        </Moment.Root.Main>
                    )
                })}
                <View style={text_container}>
                    <Text style={text_style}>{truncated({ text: memory.title, size: 12 })}</Text>
                </View>
            </Memory.MainRoot>
        </View>
    )
}
