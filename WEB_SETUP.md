# 🌐 Circle App - Web Setup

Este guia explica como configurar e executar o Circle App no navegador web.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🛠️ Dependências Web Necessárias

Instale as dependências específicas para web:

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader
npm install react-native-web react-native-web-linear-gradient react-native-svg-web
npm install @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
npm install @babel/plugin-proposal-class-properties @babel/plugin-syntax-dynamic-import
npm install @babel/plugin-transform-react-jsx babel-plugin-module-resolver
npm install style-loader css-loader process buffer
```

## 🚀 Comandos de Execução

### Desenvolvimento
```bash
npm run web:dev
```
- Inicia o servidor de desenvolvimento
- Hot reload habilitado
- Abre automaticamente em http://localhost:3000

### Build de Produção
```bash
npm run web:build
```
- Cria build otimizado na pasta `dist/`
- Minificação e otimização de assets
- Pronto para deploy

### Servir Build de Produção
```bash
npm run web:serve
```
- Faz build e serve localmente
- Simula ambiente de produção

## 📁 Estrutura de Arquivos Web

```
src/
├── app.web.tsx              # Entrada principal para web
├── constants/
│   └── sizes.web.tsx        # Tamanhos responsivos para web
web/
├── index.html               # Template HTML
webpack.config.js            # Configuração do Webpack
babel.config.web.js          # Configuração Babel para web
index.web.js                 # Ponto de entrada
```

## 🎯 Características Web

### ✅ Funcionalidades Implementadas
- **Responsive Design**: Adapta-se a diferentes tamanhos de tela
- **PWA Ready**: Preparado para Progressive Web App
- **Font Loading**: Carregamento otimizado das fontes Inter
- **Asset Optimization**: Imagens e assets otimizados
- **Code Splitting**: Divisão automática do código
- **Hot Reload**: Desenvolvimento com reload instantâneo

### 📱 Responsividade
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px
- **Max Width**: 1200px (para melhor UX)

### 🎨 Otimizações Web
- **CSS Reset**: Reset de estilos padrão do navegador
- **Custom Scrollbars**: Scrollbars personalizadas
- **Video Controls**: Controles de vídeo removidos
- **Touch Optimization**: Prevenção de zoom e comportamentos indesejados
- **Loading Screen**: Tela de carregamento elegante

## 🔧 Configurações Específicas

### Webpack
- **Aliases**: Configuração de paths para React Native Web
- **Loaders**: Support para TypeScript, JavaScript, CSS, Assets
- **DevServer**: Servidor de desenvolvimento configurado
- **Split Chunks**: Otimização de bundle

### Babel
- **Presets**: Env, React, TypeScript
- **Plugins**: Class properties, Dynamic imports, JSX transform
- **Module Resolver**: Aliases para importações

## 🌐 Deploy

### Netlify
```bash
npm run web:build
# Upload da pasta dist/
```

### Vercel
```bash
npm run web:build
# Deploy automático via Git
```

### GitHub Pages
```bash
npm run web:build
# Commit da pasta dist/ na branch gh-pages
```

## 🐛 Troubleshooting

### Erro: Module not found
- Verifique se todas as dependências web estão instaladas
- Confirme os aliases no webpack.config.js

### Vídeos não reproduzem
- Verifique URLs HTTPS para vídeos
- Confirme configuração de CORS do servidor

### Fonts não carregam
- Verifique conexão com Google Fonts
- Confirme fallbacks no CSS

### Performance lenta
- Execute build de produção
- Verifique otimizações do Webpack
- Use React DevTools Profiler

## 📊 Performance

### Bundle Size
- **Vendors**: ~800KB (React, React Native Web)
- **App**: ~400KB (código da aplicação)
- **Assets**: Variável (imagens, fontes)

### Métricas Alvo
- **First Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 2MB total

## 🔄 Diferenças Mobile vs Web

### Mobile (React Native)
- Navegação nativa
- APIs device-specific
- Performance otimizada
- Gestos nativos

### Web (React Native Web)
- Navegação via React Router
- APIs web equivalentes
- Performance dependente do navegador
- Eventos de mouse/teclado

---

**🎉 Pronto para desenvolvimento web!**

Execute `npm run web:dev` e acesse http://localhost:3000
