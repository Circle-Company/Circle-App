# Expo Router Migration Guide - Native Tabs Implementation

This document outlines the complete migration from React Navigation to Expo Router with Native Tabs.

## 🎯 Overview

The app has been migrated from traditional React Navigation to **Expo Router** with **Native Tabs** (experimental feature). This provides:
- File-based routing
- Native iOS/Android tab bar implementation
- Better performance and native animations
- Type-safe navigation

## 📁 New Structure

```
app/
├── _layout.tsx                    # Root layout with auth protection
├── (auth)/                        # Auth group (modals)
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
│   ├── moments/                  # Home/Moments tab
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── create/                   # Camera tab
│   │   └── index.tsx
│   └── you/                      # Account tab
│       ├── _layout.tsx
│       ├── index.tsx
│       └── edit.tsx
├── moment/                        # Moment screens (stack)
│   ├── _layout.tsx
│   ├── [id].tsx                  # Dynamic route for moment detail
│   ├── new-gallery.tsx
│   ├── new-image.tsx
│   ├── new-camera.tsx
│   └── new-description.tsx
├── profile/                       # Profile screens (stack)
│   ├── _layout.tsx
│   └── [userId].tsx              # Dynamic route for user profile
└── settings/                      # Settings screens (stack)
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
```

## 🔄 Navigation Changes

### Old Way (React Navigation)
```tsx
// Navigate to a screen
navigation.navigate('ProfileNavigator', { 
  screen: 'Profile', 
  params: { findedUserPk: '123' } 
});

// Go back
navigation.goBack();

// Replace
navigation.replace('HomeScreen');
```

### New Way (Expo Router)
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to a screen
router.push('/profile/123');
router.push({
  pathname: '/profile/[userId]',
  params: { userId: '123' }
});

// Go back
router.back();

// Replace
router.replace('/moments');

// Dismiss modal
router.dismiss();

// Navigate to tabs
router.push('/(tabs)/moments');
router.push('/(tabs)/you');
```

## 📋 Route Mapping

### Auth Routes
| Old Route | New Route |
|-----------|-----------|
| `Init` | `/(auth)/init` |
| `Auth-SignIn` | `/(auth)/sign-in` |
| `Auth-SignUp-Username` | `/(auth)/sign-up-username` |
| `Auth-SignUp-Password` | `/(auth)/sign-up-password` |
| `Auth-SignUp-Agree` | `/(auth)/sign-up-agree` |

### Tab Routes
| Old Route | New Route |
|-----------|-----------|
| `BottomTab` → `Moments` → `HomeScreen` | `/(tabs)/moments` |
| `BottomTab` → `Create` | `/(tabs)/create` |
| `BottomTab` → `You` → `AccountScreen` | `/(tabs)/you` |

### Moment Routes
| Old Route | New Route |
|-----------|-----------|
| `MomentNavigator` → `MomentFullScreen` | `/moment/[id]` |
| `MomentNavigator` → `NewMomentGalleryScreen` | `/moment/new-gallery` |
| `MomentNavigator` → `NewMomentImageScreen` | `/moment/new-image` |
| `MomentNavigator` → `NewMomentCameraModule` | `/moment/new-camera` |
| `MomentNavigator` → `NewMomentDescription` | `/moment/new-description` |

### Profile Routes
| Old Route | New Route |
|-----------|-----------|
| `ProfileNavigator` → `Profile` | `/profile/[userId]` |

### Settings Routes
| Old Route | New Route |
|-----------|-----------|
| `SettingsNavigator` → `Settings` | `/settings` |
| `SettingsNavigator` → `Settings-ProfilePicture` | `/settings/profile-picture` |
| `SettingsNavigator` → `Settings-Description` | `/settings/description` |
| `SettingsNavigator` → `Settings-Followings` | `/settings/followings` |
| `SettingsNavigator` → `Settings-Name` | `/settings/name` |
| `SettingsNavigator` → `Settings-Password` | `/settings/password` |
| (and all other settings screens...) | `/settings/{screen-name}` |

## 🔧 Code Updates Required

### 1. Update Navigation Calls

Find all instances of:
```tsx
navigation.navigate()
navigation.push()
navigation.goBack()
navigation.replace()
```

Replace with Expo Router equivalents:
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push()
router.back()
router.replace()
```

### 2. Update useNavigation Hook

**Before:**
```tsx
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
```

**After:**
```tsx
import { useRouter } from 'expo-router';
const router = useRouter();
```

### 3. Update Route Parameters

**Before:**
```tsx
import { useRoute } from '@react-navigation/native';
const route = useRoute();
const { findedUserPk } = route.params;
```

**After:**
```tsx
import { useLocalSearchParams } from 'expo-router';
const { userId } = useLocalSearchParams<{ userId: string }>();
```

### 4. Update Header Configuration

