import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, DynamicColorIOS } from 'react-native';
import ColorTheme, { colors } from '@/constants/colors';
import Fonts from '@/constants/fonts';

export default function TabsLayout() {
    const tintColor = Platform.select({
        ios: DynamicColorIOS({
            dark: 'white',
            light: ColorTheme().primary,
        }),
        android: ColorTheme().primary,
    });

    const labelColor = Platform.select({
        ios: DynamicColorIOS({
            dark: 'white',
            light: 'black',
        }),
        android: ColorTheme().text,
    });

    return (
        <NativeTabs
            tintColor={tintColor}
            labelStyle={{
                color: labelColor,
                fontFamily: Fonts.family['Bold-Italic'],
                fontSize: Fonts.size.body * 0.9,
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

            <NativeTabs.Trigger name="create">
                <Label hidden />
                <Icon
                    sf={{ default: 'camera', selected: 'camera.fill' }}
                    src={require('@/assets/icons/pngs/camera.png')}
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="you">
                <Label hidden />
                <Icon
                    sf={{ default: 'person', selected: 'person.fill' }}
                    src={require('@/assets/icons/pngs/at.png')}
                />
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
