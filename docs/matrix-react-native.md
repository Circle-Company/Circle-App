# Matrix em React Native

Avaliação de usar [`matrix-js-sdk`](https://github.com/matrix-org/matrix-js-sdk) para
mensagens num app React Native de porte, entregue a cliente. Setembro de 2026.

> **E2EE** (*end-to-end encryption*): a mensagem é cifrada no aparelho de quem envia e só é
> decifrada no aparelho de quem recebe. As chaves nunca saem dos dispositivos, então o
> servidor guarda texto cifrado que ele próprio não consegue ler.
>
> Consequência: sem as chaves não há recuperação. Quem troca de aparelho sem guardar a chave
> perde o histórico, e não existe botão no servidor que traga de volta.

## Conclusão: Matrix está fora

| Rota | Veredito |
| --- | --- |
| `matrix-js-sdk` com E2EE | **Bloqueado.** Exige WebAssembly, que o motor JS não executa |
| `matrix-js-sdk` sem E2EE | **Sem sentido.** Custo de protocolo federado sem o benefício |
| Binding nativo do `matrix-rust-sdk` | **Reprovado.** 322 downloads/semana, 0.9.x, mantenedor único |

A única rota tecnicamente viável não passa no critério de risco. Dependência dessa espessura
no caminho crítico vira manutenção do contrato, não do upstream.

## Por que está bloqueado

```
E2EE → matrix-sdk-crypto-wasm (Rust→WASM) → motor JS que execute WASM → ✗
```

- **Hermes não executa WASM.** É o motor padrão do RN. O
  [#4150](https://github.com/matrix-org/matrix-js-sdk/issues/4150) registra o sintoma:
  `initRustCrypto()` falha com `Property 'FinalizationRegistry' doesn't exist`.
- **Trocar de motor não resolve.** No JSC o WASM depende de JIT, proibido pela Apple em apps
  de terceiros ([fórum](https://developer.apple.com/forums/thread/121040)). No Android está
  [desabilitado no `jsc-android`](https://github.com/react-native-community/jsc-android-buildscripts/issues/113).
- **Sem plano B.** O libolm em asm.js rodava em qualquer motor, mas foi
  [depreciado em 2024](https://matrix.org/blog/2024/08/libolm-deprecation/) e removido. Na
  42.3.0 só existe `initRustCrypto`.
- **Sem store.** Os backends são memória e IndexedDB. Em RN não há IndexedDB, e o in-memory
  perde as chaves de device a cada abertura.
- **Sem suporte oficial.** [Issue aberto desde 2018](https://github.com/matrix-org/matrix-js-sdk/issues/657),
  marcado como fluxo improvável. Rodar sem E2EE exigiria polyfills de `crypto.subtle`,
  `TextEncoder`, `FinalizationRegistry` e `Intl.Collator`, mais um store próprio.

## O que sobra

| Rota | Pacote | Downloads/sem |
| --- | --- | --- |
| Backend próprio | `socket.io-client` | 12.704.204 |
| Transporte puro | `ably` · `pubnub` | 1.105.812 · 270.105 |

Referência: o binding Matrix reprovado tem 322.

- **Backend próprio.** Controle total, sem preço por usuário nem lock-in. Você constrói
  entrega, ordenação, presença, read receipts, paginação, mídia e moderação. Trabalho real,
  mas nada disso é pesquisa.
- **Transporte puro.** Ably e PubNub entregam o canal em tempo real com garantias. A
  semântica de chat continua sendo sua.
