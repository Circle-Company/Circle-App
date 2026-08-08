import React from "react"
import { VStack, HStack, Text, Button, Image, List } from "@expo/ui/swift-ui"
import {
    buttonStyle,
    controlSize,
    disabled,
    font,
    foregroundStyle,
    italic,
    padding,
    tint,
} from "@expo/ui/swift-ui/modifiers"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useToast } from "@/contexts/Toast"
import MomentContext from "../context"
import { useMomentReportMutation } from "@/queries/moment.report"

export function MomentReportModal() {
    const { options, data } = React.useContext(MomentContext)
    const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null)

    const toast = useToast()

    // Allowed reasons for moment reports with clear titles and descriptions
    const reports = [
        {
            id: "spam",
            title: "Spam",
            description: "Repeated, irrelevant, or unsolicited content.",
        },
        {
            id: "harassment",
            title: "Harassment",
            description: "Bullying, threats, or targeted harassment toward a person or group.",
        },
        {
            id: "inappropriate_content",
            title: "Inappropriate Content",
            description: "Sexually explicit, graphic, or otherwise unsuitable material.",
        },
        {
            id: "violence",
            title: "Violence",
            description: "Graphic violence, threats, or promotion of harm.",
        },
        {
            id: "hate_speech",
            title: "Hate Speech",
            description:
                "Dehumanizing, insulting, or violent language targeting a protected group.",
        },
        {
            id: "other",
            title: "Other",
            description: "Something else not covered by the options above.",
        },
    ] as const

    const reportMutation = useMomentReportMutation({
        momentId: data?.id || "",
        reason: selectedReportId || "",
        description: reports.find((report) => report.id === selectedReportId)?.description || "",
    })

    const title = `Report Content from @${data?.user?.username ?? ""}`

    return (
        <VStack alignment="center">
            <Text
                modifiers={[
                    font({ size: 20, weight: "bold" }),
                    italic(),
                    foregroundStyle(colors.gray.white),
                    padding({ top: 46, bottom: 0, leading: 15, trailing: 15 }),
                ]}
            >
                {title}
            </Text>

            <VStack spacing={sizes.margins["1sm"]}>
                <List>
                    {reports.map((report) => {
                        const isSelected = selectedReportId === report.id
                        return (
                            <HStack
                                key={report.id}
                                spacing={sizes.margins["1sm"]}
                                alignment="center"
                            >
                                <Button
                                    modifiers={[buttonStyle("plain")]}
                                    onPress={() => {
                                        setSelectedReportId(report.id)
                                    }}
                                >
                                    <HStack alignment="center" spacing={16}>
                                        <Image
                                            systemName={
                                                isSelected ? "checkmark.circle.fill" : "circle"
                                            }
                                            size={24}
                                            color={
                                                isSelected
                                                    ? colors.yellow.yellow_05
                                                    : colors.gray.grey_04
                                            }
                                        />
                                        <VStack alignment="leading" spacing={4}>
                                            <Text
                                                modifiers={[
                                                    font({ size: 20, weight: "bold" }),
                                                    foregroundStyle(
                                                        isSelected
                                                            ? colors.yellow.yellow_01
                                                            : colors.gray.white,
                                                    ),
                                                ]}
                                            >
                                                {report.title}
                                            </Text>
                                            {!!report.description && (
                                                <Text
                                                    modifiers={[
                                                        font({ size: 14, weight: "regular" }),
                                                        foregroundStyle(
                                                            isSelected
                                                                ? colors.yellow.yellow_01 + 90
                                                                : colors.gray.grey_04,
                                                        ),
                                                    ]}
                                                >
                                                    {report.description}
                                                </Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                </Button>
                            </HStack>
                        )
                    })}
                </List>
            </VStack>

            <HStack spacing={12}>
                <Button
                    role="cancel"
                    modifiers={[
                        buttonStyle("glass"),
                        controlSize("large"),
                        tint(colors.gray.grey_04),
                        disabled(reportMutation.isPending),
                    ]}
                    onPress={() => {
                        options.setShowReportModal(false)
                        setSelectedReportId(null)
                    }}
                >
                    <Text>Cancel</Text>
                </Button>
                <Button
                    role="destructive"
                    modifiers={[
                        buttonStyle("glassProminent"),
                        controlSize("large"),
                        tint(colors.red.red_05),
                        disabled(!selectedReportId || reportMutation.isPending),
                    ]}
                    onPress={async () => {
                        if (!selectedReportId) return
                        try {
                            await reportMutation.mutateAsync()
                            options.setShowReportModal(false)
                            Vibrate("notificationSuccess")
                            toast.success("Report sent successfully!")
                            setSelectedReportId(null)
                        } catch (e) {
                            options.setShowReportModal(false)
                            Vibrate("notificationError")
                            toast.error("Error sending report")
                            setSelectedReportId(null)
                        }
                    }}
                >
                    <Text>{reportMutation.isPending ? "Loading" : "Send Report"}</Text>
                </Button>
            </HStack>
        </VStack>
    )
}
