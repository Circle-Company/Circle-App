sudo eas build -p ios
sudo eas submit --platform ios

Os comandos de limpeza:

# 1. cache do Metro
npx expo start --clear

# 2. limpeza completa (quando o --clear não basta)
watchman watch-del-all 2>/dev/null
rm -rf "$TMPDIR"/metro-* "$TMPDIR"/haste-map-*
rm -rf node_modules/.cache .expo

# 3. artefatos nativos do iOS
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData

# 4. pods
npm run pod-install

# 5. rebuild
npx expo run:ios --device
