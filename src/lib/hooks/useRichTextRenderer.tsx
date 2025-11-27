import { Linking, Pressable, Text, TextStyle, View, ViewStyle } from "react-native"

import ColorTheme from "../../constants/colors"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { UserShow } from "../../components/user_show"
import fonts from "../../constants/fonts"
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

export type UseRichTextRendererProps = {
    richText: RichTextUIFormat
    userMapping?: Record<string, userReciveDataProps> // Mapeamento de user ID para dados do usuário
    // Estilos para texto normal
    textStyle?: TextStyle
    fontSize?: number
    fontFamily?: string
    color?: string
    // Estilos para mentions (nome de usuário)
    mentionStyle?: TextStyle
    mentionFontSize?: number
    mentionFontFamily?: string
    mentionColor?: string
    // Estilos para hashtags
    hashtagStyle?: TextStyle
    hashtagFontSize?: number
    hashtagFontFamily?: string
    hashtagColor?: string
    // Estilos para links
    linkStyle?: TextStyle
    linkFontSize?: number
    linkFontFamily?: string
    linkColor?: string
    // Outras props
    displayOnMoment?: boolean
}

export function useRichTextRenderer({
    richText,
    userMapping = {},
    // Texto normal
    textStyle,
    fontSize = fonts.size.body,
    fontFamily = fonts.family.Regular,
    color = ColorTheme().text,
    // Mentions
    mentionStyle,
    mentionFontSize,
    mentionFontFamily,
    mentionColor,
    // Hashtags
    hashtagStyle,
    hashtagFontSize,
    hashtagFontFamily,
    hashtagColor,
    // Links
    linkStyle,
    linkFontSize,
    linkFontFamily,
    linkColor,
    // Outras
    displayOnMoment = false,
}: UseRichTextRendererProps) {
    const { session } = React.useContext(PersistedContext)
    const defaultTextStyle: TextStyle = {
        fontSize,
        fontFamily,
        color,
        ...textStyle,
    }

    const defaultMentionStyle: TextStyle = {
        fontSize: mentionFontSize ?? fontSize,
        fontFamily: mentionFontFamily ?? fonts.family.Bold,
        color: mentionColor ?? color,
        ...mentionStyle,
    }

    const defaultHashtagStyle: TextStyle = {
        fontSize: hashtagFontSize ?? fontSize,
        fontFamily: hashtagFontFamily ?? fontFamily,
        color: hashtagColor ?? color,
        ...hashtagStyle,
    }

    const defaultLinkStyle: TextStyle = {
        fontSize: linkFontSize ?? fontSize,
        fontFamily: linkFontFamily ?? fonts.family["Semibold-Italic"],
        color: linkColor ?? ColorTheme().primary,
        textDecorationLine: "underline",
        ...linkStyle,
    }

    const handleLinkPress = React.useCallback((url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error("Erro ao abrir URL:", err)
        })
    }, [])

    // Armazenar em memória os IDs dos usernames mencionados
    const mentionedUserIdsRef = React.useRef<Set<string>>(new Set())

    // Extrair e armazenar IDs das mentions quando o richText mudar
    React.useEffect(() => {
        if (richText?.entities) {
            const userIds = new Set<string>()
            richText.entities.forEach((entity) => {
                if (entity.type === "mention" && entity.id) {
                    userIds.add(String(entity.id))
                }
            })
            mentionedUserIdsRef.current = userIds
        }
    }, [richText])

    const renderComponents = React.useMemo(() => {
        if (!richText?.entities || richText.entities.length === 0) {
            return [
                <Text key="text-only" style={defaultTextStyle}>
                    {richText?.text || ""}
                </Text>,
            ]
        }

        const components: React.ReactElement[] = []
        let lastIndex = 0
        let textBuffer = ""

        // Ordenar entidades por posição inicial
        const sortedEntities = [...richText.entities].sort((a, b) => a.start - b.start)

        const flushTextBuffer = () => {
            if (textBuffer) {
                components.push(
                    <Text key={`text-${components.length}`} style={defaultTextStyle}>
                        {textBuffer}
                    </Text>,
                )
                textBuffer = ""
            }
        }

        sortedEntities.forEach((entity, index) => {
            // Adicionar texto antes da entidade ao buffer
            if (entity.start > lastIndex) {
                textBuffer += richText.text.substring(lastIndex, entity.start)
            }

            // Renderizar a entidade
            switch (entity.type) {
                case "mention": {
                    // Flush buffer antes de adicionar componente interativo
                    flushTextBuffer()

                    const entityId = entity.id
                    const hasId = !!entityId

                    if (hasId && entityId) {
                        // Se tiver ID, buscar no userMapping ou criar dados básicos
                        const entityIdString = String(entityId)
                        const entityUsernameString = String(entity.text)
                        let userData: userReciveDataProps | undefined = userMapping[entityIdString]

                        // Se não encontrar no userMapping, tentar como número
                        if (!userData && !isNaN(Number(entityIdString))) {
                            userData = userMapping[Number(entityIdString)]
                        }

                        // Se ainda não tiver dados, criar dados básicos a partir do ID e texto
                        if (!userData) {
                            userData = {
                                id: entityIdString,
                                username: entityUsernameString,
                                verified: false,
                                profilePicture: "",
                                youFollow: false,
                            }
                        } else {
                            // Garantir que o username esteja presente mesmo quando vem do userMapping
                            // Se o userMapping não tiver username, usar o texto da entidade
                            if (!userData.username) {
                                userData = {
                                    ...userData,
                                    username: entityUsernameString,
                                }
                            }
                        }

                        // Renderizar mention com UserShow (clicável)
                        components.push(
                            <UserShow.Root key={`mention-${index}-${entityId}`} data={userData}>
                                <UserShow.Username
                                    displayOnMoment={displayOnMoment}
                                    fontSize={defaultMentionStyle.fontSize ?? fontSize}
                                    fontFamily={defaultMentionStyle.fontFamily}
                                    color={String(defaultMentionStyle.color || color)}
                                    margin={0}
                                    pressable={true}
                                    displayYou={true}
                                />
                            </UserShow.Root>,
                        )
                    } else {
                        // Fallback: renderizar como texto se não tiver ID
                        components.push(
                            <Text
                                key={`mention-${index}-${entity.text}`}
                                style={defaultMentionStyle}
                            >
                                @{entity.text}
                            </Text>,
                        )
                    }
                    break
                }

                case "url": {
                    // Flush buffer antes de adicionar componente interativo
                    flushTextBuffer()

                    components.push(
                        <Pressable
                            key={`url-${index}`}
                            onPress={() => handleLinkPress(entity.text)}
                        >
                            <Text style={defaultLinkStyle}>{entity.text}</Text>
                        </Pressable>,
                    )
                    break
                }

                case "hashtag": {
                    // Flush buffer antes de adicionar hashtag com estilo específico
                    flushTextBuffer()
                    components.push(
                        <Text key={`hashtag-${index}`} style={defaultHashtagStyle}>
                            #{entity.text}
                        </Text>,
                    )
                    break
                }

                case "text": {
                    textBuffer += entity.text
                    break
                }

                default: {
                    // Fallback para tipos desconhecidos
                    textBuffer += entity.text
                }
            }

            lastIndex = entity.end
        })

        // Adicionar texto restante após a última entidade
        if (lastIndex < richText.text.length) {
            textBuffer += richText.text.substring(lastIndex)
        }

        // Flush buffer final
        flushTextBuffer()

        return components
    }, [
        richText,
        userMapping,
        defaultTextStyle,
        defaultLinkStyle,
        defaultMentionStyle,
        defaultHashtagStyle,
        displayOnMoment,
        fontSize,
        handleLinkPress,
    ])

    return renderComponents
}

// Hook para obter apenas os IDs mencionados (útil para buscar dados dos usuários)
export function useMentionedUserIds(richText: RichTextUIFormat): string[] {
    const [mentionedIds, setMentionedIds] = React.useState<string[]>([])

    React.useEffect(() => {
        if (richText?.entities) {
            const userIds: string[] = []
            richText.entities.forEach((entity) => {
                if (entity.type === "mention" && entity.id && !userIds.includes(entity.id)) {
                    userIds.push(entity.id)
                }
            })
            setMentionedIds(userIds)
        } else {
            setMentionedIds([])
        }
    }, [richText])

    return mentionedIds
}

// Componente wrapper para facilitar o uso
export type RichTextRendererProps = UseRichTextRendererProps & {
    containerStyle?: ViewStyle
    textContainerStyle?: TextStyle
}

export function RichTextRenderer({
    containerStyle,
    textContainerStyle,
    ...hookProps
}: RichTextRendererProps) {
    const components = useRichTextRenderer(hookProps)

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
            {components}
        </View>
    )
}
