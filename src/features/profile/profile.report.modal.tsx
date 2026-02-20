import React from "react"
import { VStack, HStack, Text, Button, Switch, List, Group, Section } from "@expo/ui/swift-ui"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"
import BottomSheetContext from "@/contexts/bottomSheet"
import ProfileContext from "@/contexts/profile"
import { useReportMutation } from "@/queries/user.report"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useToast } from "@/contexts/Toast"

export function ProfileReportModal() {
    const { showReportModal, setShowReportModal } = React.useContext(ProfileContext)
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
    ]

    const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null)
    const { profile } = React.useContext(ProfileContext)
    const reportMutation = useReportMutation({
        userId: profile?.id || "",
        reason: selectedReportId || "",
        description: reports.find((report) => report.id === selectedReportId)?.description || "",
    })

    return (
        <VStack alignment="center">
            <Text size={fonts.size.title3} weight="bold" padding={{ bottom: 20, top: 30 }}>
                Report Account
            </Text>
            <VStack spacing={sizes.margins["1sm"]}>
                <List listStyle="inset">
                    {reports.map((report) => {
                        const isSelected = selectedReportId === report.id
                        return (
                            <HStack
                                spacing={sizes.margins["1sm"]}
                                alignment="center"
                                frame={{ width: sizes.screens.width }}
                            >
                                <Button
                                    color={
                                        isSelected ? colors.yellow.yellow_09 : colors.gray.grey_08
                                    }
                                    variant={isSelected ? "bordered" : "default"}
                                    frame={{ alignment: "leading" }}
                                    onPress={() => {
                                        setSelectedReportId(report.id)
                                    }}
                                >
                                    <HStack
                                        frame={{
                                            width: isSelected
                                                ? sizes.screens.width * 0.8
                                                : sizes.screens.width * 0.85,
                                            alignment: "leading",
                                        }}
                                        padding={{ leading: 5, trailing: 15 }}
                                        alignment="center"
                                    >
                                        <Switch
                                            onValueChange={(value) => {
                                                setSelectedReportId(
                                                    value === false ? null : report.id,
                                                )
                                            }}
                                            color={colors.yellow.yellow_05}
                                            value={isSelected}
                                            variant="checkbox"
                                        />
                                        <VStack
                                            alignment="leading"
                                            spacing={4}
                                            padding={{
                                                top: isSelected ? 8 : 0,
                                                bottom: isSelected ? 8 : 0,
                                                leading: 20,
                                                trailing: 20,
                                            }}
                                        >
                                            <Text size={18} weight="bold" color={colors.gray.white}>
                                                {report.title}
                                            </Text>
                                            {!!report.description && (
                                                <Text
                                                    size={13}
                                                    weight="medium"
                                                    color={colors.gray.grey_03}
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

            <HStack padding={{ top: 20 }}>
                <Button
                    role="destructive"
                    disabled={!selectedReportId || reportMutation.isPending}
                    variant="glassProminent"
                    color={colors.red.red_05}
                    controlSize="large"
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
                            toast.error("error to send report")
                            setSelectedReportId(null)
                            // noop - erros já tratados no hook
                        }
                    }}
                >
                    <Text weight="bold">
                        {reportMutation.isPending ? "Loading" : "Send Report"}
                    </Text>
                </Button>
            </HStack>
        </VStack>
    )
}
