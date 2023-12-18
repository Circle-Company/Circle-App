import * as React from 'react';
import { Text as DefaultText, View as DefaultView, TouchableOpacity, useColorScheme } from 'react-native';

import ColorTheme from '../layout/constants/colors'

export function Text(props:any) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  return <DefaultText style={[{ color: ColorTheme().text}, style]} {...otherProps} />;
}
export function View(props:any) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  return <DefaultView style={[{ backgroundColor: ColorTheme().background }, style]} {...otherProps} />;
}