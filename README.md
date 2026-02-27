<div align="center">

<img alt="Circle Banner" src="https://github.com/Circle-Company/.github/blob/bec79f345b45f6a987ed557a1c7b67871eaeb426/profile/PRESENTATION-BANNER-V3.png" width="920"/>

</div>

### Configuração do Ambiente

### Requisitos

**Básico:** Node.js v18+ • npm/yarn • Git • Expo CLI  
**Development Build:** EAS CLI • Conta Expo • Dispositivo/Emulador

```bash
npm install -g @expo/cli eas-cli
```

### Configuração por Plataforma

<details>
<summary><strong>iOS: Xcode + CocoaPods</strong></summary>

```bash
# Instalar dependências
xcode-select --install
sudo gem install cocoapods
```

**Requisitos:** macOS • Xcode (App Store) • iOS Simulator

</details>

<details>
<summary><strong>Android: Android Studio + SDK</strong></summary>

```bash
# Configurar variáveis (adicionar ao ~/.bashrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Requisitos:** [Android Studio](https://developer.android.com/studio) • JDK 11+ • AVD configurado

</details>

### Instalação

```bash
# Clone e instale
git clone https://github.com/Circle-Company/Circle-App.git
cd Circle-App
npm install

# iOS: Configure pods
npm run pod-install

# Configure EAS
npx expo login
eas build:configure
```
<br>

### Executando

### Rodando Expo com **Development Build** (Não suporta o modo Expo GO)

```bash
# Criar build de desenvolvimento
eas build --platform all --profile development

# Executar
npm start
# Pressione 's' para Development Build mode
```
### Comandos por Plataforma

```bash
npm run android    # Android
npm run ios        # iOS
```

### Executando Testes

```bash
# Testes
npm test                    # Executar testes
npm run test:coverage       # Com coverage

# Debug
npx expo doctor             # Verificar problemas
npx expo start --clear      # Limpar cache
```

### Problemas Comuns

<details>
<summary><strong>Cache/Bundle issues</strong></summary>

```bash
# Limpar caches e reinstalar
npx expo start --clear
rm -rf node_modules && npm install
```

</details>

<br>

### Licença

**CIRCLE LICENCE** - Veja [LICENSE](LICENSE) para detalhes.
