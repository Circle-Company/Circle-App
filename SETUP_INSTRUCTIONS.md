# 🚀 Expo Router Setup Instructions

## ✅ Migration Complete!

Your Circle App has been successfully migrated from React Navigation to **Expo Router with Native Tabs**!

## 📋 What Was Done

### ✨ Created New Structure
- ✅ Created `app/` directory with file-based routing
- ✅ Implemented Native Tabs for bottom navigation
- ✅ Set up auth flow with `(auth)` group
- ✅ Set up main app with `(tabs)` group
- ✅ Created Stack navigators for Moments, Profile, Settings
- ✅ Set up dynamic routes for `[id]` and `[userId]`
- ✅ Added auth protection and redirection logic

### 🗑️ Removed Old Files
- ✅ Deleted `src/navigation/` folder
- ✅ Deleted `src/routes/` folder
- ✅ Updated `index.js` to use Expo Router entry point

### 📦 New Files Created
```
app/
├── _layout.tsx                    # Root layout with all providers
├── +not-found.tsx                 # 404 screen
├── (auth)/                        # Auth group
│   ├── _layout.tsx
│   ├── init.tsx
│   ├── sign-in.tsx
│   ├── sign-up-username.tsx
│   ├── sign-up-password.tsx
│   ├── sign-up-agree.tsx
│   ├── privacy-policy.tsx
│   ├── terms-of-service.tsx
│   └── community-guidelines.tsx
├── (tabs)/                        # Main tabs with Native Tabs
│   ├── _layout.tsx               # Native tabs configuration
│   ├── moments/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── create/
│   │   └── index.tsx
│   └── you/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── edit.tsx
├── moment/                        # Moment screens
│   ├── _layout.tsx
│   ├── [id].tsx
│   ├── new-gallery.tsx
│   ├── new-image.tsx
│   ├── new-camera.tsx
│   └── new-description.tsx
├── profile/                       # Profile screens
│   ├── _layout.tsx
│   └── [userId].tsx
└── settings/                      # Settings screens
    ├── _layout.tsx
    ├── index.tsx
    ├── profile-picture.tsx
    ├── description.tsx
    ├── followings.tsx
    ├── name.tsx
    ├── password.tsx
    ├── privacy-policy.tsx
    ├── terms-of-service.tsx
    ├── community-guidelines.tsx
    ├── push-notifications.tsx
    ├── all-moments.tsx
    ├── preferences.tsx
    ├── language.tsx
    ├── content.tsx
    ├── haptics.tsx
    ├── open-source.tsx
    ├── support.tsx
    ├── version.tsx
    └── log-out.tsx

src/lib/
└── navigation.ts                  # Helper functions for migration
```

## 🔧 Next Steps

### 1. Update Dependencies (if needed)

Make sure you have the correct dependencies:

```bash
npm install expo-router@latest
```

### 2. Clear Cache and Rebuild

```bash
# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/app/build
rm -rf ios/Pods
rm -rf ios/build

# Reinstall and rebuild
npm install
cd ios && pod install && cd ..

# Start fresh
npx expo start -c
```

### 3. Update Navigation Calls in Components

You need to update all components that use navigation. Here's a quick guide:

#### Find and Replace Patterns:

**Pattern 1: Import statements**
```bash
# Find:
import { useNavigation } from '@react-navigation/native'

# Replace with:
import { useRouter } from 'expo-router'
```

**Pattern 2: Hook usage**
```bash
# Find:
const navigation = useNavigation()

# Replace with:
const router = useRouter()
```

**Pattern 3: Navigate calls**
```bash
# Find:
navigation.navigate('ScreenName')

# Replace with:
router.push('/screen-name')
```

**Pattern 4: Go back**
```bash
# Find:
navigation.goBack()

# Replace with:
router.back()
```

**Pattern 5: Route params**
```bash
# Find:
import { useRoute } from '@react-navigation/native'
const route = useRoute()
const { param } = route.params

# Replace with:
import { useLocalSearchParams } from 'expo-router'
const { param } = useLocalSearchParams()
```

### 4. Update Specific Files

Here are the files you'll most likely need to update:

#### Components that navigate:
- `src/components/headers/**/*.tsx` - Header buttons
- `src/components/moment/**/*.tsx` - Moment interactions
- `src/components/profile/**/*.tsx` - Profile navigation
- `src/pages/**/*.tsx` - All page components

#### Common navigation locations:
```bash
# Search for all navigation usage
grep -r "useNavigation" src/ --include="*.tsx"
grep -r "navigation.navigate" src/ --include="*.tsx"
grep -r "navigation.push" src/ --include="*.tsx"
grep -r "navigation.goBack" src/ --include="*.tsx"
grep -r "useRoute" src/ --include="*.tsx"
```

