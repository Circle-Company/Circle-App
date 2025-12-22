#!/bin/bash

# Script to fix react-native-notificated compatibility with Reanimated v4
# This replaces the deprecated useAnimatedGestureHandler with the new Gesture API

set -e

echo "🔧 Fixing react-native-notificated Reanimated v4 compatibility..."

# Define the target file
TARGET_FILE="node_modules/react-native-notificated/lib/module/core/hooks/useDrag.js"

# Check if the file exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: $TARGET_FILE not found"
    echo "   Make sure you've run 'npm install' first"
    exit 1
fi

# Create backup
cp "$TARGET_FILE" "${TARGET_FILE}.backup"
echo "📦 Backup created: ${TARGET_FILE}.backup"

# Write the fixed version
cat > "$TARGET_FILE" << 'EOF'
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
    x.value = withSpring(0, {
      mass: 0.2
    });
    y.value = withSpring(0, {
      mass: 0.2
    });
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
      x.value = withSpring(0, {
        mass: 0.2
      });
      y.value = withSpring(0, {
        mass: 0.2
      });
    });

  const dragStateHandler = useCallback((onDragSuccess, onDragFail) => event => {
    const {
      nativeEvent
    } = event;
    if (nativeEvent.state !== 5) return event; // State.END = 5
    const dragTriggered = shouldTriggerGesture(config, {
      distance: [nativeEvent.translationX, nativeEvent.translationY],
      velocity: [nativeEvent.velocityX, nativeEvent.velocityY]
    });
    if (dragTriggered) onDragSuccess();else onDragFail();
    return event;
  }, [config]);

  const dragStyles = useAnimatedStyle(() => ({
    transform: [{
      translateX: x.value
    }, {
      translateY: y.value
    }]
  }));

  return {
    dragGestureHandler,
    dragStateHandler,
    dragStyles,
    resetDrag
  };
};

const getDragDirections = direction => {
  switch (direction) {
    case 'full':
      return {
        x: 1,
        y: 1
      };

    case 'x':
      return {
        x: 1,
        y: 0
      };

    case 'y':
      return {
        x: 0,
        y: 1
      };

    case 'none':
      return {
        x: 0,
        y: 0
      };
    // What should be correct default value? => Platform specific?

    default:
      return {
        x: 0,
        y: 0
      };
  }
};
//# sourceMappingURL=useDrag.js.map
EOF

echo "✅ File patched successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Clear Metro bundler cache: npx expo start --clear"
echo "   2. Rebuild the app if needed"
echo ""
echo "💡 To make this fix permanent, run: npx patch-package react-native-notificated"
echo "   This will create a patch file in the patches/ directory"
echo ""
echo "📖 For more details, see: docs/REANIMATED_V4_FIX.md"
