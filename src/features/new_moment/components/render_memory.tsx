import React from "react"
import { Pressable, View, useColorScheme } from "react-native"
import { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import NewMomentContext from "../../../contexts/newMoment"
import { MemoryObjectProps } from "../../../components/memory/memory-types"
import RenderMemory_ from "../../list-memories/components/render-memory"
import CheckCircle from "../../../assets/icons/svgs/check_circle.svg"

type RenderMemoryProps = {
    memory: MemoryObjectProps
}

export default function RenderMemory({ memory }: RenderMemoryProps) {
    const { setSelectedMemory, selectedMemory } = React.useContext(NewMomentContext)
    const [selected, setSelected] = React.useState(false)
    const isDarkMode = useColorScheme() === "dark"

    function handlePress() {
        if (selectedMemory.id !== memory.id) {
            setSelectedMemory(memory)
        } else null
    }

    const container = {}

    const pressable_container: any = {
        position: "absolute",
        zIndex: 10,
        width: "92%",
        top: 10,
        height: "90%",
        left: 5,
    }

    const memory_container: any = {
        transform: [{ scale: 0.6 }],
        marginLeft: -35,
        marginRight: -44,
        height: 215,
        paddingLeft: 5,
        marginTop: -30,
        zIndex: 1,
    }

    const memory_container_selected: any = {
        transform: [{ scale: 0.45 }],
        marginLeft: -35,
        marginRight: -44,
        height: 215,
        paddingLeft: 5,
        marginTop: -30,
        zIndex: 1,
    }

    const inner_container_selected: any = {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        backgroundColor: isDarkMode ? colors.transparent.white_20 : colors.transparent.black_20,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
    }

    const selectedMemoryId: any = selectedMemory?.id ?? false

    const ContainerStyle =
        selectedMemoryId !== false
            ? selectedMemoryId == memory.id
                ? memory_container_selected
                : memory_container
            : memory_container

    return (
        <View style={container}>
            <Pressable style={pressable_container} onPress={handlePress}>
                {selectedMemoryId == memory.id && (
                    <View style={inner_container_selected}>
                        <CheckCircle
                            fill={String(colors.gray.white)}
                            style={{ elevation: 10, shadowOpacity: 1, top: -6 }}
                            width={35}
                            height={35}
                        />
                    </View>
                )}
            </Pressable>
            <View style={ContainerStyle}>
                <RenderMemory_
                    memory={memory}
                    pressable={false}
                    scale={1}
                    marginRight={40}
                    textMarginTop={10}
                    fontSize={fonts.size.body * 1.3}
                    dinamicMargin={false}
                />
            </View>
        </View>
    )
}
