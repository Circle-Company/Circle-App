/**
 * Utilitário para acesso aos comandos nativos da câmera
 */
import { UIManager } from "react-native"

// Constantes para os comandos nativos
export const getCommandId = (commandName: string): number => {
    try {
        const viewConfig = UIManager.getViewManagerConfig("CircleCameraView")
        if (viewConfig && viewConfig.Commands && viewConfig.Commands[commandName] !== undefined) {
            return viewConfig.Commands[commandName]
        }
        console.warn(`[Camera] Comando não encontrado: ${commandName}`)
        return -1
    } catch (error) {
        console.error(`[Camera] Erro ao acessar comando ${commandName}:`, error)
        return -1
    }
}

// Exportar os comandos da câmera
export const CAMERA_COMMANDS = {
    takePhoto: getCommandId("takePhoto"),
    switchCamera: getCommandId("switchCamera"),
    setFocusPoint: getCommandId("setFocusPoint"),
}

export default CAMERA_COMMANDS