**Before:**
```tsx
navigation.setOptions({
  headerTitle: 'My Title',
  headerRight: () => <MyButton />
});
```

**After:**
```tsx
import { Stack } from 'expo-router';

<Stack.Screen
  options={{
    headerTitle: 'My Title',
    headerRight: () => <MyButton />
  }}
/>
```

### 5. Update Deep Linking

**Before (app.json):**
```json
{
  "expo": {
    "scheme": "circle"
  }
}
```

**After (app.json):**
```json
{
  "expo": {
    "scheme": "circle",
    "plugins": [
      "expo-router"
    ]
  }
}
```

## 🎨 Native Tabs Features

The new Native Tabs implementation provides:

### iOS Features:
- **Liquid Glass Effect** (iOS 18+)
- **Tab bar minimization** on scroll
- **SF Symbols** for icons
- **Native animations**
- **Dynamic color support**

### Android Features:
- **Material Design** tab bar
- **Custom drawables** support
- **Badge support**
- **Keyboard avoidance**

### Configuration Example:
```tsx
<NativeTabs
  tintColor={ColorTheme().primary}
  labelStyle={{
    color: ColorTheme().text,
    fontFamily: Fonts.family['Bold-Italic'],
  }}
  minimizeBehavior="onScrollDown"
>
  <NativeTabs.Trigger name="moments">
    <Label hidden />
    <Icon
      sf={{ default: 'house', selected: 'house.fill' }}
      src={require('@/assets/icons/pngs/moments.png')}
    />
  </NativeTabs.Trigger>
</NativeTabs>
```

## 🚀 Benefits

1. **Type Safety**: Better TypeScript support with typed routes
2. **Performance**: Native tab implementation is faster
3. **Developer Experience**: File-based routing is more intuitive
4. **Native Feel**: Uses platform-specific navigation patterns
5. **Code Splitting**: Automatic code splitting by route
6. **Deep Linking**: Built-in deep linking support

## ⚠️ Breaking Changes

1. **Navigation API**: All `navigation.navigate()` calls must be updated to `router.push()`
2. **Route Params**: `route.params` becomes `useLocalSearchParams()`
3. **Navigation State**: Access through `useSegments()` instead of navigation state
4. **Screen Options**: Must use `<Stack.Screen>` component instead of navigation options
5. **Nested Navigators**: Use file-based structure instead of nested navigator components

## 📦 Required Dependencies

Make sure these are in your `package.json`:
```json
{
  "dependencies": {
    "expo-router": "^6.0.21",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/stack": "^7.4.5",
    "@react-navigation/bottom-tabs": "^7.9.0"
  }
}
```

## 🔍 Search and Replace Patterns

### Pattern 1: Basic Navigation
```bash
# Find: navigation.navigate\(['"]([^'"]+)['"]\)
# Replace: router.push('/$1')
```

### Pattern 2: Navigation with Params
```bash
# Find: navigation.navigate\(['"]([^'"]+)['"], \{ params: (\{[^}]+\}) \}\)
# Replace: router.push({ pathname: '/$1', params: $2 })
```

### Pattern 3: Go Back
```bash
# Find: navigation.goBack\(\)
# Replace: router.back()
```

## 📝 Testing Checklist

- [ ] Auth flow (sign in, sign up)
- [ ] Tab navigation (moments, create, you)
- [ ] Deep linking to moments
- [ ] Profile navigation
- [ ] Settings navigation (all screens)
- [ ] Back button behavior
- [ ] Modal presentations
- [ ] Dynamic routes (moment/[id], profile/[userId])
- [ ] Header configurations
- [ ] Tab bar visibility on scroll

## 🐛 Common Issues

### Issue 1: "Cannot find module 'expo-router'"
**Solution**: Run `npm install expo-router`

### Issue 2: White screen on app start
**Solution**: Check that `app/_layout.tsx` exists and exports a component

### Issue 3: Navigation not working
**Solution**: Ensure you're using `router.push()` with correct paths starting with `/`

### Issue 4: Tabs not showing
**Solution**: Check that `(tabs)/_layout.tsx` uses `NativeTabs` component

### Issue 5: Dynamic routes not matching
**Solution**: Ensure dynamic segments use `[param]` syntax in filename

## 📚 Additional Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Native Tabs Guide](https://docs.expo.dev/router/advanced/native-tabs/)
- [Stack Navigator](https://docs.expo.dev/router/advanced/stack/)
- [Migration from React Navigation](https://docs.expo.dev/router/migrate/from-react-navigation/)

## 🎉 Next Steps

1. **Update all navigation calls** in your components
2. **Test each flow** thoroughly
3. **Update deep linking** configuration
4. **Optimize tab icons** for both platforms
5. **Remove old navigation files** from `src/navigation/`
6. **Update documentation** for your team

---

**Note**: The old navigation files in `src/navigation/` can be removed after thorough testing of the new routing system.