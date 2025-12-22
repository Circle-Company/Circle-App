import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import ColorTheme from '@/constants/colors';
import Fonts from '@/constants/fonts';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops! Not Found" }} />
            <View style={styles.container}>
                <Text style={styles.title}>404</Text>
                <Text style={styles.subtitle}>This screen doesn't exist.</Text>
                <Link href="/(tabs)/moments" style={styles.link}>
                    <Text style={styles.linkText}>Go to home screen!</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: ColorTheme().background,
    },
    title: {
        fontSize: 72,
        fontFamily: Fonts.family['Black-Italic'],
        color: ColorTheme().text,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 20,
        fontFamily: Fonts.family['SemiBold'],
        color: ColorTheme().text,
        marginBottom: 32,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: ColorTheme().primary,
        borderRadius: 12,
    },
    linkText: {
        fontSize: 16,
        fontFamily: Fonts.family['Bold'],
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
