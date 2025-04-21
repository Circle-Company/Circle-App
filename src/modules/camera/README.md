# Módulo de Câmera do Circle

Este módulo fornece funcionalidades avançadas de câmera para o aplicativo Circle, oferecendo suporte a captura de fotos, gravação de vídeos e uma interface nativa de alta performance.

## Estrutura do Módulo

O módulo de câmera segue uma arquitetura em camadas:

```
src/modules/camera/
├── components/          # Componentes React
│   ├── Camera.tsx       # Componente principal da câmera
│   ├── SimpleCameraView.tsx  # Versão simplificada do componente de câmera
│   └── ui/              # Componentes de UI para a câmera
│       ├── CameraActionButtons.tsx  # Botões de ação (tirar foto, gravar)
│       └── CameraControls.tsx       # Controles (flash, trocar câmera)
├── core/                # Lógica central e contexto
│   ├── CameraContext.tsx  # Contexto global de câmera
│   └── NativeInterface.ts # Interface com módulos nativos
├── native/              # Wrappers para componentes nativos
│   └── NativeCameraView.tsx  # Wrapper para a view nativa de câmera
├── screens/             # Telas completas
│   └── CameraScreen.tsx  # Tela da câmera pronta para uso
├── types/               # Definições de tipos
│   └── camera.types.ts  # Interfaces e tipos do módulo
└── index.ts             # Exportações públicas do módulo
```

## Parte Nativa (Android)

No lado Android, a implementação utiliza a API Camera (legacy) com melhorias para manter a proporção correta e otimizações de performance:

```
android/app/src/main/java/com/circle/camera/
├── CircleCameraModule.java       # Módulo nativo com métodos JavaScript
├── CircleCameraPackage.java      # Package para registrar o módulo no React Native
├── CircleCameraView.java         # View nativa que exibe o preview da câmera
└── CircleCameraViewManager.java  # Gerenciador da view para React Native
```

## Funcionalidades Principais

-   **Captura de fotos** em alta qualidade
-   **Gravação de vídeos** com controle de duração
-   **Troca entre câmera frontal e traseira**
-   **Controle de flash** (on/off/auto/torch)
-   **Zoom e foco** com suporte a toque na tela
-   **Manutenção da proporção correta** da imagem da câmera
-   **Detecção de códigos de barras** (opcional)
-   **Detecção facial** (opcional)

## Como Usar

### Componente Simplificado

Para usar a versão simplificada da câmera:

```tsx
import React, { useRef } from "react"
import { View, Button } from "react-native"
import { SimpleCameraView, SimpleCameraViewRef } from "../modules/camera"

const MyCameraScreen = () => {
    const cameraRef = useRef<SimpleCameraViewRef>(null)

    const handleTakePhoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePhoto()
            console.log("Foto tirada:", photo.path)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <SimpleCameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                cameraType="back"
                flashMode="off"
                onCameraReady={() => console.log("Câmera pronta")}
                onError={(error) => console.error("Erro na câmera:", error)}
            />
            <Button title="Tirar Foto" onPress={handleTakePhoto} />
        </View>
    )
}
```

### Tela de Câmera Completa

Para usar a tela de câmera completa com todos os controles:

```tsx
import React from "react"
import { CameraScreen } from "../modules/camera"

const MyCameraPage = () => {
    return <CameraScreen />
}
```

### Contexto de Câmera

Para acessar a câmera de qualquer lugar do aplicativo:

```tsx
import React from "react"
import { useCamera } from "../modules/camera"

const MyCameraController = () => {
    const camera = useCamera()

    const handleTakePhoto = async () => {
        try {
            const photo = await camera.takePhoto()
            console.log("Foto tirada:", photo.path)
        } catch (error) {
            console.error("Erro ao tirar foto:", error)
        }
    }

    return <Button title="Tirar Foto" onPress={handleTakePhoto} />
}
```

## Manutenção da Proporção

Um dos principais recursos deste módulo é a manutenção correta da proporção da imagem da câmera. Por padrão, a proporção é mantida para evitar distorção, mas este comportamento pode ser alterado:

```tsx
<SimpleCameraView
    maintainAspectRatio={true} // true = mantém proporção, false = preenche a tela (pode distorcer)
    // ...outras props
/>
```

## Customização

Todos os componentes podem ser personalizados por meio de props:

-   **style**: Estilo personalizado para os componentes
-   **PermissionDeniedComponent**: Componente personalizado para quando a permissão for negada
-   **ErrorComponent**: Componente personalizado para exibir erros

## Solução de Problemas

### Imagem Esticada/Distorcida

Se a imagem da câmera aparecer esticada ou distorcida, certifique-se de que:

1. A prop `maintainAspectRatio` está definida como `true`
2. O componente de câmera tem espaço suficiente na tela para manter a proporção correta

### Performance

Para melhor performance, especialmente em dispositivos de entrada:

1. Use `SimpleCameraView` quando não precisar de todos os recursos
2. Desative a detecção facial e de códigos de barras quando não forem necessárias
3. Libere os recursos da câmera quando não estiver em uso (especialmente ao sair da tela)

## Arquitetura e Design do Código

O módulo foi projetado seguindo os princípios:

1. **Separação de Responsabilidades**: Cada componente tem uma função específica
2. **Interfaces Claras**: Todas as interfaces são bem definidas e tipadas
3. **Fallbacks**: Implementações de fallback para quando os recursos nativos não estão disponíveis
4. **Personalização**: Componentes altamente personalizáveis via props
5. **Performance**: Otimizações nativas para uso eficiente dos recursos do dispositivo
