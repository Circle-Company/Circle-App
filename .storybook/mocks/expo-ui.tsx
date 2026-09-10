import React from "react"
import { Modal, Pressable, Text, View } from "react-native"

/**
 * Stub web do `@expo/ui`.
 *
 * `ContextMenu` (SwiftUI) e `DropdownMenu` (Compose) são views nativas: no
 * Storybook web não existe runtime para elas. O stub preserva o *contrato* —
 * long press no gatilho abre a lista de itens — para a story continuar servindo
 * como conferência da lista de ações. A aparência real só se confere no
 * dispositivo, com `npm run storybook:ios`.
 */

type ItemProps = { label?: string; role?: string; onPress?: () => void; children?: React.ReactNode }

/** Elemento de slot (`Items`/`Trigger`), reconhecido pelo `slotName` do tipo. */
type SlotElement = React.ReactElement<{ children?: React.ReactNode }> & {
    type: { slotName?: string }
}

const MenuContext = React.createContext<{ open: () => void } | null>(null)

function useItems(children: React.ReactNode): React.ReactElement<ItemProps>[] {
    return React.Children.toArray(children).filter(
        React.isValidElement,
    ) as React.ReactElement<ItemProps>[]
}

function Menu({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = React.useState(false)

    const nodes = React.Children.toArray(children).filter(React.isValidElement) as SlotElement[]
    const items = nodes.find((node) => node.type?.slotName === "items")
    const trigger = nodes.find((node) => node.type?.slotName === "trigger")

    return (
        <MenuContext.Provider value={{ open: () => setVisible(true) }}>
            <Pressable onLongPress={() => setVisible(true)} delayLongPress={250}>
                {trigger?.props?.children}
            </Pressable>

            <Modal visible={visible} transparent animationType="fade">
                <Pressable
                    style={{ flex: 1, backgroundColor: "#0006", justifyContent: "center" }}
                    onPress={() => setVisible(false)}
                >
                    <View
                        style={{
                            margin: 24,
                            borderRadius: 12,
                            backgroundColor: "#fff",
                            overflow: "hidden",
                        }}
                    >
                        {useItems(items?.props?.children).map((item, index) => (
                            <Pressable
                                key={index}
                                style={{ padding: 14 }}
                                onPress={() => {
                                    setVisible(false)
                                    item.props.onPress?.()
                                }}
                            >
                                <Text
                                    style={{
                                        color: item.props.role === "destructive" ? "red" : "#111",
                                    }}
                                >
                                    {item.props.label ?? item.props.children}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </MenuContext.Provider>
    )
}

const slot = (name: string) => {
    const Slot = ({ children }: { children?: React.ReactNode }) => <>{children}</>
    Slot.slotName = name
    return Slot
}

export const Host = ({ children }: { children?: React.ReactNode }) => <>{children}</>

export const ContextMenu = Object.assign(Menu, {
    Items: slot("items"),
    Trigger: slot("trigger"),
    Preview: slot("preview"),
})

export const DropdownMenu = Object.assign(Menu, {
    Items: slot("items"),
    Trigger: slot("trigger"),
    Preview: slot("preview"),
})

export const Button = (_props: ItemProps) => null
export const DropdownMenuItem = Object.assign((_props: ItemProps) => null, {
    Text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    LeadingIcon: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    TrailingIcon: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
})
