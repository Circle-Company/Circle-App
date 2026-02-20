# Onboarding Permissions (post-signup)

Goal
- Right after signup, present a single consolidated screen where the user can grant all permissions the app uses, each with a clear title, description, and “Allow” action.
- Respect platform differences and “Allow Once/Don’t Ask Again” states; guide users to Settings when needed.
- Provide a great default path: one-tap “Allow all” and individual cards to grant selectively.

Sources in this project
- Push notifications
  - Firebase Messaging permission + Android Post Notifications:
    - src/lib/hooks/userRequestPermissions.ts
      - messaging().requestPermission()
      - PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  - App plugin: expo-notifications plugin is configured in app.config.js
- Camera & Microphone
  - modules/camera/pages/permissions.tsx
    - Camera.requestCameraPermission()
    - Camera.requestMicrophonePermission()
- Photos / Media Library
  - app/(tabs)/settings/profile-picture.tsx
    - ImagePicker.requestMediaLibraryPermissionsAsync()
    - ImagePicker.requestCameraPermissionsAsync()
- Location (Foreground & Background)
  - src/contexts/geolocation.tsx
    - Location.requestForegroundPermissionsAsync()
    - Location.requestBackgroundPermissionsAsync()
    - openSettings fallback
    - Background updates with TaskManager

Target permissions to request on onboarding
- Push Notifications
  - Purpose: enable real-time alerts (messages, interactions, follows).
  - iOS: OS prompt via Firebase Messaging (and/or Expo Notifications if adopted).
  - Android 13+: POST_NOTIFICATIONS runtime permission.
- Camera
  - Purpose: record and share Moments (video/photo capture).
- Microphone
  - Purpose: capture audio in Moments.
- Photos / Media Library
  - Purpose: select media for profile picture and Moments from the gallery.
- Location (Foreground)
  - Purpose: show nearby users and personalize content; get current location on demand.
- Location (Background)
  - Purpose: keep coordinates updated periodically, even when the app is closed (as implemented in GeolocationContext).

UX copy (titles and descriptions)
Use the following titles and descriptions on the onboarding screen. You can map each to i18n keys if needed.

- Notifications
  - Title: Enable Notifications
  - Description: Get alerts about new followers, likes, and messages. You can change this anytime in Settings.
- Camera
  - Title: Camera Access
  - Description: Record and share Moments with your camera.
- Microphone
  - Title: Microphone Access
  - Description: Capture audio for your videos and voice notes.
- Photos & Media
  - Title: Photos & Media Access
  - Description: Choose photos and videos from your library to use in your profile and Moments.
- Location (Foreground)
  - Title: Location Access
  - Description: Share your approximate location to discover people and content near you.
- Background Location
  - Title: Allow Background Location
  - Description: Keep your location up to date even when you’re not using the app. This helps us show nearby content reliably.

UI spec
- Screen header: “Permissions” (or “Get set up”) with short lead: “Allow access to features you’ll use most.”
- List of permission cards. Each card includes:
  - Icon
  - Title (from UX copy above)
  - Description (1–2 lines, concise)
  - Primary action button: “Allow”
  - Secondary action: “Not now” (optional for non-critical items)
  - Status chip:
    - Granted (check)
    - Denied (warning)
    - Limited / Allow Once (info)
- CTA section (sticky footer):
  - “Allow all” (requests any pending permissions in recommended order)
  - “Continue” (enabled when all Required permissions are granted; otherwise disabled)
- Optional grouping:
  - Required: Camera, Microphone, Photos (if the app’s core creation flow depends on them)
  - Optional: Notifications, Location (Foreground/Background)
  - Note: If you prefer a softer approach, make all optional and present a “You can enable any time in Settings” helper text.

Request order (recommended)
1) Camera, Microphone, Photos/Media: These are typically core to content creation.
2) Notifications: Non-blocking; request after media permissions to avoid stacking iOS prompts.
3) Location (Foreground) -> Location (Background): Request Foreground first; if granted, then request Background.

Platform nuances and fallbacks
- iOS:
  - Avoid stacking multiple OS permission prompts at once. Trigger sequentially after the user taps “Allow”.
  - For Location, user may select “Allow Once” or “While Using the App”. Treat “Allow Once” as granted-foreground-limited; show an inline note suggesting they can upgrade in Settings.
- Android:
  - Android 13+ (API 33): POST_NOTIFICATIONS is required at runtime to show notifications.
  - For location background, ensure foreground is granted; otherwise don’t prompt background as it will fail or be confusing.
