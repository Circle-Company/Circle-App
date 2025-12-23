import React from "react"
import { Linking, Text, View, TextStyle, ViewStyle } from "react-native"
import fonts from "../../constants/fonts"
import ColorTheme from "../../constants/colors"
import { UserShow } from "../../components/user_show"
import { userReciveDataProps } from "../../components/user_show/user_show-types"

export type RichTextUIEntity = {
    type: "text" | "mention" | "hashtag" | "url"
    text: string
    id?: string
    start: number
    end: number
}

export type RichTextUIFormat = {
    text: string
    entities: RichTextUIEntity[]
}

type Props = {
    richText: RichTextUIFormat
    userMapping?: Record<string, userReciveDataProps>
    textStyle?: TextStyle
    containerStyle?: ViewStyle
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\//i, "")

const softWrap = (text: string) => text.replace(/([\/\.\-_?#=&])/g, "$1\u200B")

export function RichTextRenderer({ richText, userMapping = {}, textStyle, containerStyle }: Props) {
    if (!richText?.text) return null

    // 🔒 estilo base RESOLVIDO (sempre existe)
    const baseTextStyle: TextStyle = {
        fontFamily: fonts.family.Regular,
        fontSize: fonts.size.body,
        color: ColorTheme().text,
        ...textStyle,
    }

    const blocks: React.ReactNode[] = []
    let cursor = 0

    const entities = [...(richText.entities ?? [])].sort((a, b) => a.start - b.start)

    const pushText = (value: string) => {
        if (!value) return
        blocks.push(
            <Text key={`text-${blocks.length}`} style={baseTextStyle}>
                {value}
            </Text>,
        )
    }

    entities.forEach((entity, index) => {
        // texto antes da entidade
        if (entity.type !== "text" && entity.start > cursor) {
            pushText(richText.text.slice(cursor, entity.start))
        }

        switch (entity.type) {
            case "text":
                pushText(entity.text)
                break

            case "url":
                blocks.push(
                    <Text
                        key={`url-${index}`}
                        style={[
                            baseTextStyle,
                            {
                                color: ColorTheme().primary,
                                textDecorationLine: "underline",
                            },
                        ]}
                        onPress={() => Linking.openURL(entity.text)}
                    >
                        {softWrap(stripProtocol(entity.text))}
                    </Text>,
                )
                break

            case "hashtag":
                blocks.push(
                    <Text
                        key={`hashtag-${index}`}
                        style={[baseTextStyle, { fontFamily: fonts.family.Bold }]}
                    >
                        #{entity.text}
                    </Text>,
                )
                break

            case "mention": {
                const id = String(entity.id)
                const data = userMapping[id] ?? {
                    id,
                    username: entity.text,
                    verified: false,
                    profilePicture: "",
                    youFollow: false,
                }

                blocks.push(
                    <View key={`mention-${index}`} style={{ marginHorizontal: 2 }}>
                        <UserShow.Root data={data}>
                            <UserShow.Username
                                fontSize={baseTextStyle.fontSize}
                                color={String(baseTextStyle.color)}
                                pressable
                            />
                        </UserShow.Root>
                    </View>,
                )
                break
            }
        }

        cursor = entity.end
    })

    if (cursor < richText.text.length) {
        pushText(richText.text.slice(cursor))
    }

    return (
        <View
            style={[
                {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                },
                containerStyle,
            ]}
        >
            {blocks}
        </View>
    )
}
