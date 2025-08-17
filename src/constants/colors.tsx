import { useColorTheme } from "@/lib/hooks/useColorTheme"

type colorsType = {
    blue: {
        blue_09: string
        blue_08: string
        blue_07: string
        blue_06: string
        blue_05: string
        blue_04: string
        blue_03: string
        blue_02: string
        blue_01: string
        blue_00: string
    }
    purple: {
        purple_09: string
        purple_08: string
        purple_07: string
        purple_06: string
        purple_05: string
        purple_04: string
        purple_03: string
        purple_02: string
        purple_01: string
        purple_00: string
    }
    green: {
        green_09: string
        green_08: string
        green_07: string
        green_06: string
        green_05: string
        green_04: string
        green_03: string
        green_02: string
        green_01: string
        green_00: string
    }
    yellow: {
        yellow_09: string
        yellow_07: string
        yellow_05: string
        yellow_04: string
        yellow_03: string
        yellow_01: string
    }
    red: {
        red_09: string
        red_07: string
        red_05: string
        red_03: string
        red_01: string
    }
    gray: {
        black: string
        grey_09: string
        grey_08: string
        grey_07: string
        grey_06: string
        grey_05: string
        grey_04: string
        grey_03: string
        grey_02: string
        grey_01: string
        white: string
    }
    transparent: {
        black_00: string
        black_90: string
        black_80: string
        black_70: string
        black_60: string
        black_50: string
        black_40: string
        black_30: string
        black_20: string
        black_10: string

        white_00: string
        white_80: string
        white_70: string
        white_60: string
        white_50: string
        white_40: string
        white_30: string
        white_20: string
        white_10: string
    }
}

export const colors: colorsType = {
    blue: {
        blue_09: "#003187",
        blue_08: "#0042A5",
        blue_07: "#0056C3",
        blue_06: "#006BE1",
        blue_05: "#007AFF",
        blue_04: "#0A84FF",
        blue_03: "#47A2F9",
        blue_02: "#69B2F8",
        blue_01: "#8AC2F8",
        blue_00: "#AAD2F8",
    },
    purple: {
        purple_09: "#3B0B78", // mais escuro
        purple_08: "#4D0D9A",
        purple_07: "#5F0FBC",
        purple_06: "#6F18DC",
        purple_05: "#7B23F3", // tom base que você passou
        purple_04: "#8E3FF5",
        purple_03: "#A362F7",
        purple_02: "#B47FF8",
        purple_01: "#C49AF9",
        purple_00: "#D3B5FA", // mais claro
    },
    green: {
        green_09: "#032C23",
        green_08: "#06523B",
        green_07: "#0B774E",
        green_06: "#0F9B5A",
        green_05: "#15BF62",
        green_04: "#3CCC79",
        green_03: "#63D992",
        green_02: "#8BE4AD",
        green_01: "#B5EFC9",
        green_00: "#DFF8E7",
    },
    yellow: {
        yellow_09: "#85590E",
        yellow_07: "#C2871A",
        yellow_05: "#FFB72A",
        yellow_04: "#f2be00",
        yellow_03: "#FACC74",
        yellow_01: "#F9E3B8",
    },
    red: {
        red_09: "#780E1F",
        red_07: "#B41A27",
        red_05: "#ED2A2A",
        red_03: "#EE7373",
        red_01: "#F3B8B8",
    },

    gray: {
        black: "#000000",
        grey_09: "#151416",
        grey_08: "#1F1E1E",
        grey_07: "#282828",
        grey_06: "#424242",
        grey_05: "#525252",
        grey_04: "#858585",
        grey_03: "#DEDEDE",
        grey_02: "#EDEDED",
        grey_01: "#F9F9F9",
        white: "#FFFFFF",
    },

    transparent: {
        black_00: "#00000000",
        black_90: "#00000090",
        black_80: "#00000080",
        black_70: "#00000070",
        black_60: "#00000060",
        black_50: "#00000050",
        black_40: "#00000040",
        black_30: "#00000030",
        black_20: "#00000020",
        black_10: "#00000010",

        white_00: "#ffffff00",
        white_80: "#ffffff80",
        white_70: "#ffffff70",
        white_60: "#ffffff60",
        white_50: "#ffffff50",
        white_40: "#ffffff40",
        white_30: "#ffffff30",
        white_20: "#ffffff20",
        white_10: "#ffffff10",
    },
}

export const dark = {
    background: colors.gray.black,
    backgroundAccent: colors.gray.white,
    backgroundDisabled: colors.gray.grey_07,

    primaryBackground: colors.purple.purple_09,
    primary: colors.purple.purple_04,
    primaryAccent: colors.purple.purple_00,
    primaryMaxAccent: colors.purple.purple_02,

    secundaryBackground: colors.green.green_09,
    secundary: colors.green.green_04,
    secundaryAccent: colors.green.green_00,
    secundaryMaxAccent: colors.green.green_02,

    headline: colors.gray.black,
    title: colors.gray.grey_09,
    titleAccent: colors.gray.white,
    text: colors.gray.grey_01,
    textAccent: colors.gray.grey_09,
    textDisabled: colors.gray.grey_04,
    label: colors.gray.grey_08,
    placeholder: colors.gray.grey_04,

    success: colors.green.green_05,
    warning: colors.yellow.yellow_05,
    error: colors.red.red_05,

    like: colors.red.red_05,
    comment: colors.yellow.yellow_05,
    view: colors.green.green_05,
    user: colors.purple.purple_05,

    iconFocused: colors.purple.purple_05,
    icon: colors.gray.grey_04,

    blur_overlay_color: colors.transparent.black_00,
    blur_button_color: colors.transparent.black_60,
    blur_display_color: colors.transparent.black_40,

    verifyed: colors.yellow.yellow_04,
}

export const light = {
    background: colors.gray.white,
    backgroundAccent: colors.gray.black,
    backgroundDisabled: colors.gray.grey_02,

    primaryBackground: colors.purple.purple_00,
    primary: colors.purple.purple_05,
    primaryAccent: colors.purple.purple_00,
    primaryMaxAccent: colors.purple.purple_02,

    secundaryBackground: colors.green.green_00,
    secundary: colors.green.green_05,
    secundaryAccent: colors.green.green_00,
    secundaryMaxAccent: colors.green.green_02,

    headline: colors.gray.black,
    title: colors.gray.grey_09,
    titleAccent: colors.gray.white,
    text: colors.gray.grey_09,
    textAccent: colors.gray.grey_01,
    textDisabled: colors.gray.grey_04,
    label: colors.gray.grey_08,
    placeholder: colors.gray.grey_03,

    success: colors.green.green_05,
    warning: colors.yellow.yellow_05,
    error: colors.red.red_05,

    like: colors.red.red_05,
    comment: colors.yellow.yellow_05,
    view: colors.green.green_05,
    user: colors.purple.purple_05,

    iconFocused: colors.purple.purple_05,
    icon: colors.gray.grey_04,

    blur_overlay_color: colors.transparent.white_00,
    blur_button_color: colors.transparent.black_40,
    blur_display_color: colors.transparent.white_40,

    verifyed: colors.yellow.yellow_04,
}

export default function ColorTheme(): typeof dark | typeof light {
    return useColorTheme()
}
