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
import ProfileContext from "@/contexts/profile"
import { useReportMutation } from "@/queries/user.report"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useToast } from "@/contexts/Toast"

export function ProfileReportModal() {
    const { setShowReportModal, profile } = React.useContext(ProfileContext)
    const toast = useToast()

    const reports = [
        { id: "spam", title: "Spam", description: "Unwanted or repetitive content" },
        { id: "harassment", title: "Harassment", description: "Bullying or targeted harassment" },
        {
            id: "hate_speech",
            title: "Hate Speech",
            description: "Attacks against protected groups",
        },
        { id: "violence", title: "Violence", description: "Threats or promotion of violence" },
        { id: "scam", title: "Scam", description: "Fraud, phishing or other scams" },
        {
            id: "nudity_or_sexual_content",
            title: "Nudity or Sexual Content",
            description: "Explicit sexual content or nudity",
        },
        { id: "child_safety", title: "Child Safety", description: "Risk or harm involving minors" },
        {
            id: "illegal_goods",
            title: "Illegal Goods",
            description: "Sale or trade of illegal goods",
        },
        {
            id: "doxxing_or_personal_data",
            title: "Doxxing or Personal Data",
            description: "Exposing personal data without consent",
        },
        {
            id: "non_consensual_content",
            title: "Non‑consensual Content",
            description: "Sharing content without permission",
        },
        {
            id: "fake_account",
            title: "Fake Account",
            description: "False identity or bot activity",
        },
        { id: "underage", title: "Underage", description: "Account belongs to a minor" },
        { id: "other", title: "Other", description: "Another issue not listed here" },
    ] as const

    const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null)

    const reportMutation = useReportMutation({
        userId: profile?.id || "",
        reason: selectedReportId || "",
        description: reports.find((report) => report.id === selectedReportId)?.description || "",
    })

    const title = `Report Account @${profile?.username ?? ""}`

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
                                                                ? colors.yellow.yellow_03
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
                        setShowReportModal(false)
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
                            setShowReportModal(false)
                            Vibrate("notificationSuccess")
                            toast.success("Report sent successfully!")
                            setSelectedReportId(null)
                        } catch (e) {
                            setShowReportModal(false)
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
