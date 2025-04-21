/**
 * Componente para exibir erros da câmera
 *
 * Fornece uma interface amigável para exibir mensagens de erro
 */
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

export interface ErrorScreenProps {
    errorMessage?: string
    onGoBack: () => void
}

/**
 * Tela de erro para quando há problemas com a câmera
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorMessage, onGoBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.errorContainer}>
                <Icon name="camera-off" size={50} color="#FF3B30" />
                <Text style={styles.title}>Erro na câmera</Text>

                {errorMessage && (
                    <View style={styles.errorMessageContainer}>
                        <View style={styles.errorTextContainer}>
                            <Icon
                                name="alert-circle"
                                size={20}
                                color="#FF3B30"
                                style={styles.errorIcon}
                            />
                            <View>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        </View>
                    </View>
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={onGoBack}>
                        <Text style={styles.buttonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        backgroundColor: "#1A1A1A",
        borderRadius: 12,
        padding: 24,
        width: "85%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 16,
        marginBottom: 8,
    },
    buttonContainer: {
        marginTop: 24,
        width: "100%",
    },
    button: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#FF3B30",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    errorMessageContainer: {
        marginTop: 20,
        marginHorizontal: 8,
        padding: 15,
        backgroundColor: "rgba(255,59,48,0.1)",
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#FF3B30",
        width: "100%",
    },
    errorTextContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    errorIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    errorText: {
        fontSize: 14,
        color: "#AAA",
        lineHeight: 20,
    },
})

export default ErrorScreen