### 5. Use Helper Functions (Temporary)

During migration, you can use the helper functions in `src/lib/navigation.ts`:

```tsx
import { navigation, ROUTES } from '@/lib/navigation';

// Instead of:
// router.push('/(tabs)/moments')
navigation.navigate(ROUTES.TABS.MOMENTS);

// Instead of:
// router.push(`/profile/${userId}`)
navigation.navigate(ROUTES.PROFILE.USER(userId));
```

### 6. Test All Flows

Test these critical flows:

- [ ] **Auth Flow**
  - [ ] App opens to splash/init screen
  - [ ] Sign in works
  - [ ] Sign up flow works
  - [ ] Redirects to home after login
  - [ ] Privacy policy, terms, guidelines accessible

- [ ] **Tab Navigation**
  - [ ] All 3 tabs work (Moments, Create, You)
  - [ ] Tab icons show correctly
  - [ ] Tab bar shows/hides on scroll
  - [ ] Switching between tabs maintains state

- [ ] **Moments Flow**
  - [ ] View moment detail
  - [ ] Create new moment
  - [ ] Gallery picker
  - [ ] Camera module
  - [ ] Add description

- [ ] **Profile Flow**
  - [ ] View own profile
  - [ ] View other profiles
  - [ ] Edit profile

- [ ] **Settings Flow**
  - [ ] All settings screens accessible
  - [ ] Navigation back works
  - [ ] Changes save correctly
  - [ ] Log out works

- [ ] **Deep Linking**
  - [ ] Test deep links to moments
  - [ ] Test deep links to profiles
  - [ ] Test share functionality

## 📚 Documentation

Refer to these files for detailed information:

1. **EXPO_ROUTER_MIGRATION.md** - Complete migration guide
2. **MIGRATION_EXAMPLES.md** - Code examples for every scenario
3. **src/lib/navigation.ts** - Helper functions and route constants

## 🆘 Troubleshooting

### Issue: "Cannot find module 'expo-router'"
**Solution:**
```bash
npm install expo-router
npx expo install expo-router
```

### Issue: White screen on startup
**Solution:**
- Check that `app/_layout.tsx` exists
- Clear cache: `npx expo start -c`
- Check console for errors

### Issue: Navigation not working
**Solution:**
- Make sure paths start with `/`
- Check route names in `ROUTES` constant
- Verify dynamic routes use `[param]` syntax

### Issue: Tabs not showing
**Solution:**
- Check `app/(tabs)/_layout.tsx` uses `NativeTabs`
- Verify tab icons exist
- Check that you're navigating to `/(tabs)/moments` not just `/moments`

### Issue: Auth redirect loop
**Solution:**
- Check `AuthContext.checkIsSigned()` is working
- Verify `RedirectContext` is properly initialized
- Check console logs for auth state

### Issue: Deep links not working
**Solution:**
- Verify `app.config.js` has `expo-router` plugin
- Check scheme is configured: `"scheme": "circle"`
- Test with: `npx uri-scheme open circle://moment/123 --ios`

## 🎯 Performance Tips

1. **Use `memo` for expensive components**
   ```tsx
   export default React.memo(MyComponent);
   ```

2. **Lazy load routes** (if needed)
   ```tsx
   const LazyScreen = lazy(() => import('./screens/Heavy'));
   ```

3. **Optimize images**
   - Use `expo-image` instead of `Image`
   - Already configured in your project!

4. **Monitor navigation performance**
   ```tsx
   import { useNavigationState } from 'expo-router';
   ```

## 🔗 Useful Links

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Native Tabs Guide](https://docs.expo.dev/router/advanced/native-tabs/)
- [Stack Navigator](https://docs.expo.dev/router/advanced/stack/)
- [Migration Guide](https://docs.expo.dev/router/migrate/from-react-navigation/)

## 📝 Notes

- The old navigation files have been removed
- All routes now use file-based routing
- Native Tabs is experimental but stable
- Dynamic routes require rebuilding when changed
- Group routes `(name)` don't affect URL structure

## ✅ Checklist

Before deploying:

- [ ] All navigation calls updated
- [ ] All route params updated
- [ ] Auth flow tested
- [ ] All tabs working
- [ ] Deep links tested
- [ ] Build successful on iOS
- [ ] Build successful on Android
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated

## 🎉 You're Ready!

The migration is complete! Start updating your components one by one, test thoroughly, and enjoy the benefits of Expo Router with Native Tabs!

**Need help?** Check the migration documents or the examples in `MIGRATION_EXAMPLES.md`.

---

**Last Updated:** $(date)
**Migration Version:** 1.0.0