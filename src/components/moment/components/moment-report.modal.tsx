import React from "react"
import { VStack, HStack, Text, Button, Switch, List } from "@expo/ui/swift-ui"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"
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
            <Text size={fonts.size.title3} weight="bold" padding={{ bottom: 20, top: 30 }}>
                {title}
            </Text>

            <VStack spacing={sizes.margins["1sm"]}>
                <List listStyle="inset">
                    {reports.map((report) => {
                        const isSelected = selectedReportId === report.id
                        return (
                            <HStack
                                key={report.id}
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
                    <Text weight="bold">
                        {reportMutation.isPending ? "Loading" : "Send Report"}
                    </Text>
                </Button>
            </HStack>
        </VStack>
    )
}
