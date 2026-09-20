import { Ionicons } from '@expo/vector-icons';
import { colors, icons, type IconName } from '@comodities/ui';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

export function Icon({ name, size = 22, color = colors.ink, accessibilityLabel }: IconProps) {
  return (
    <Ionicons
      accessibilityElementsHidden={!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      color={color}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
      name={icons[name] as IoniconName}
      size={size}
    />
  );
}
