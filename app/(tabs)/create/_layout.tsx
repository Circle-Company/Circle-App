import { Stack } from 'expo-router';
import React from 'react';
import ColorTheme from '@/constants/colors';
import fonts from '@/constants/fonts';
import sizes from '@/constants/sizes';
import LanguageContext from '@/contexts/Preferences/language';
import HeaderLeft from '@/components/headers/camera/camera-header_left';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { CameraProvider } from '@/modules/camera/context';

export default function CameraLayout() {
    const { t } = React.useContext(LanguageContext);

    const HeaderStyle = {
        ...sizes.headers,
        backgroundColor: ColorTheme().background,
    };

    return (
        <CameraProvider>
            <GestureHandlerRootView style={styles.root}>
                <Stack
                    screenOptions={{
                        statusBarStyle: 'dark',
                        animationTypeForReplace: 'push',
                        headerTitleAlign: 'center',
                        headerTitleStyle: { fontFamily: fonts.family['Bold-Italic'] },
                        headerStyle: HeaderStyle,
                        headerTintColor: String(ColorTheme().text),
                        headerLeft: () => <HeaderLeft />,
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            headerTitle: 'Camera',
                        }}
                    />
                    <Stack.Screen
                        name="permissions"
                        options={{
                            headerTitle: 'Permissions',
                        }}
                    />
                    <Stack.Screen
                        name="media"
                        options={{
                            animation: 'none',
                            headerTitle: t('All Ready'),
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </CameraProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});
