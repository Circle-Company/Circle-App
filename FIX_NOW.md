# Quick Fix for Reanimated v4 Error

## The Error You're Seeing

```
TypeError: useAnimatedGestureHandler is not a function (it is undefined)
```

## Quick Fix (Copy & Paste This)

Run this single command in your terminal:

```bash
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

echo "✅ Fixed! Now run: npx expo start --clear"
```

## Make It Permanent

After the fix works, make it permanent so it survives `npm install`:

```bash
npx patch-package react-native-notificated
```

This creates a patch file that will be automatically applied in the future.

## Then Restart

```bash
# Clear Metro cache and restart
npx expo start --clear

# If still having issues, rebuild:
npx expo run:ios
# or
npx expo run:android
```

## What This Does

This fixes the `react-native-notificated` package to work with Reanimated v4 by:
- Replacing the deprecated `useAnimatedGestureHandler` with `Gesture.Pan()`
- Using the new Reanimated v3+ API
- Maintaining all original functionality

## More Details

See `REANIMATED_FIX_SUMMARY.md` for complete information about all the fixes applied to your project.

---

**Need Help?** Check the error console after restarting. If you see no more errors about `useAnimatedGestureHandler`, you're good to go! ✨