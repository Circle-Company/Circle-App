# Fixing react-native-notificated Reanimated v4 Compatibility

## Problem

The `react-native-notificated` package (v0.1.7) uses the deprecated `useAnimatedGestureHandler` API from React Native Reanimated v2. This API was removed in Reanimated v3+, causing the following error:

```
TypeError: useAnimatedGestureHandler is not a function (it is undefined)
```

## Solution

We need to patch the package to use the new Gesture API from `react-native-gesture-handler` v2+.

### Step 1: Manual Fix (Temporary - until restart)

Run the following script to temporarily patch the package:

```bash
#!/bin/bash
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
    if (nativeEvent.state !== 5) return event; // State.END = 5
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
```

### Step 2: Create Permanent Patch

To make this fix permanent across `npm install` runs, create a patch file:

1. First, make the changes above to the file in `node_modules/`
2. Run: `npx patch-package react-native-notificated`
3. This will create a file in `patches/react-native-notificated+0.1.7.patch`
4. The patch will be automatically applied when running `npm install` thanks to the `postinstall` script in `package.json`

### Alternative: Replace the Package

Consider replacing `react-native-notificated` with an alternative that supports Reanimated v4:

- **react-native-toast-message** - Popular, actively maintained
- **react-native-paper** (Snackbar) - Part of Material Design
- **expo-notifications** - If you only need simple toasts

## What Changed

### Before (Reanimated v2 API):
```javascript
const dragGestureHandler = useAnimatedGestureHandler({
  onStart: (_, ctx) => {
    ctx.x = x.value;
    ctx.y = y.value;
  },
  onActive: ({ translationX, translationY }, ctx) => {
    x.value = ctx.x + translationX * directions.x;
    y.value = ctx.y + translationY * directions.y;
  },
  onEnd: () => {
    x.value = withSpring(0, { mass: 0.2 });
    y.value = withSpring(0, { mass: 0.2 });
  }
});
```

### After (Reanimated v3+ / Gesture Handler v2 API):
```javascript
const ctxX = useSharedValue(0);
const ctxY = useSharedValue(0);

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
```

## Key Changes:

1. **Import change**: `State` → `Gesture` from `react-native-gesture-handler`
2. **Import removal**: No longer need `useAnimatedGestureHandler` from `react-native-reanimated`
3. **Context storage**: Use separate `useSharedValue` hooks for context instead of the `ctx` parameter
4. **API change**: `useAnimatedGestureHandler({...})` → `Gesture.Pan().onBegin(...).onUpdate(...).onEnd(...)`
5. **Worklet directive**: Add `'worklet'` directive in gesture callbacks
6. **State comparison**: Use numeric value `5` instead of `State.END`

## Testing

After applying the fix:

1. Clear Metro bundler cache: `npx expo start --clear`
2. Rebuild the app: `npx expo run:ios` or `npx expo run:android`
3. Test toast notifications by triggering them in your app

## References

- [React Native Reanimated v3 Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration)
- [React Native Gesture Handler v2 Documentation](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture)
- [react-native-notificated GitHub Issues](https://github.com/TheWidlarzGroup/react-native-notificated/issues)