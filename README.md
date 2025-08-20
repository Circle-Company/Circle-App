<h1 align="center">Circle App - Crie momentos e Compartilhe Memórias</h1>

<div align="center">
  <a href="https://github.com/Circle-Company/Circle-App" target="_blank">
    <img alt="Circle Banner" src="https://github.com/Circle-Company/.github/blob/eb5113ac18899f6e96f6e6791ef2a1e43091affe/profile/Circle%20App%20Presentation%20Banner.png" width="730"/>
  </a>
</div>

<div align="center">
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white">
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white">
</div>

---

## 📱 Sobre o Circle App

O **Circle App** é uma rede social inovadora e open source que busca revolucionar a forma como compartilhamos nossos momentos. Nossa missão é criar uma plataforma **autêntica**, **intuitiva** e **divertida** para acompanhar os amigos, onde compartilhar o dia a dia seja uma atividade leve e prazerosa.

## 🧠 Funcionalidades

-   📸 **Criar e editar momentos** com vídeo e texto
-   📂 **Organizar momentos** em memórias personalizadas
-   💬 **Interações sociais** como curtidas e comentários
-   📱 **Perfil público** com galeria de memórias
-   🔔 **Notificações em tempo real** via Firebase
-   🌍 **Suporte multilíngue** (Português, Inglês)
-   📊 **Estatísticas pessoais** de engajamento
-   🔍 **Sistema de busca** avançada com base em interações

---

## 🛠️ Tecnologias Utilizadas

-   **Interface**: React Native + TypeScript
-   **Navegação**: React Navigation
-   **Estados/Armazenamento**: Zustand + TanStack Query
-   **Animações**: Expo + Moti (animações)
-   **Notificações**: Firebase (notificações, autenticação)
-   **Testes**: Vitest + Testing Library
-   **Build para Produção**: Expo Application Services (EAS)

---

## 🚀 Configuração do Ambiente

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

-   **Node.js** (versão 18 ou superior)
-   **npm** ou **yarn**
-   **Expo CLI**: `npm install -g @expo/cli`
-   **Git**

Para desenvolvimento iOS (apenas macOS):

-   **Xcode** (versão mais recente)
-   **CocoaPods**: `sudo gem install cocoapods`

Para desenvolvimento Android:

-   **Android Studio** com SDK configurado
-   **Java Development Kit (JDK)**

### 📥 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Circle-Company/Circle-App.git
cd Circle-App
```

2. **Instale as dependências**

```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

3. **Configure as dependências nativas (iOS)**

```bash
npm run pod-install
# ou
yarn pod-install
```

---

## 🎯 Executando o Projeto

### Modo Desenvolvimento

```bash
# Inicia o servidor de desenvolvimento
npm start
# ou
yarn start
```

Após executar, você verá um QR code no terminal. Use o app **Expo Go** no seu dispositivo móvel para escanear e executar o app.

### Executar em Dispositivos Específicos

```bash
# Android (dispositivo ou emulador)
npm run android
# ou
yarn android

# iOS (simulador - apenas macOS)
npm run ios
# ou
yarn ios

# Web (navegador)
npm run web
# ou
yarn web
```

### 🧪 Executando Testes

```bash
# Executar todos os testes
npm test
# ou
yarn test

# Executar testes com interface visual
npm run test:ui
# ou
yarn test:ui

# Executar testes com coverage
npm run test:coverage
# ou
yarn test:coverage
```


## 📁 Estrutura do Projeto
```
Circle-App/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── contexts/         # Context APIs (Auth, Persisted, etc.)
│   ├── features/         # Features específicas do app
│   ├── navigation/       # Configuração de navegação
│   ├── pages/           # Telas/páginas do aplicativo
│   ├── services/        # APIs e serviços externos
│   ├── constants/       # Constantes (cores, fontes, etc.)
│   └── types/           # Definições TypeScript
├── assets/              # Imagens, fontes e recursos
├── android/            # Código nativo Android
├── ios/               # Código nativo iOS
└── __tests__/         # Testes automatizados
```

## 🤝 Contribuindo

Estamos sempre procurando novos colaboradores! Se você é desenvolvedor mobile, backend, designer ou simplesmente tem boas ideias, será muito bem-vindo! 💜

<div align="center">
  <a href="https://github.com/Circle-Company/Circle-App" target="_blank">
    <img alt="Procurando Contribuidores" src="https://github.com/tiagosavioli/tiagosavioli/blob/bf6bb095107d902c2fba9d4e65ac989c7389768b/Procurando%20por%20Contribu%C3%ADdores.png" width="730"/>
  </a>
</div>

1. **Fork** o projeto
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/Circle-App.git`
3. **Crie uma branch**: `git checkout -b minha-feature`
4. **Faça suas alterações** e commit: `git commit -m 'feat: adiciona nova feature'`
5. **Push** para a branch: `git push origin minha-feature`
6. **Abra um Pull Request** com uma descrição clara das mudanças

## 🐛 Reportando Bugs

Encontrou um bug? Nos ajude a melhorar o app:

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/Circle-Company/Circle-App/issues)
2. Se não, abra uma nova issue com:
    - Descrição clara do problema
    - Passos para reproduzir
    - Screenshots (se aplicável)
    - Informações do dispositivo/sistema

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

<div align="center">
  <strong>Feito com ❤️ no Brasil</strong>
</div>