- “Don’t ask again” / canAskAgain === false:
  - Show an “Open Settings” button. Use Linking to route to app settings.

Data model
- Create a local model to track permission items, status, and request handlers.

  interface PermissionItem {
    id:
      | "notifications"
      | "camera"
      | "microphone"
      | "mediaLibrary"
      | "locationForeground"
      | "locationBackground"
    title: string
    description: string
    required: boolean
    status: "unknown" | "granted" | "denied" | "limited"
    request: () => Promise<"granted" | "denied" | "limited">
    openSettings?: () => Promise<void>
  }

- Persist status in your existing persisted store if needed:
  - Refer to PersistedContext device.permissions.setFirebaseMessaging(enabled) for notifications; you may extend this with additional setters like setCameraGranted, setMicrophoneGranted, etc.

Technical details and handlers
- Notifications
  - iOS (Firebase Messaging): await messaging().requestPermission()
  - Android 13+: await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  - Result mapping:
    - Authorized/Provisional => granted
    - Denied => denied
- Camera / Microphone (react-native-vision-camera)
  - Camera.requestCameraPermission()
  - Camera.requestMicrophonePermission()
  - Result: "granted" | "denied" | "restricted" (map restricted to “limited” if present)
- Photos / Media Library (expo-image-picker)
  - ImagePicker.requestMediaLibraryPermissionsAsync()
  - Result: { status, canAskAgain } (map granted/denied; if limited access available on iOS, treat as “limited”)
- Location (expo-location)
  - Foreground: await Location.requestForegroundPermissionsAsync()
  - Background: await Location.requestBackgroundPermissionsAsync() (only after foreground granted)
  - Respect { status, canAskAgain } and “Allow Once” (iOS).
  - Provide openSettings = () => Linking.openURL("app-settings:")
- Background updates (already configured)
  - Background location processing exists in src/contexts/geolocation.tsx. Onboarding should not start background updates directly; let the GeolocationContext manage it automatically once permissions are granted (and user is logged in).

Screen state and flows
- Initial load:
  - Probe current statuses:
    - Notifications: firebaseMessaging().requestPermission can be noisy; prefer checking settings or only prompt on user action. If you must probe, avoid double prompting by caching.
    - Camera/Mic/Photos: use corresponding get*PermissionsAsync APIs when available to read state without prompting.
    - Location: getForegroundPermissionsAsync(), getBackgroundPermissionsAsync().
  - Initialize PermissionItem.status accordingly.
- On “Allow all”:
  - Iterate over items in the recommended order.
  - For each, if status !== "granted", call request() and update its status.
  - If canAskAgain === false or the platform disallows programmatic prompt, show “Open Settings”.
- On individual “Allow”:
  - Run request() for that item, update status.
- Completing onboarding:
  - If any required item is not granted, disable “Continue”, show inline message: “To start creating Moments, please allow Camera, Microphone, and Photos.”
  - If all required are granted, “Continue” -> navigate to main app.
- Edge cases:
  - User denies background location but grants foreground: mark background as “denied” and allow proceed; surface a small note “You can enable background updates later in Settings for better nearby content.”

Suggested folder and file layout
- UI screen:
  - app/pages/auth/Onboarding/Permissions.tsx (or a similar route in your auth flow)
- Reusable hook for requests:
  - src/lib/hooks/useAppPermissions.ts (wraps concrete platform APIs with consistent return types)
- Optional context:
  - src/contexts/Permissions (mirror of PersistedContext for unified permission state across the app)

Example pseudo-code (orchestration outline)

