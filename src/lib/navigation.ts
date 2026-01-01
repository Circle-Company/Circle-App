/**
 * Navigation Helper for Expo Router Migration
 *
 * This file provides helper functions to ease the migration from React Navigation
 * to Expo Router. It maps old navigation patterns to new Expo Router patterns.
 */

import { router } from "expo-router"

/**
 * Navigation helpers that mimic React Navigation API
 */
export const navigation = {
    /**
     * Navigate to a route
     * @example navigation.navigate('/(tabs)/moments')
     * @example navigation.navigate('/profile/123')
     */
    navigate: (route: string, params?: Record<string, any>) => {
        if (params) {
            router.push({ pathname: route as any, params })
        } else {
            router.push(route as any)
        }
    },

    /**
     * Push a new route onto the stack
     */
    push: (route: string, params?: Record<string, any>) => {
        if (params) {
            router.push({ pathname: route as any, params })
        } else {
            router.push(route as any)
        }
    },

    /**
     * Go back to the previous screen
     */
    goBack: () => {
        router.back()
    },

    /**
     * Replace the current route
     */
    replace: (route: string, params?: Record<string, any>) => {
        if (params) {
            router.replace({ pathname: route as any, params })
        } else {
            router.replace(route as any)
        }
    },

    /**
     * Dismiss modal screens
     */
    dismiss: (count?: number) => {
        router.dismiss(count)
    },

    /**
     * Dismiss all screens and return to first screen
     */
    dismissAll: () => {
        router.dismissAll()
    },

    /**
     * Check if we can go back
     */
    canGoBack: () => {
        return router.canGoBack()
    },

    /**
     * Check if we can dismiss
     */
    canDismiss: () => {
        return router.canDismiss()
    },
}

/**
 * Route mapping from old React Navigation routes to new Expo Router routes
 */
export const ROUTES = {
    // Auth routes
    AUTH: {
        INIT: "/(auth)/init",
        SIGN_IN: "/(auth)/sign-in",
        SIGN_UP_USERNAME: "/(auth)/sign-up-username",
        SIGN_UP_PASSWORD: "/(auth)/sign-up-password",
        SIGN_UP_AGREE: "/(auth)/sign-up-agree",
        PRIVACY_POLICY: "/(auth)/privacy-policy",
        TERMS_OF_SERVICE: "/(auth)/terms-of-service",
        COMMUNITY_GUIDELINES: "/(auth)/community-guidelines",
    },

    // Tab routes
    TABS: {
        MOMENTS: "/(tabs)/moments",
        CREATE: "/(tabs)/create",
        YOU: "/(tabs)/you",
    },

    // Camera routes (inside create tab)
    CAMERA: {
        INDEX: "/(tabs)/create",
        PERMISSIONS: "/(tabs)/create/permissions",
        MEDIA: "/(tabs)/create/media",
    },

    // Profile routes
    PROFILE: {
        USER: (userId: string) => `/profile/${userId}`,
    },

    // Settings routes
    SETTINGS: {
        INDEX: "/(tabs)/settings",
        PROFILE_PICTURE: "/(tabs)/settings/profile-picture",
        DESCRIPTION: "/(tabs)/settings/description",
        FOLLOWINGS: "/(tabs)/settings/followings",
        NAME: "/(tabs)/settings/name",
        PASSWORD: "/(tabs)/settings/password",
        PRIVACY_POLICY: "/(tabs)/settings/privacy-policy",
        TERMS_OF_SERVICE: "/(tabs)/settings/terms-of-service",
        COMMUNITY_GUIDELINES: "/(tabs)/settings/community-guidelines",
        PREFERENCES: "/(tabs)/settings/preferences",
        LANGUAGE: "/(tabs)/settings/language",
        CONTENT: "/(tabs)/settings/content",
        HAPTICS: "/(tabs)/settings/haptics",
        OPEN_SOURCE: "/(tabs)/settings/open-source",
        SUPPORT: "/(tabs)/settings/support",
        VERSION: "/(tabs)/settings/version",
        LOG_OUT: "/(tabs)/settings/log-out",
    },
} as const

