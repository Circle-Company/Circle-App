import { useColorScheme } from "react-native"

type colorsType = {
    blue: {
        blue_09: String,
        blue_08: String,
        blue_07: String,
        blue_06: String,
        blue_05: String,
        blue_04: String,
        blue_03: String,
        blue_02: String,
        blue_01: String,
        blue_00: String,
    },
    green: {
        green_09: String,
        green_08: String,
        green_07: String,
        green_06: String,
        green_05: String,
        green_04: String,
        green_03: String,
        green_02: String,
        green_01: String,
        green_00: String,
    },
    yellow: {
        yellow_09: String,
        yellow_07: String,
        yellow_05: String,
        yellow_04: String,
        yellow_03: String,
        yellow_01: String,
    },
    red: {
        red_09: String,
        red_07: String,
        red_05: String,
        red_03: String,
        red_01: String,
    },
    gray: {
        black: String,
        grey_09: String,
        grey_08: String,
        grey_07: String,
        grey_06: String,
        grey_05: String,
        grey_04: String,
        grey_03: String,
        grey_02: String,
        grey_01: String,
        white: String        
    },
    transparent: {
        black_00: String,
        black_90: String,
        black_80: String,
        black_70: String,
        black_60: String,
        black_50: String,
        black_40: String,
        black_30: String,
        black_20: String,
        black_10: String,

        white_00: String,
        white_80: String,
        white_70: String,
        white_60: String,
        white_50: String,
        white_40: String,
        white_30: String,
        white_20: String,
        white_10: String
    }
}

export const colors:colorsType = {
    blue: {
        blue_09: '#003187',
        blue_08: '#0042A5',
        blue_07: '#0056C3',
        blue_06: '#006BE1',
        blue_05: '#007AFF',
        blue_04: '#0A84FF',
        blue_03: '#47A2F9',
        blue_02: '#69B2F8',
        blue_01: '#8AC2F8',
        blue_00: '#AAD2F8',
    },
    green: {
        green_09: '#032C23', 
        green_08: '#06523B',
        green_07: '#0B774E',
        green_06: '#0F9B5A',
        green_05: '#15BF62',
        green_04: '#3CCC79',
        green_03: '#63D992',
        green_02: '#8BE4AD',
        green_01: '#B5EFC9',
        green_00: '#DFF8E7',
    },
    yellow: {
        yellow_09: '#85590E',
        yellow_07: '#C2871A',
        yellow_05: '#FFB72A',
        yellow_04: '#f2be00',
        yellow_03: '#FACC74',
        yellow_01: '#F9E3B8',
    },
    red: {
        red_09: '#780E1F',
        red_07: '#B41A27',
        red_05: '#ED2A2A',
        red_03: '#EE7373',
        red_01: '#F3B8B8',
    },

    gray: {
        black: '#000000',
        grey_09: '#151414',
        grey_08: '#1F1E1E',
        grey_07: '#282828',
        grey_06: '#424242',
        grey_05: '#525252',
        grey_04: '#858585',
        grey_03: '#DEDEDE',
        grey_02: '#EDEDED',
        grey_01: '#F9F9F9',
        white: '#FFFFFF'        
    },

    transparent: {
        black_00: '#00000000',
        black_90: '#00000090',
        black_80: '#00000080',
        black_70: '#00000070',
        black_60: '#00000060',
        black_50: '#00000050',
        black_40: '#00000040',
        black_30: '#00000030',
        black_20: '#00000020',
        black_10: '#00000010',

        white_00: '#ffffff00',
        white_80: '#ffffff80',
        white_70: '#ffffff70',
        white_60: '#ffffff60',
        white_50: '#ffffff50',
        white_40: '#ffffff40',
        white_30: '#ffffff30',
        white_20: '#ffffff20',
        white_10: '#ffffff10',
    }
}

export const dark = {
    background: colors.gray.black,
    backgroundAccent: colors.gray.white,
    backgroundDisabled: colors.gray.grey_07,

    primaryBackground: colors.blue.blue_09,
    primary: colors.blue.blue_04,
    primaryAccent: colors.blue.blue_00,
    primaryMaxAccent: colors.blue.blue_02,

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
    user: colors.blue.blue_05,

    iconFocused: colors.blue.blue_05,
    icon: colors.gray.grey_04,

    blur_overlay_color: colors.transparent.black_00,
    blur_button_color:colors.transparent.black_60,
    blur_display_color:colors.transparent.black_40,

    verifyed: colors.yellow.yellow_04
}

export const light = {
    background: colors.gray.white,
    backgroundAccent: colors.gray.black,
    backgroundDisabled: colors.gray.grey_02,

    primaryBackground: colors.blue.blue_00,
    primary: colors.blue.blue_05,
    primaryAccent: colors.blue.blue_00,
    primaryMaxAccent: colors.blue.blue_02,

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
    user: colors.blue.blue_05,

    iconFocused: colors.blue.blue_05,
    icon: colors.gray.grey_04,

    blur_overlay_color: colors.transparent.white_00,
    blur_button_color:colors.transparent.black_40,
    blur_display_color:colors.transparent.white_40,

    verifyed: colors.yellow.yellow_04
}

export default function ColorTheme() {
    if (useColorScheme() == "dark") return dark
    else return light
}