declare module "@env" {
    export const APP_VERSION: string
    export const MIXPANEL_KEY: string
    export const NODE_ENV: "development" | "production" | "test"
}

declare module "*.svg" {
    import React from "react"
    import { SvgProps } from "react-native-svg"
    const content: React.FC<SvgProps>
    export default content
}
