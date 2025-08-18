import React from "react"
import { View } from "react-native"
import { Memory } from "../../../components/memory"
import { Moment } from "../../../components/moment"
import sizes from "../../../constants/sizes"

export type MemoryMomentObjectProps = {
    id: string
    midia: {
        content_type: "IMAGE" | "VIDEO"
        fullhd_resolution: string
    }
}

export type MemoryObjectProps = {
    moments: MemoryMomentObjectProps[]
}

type RenderMemoryProps = {
    memory: MemoryObjectProps
    scale?: number
}

export default function render_memory({ memory, scale = 1 }: RenderMemoryProps) {
    const container = {
        marginRight: 36 * scale,
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

    return (
        <View style={container}>
            <Memory.MainRoot data={memory}>
                {memory.moments.map((moment, index) => {
                    const container =
                        (index === 0 && c0) || (index === 1 && c1) || (index === 2 && c2)
                    return (
                        <Moment.Root.Main
                            key={moment.id}
                            momentData={moment}
                            momentSize={sizes.moment.tiny}
                        >
                            <View style={container}>
                                <Memory.Container
                                    contentRender={moment.midia}
                                    focused={Boolean(index !== 0)}
                                    pressable={false}
                                />
                            </View>
                        </Moment.Root.Main>
                    )
                })}
            </Memory.MainRoot>
        </View>
    )
}
