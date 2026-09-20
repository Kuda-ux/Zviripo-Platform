import { motion } from '@comodities/ui';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable as RNPressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.().then((value) => {
  reduceMotion = value;
});

export function useReduceMotion() {
  const [value, setValue] = useState(reduceMotion);
  useEffect(() => {
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (next) => {
      reduceMotion = next;
      setValue(next);
    });
    return () => sub.remove();
  }, []);
  return value;
}

export interface PressProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale-down press feedback. Defaults on; disabled automatically with reduced motion. */
  feedback?: boolean;
}

/** Pressable with the Zviripo micro press response (scale 0.97, 120ms). */
export function Press({ style, feedback = true, children, ...rest }: PressProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduce = useReduceMotion();
  const animate = (to: number) =>
    Animated.timing(scale, { toValue: to, duration: motion.micro, useNativeDriver: true }).start();
  const active = feedback && !reduce;

  return (
    <RNPressable
      {...rest}
      onPressIn={(e) => {
        if (active) animate(motion.pressScale);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (active) animate(1);
        rest.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, active ? { transform: [{ scale }] } : null]}>
        {children as React.ReactNode}
      </Animated.View>
    </RNPressable>
  );
}
