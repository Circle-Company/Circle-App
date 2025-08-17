import { NavigationState, PartialState } from "@react-navigation/native"

export type { NativeStackScreenProps } from "@react-navigation/native-stack"

export type State = NavigationState | Omit<PartialState<NavigationState>, "stale">

export type RouteParams = Record<string, string>
export type MatchResult = { params: RouteParams }
export type Route = {
    match: (path: string) => MatchResult | undefined
    build: (params: RouteParams) => string
}
