<div align="center">

<img alt="Circle Banner" src="https://github.com/Circle-Company/.github/blob/eb5113ac18899f6e96f6e6791ef2a1e43091affe/profile/Circle%20App%20Presentation%20Banner.png" width="920"/>

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)

![GitHub stars](https://img.shields.io/github/stars/Circle-Company/Circle-App?style=social)
![GitHub forks](https://img.shields.io/github/forks/Circle-Company/Circle-App?style=social)
![GitHub issues](https://img.shields.io/github/issues/Circle-Company/Circle-App)

</div>

<br>

# 📱 Circle App

O **Circle App** é uma rede social **open source** que revoluciona como compartilhamos momentos. Uma plataforma **autêntica** e **intuitiva** para acompanhar amigos e família de forma leve e prazerosa.

**✨ Diferenciais:** Interface moderna • Foco na autenticidade • Open source • Feito no Brasil 🇧🇷

### 🧠 Features Principais

-   📸 **Momentos** - Criar e editar com vídeo e texto
-   📂 **Memórias** - Organizar momentos em coleções temáticas
-   💬 **Social** - Curtidas, comentários e interações
-   📱 **Perfil** - Galeria personalizada de memórias
-   🔔 **Notificações** - Push notifications em tempo real
-   🌍 **Multilíngue** - Português e Inglês

### Tecnologias

**Interface:** React Native, TypeScript, React Navigation, Moti  
**Estado:** Zustand, TanStack Query, AsyncStorage  
**Backend:** Firebase, Authentication, Push Notifications  
**Testes:** Vitest, Testing Library  
**Build:** EAS, Xcode, Android Studio

<br>

# 🚀 Configuração do Ambiente

### Requisitos

**Básico:** Node.js v18+ • npm/yarn • Git • Expo CLI  
**Development Build:** EAS CLI • Conta Expo • Dispositivo/Emulador

```bash
npm install -g @expo/cli eas-cli
```

### Configuração por Plataforma

<details>
<summary><strong>🍎 iOS: Xcode + CocoaPods</strong></summary>

```bash
# Instalar dependências
xcode-select --install
sudo gem install cocoapods
```

**Requisitos:** macOS • Xcode (App Store) • iOS Simulator

</details>

<details>
<summary><strong>🤖 Android: Android Studio + SDK</strong></summary>

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

# 📱 Executando

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
<summary><strong>🐛 Cache/Bundle issues</strong></summary>

```bash
# Limpar caches e reinstalar
npx expo start --clear
rm -rf node_modules && npm install
```

</details>

<br>

# Contribuindo

Procuramos **desenvolvedores**, **designers** e **idealistas**! 💜

### Como Contribuir

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch: `git checkout -b minha-feature`
4. **Faça** suas alterações
5. **Abra** um Pull Request

### Reportando Bugs

1. Verifique se já existe uma [issue similar](https://github.com/Circle-Company/Circle-App/issues)
2. Crie uma nova issue com: descrição clara, passos para reproduzir, screenshots

<br>

# Licença

**CIRCLE LICENCE** - Veja [LICENSE](LICENSE) para detalhes.

<div align="center">

### 🇧🇷 **Feito com ❤️ no Brasil**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Circle-Company/Circle-App)
[![Issues](https://img.shields.io/badge/Issues-FF6B6B?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Circle-Company/Circle-App/issues)
[![Pull Requests](https://img.shields.io/badge/Pull_Requests-4ECDC4?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Circle-Company/Circle-App/pulls)

**[⭐ Dê uma estrela se este projeto te ajudou!](https://github.com/Circle-Company/Circle-App)**

</div>