/**
 * Legacy route name to new route mapping
 * Used for backward compatibility during migration
 */
export const LEGACY_ROUTE_MAP: Record<string, string> = {
    // Auth
    Init: ROUTES.AUTH.INIT,
    "Auth-SignIn": ROUTES.AUTH.SIGN_IN,
    "Auth-SignUp-Username": ROUTES.AUTH.SIGN_UP_USERNAME,
    "Auth-SignUp-Password": ROUTES.AUTH.SIGN_UP_PASSWORD,
    "Auth-SignUp-Agree": ROUTES.AUTH.SIGN_UP_AGREE,
    "Auth-Privacy-Policy": ROUTES.AUTH.PRIVACY_POLICY,
    "Auth-Terms-Of-Service": ROUTES.AUTH.TERMS_OF_SERVICE,
    "Auth-Community-Guidelines": ROUTES.AUTH.COMMUNITY_GUIDELINES,

    // Tabs
    HomeScreen: ROUTES.TABS.MOMENTS,
    CreateBottomTab: ROUTES.TABS.CREATE,
    AccountScreen: ROUTES.TABS.YOU,

    // Moments
    MomentFullScreen: "/moment/",

    // Profile
    Profile: "/profile/",

    // Settings
    Settings: ROUTES.SETTINGS.INDEX,
    "Settings-ProfilePicture": ROUTES.SETTINGS.PROFILE_PICTURE,
    "Settings-Description": ROUTES.SETTINGS.DESCRIPTION,
    "Settings-Followings": ROUTES.SETTINGS.FOLLOWINGS,
    "Settings-Name": ROUTES.SETTINGS.NAME,
    "Settings-Password": ROUTES.SETTINGS.PASSWORD,
    "Settings-Privacy-Policy": ROUTES.SETTINGS.PRIVACY_POLICY,
    "Settings-Terms-Of-Service": ROUTES.SETTINGS.TERMS_OF_SERVICE,
    "Settings-Community-Guidelines": ROUTES.SETTINGS.COMMUNITY_GUIDELINES,
    "Settings-Preferences": ROUTES.SETTINGS.PREFERENCES,
    "Settings-Preferences-Language": ROUTES.SETTINGS.LANGUAGE,
    "Settings-Preferences-Content": ROUTES.SETTINGS.CONTENT,
    "Settings-Preferences-Haptics": ROUTES.SETTINGS.HAPTICS,
    "Settings-Open-Source": ROUTES.SETTINGS.OPEN_SOURCE,
    "Settings-Support": ROUTES.SETTINGS.SUPPORT,
    "Settings-Version": ROUTES.SETTINGS.VERSION,
    "Settings-Log-Out": ROUTES.SETTINGS.LOG_OUT,
}

/**
 * Convert legacy navigation call to new Expo Router format
 * @example navigateLegacy('Profile', { findedUserPk: '123' })
 */
export function navigateLegacy(screenName: string, params?: Record<string, any>) {
    let route = LEGACY_ROUTE_MAP[screenName] || screenName

    // Handle dynamic routes
    if (params) {
        if (screenName === "Profile" && params.findedUserPk) {
            route = ROUTES.PROFILE.USER(params.findedUserPk)
        } else if (screenName === "MomentFullScreen" && params.momentId) {
            route = ROUTES.MOMENT.DETAIL(params.momentId)
        } else {
            // Pass remaining params
            router.push({ pathname: route as any, params })
            return
        }
    }

    router.push(route as any)
}

/**
 * Hook for accessing navigation in a backward-compatible way
 * @example const nav = useNavigation()
 */
export function useNavigationCompat() {
    return navigation
}

export default navigation
