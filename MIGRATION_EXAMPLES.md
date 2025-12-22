# Migration Examples - React Navigation to Expo Router

This document provides practical examples of how to migrate components from React Navigation to Expo Router with Native Tabs.

## Table of Contents
- [Navigation Calls](#navigation-calls)
- [Route Parameters](#route-parameters)
- [Header Configuration](#header-configuration)
- [Link Components](#link-components)
- [Conditional Navigation](#conditional-navigation)
- [Common Patterns](#common-patterns)

## Navigation Calls

### Example 1: Basic Navigation

**Before (React Navigation):**
```tsx
import { useNavigation } from '@react-navigation/native';

function MyComponent() {
    const navigation = useNavigation();
    
    const handlePress = () => {
        navigation.navigate('Settings');
    };
    
    return <Button onPress={handlePress} title="Go to Settings" />;
}
```

**After (Expo Router):**
```tsx
import { useRouter } from 'expo-router';

function MyComponent() {
    const router = useRouter();
    
    const handlePress = () => {
        router.push('/settings');
    };
    
    return <Button onPress={handlePress} title="Go to Settings" />;
}
```

**Using Helper (Transition):**
```tsx
import { navigation } from '@/lib/navigation';

function MyComponent() {
    const handlePress = () => {
        navigation.navigate('/settings');
    };
    
    return <Button onPress={handlePress} title="Go to Settings" />;
}
```

### Example 2: Navigation with Parameters

**Before:**
```tsx
import { useNavigation } from '@react-navigation/native';

function UserList() {
    const navigation = useNavigation();
    
    const viewProfile = (userId: string) => {
        navigation.navigate('ProfileNavigator', {
            screen: 'Profile',
            params: { findedUserPk: userId }
        });
    };
    
    return <UserCard onPress={() => viewProfile('123')} />;
}
```

**After:**
```tsx
import { useRouter } from 'expo-router';

function UserList() {
    const router = useRouter();
    
    const viewProfile = (userId: string) => {
        router.push(`/profile/${userId}`);
        // OR with explicit params:
        router.push({
            pathname: '/profile/[userId]',
            params: { userId }
        });
    };
    
    return <UserCard onPress={() => viewProfile('123')} />;
}
```

**Using ROUTES constant:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

function UserList() {
    const router = useRouter();
    
    const viewProfile = (userId: string) => {
        router.push(ROUTES.PROFILE.USER(userId));
    };
    
    return <UserCard onPress={() => viewProfile('123')} />;
}
```

### Example 3: Modal Navigation

**Before:**
```tsx
navigation.navigate('MomentNavigator', {
    screen: 'MomentFullScreen',
    params: { momentId: '456' }
});
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
router.push(ROUTES.MOMENT.DETAIL('456'));
// or
router.push('/moment/456');
```

### Example 4: Go Back

**Before:**
```tsx
navigation.goBack();
```

**After:**
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.back();
```

### Example 5: Replace Navigation

**Before:**
```tsx
navigation.replace('HomeScreen');
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
router.replace(ROUTES.TABS.MOMENTS);
```

## Route Parameters

### Example 1: Reading Route Parameters

**Before:**
```tsx
import { useRoute } from '@react-navigation/native';

function ProfileScreen() {
    const route = useRoute();
    const { findedUserPk } = route.params as { findedUserPk: string };
    
    return <Text>User ID: {findedUserPk}</Text>;
}
```

**After:**
```tsx
import { useLocalSearchParams } from 'expo-router';

function ProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    
    return <Text>User ID: {userId}</Text>;
}
```

### Example 2: Optional Parameters

**Before:**
```tsx
const route = useRoute();
const params = route.params as { momentId?: string };
const momentId = params?.momentId;
```

**After:**
```tsx
import { useLocalSearchParams } from 'expo-router';

const { momentId } = useLocalSearchParams<{ momentId?: string }>();
```

### Example 3: Multiple Parameters

**Before:**
```tsx
const route = useRoute();
const { userId, tabIndex } = route.params as { 
    userId: string; 
    tabIndex?: number 
};
```

**After:**
```tsx
import { useLocalSearchParams } from 'expo-router';

const { userId, tabIndex } = useLocalSearchParams<{ 
    userId: string; 
    tabIndex?: string // Note: URL params are always strings
}>();

// Convert if needed
const tabIndexNumber = tabIndex ? parseInt(tabIndex, 10) : 0;
```

## Header Configuration

### Example 1: Dynamic Header Title

**Before:**
```tsx
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

function ProfileScreen() {
    const navigation = useNavigation();
    const username = '@johndoe';
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: username
        });
    }, [navigation, username]);
    
    return <View>...</View>;
}
```

**After:**
```tsx
import { Stack } from 'expo-router';

function ProfileScreen() {
    const username = '@johndoe';
    
    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: username
                }}
            />
            <View>...</View>
        </>
    );
}
```

### Example 2: Header with Custom Button

**Before:**
```tsx
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

function SettingsScreen() {
    const navigation = useNavigation();
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleSave}>
                    <Text>Save</Text>
                </TouchableOpacity>
            )
        });
    }, [navigation]);
    
    const handleSave = () => {
        // Save logic
    };
    
    return <View>...</View>;
}
```

**After:**
```tsx
import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';

function SettingsScreen() {
    const handleSave = () => {
        // Save logic
    };
    
    return (
        <>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text>Save</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            <View>...</View>
        </>
    );
}
```

## Link Components

### Example 1: Link to Screen

**Before:**
```tsx
import { TouchableOpacity } from 'react-native';

<TouchableOpacity 
    onPress={() => navigation.navigate('Settings')}
>
    <Text>Settings</Text>
</TouchableOpacity>
```

**After:**
```tsx
import { Link } from 'expo-router';

<Link href="/settings" asChild>
    <TouchableOpacity>
        <Text>Settings</Text>
    </TouchableOpacity>
</Link>
```

### Example 2: Link with Parameters

**Before:**
```tsx
<TouchableOpacity 
    onPress={() => navigation.navigate('Profile', { 
        findedUserPk: user.id 
    })}
>
    <Text>{user.name}</Text>
</TouchableOpacity>
```

**After:**
```tsx
import { Link } from 'expo-router';

<Link 
    href={{
        pathname: '/profile/[userId]',
        params: { userId: user.id }
    }}
    asChild
>
    <TouchableOpacity>
        <Text>{user.name}</Text>
    </TouchableOpacity>
</Link>

// Or simpler:
<Link href={`/profile/${user.id}`} asChild>
    <TouchableOpacity>
        <Text>{user.name}</Text>
    </TouchableOpacity>
</Link>
```

## Conditional Navigation

### Example 1: Navigate After Login

**Before:**
```tsx
const handleLogin = async () => {
    const success = await login(credentials);
    if (success) {
        navigation.replace('BottomTab');
    }
};
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();

const handleLogin = async () => {
    const success = await login(credentials);
    if (success) {
        router.replace(ROUTES.TABS.MOMENTS);
    }
};
```

### Example 2: Conditional Redirect

**Before:**
```tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

function ProtectedScreen() {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigation.replace('Auth-SignIn');
        }
    }, [isAuthenticated, navigation]);
    
    return <View>...</View>;
}
```

**After:**
```tsx
import { Redirect } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

function ProtectedScreen() {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Redirect href={ROUTES.AUTH.SIGN_IN} />;
    }
    
    return <View>...</View>;
}
```

## Common Patterns

### Pattern 1: Tab Navigation from Anywhere

**Before:**
```tsx
// Navigate to home tab
navigation.navigate('BottomTab', {
    screen: 'Moments',
    params: { screen: 'HomeScreen' }
});
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
router.push(ROUTES.TABS.MOMENTS);
```

### Pattern 2: Deep Navigation with Multiple Params

**Before:**
```tsx
navigation.navigate('MomentNavigator', {
    screen: 'NewMomentDescription',
    params: {
        imageUri: 'file://...',
        momentId: '123'
    }
});
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
router.push({
    pathname: ROUTES.MOMENT.NEW_DESCRIPTION,
    params: {
        imageUri: 'file://...',
        momentId: '123'
    }
});
```

### Pattern 3: Navigate and Reset Stack

**Before:**
```tsx
navigation.reset({
    index: 0,
    routes: [{ name: 'HomeScreen' }],
});
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
// Dismiss all and navigate to home
router.dismissAll();
router.replace(ROUTES.TABS.MOMENTS);
```

### Pattern 4: Check Navigation State

**Before:**
```tsx
const canGoBack = navigation.canGoBack();
if (canGoBack) {
    navigation.goBack();
}
```

**After:**
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
if (router.canGoBack()) {
    router.back();
}
```

### Pattern 5: Navigate to Settings

**Before:**
```tsx
navigation.navigate('SettingsNavigator', {
    screen: 'Settings-ProfilePicture'
});
```

**After:**
```tsx
import { useRouter } from 'expo-router';
import { ROUTES } from '@/lib/navigation';

const router = useRouter();
router.push(ROUTES.SETTINGS.PROFILE_PICTURE);
```

### Pattern 6: Handle Drawer/Modal Dismiss

**Before:**
```tsx
// Close modal and go back
navigation.goBack();

// Or pop multiple screens
navigation.pop(2);
```

**After:**
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Close modal/screen
router.back();

// Dismiss multiple screens
router.dismiss(2);

// Dismiss all in current stack
router.dismissAll();
```

## Migration Checklist for Each Component

For each component that uses navigation:

1. ✅ Replace `import { useNavigation } from '@react-navigation/native'` with `import { useRouter } from 'expo-router'`
2. ✅ Replace `navigation.navigate()` with `router.push()`
3. ✅ Replace `navigation.goBack()` with `router.back()`
4. ✅ Replace `navigation.replace()` with `router.replace()`
5. ✅ Replace `useRoute()` with `useLocalSearchParams()`
6. ✅ Update route names to new path-based format
7. ✅ Update parameter names (e.g., `findedUserPk` → `userId`)
8. ✅ Move `navigation.setOptions()` to `<Stack.Screen options={...} />`
9. ✅ Test navigation flow
10. ✅ Test with parameters
11. ✅ Test back navigation
12. ✅ Test deep linking

## Quick Reference

| Old Method | New Method | Example |
|------------|------------|---------|
| `navigation.navigate()` | `router.push()` | `router.push('/settings')` |
| `navigation.push()` | `router.push()` | `router.push('/profile/123')` |
| `navigation.goBack()` | `router.back()` | `router.back()` |
| `navigation.replace()` | `router.replace()` | `router.replace('/moments')` |
| `navigation.pop()` | `router.dismiss()` | `router.dismiss(2)` |
| `navigation.popToTop()` | `router.dismissAll()` | `router.dismissAll()` |
| `navigation.reset()` | `router.dismissAll() + router.replace()` | See Pattern 3 |
| `route.params` | `useLocalSearchParams()` | `const { id } = useLocalSearchParams()` |
| `navigation.setOptions()` | `<Stack.Screen options={...} />` | See Header Configuration |

## Tips

1. **Use ROUTES constant** for type-safety and easier refactoring
2. **Test incrementally** - migrate one screen at a time
3. **Keep old navigation** during transition period
4. **Use the helper functions** in `@/lib/navigation` for gradual migration
5. **Update deep links** in your `app.json` or marketing materials
6. **Remember**: All Expo Router paths start with `/`
7. **Dynamic routes**: Use `[param]` in filename, not in route string
8. **Groups**: Use `(groupName)` for layout grouping without affecting URLs

---

**Need help?** Check the [Expo Router Documentation](https://docs.expo.dev/router/introduction/) or the [EXPO_ROUTER_MIGRATION.md](./EXPO_ROUTER_MIGRATION.md) guide.