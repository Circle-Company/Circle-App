module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          'react-native': 'react-native-web',
          'react-native-linear-gradient': 'react-native-web-linear-gradient',
          'react-native-svg': 'react-native-svg-web',
          'react-native-vector-icons': '@expo/vector-icons',
        },
      },
    ],
  ],
};
