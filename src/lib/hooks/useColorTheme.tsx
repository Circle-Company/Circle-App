import { dark, light } from "@/constants/colors"

export function useColorTheme(): typeof dark | typeof light {
    return dark
}
