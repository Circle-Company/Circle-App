import { Dimensions } from "react-native"
import { isIPad11, isIPad } from "@/lib/platform/detection"
const WindowWidth = Dimensions.get("window").width
const WindowHeight = Dimensions.get("window").height

const BASE_DESIGN_WIDTH = 375
const MOMENT_BASE_WIDTH = 355
const IPAD_MOMENT_REDUCTION = 0.75
const AJUST_FACTOR = 0.95
const IPAD_UI_REDUCTION = 0.7

const momentAspectRatio = 1.566
const screenScale = (WindowWidth / BASE_DESIGN_WIDTH) * AJUST_FACTOR

// Responsiveness factors (scale moment.standart by screen width)
const scaleIpad = (value: number) => (isIPad11 ? value * IPAD_UI_REDUCTION : value)
const reduceIpad = (value: number) => (isIPad11 ? value * IPAD_MOMENT_REDUCTION : value)

const borderRadius = {
    "1sm": scaleIpad(10),
    "1md": scaleIpad(20),
    "1lg": scaleIpad(28),
    "1xl": scaleIpad(40),
    "1xxl": scaleIpad(72),
}

const paddings = {
    "1sm": scaleIpad(10),
    "2sm": scaleIpad(15),
    "1md": scaleIpad(20),
    "2md": scaleIpad(26),
    "1lg": scaleIpad(28),
    "1xl": scaleIpad(40),
    "1xxl": scaleIpad(72),
}

const borders = {
    "1sm": scaleIpad(0.5),
    "1md": scaleIpad(1),
    "1lg": scaleIpad(2),
    "1xl": scaleIpad(4),
    "1xxl": scaleIpad(5),
}

const margins = {
    "1sm": scaleIpad(5),
    "2sm": scaleIpad(10),
    "3sm": scaleIpad(15),
    "1md": scaleIpad(20),
    "2md": scaleIpad(26),
    "1lg": scaleIpad(28),
    "1xl": scaleIpad(40),
    "1xxl": scaleIpad(72),
}

const sizes = {
    "1sm": scaleIpad(10),
    "2sm": scaleIpad(15),
    "3sm": scaleIpad(20),
    "1md": scaleIpad(30),
    "2md": scaleIpad(40),
    "3md": scaleIpad(50),
    "1lg": scaleIpad(70),
    "2lg": scaleIpad(80),
    "3lg": scaleIpad(100),
    "1xxl": scaleIpad(150),
    "2xxl": scaleIpad(200),
    "3xxl": scaleIpad(250),
    "4xxl": scaleIpad(300),
}

const bottomSheet = {
    zIndex: 1,
    paddingHorizontal: paddings["2sm"],
    paddingBottom: paddings["2md"],
    marginHorizontal: 10,
}
const window = {
    width: WindowWidth,
    height: WindowHeight,
}

const headers = {
    elevation: 0,
    height: isIPad11 ? 40 : isIPad ? 60 : 80,
}

const bottomTab = {
    elevation: 0,
    borderTopWidth: 0,
    paddingTop: 5,
    height: 70,
}

const screens = {
    width: window.width,
    height: window.height - scaleIpad(80),
    overflow: "hidden",
    padding: paddings["1sm"] / 2,
}

const buttons = {
    width: scaleIpad(WindowWidth - 60),
    height: scaleIpad(80),
    borderRadius: scaleIpad(40),
    paddingHorizontal: scaleIpad(28),
    marginHorizontal: scaleIpad(33),
    marginBottom: scaleIpad(20),
    flexDirection: "row",
    justifyContent: "center",
}

const inputs = {
    width: screens.width - screens.padding * 2,
    height: scaleIpad(56),
    paddingHorizontal: paddings["2sm"],
    paddingVertical: paddings["1sm"] / 2,
    borderRadius: borderRadius["1sm"],
    alignItems: "center",
    justifyContent: "center",
    marginRight: scaleIpad(10),
}

const moment = {
    aspectRatio: momentAspectRatio,

    micro: {
        width: reduceIpad(36),
        height: momentAspectRatio * reduceIpad(36),
        paddingTop: 1,
        padding: 1,
        borderRadius: 5,
        fontScale: 0.6,
    },

    tiny: {
        width: reduceIpad(182),
        height: momentAspectRatio * reduceIpad(182),
        paddingTop: 2,
        padding: 5,
        borderRadius: 40,
    },

    small: {
        width: reduceIpad(283),
        height: momentAspectRatio * reduceIpad(283),
        paddingTop: 2,
        padding: 5,
        borderRadius: 40,
    },

    standart: {
        width: isIPad11 ? reduceIpad(MOMENT_BASE_WIDTH) : MOMENT_BASE_WIDTH * screenScale,

        height: isIPad11
            ? momentAspectRatio * reduceIpad(MOMENT_BASE_WIDTH)
            : momentAspectRatio * (MOMENT_BASE_WIDTH * screenScale),

        padding: 5,
        paddingTop: 5,
        borderRadius: isIPad11 ? 50 * IPAD_UI_REDUCTION : 40,
    },

    full: {
        width: isIPad11 ? reduceIpad(screens.width) : screens.width,

        height: isIPad11
            ? momentAspectRatio * reduceIpad(screens.width)
            : momentAspectRatio * screens.width,

        paddingBottom: 5,
        padding: 10,
        borderRadius: 10,
    },
}
const toasts = {
    small: {
        width: screens.width,
        height: headers.height * 0.7,
    },
    standart: {
        width: screens.width,
        height: headers.height * 1.2,
    },
}

const blur = {
    blurAmount: 20,
}

const card = {
    width: scaleIpad(160),
    height: scaleIpad(220),
    borderRadius: scaleIpad(20),
    paddingVertical: scaleIpad(10),
    paddingHorizontal: scaleIpad(10),
}

const icons = {
    "1sm": {
        width: scaleIpad(12),
        height: scaleIpad(12),
        padding: scaleIpad(1),
    },
    "2sm": {
        width: scaleIpad(17),
        height: scaleIpad(17),
        padding: scaleIpad(2),
    },
    "1md": {
        width: scaleIpad(24),
        height: scaleIpad(24),
        padding: scaleIpad(10),
    },
    "1lg": {
        width: scaleIpad(32),
        height: scaleIpad(32),
        padding: scaleIpad(15),
    },
}

const isSmallDevice = WindowWidth < 375

export default {
    bottomSheet,
    borderRadius,
    paddings,
    borders,
    margins,
    sizes,
    window,
    headers,
    bottomTab,
    screens,
    buttons,
    toasts,
    inputs,
    card,
    moment,
    blur,
    icons,
    isSmallDevice,
}
