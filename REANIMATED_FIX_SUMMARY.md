# Reanimated v4 Migration - Summary & Fixes

## ✅ What Was Fixed

### 1. Camera Module - CaptureButton.tsx
**Status:** ✅ **FIXED**

**Changes:**
- Removed `useAnimatedGestureHandler` import
- Replaced `PanGestureHandler` with `Gesture.Pan()` API
- Migrated to Reanimated v3+ gesture handling
- Used `useSharedValue` for gesture context storage

**Files Modified:**
- `src/modules/camera/components/CaptureButton.tsx`

### 2. Camera Module - camera.tsx
**Status:** ✅ **FIXED**

**Changes:**
- Removed `useAnimatedGestureHandler` import
- Replaced `PinchGestureHandler` with `Gesture.Pinch()` API
- Used `useSharedValue` for storing start zoom value
- Updated to use `GestureDetector` component

**Files Modified:**
- `src/modules/camera/pages/camera.tsx`

---

## ⚠️ Remaining Issue: react-native-notificated

### The Problem
The `react-native-notificated` package (v0.1.7) still uses the deprecated `useAnimatedGestureHandler` API internally. This causes the error:

```
TypeError: useAnimatedGestureHandler is not a function (it is undefined)
```

### Why This Happens
- `react-native-notificated` v0.1.7 is the latest version
- It hasn't been updated to support Reanimated v3+
- The package's internal `useDrag.js` hook uses the old API

---

## 🔧 Solutions (Choose One)

### Option 1: Apply Manual Patch (RECOMMENDED)

Run this command to fix the package:

```bash
# Fix the module file
cat > node_modules/react-native-notificated/lib/module/core/hooks/useDrag.js << 'EOF'
import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { shouldTriggerGesture } from '../gestures/shouldTriggerGesture';

export const useDrag = config => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const ctxX = useSharedValue(0);
  const ctxY = useSharedValue(0);
  const directions = getDragDirections(config.direction);
  
  const resetDrag = useCallback(() => {
    x.value = withSpring(0, { mass: 0.2 });
    y.value = withSpring(0, { mass: 0.2 });
  }, [x, y]);
  
  const dragGestureHandler = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      ctxX.value = x.value;
      ctxY.value = y.value;
    })
    .onUpdate((event) => {
      'worklet';
      x.value = ctxX.value + event.translationX * directions.x;
      y.value = ctxY.value + event.translationY * directions.y;
    })
    .onEnd(() => {
      'worklet';
      x.value = withSpring(0, { mass: 0.2 });
      y.value = withSpring(0, { mass: 0.2 });
    });
  
  const dragStateHandler = useCallback((onDragSuccess, onDragFail) => event => {
    const { nativeEvent } = event;
    if (nativeEvent.state !== 5) return event;
    const dragTriggered = shouldTriggerGesture(config, {
      distance: [nativeEvent.translationX, nativeEvent.translationY],
      velocity: [nativeEvent.velocityX, nativeEvent.velocityY]
    });
    if (dragTriggered) onDragSuccess(); else onDragFail();
    return event;
  }, [config]);
  
  const dragStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }]
  }));
  
  return { dragGestureHandler, dragStateHandler, dragStyles, resetDrag };
};

const getDragDirections = direction => {
  switch (direction) {
    case 'full': return { x: 1, y: 1 };
    case 'x': return { x: 1, y: 0 };
    case 'y': return { x: 0, y: 1 };
    case 'none': return { x: 0, y: 0 };
    default: return { x: 0, y: 0 };
  }
};
EOF

# Create permanent patch
npx patch-package react-native-notificated
```

After running this:
1. Clear Metro cache: `npx expo start --clear`
2. Rebuild: `npx expo run:ios` or `npx expo run:android`

The patch will be saved in `patches/react-native-notificated+0.1.7.patch` and automatically applied after `npm install`.

---

### Option 2: Replace the Package

Consider using an alternative toast/notification library:

#### A. react-native-toast-message
```bash
npm uninstall react-native-notificated
npm install react-native-toast-message
```

**Pros:**
- Actively maintained
- 3k+ stars on GitHub
- Supports Reanimated v3+
- Great customization

**Migration effort:** Medium - Need to update all `notify()` calls

#### B. React Native Paper (Snackbar)
```bash
npm install react-native-paper
```

**Pros:**
- Part of Material Design ecosystem
- Well maintained
- Native-like animations

**Migration effort:** Medium-High

#### C. Build Your Own
Create a simple toast using Reanimated v4 directly:

```bash
# No new dependencies needed
# Uses existing: react-native-reanimated, react-native-gesture-handler
```

**Pros:**
- Full control
- No third-party dependencies
- Lightweight

**Migration effort:** High - Need to build from scratch

---

## 📋 Migration Checklist

- [x] Fix `CaptureButton.tsx` - Pan gesture
- [x] Fix `camera.tsx` - Pinch gesture  
- [ ] Fix `react-native-notificated` - Choose an option above
- [ ] Test all toast notifications
- [ ] Test camera zoom and capture gestures
- [ ] Clear Metro cache
- [ ] Rebuild native apps

---

## 🧪 Testing

After applying all fixes:

```bash
# 1. Clear all caches
npx expo start --clear
rm -rf ios/build android/build

# 2. Rebuild
npx expo run:ios --device
# or
npx expo run:android --device

# 3. Test these features:
```

**Test Cases:**
- [ ] Camera: Pan gesture for zoom (swipe up/down on capture button)
- [ ] Camera: Pinch to zoom
- [ ] Toast notifications appear correctly
- [ ] Toast notifications can be dismissed by swiping
- [ ] No console errors about `useAnimatedGestureHandler`

---

## 📚 Key Changes Made

### Before (Reanimated v2):
```javascript
const handler = useAnimatedGestureHandler({
  onStart: (_, ctx) => { ctx.value = x.value; },
  onActive: (event, ctx) => { x.value = ctx.value + event.translation; },
  onEnd: () => { x.value = withSpring(0); }
});
```

### After (Reanimated v3+):
```javascript
const ctx = useSharedValue(0);
const handler = Gesture.Pan()
  .onBegin(() => { 'worklet'; ctx.value = x.value; })
  .onUpdate((e) => { 'worklet'; x.value = ctx.value + e.translation; })
  .onEnd(() => { 'worklet'; x.value = withSpring(0); });
```

**Key Differences:**
1. Import `Gesture` from `react-native-gesture-handler` (not `PanGestureHandler`)
2. Use `useSharedValue()` for context instead of `ctx` parameter
3. Add `'worklet'` directive in gesture callbacks
4. Chain methods: `.onBegin().onUpdate().onEnd()`
5. Use `GestureDetector` component instead of `PanGestureHandler`

---

## 🔗 Resources

- [Reanimated v3 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration)
- [Gesture Handler v2 Docs](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture)
- [react-native-notificated Issues](https://github.com/TheWidlarzGroup/react-native-notificated/issues)
- Local documentation: `docs/REANIMATED_V4_FIX.md`

---

## 🆘 Still Having Issues?

If you encounter errors after applying these fixes:

1. **Clear everything:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

2. **Check imports:**
   - Ensure no files import `useAnimatedGestureHandler`
   - Ensure `Gesture` is imported from `react-native-gesture-handler`

3. **Verify versions:**
   ```bash
   npm list react-native-reanimated
   npm list react-native-gesture-handler
   ```

4. **Search for remaining issues:**
   ```bash
   grep -r "useAnimatedGestureHandler" src/
   ```

---

**Last Updated:** January 2025
**Reanimated Version:** 4.1.1
**Gesture Handler Version:** 2.28.0