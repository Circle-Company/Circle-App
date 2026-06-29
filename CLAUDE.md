# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Circle App — a mobile social/video ("moments") app built with Expo SDK 56, React Native 0.85, React 19, and Expo Router. iOS-first (Apple Sign-In, new architecture enabled on iOS only; Android uses the old architecture). Requires a **development build** — it does **not** run in Expo Go.

## Commands

```bash
npm start                # expo start (press 's' for Development Build mode)
npm run ios              # expo run:ios
npm run android          # expo run:android
npm run pod-install      # cd ios && RCT_NEW_ARCH_ENABLED=1 bundle exec pod install
npm run lint             # expo lint

npm test                 # vitest (watch)
npm run test:run         # vitest run (single pass, use in CI)
npm run test:ui          # vitest --ui
npm run test:coverage    # vitest run --coverage
npx vitest run src/contexts/Feed/classes/__tests__/orchestrator.spec.ts   # run a single test file
npx vitest run -t "name of test"                                          # run by test name

eas build --platform all --profile development   # create a dev build (required to run the app)
npx expo doctor          # diagnose env/dependency problems
npx expo start --clear   # clear Metro cache
```

`postinstall` runs `patch-package` — patches live in `patches/` (currently `react-native-haptic-feedback`, `react-native-linear-gradient`). After editing a dependency in `node_modules`, regenerate the patch rather than hand-editing.

## Code style (enforced by ESLint + Prettier)

- 4-space indentation, **double quotes**, **no semicolons**, unix line endings.
- Path aliases: `@/*` and `#/*` both map to `src/*` (configured in `tsconfig.json`, `babel.config.js`, and `vitest.config.ts` — keep all three in sync). `#/*` is also used to reach repo root.
- TypeScript `strict` is on. `@typescript-eslint/no-explicit-any` is a warning (used liberally in interceptor/store code).
- Much of the codebase has Portuguese comments and log messages; match the surrounding language when editing a file.

## Architecture

### Navigation (Expo Router, file-based)
Routes live in `app/`. Route groups: `(auth)` (sign-in / sign-up flow), `(tabs)` (main app — `moments`, `inbox`, `you`, `settings`, `create`), plus `moment/`, `profile/`, `permissions/`. `app/_layout.tsx` is the root: it loads fonts, mounts the entire provider tree, and `RootLayoutNav` decides the initial redirect (`/(tabs)/moments` vs `/(auth)/init`) based on auth state while holding the splash screen.

### Provider tree
`app/_layout.tsx` nests ~15 context providers in a specific order (Redirect → Auth → QueryProvider → Toast → Tutorial → Language → Network → Geolocation → Camera → Account → Profile → Feed → BottomSheet → NewMoment → PushNotification). Order matters: e.g. `QueryProvider` must wrap anything using React Query, `Auth` wraps everything that reads the session. Contexts are in `src/contexts/` and each exports a `Provider`.

### State & persistence (three layers)
1. **MMKV** (`src/store/index.ts`) — synchronous key-value storage via `react-native-mmkv`. `storageKeys()` is the single source of truth for all storage keys (JWT, preferences, statistics, etc.); always go through it. Use `safeDelete`/`safeSet` helpers. This is the lowest layer — interceptors and stores read/write tokens here directly.
2. **Zustand persisted stores** (`src/contexts/Persisted/`) — `persist.account.ts`, `persist.user.ts`, `persist.preferences.ts`, `persist.metrics.ts`. The `Persisted` Provider syncs the auth session into these stores. Stores are accessible outside React via `useXStore.getState()` (the axios layer does this to mutate tokens without hooks).
3. **React Query** (`src/lib/react-query.tsx`) — server cache, persisted to MMKV via `PersistQueryClientProvider`. Only query keys in `STORED_CACHE_QUERY_KEY_ROOTS` are dehydrated. Default options: no retry, no refetch on focus. Shared stale-time constants in `src/queries/index.ts` (`STALE`).

### API layer (`src/api/`)
`src/api/index.ts` builds a single axios instance and exports `apiRoutes`, namespaced by domain (`account`, `moment`, `user`, `preferences`, `auth`, `profile`). Each domain folder has `<name>.ts` (route functions) + `<name>.types.ts`. Base URL comes from `config.ENDPOINT` (`.env`).

Two interceptors carry significant logic — read them before touching auth:
- **Request**: injects `Authorization: Bearer <token>` from MMKV; extra enforcement + verbose logging for `/moments/*` and `/auth/*`.
- **Response**: on 401 (except the refresh route), runs a **single-flight refresh-token flow** (`doRefreshToken`) that queues concurrent failed requests, refreshes via `GET /auth/refresh-token`, updates MMKV + Zustand, and replays the queue. There's an `authGracePeriod` to suppress refresh churn right after login. On refresh failure it clears tokens (except the `NO_REFRESH_TOKEN` sentinel). See `docs/refresh-auth-persisted.md`.

### Feed system (`src/contexts/Feed/`)
The moments feed is orchestrated by `classes/orchestrator.ts` (`FeedOrchestrator`), which composes `Fetcher` (network), `ChunkManager` (pagination chunks), `CacheManager` (bounded in-memory cache, max size from `helpers/calculeCacheMaxSize`), and `DebounceGate` (rate-limits fetches). `useFeed.ts` is the React hook wrapping the orchestrator; the `Feed` Provider also merges in keyboard state. This subsystem has the densest test coverage (`classes/__tests__`, `helpers/__tests__`).

### Mutations (`src/queries/`)
React Query mutation hooks, one file per action (`moment.like.ts`, `user.follow.ts`, `moment.comment.ts`, etc.), each calling into `apiRoutes`.

### Other integrations
- **Camera**: `modules/camera/` (vision-camera based) with its own context, mounted in the root tree.
- **Push**: Firebase Messaging + `expo-notifications` (`src/contexts/push.notification.tsx`).
- **i18n**: `i18next` + `react-i18next`, locales in `src/locales/`.
- **Analytics**: Mixpanel (`src/lib/trackEvent.ts`, key from `MIXPANEL_KEY`).
- **SVGs**: imported as components via `react-native-svg-transformer` (Metro is configured to treat `.svg` as source, not asset).

## Testing

Vitest with `happy-dom` environment (not jest, despite some eslint jest config). Config in `vitest.config.ts`: globals on, `singleFork` pool, setup in `src/test-setup.ts`, `__mocks__/` for native module mocks. Tests match `src/**/*.{test,spec}.{ts,tsx,...}`; `android/` and `ios/` are excluded. `__DEV__` is defined globally.

## Config & environment

- `app.config.js` — dynamic Expo config. App `version`/`PLATFORM` constants live at the top of this file; bump `VERSION` there for releases. Defines plugins (notifications, fonts, splash, build-properties), bundle IDs (`circlellc.circleapp` / `com.circlecompany.circleapp`), and the `jsEngine: "jsc"`.
- `.env` (via `react-native-dotenv`, imported as `@env`) — `ENDPOINT`, `API_VESION` (sic), `APP_VERSION`, `MIXPANEL_KEY`, Android upload-keystore secrets. Not committed.
- `eas.json` — EAS build profiles. `google-services.json` for Firebase (Android).
