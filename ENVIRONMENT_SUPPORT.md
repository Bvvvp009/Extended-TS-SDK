# Environment Support Guide

This document provides detailed information about using the Extended TypeScript SDK in different environments, including browser, Node.js, PWA, and mobile applications.

## Supported Environments

The Extended TypeScript SDK is built to work in **multiple environments**:

- ✅ **Node.js** (v18+)
- ✅ **Browser** (Chrome, Firefox, Safari, Edge)
- ✅ **Progressive Web Apps (PWA)**
- ✅ **React Native** (with polyfills)
- ✅ **Electron**
- ✅ **Web Workers**
- ⚠️ **Native Mobile** (iOS/Android) - Requires additional setup

## Browser Environment

The SDK works seamlessly in modern browsers with full support for:

- WASM cryptographic operations
- WebSocket streaming
- TypeScript/JavaScript bundlers (Webpack, Vite, Rollup, etc.)

### Installation

```bash
npm install extended-typescript-sdk
```

### Example Usage

```typescript
import { initWasm, TESTNET_CONFIG, PerpetualTradingClient } from 'extended-typescript-sdk';

// Initialize WASM (required for cryptographic operations)
await initWasm();

// Create trading client
const client = new PerpetualTradingClient(TESTNET_CONFIG, account);
```

### Bundler Configuration

The SDK automatically loads the correct WASM module for browsers. Most modern bundlers (Webpack 5+, Vite, etc.) handle WASM imports automatically.

#### Webpack Configuration (if needed)

```javascript
module.exports = {
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
    ],
  },
};
```

## Node.js Environment

The SDK is fully compatible with Node.js 18 and above.

### Installation

```bash
npm install extended-typescript-sdk
```

### Example Usage

```typescript
import { initWasm, TESTNET_CONFIG, PerpetualTradingClient } from 'extended-typescript-sdk';

async function main() {
  // Initialize WASM
  await initWasm();
  
  // Create trading client
  const client = new PerpetualTradingClient(TESTNET_CONFIG, account);
  
  // Use the client
  const balance = await client.account.getBalance();
  console.log(balance.data?.toPrettyJson());
  
  await client.close();
}

main().catch(console.error);
```

### CommonJS vs ES Modules

The SDK supports both CommonJS and ES Modules:

**ES Modules (recommended):**
```typescript
import { initWasm, PerpetualTradingClient } from 'extended-typescript-sdk';
```

**CommonJS:**
```javascript
const { initWasm, PerpetualTradingClient } = require('extended-typescript-sdk');
```

## Progressive Web Apps (PWA)

The SDK works perfectly in PWA environments. The WASM module can be cached for offline use.

### Service Worker Caching

You can cache the SDK's WASM files in your service worker:

```javascript
// service-worker.js
const CACHE_NAME = 'extended-sdk-v1';
const urlsToCache = [
  '/node_modules/extended-typescript-sdk/wasm/stark_crypto_wasm-web.wasm',
  // ... other assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### PWA Manifest

Ensure your PWA manifest includes necessary permissions:

```json
{
  "name": "Extended Trading App",
  "short_name": "Extended",
  "start_url": "/",
  "display": "standalone",
  "permissions": [
    "crypto",
    "wasm"
  ]
}
```

### Offline Considerations

- **WASM initialization**: Cache the WASM module for offline use
- **API calls**: The SDK requires network connectivity for API calls
- **WebSocket streams**: Require active internet connection

## React Native

The SDK can work in React Native with appropriate polyfills.

### Installation

```bash
npm install extended-typescript-sdk
npm install react-native-get-random-values
npm install react-native-webview
npm install text-encoding
```

### Required Polyfills

```typescript
// App.tsx or index.js - Import at the top!
import 'react-native-get-random-values';
import { TextEncoder, TextDecoder } from 'text-encoding';

// Polyfill TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
```

### WASM Support

React Native **does not** natively support WebAssembly. You have two options:

#### Option 1: Use Hermes with WASM Support (Recommended)

React Native 0.70+ with Hermes engine supports WASM:

```javascript
// metro.config.js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: ['wasm', 'bin'],
  },
};
```

#### Option 2: Use Custom Signer (No WASM Required)

Use a custom signer implementation that uses React Native's native crypto:

```typescript
import { CustomStarkSigner, createStarkPerpetualAccountWithCustomSigner } from 'extended-typescript-sdk';
// Import native crypto module
import NativeCrypto from 'react-native-starknet-crypto';

class ReactNativeStarkSigner implements CustomStarkSigner {
  constructor(private privateKey: string) {}
  
  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    const signature = await NativeCrypto.sign(
      this.privateKey,
      msgHash.toString(16)
    );
    return [BigInt(signature.r), BigInt(signature.s)];
  }
}

// Use the custom signer
const signer = new ReactNativeStarkSigner(privateKey);
const account = createStarkPerpetualAccountWithCustomSigner(
  vaultId,
  publicKey,
  apiKey,
  signer
);
```

### WebSocket in React Native

For WebSocket streaming, you may need to configure:

```typescript
// Use global WebSocket (available in React Native)
import { PerpetualStreamClient } from 'extended-typescript-sdk';

const streamClient = new PerpetualStreamClient({
  apiUrl: TESTNET_CONFIG.streamUrl,
});
```

React Native provides WebSocket globally, so no additional configuration is needed.

## Electron

The SDK works seamlessly in Electron applications in both renderer and main processes.

### Renderer Process

```typescript
import { initWasm, PerpetualTradingClient } from 'extended-typescript-sdk';

// Works like in a browser
await initWasm();
const client = new PerpetualTradingClient(config, account);
```

### Main Process

```typescript
import { initWasm, PerpetualTradingClient } from 'extended-typescript-sdk';

