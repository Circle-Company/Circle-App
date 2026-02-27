import { isIPad11 } from "@/lib/platform/detection"

const IPAD_FONT_REDUCTION = 0.75

const scaleFont = (value: number) => (isIPad11 ? value * IPAD_FONT_REDUCTION : value)
export default {
    size: {
        extraLargeTitle: scaleFont(36),
        extraLargeTitle2: scaleFont(28),
        largeTitle: scaleFont(34),
        title1: scaleFont(28),
        title2: scaleFont(22),
        title3: scaleFont(20),
        headline: scaleFont(17),
        subheadline: scaleFont(15),
        body: scaleFont(14),
        callout: scaleFont(16),
        footnote: scaleFont(13),
        caption1: scaleFont(11),
        caption2: scaleFont(10),
    },

    family: {
        "Thin-Italic": "Inter-ThinItalic",
        Thin: "Inter-Thin",
        "ExtraLight-Italic": "Inter-ExtraLightItalic",
        ExtraLight: "Inter-ExtraLight",
        "Light-Italic": "Inter-LightItalic",
        Light: "Inter-Light",
        "Regular-Italic": "Inter-Italic",
        Regular: "Inter-Regular",
        "Medium-Italic": "Inter-MediumItalic",
        Medium: "Inter-Medium",
        "Semibold-Italic": "Inter-SemiBoldItalic",
        Semibold: "Inter-SemiBold",
        "Bold-Italic": "Inter-BoldItalic",
        Bold: "Inter-Bold",
        "ExtraBold-Italic": "Inter-ExtraBoldItalic",
        ExtraBold: "Inter-ExtraBold",
        "Black-Italic": "Inter-BlackItalic",
        Black: "Inter-Black",
    },

    files: {
        "Inter-Thin": require("../../assets/fonts/inter/Inter-Thin.otf"),
        "Inter-ThinItalic": require("../../assets/fonts/inter/Inter-ThinItalic.otf"),
        "Inter-ExtraLight": require("../../assets/fonts/inter/Inter-ExtraLight.otf"),
        "Inter-ExtraLightItalic": require("../../assets/fonts/inter/Inter-ExtraLightItalic.otf"),
        "Inter-Light": require("../../assets/fonts/inter/Inter-Light.otf"),
        "Inter-LightItalic": require("../../assets/fonts/inter/Inter-LightItalic.otf"),
        "Inter-Regular": require("../../assets/fonts/inter/Inter-Regular.otf"),
        "Inter-Italic": require("../../assets/fonts/inter/Inter-Italic.otf"),
        "Inter-Medium": require("../../assets/fonts/inter/Inter-Medium.otf"),
        "Inter-MediumItalic": require("../../assets/fonts/inter/Inter-MediumItalic.otf"),
        "Inter-SemiBold": require("../../assets/fonts/inter/Inter-SemiBold.otf"),
        "Inter-SemiBoldItalic": require("../../assets/fonts/inter/Inter-SemiBoldItalic.otf"),
        "Inter-Bold": require("../../assets/fonts/inter/Inter-Bold.otf"),
        "Inter-BoldItalic": require("../../assets/fonts/inter/Inter-BoldItalic.otf"),
        "Inter-ExtraBold": require("../../assets/fonts/inter/Inter-ExtraBold.otf"),
        "Inter-ExtraBoldItalic": require("../../assets/fonts/inter/Inter-ExtraBoldItalic.otf"),
        "Inter-Black": require("../../assets/fonts/inter/Inter-Black.otf"),
        "Inter-BlackItalic": require("../../assets/fonts/inter/Inter-BlackItalic.otf"),
    },
}
