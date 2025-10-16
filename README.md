<div align="center">

<img alt="Circle Banner" src="https://github.com/Circle-Company/.github/blob/8f4a401a696c9baae2c584cd53f7266094bcb259/profile/PRESENTATION-BANNER-V3.png" width="1080" height="920"/>

[![GitHub stars](https://img.shields.io/github/stars/Circle-Company/Circle-App?style=social)](https://github.com/Circle-Company/Circle-App/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Circle-Company/Circle-App?style=social)](https://github.com/Circle-Company/Circle-App/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Circle-Company/Circle-App)](https://github.com/Circle-Company/Circle-App/issues)

</div>

# 💜 Nossa Missão

O **Circle App** é uma rede social **open source** que busca devolver autenticidade às conexões digitais.
✨ Em vez de métricas vazias, valoriza histórias reais e a simplicidade de compartilhar momentos que realmente importam.

Com um design **inovador**, **intuitivo** e pensado do zero, o Circle redefine a experiência social: mais leve, mais fluida e centrada em interações genuínas.
Uma plataforma construída para expressar o que há de mais humano — de forma livre, criativa e transparente. 🌿


# ⚡️ Setup

### 📌 Requisitos

* **Básico:** Node.js v18+, npm ou yarn, Git, Expo CLI
* **Development Build:** EAS CLI, conta Expo, dispositivo físico ou emulador

```bash
npm install -g @expo/cli eas-cli
```

### 🍏 iOS

<details>
<summary><strong>Instalação (Xcode + CocoaPods)</strong></summary>

```bash
# Instalar dependências básicas
xcode-select --install
sudo gem install cocoapods
```

**Requisitos:** macOS • [Xcode (App Store)](https://apps.apple.com/br/app/xcode/id497799835) • iOS Simulator

</details>

### 🤖 Android

<details>
<summary><strong>Instalação (Android Studio + SDK)</strong></summary>

```bash
# Configurar variáveis (adicione ao ~/.bashrc ou ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Requisitos:** [Android Studio](https://developer.android.com/studio) • JDK 11+ • AVD configurado

</details>

# 📦 Instalação do Projeto

```bash
# Clone o repositório
git clone https://github.com/Circle-Company/Circle-App.git
cd Circle-App

# Instale as dependências
npm install

# iOS: instale os pods
npm run pod-install

# Configure o EAS
npx expo login
eas build:configure
```

# 🚀 Executando o App

### Development Build (recomendado)

> ⚠️ O modo Expo GO **não é suportado**

```bash
# Criar build de desenvolvimento
eas build --platform all --profile development

# Iniciar o servidor
npm start
# Pressione 's' para entrar no Development Build mode
```

### Comandos Rápidos

```bash
npm run android    # Android
npm run ios        # iOS
```

# 🧪 Testes & Debug

```bash
# Rodar testes
npm test

# Testes com coverage
npm run test:coverage

# Diagnóstico Expo
npx expo doctor

# Limpar cache
npx expo start --clear
```


# 🛠 Problemas Comuns

<details>
<summary><strong>Cache / Bundle quebrado</strong></summary>

```bash
# Limpar caches e reinstalar pacotes
npx expo start --clear
rm -rf node_modules && npm install
```

</details>

# 🤝 Contribuindo

Quer contribuir com o projeto? Siga o fluxo abaixo:

1. Faça um **fork** do repositório
2. **Clone** seu fork localmente
3. Crie uma branch:

   ```bash
   git checkout -b minha-feature
   ```
4. Faça suas alterações
5. Abra um **Pull Request**

### 🐛 Reportar Bugs

1. Verifique se já existe uma [issue semelhante](https://github.com/Circle-Company/Circle-App/issues)
2. Se não houver, crie uma nova issue descrevendo:

   * Problema encontrado
   * Passos para reproduzir
   * Screenshots (se possível)

---

<div align="center">

🇧🇷 **Feito com 💜 no Brasil**

</div>
