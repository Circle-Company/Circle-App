import { useEffect } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";
import { interpolate, useSharedValue, withTiming, SharedValue } from "react-native-reanimated";

type InterpolatableSharedValue = SharedValue<number> & {
  interpolate: (inputRange: [number, number], outputRange: [number, number]) => number;
};

function makeInterpolatable(value: SharedValue<number>): InterpolatableSharedValue {
  "worklet";
  return Object.assign(value, {
    interpolate(inputRange: [number, number], outputRange: [number, number]) {
      "worklet";
      return interpolate(value.value, inputRange, outputRange);
    },
  });
}

export type UseKeyboardReturn = {
  height: InterpolatableSharedValue;
  visible: SharedValue<boolean>;
  progress: InterpolatableSharedValue;
  keyboardIsVisible: SharedValue<boolean>;
};

export function useKeyboard(): UseKeyboardReturn {
  const height = makeInterpolatable(useSharedValue(0));
  const visible = useSharedValue(false);
  const rawProgress = makeInterpolatable(useSharedValue(0));
  const keyboardIsVisible = useSharedValue(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      height.value = withTiming(e.endCoordinates.height, { duration: 250 });
      visible.value = true;
      rawProgress.value = withTiming(1, { duration: 250 });
      keyboardIsVisible.value = true;
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      height.value = withTiming(0, { duration: 250 });
      visible.value = false;
      rawProgress.value = withTiming(0, { duration: 250 });
      keyboardIsVisible.value = false;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return {
    height,
    visible,
    progress: rawProgress,
    keyboardIsVisible,
  };
}