const items: PermissionItem[] = [
  {
    id: "camera",
    title: "Camera Access",
    description: "Record and share Moments with your camera.",
    required: true,
    status: "unknown",
    request: async () => {
      const res = await Camera.requestCameraPermission()
      return res === "granted" ? "granted" : "denied"
    },
  },
  {
    id: "microphone",
    title: "Microphone Access",
    description: "Capture audio for your videos and voice notes.",
    required: true,
    status: "unknown",
    request: async () => {
      const res = await Camera.requestMicrophonePermission()
      return res === "granted" ? "granted" : "denied"
    },
  },
  {
    id: "mediaLibrary",
    title: "Photos & Media Access",
    description: "Choose photos and videos from your library.",
    required: true,
    status: "unknown",
    request: async () => {
      const { status, accessPrivileges } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status === "granted") return "granted"
      if (status === "limited" || accessPrivileges === "limited") return "limited"
      return "denied"
    },
  },
  {
    id: "notifications",
    title: "Enable Notifications",
    description: "Get alerts about new followers, likes, and messages.",
    required: false,
    status: "unknown",
    request: async () => {
      // iOS
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      // Android 13+: request POST_NOTIFICATIONS if needed via PermissionsAndroid
      return enabled ? "granted" : "denied"
    },
  },
  {
    id: "locationForeground",
    title: "Location Access",
    description: "Share your approximate location to discover nearby content.",
    required: false,
    status: "unknown",
    request: async () => {
      const fg = await Location.requestForegroundPermissionsAsync()
      if (fg.status === "granted") return "granted"
      // iOS “Allow Once” will return granted but expires; you can track limited via app logic.
      return "denied"
    },
    openSettings: async () => Linking.openURL("app-settings:"),
  },
  {
    id: "locationBackground",
    title: "Allow Background Location",
    description:
      "Keep your location up to date even when you’re not using the app for better nearby content.",
    required: false,
    status: "unknown",
    request: async () => {
      // Only proceed if foreground was granted
      const fg = await Location.getForegroundPermissionsAsync()
      if (fg.status !== "granted") return "denied"
      const bg = await Location.requestBackgroundPermissionsAsync()
      if (bg.status === "granted") return "granted"
      return "denied"
    },
    openSettings: async () => Linking.openURL("app-settings:"),
  },
]

Implementation steps
1) Build a small “permissions engine”:
   - A hook returning:
     - items: PermissionItem[]
     - refresh(): read current statuses without prompting
     - requestOne(id)
     - requestAllInOrder()
   - Map raw API responses to "granted" | "denied" | "limited"
2) Create the Onboarding Permissions screen (TSX) that:
   - Reads items from the hook
   - Renders cards with status and actions
   - Shows “Allow all” and “Continue”
   - Disables Continue until required items are granted
3) Navigation:
   - After signup success -> navigate to Onboarding Permissions
   - If all required already granted (returning users or system restore), skip this screen
4) Persist:
   - Extend PersistedContext device.permissions to store flags:
     - notificationsGranted, cameraGranted, microphoneGranted, mediaGranted, locationFgGranted, locationBgGranted
   - Update on each successful request
5) Settings fallback:
   - If canAskAgain === false (e.g., iOS previously denied), show “Open Settings”
6) Geolocation integration:
   - Do not start background tasks here. Rely on GeolocationContext (src/contexts/geolocation.tsx) to react on permission changes and logged-in state, starting updates as it already does.

QA checklist
- iOS:
  - Sequential prompts fire only after user taps Allow on a card (no stacking).
  - “Allow Once” behavior: app proceeds but communicates that some features may be reduced.
  - Open Settings button opens app settings if user cannot be prompted again.
- Android:
  - On Android 13+, POST_NOTIFICATIONS is requested.
  - Behavior on older Android versions (permission auto-granted or not required) does not crash.
- Re-entry:
  - Re-opening the onboarding screen reflects latest statuses (granted/denied/limited).
- Accessibility:
  - Buttons and descriptions are accessible, with sufficient contrast and role hints.

Optional: i18n keys
- permissions.notifications.title = Enable Notifications
- permissions.notifications.description = Get alerts about new followers, likes, and messages.
- permissions.camera.title = Camera Access
- permissions.camera.description = Record and share Moments with your camera.
- permissions.microphone.title = Microphone Access
- permissions.microphone.description = Capture audio for your videos and voice notes.
- permissions.media.title = Photos & Media Access
- permissions.media.description = Choose photos and videos from your library.
- permissions.location.fg.title = Location Access
- permissions.location.fg.description = Share your approximate location to discover nearby content.
- permissions.location.bg.title = Allow Background Location
- permissions.location.bg.description = Keep your location up to date even when you’re not using the app.
- permissions.actions.allow = Allow
- permissions.actions.notNow = Not now
- permissions.actions.allowAll = Allow all
- permissions.actions.continue = Continue
- permissions.note.settings = You can change this anytime in Settings.

Notes
- Keep the design consistent with your UI system (expo-glass-effect and @expo/ui/swift-ui if used). Avoid opacity < 1 on glass parents as it may break iOS effects.
- The app already contains a dedicated camera permissions page for the Vision Camera module (modules/camera/pages/permissions.tsx). The onboarding screen centralizes these to happen right after signup so the user doesn’t get interrupted later.