import { Stack } from 'expo-router';
import React from 'react';
import ColorTheme, { colors } from '@/constants/colors';
import Sizes from '@/constants/sizes';
import LanguageContext from '@/contexts/Preferences/language';
import MomentFullHeaderLeft from '@/components/headers/moment/moment_full-header_left';
import MemoryHeaderLeft from '@/components/headers/memory/memory-header_left';
import NewMomentImageRight from '@/components/headers/moment/new_moment_image-header_right';
import NewMomentInputDescriptionRight from '@/components/headers/moment/new_moment_input_description-header_right';

export default function MomentLayout() {
    const { t } = React.useContext(LanguageContext);

    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    };

    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: String(ColorTheme().background),
                },
            }}
        >
            <Stack.Screen
                name="[id]"
                options={{
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { display: 'none' },
                    headerTransparent: true,
                    headerLeft: () => <MomentFullHeaderLeft />,
                    contentStyle: {
                        backgroundColor: colors.gray.black.toString(),
                        overflow: 'hidden',
                    },
                }}
            />
            <Stack.Screen
                name="new-gallery"
                options={{
                    headerTitle: t('New Moment'),
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentImageRight />,
                }}
            />
            <Stack.Screen
                name="new-image"
                options={{
                    headerTitle: t('New Moment'),
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentImageRight />,
                }}
            />
            <Stack.Screen
                name="new-camera"
                options={{
                    headerShown: false,
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    headerLeft: () => <MemoryHeaderLeft />,
                }}
            />
            <Stack.Screen
                name="new-description"
                options={{
                    headerTitle: t('New Moment'),
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    headerLeft: () => <MemoryHeaderLeft />,
                    headerRight: () => <NewMomentInputDescriptionRight />,
                }}
            />
        </Stack>
    );
}