// Works like in Node.js
await initWasm();
const client = new PerpetualTradingClient(config, account);
```

## Native Mobile (iOS/Android)

For **fully native** mobile applications (Swift, Kotlin, Java), you'll need to:

1. Use React Native (see above) OR
2. Create native bindings to the SDK OR
3. Use a WebView with the SDK running in JavaScript

### Option: WebView Approach

```swift
// iOS Swift Example
import WebKit

class TradingViewController: UIViewController, WKScriptMessageHandler {
    var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let contentController = WKUserContentController()
        contentController.add(self, name: "extended")
        
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        
        webView = WKWebView(frame: view.bounds, configuration: config)
        view.addSubview(webView)
        
        // Load HTML with Extended SDK
        if let htmlPath = Bundle.main.path(forResource: "trading", ofType: "html") {
            let htmlUrl = URL(fileURLWithPath: htmlPath)
            webView.loadFileURL(htmlUrl, allowingReadAccessTo: htmlUrl.deletingLastPathComponent())
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController,
                              didReceive message: WKScriptMessage) {
        // Handle messages from JavaScript
    }
}
```

## Deposits and Supported Tokens

### Supported Collateral

The Extended Exchange currently supports:

- **USDC** on **StarkNet** as the primary collateral token

### Making Deposits

Deposits are made directly to the StarkNet bridge contract. The SDK provides deposit functionality:

```typescript
// Using the AccountModule
await tradingClient.account.deposit(
  amountInUSDC,  // Amount in USDC (Decimal)
  l1PrivateKey   // Your L1 Ethereum private key
);
```

### Deposit Flow

1. **Bridge USDC** from Ethereum L1 to StarkNet L2
2. **Deposit** into your Extended Exchange vault
3. **Trade** with up to 100x leverage

For more details on deposits, see the [Extended Exchange Documentation](https://api.docs.extended.exchange/).

## Remote Signing Support (Privy, Web3Auth, etc.)

The SDK supports **custom signers** for integrations with remote signing services:

- **Privy** - Embedded wallets with remote signing
- **Web3Auth** - Social login with key management
- **Magic Link** - Passwordless authentication
- **Custom HSM** - Hardware security modules

### Example: Using Privy

```typescript
import { CustomStarkSigner, createStarkPerpetualAccountWithCustomSigner } from 'extended-typescript-sdk';

class PrivyStarkSigner implements CustomStarkSigner {
  constructor(private privyClient: any, private walletId: string) {}
  
  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    const msgHashHex = '0x' + msgHash.toString(16);
    const signature = await this.privyClient.signStarknetMessage(
      this.walletId,
      msgHashHex
    );
    return [BigInt(signature.r), BigInt(signature.s)];
  }
}

// Create account with Privy signer
const privySigner = new PrivyStarkSigner(privyClient, walletId);
const account = createStarkPerpetualAccountWithCustomSigner(
  vaultId,
  publicKey,
  apiKey,
  privySigner
);
```

See [examples/16_privy_integration.ts](./examples/16_privy_integration.ts) for a complete example.

## Troubleshooting

### WASM Not Loading

**Problem**: `Failed to initialize WASM module`

**Solution**:
1. Ensure `initWasm()` is called before any crypto operations
2. Check that WASM files are included in your build output
3. Verify your bundler supports WASM (async WebAssembly)

### WebSocket Connection Issues

**Problem**: WebSocket connections fail in certain environments

**Solution**:
1. Check CORS and WebSocket support
2. For React Native, ensure WebSocket is available globally
3. For PWA, check service worker isn't blocking WebSocket connections

### React Native Bundle Issues

**Problem**: Metro bundler fails to include WASM files

**Solution**:
1. Use custom signer approach (Option 2 above)
2. Or configure Metro to include `.wasm` files in assets

### TypeScript Errors

**Problem**: Type errors with `bigint`

**Solution**:
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"]
  }
}
```

## Performance Considerations

### WASM Initialization

- **Browser**: ~50-100ms initial load
- **Node.js**: ~20-50ms initial load
- **React Native**: Depends on polyfill approach

The WASM module is loaded once and cached for subsequent operations.

### Signing Performance

- **WASM signer**: ~55μs per signature
- **Custom signer**: Depends on implementation (remote signing adds network latency)

## FAQ

### Does the SDK work in mobile browsers?

**Yes!** The SDK works in mobile browsers (Safari, Chrome, Firefox mobile) just like desktop browsers.

### Can I use this in a PWA app?

**Yes!** PWAs are fully supported. You can cache the WASM module for offline use.

### What about React Native?

**Yes, with polyfills!** React Native requires additional setup for WASM support or using a custom signer.

### Does it support native iOS/Android apps?

**Partially**. You can use:
1. React Native wrapper (recommended)
2. WebView embedding
3. Native crypto with custom signer

### Can I use Privy or other remote signers?

**Yes!** The SDK supports custom signers. See the [Custom Signer Documentation](#remote-signing-support-privy-web3auth-etc).

### What tokens are supported for deposits?

Currently **USDC on StarkNet** is the primary collateral token. Check the [Extended Exchange documentation](https://api.docs.extended.exchange/) for updates on supported assets.

## Additional Resources

- [Extended API Documentation](https://api.docs.extended.exchange/)
- [Extended Exchange](https://extended.exchange/)
- [Examples Directory](./examples/)
- [GitHub Issues](https://github.com/Bvvvp009/Extended-TS-SDK/issues)

## Support

For environment-specific issues or questions:

1. Check this guide first
2. Review the [examples directory](./examples/)
3. Open an issue on [GitHub](https://github.com/Bvvvp009/Extended-TS-SDK/issues)
4. Contact Extended Exchange for platform-specific questions
