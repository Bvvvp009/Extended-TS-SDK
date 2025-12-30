"use strict";
/**
 * Configuration types and constants for X10 Perpetual API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAINNET_CONFIG = exports.TESTNET_CONFIG = exports.EndpointConfig = exports.StarknetDomain = void 0;
/**
 * StarkNet domain configuration
 */
class StarknetDomain {
    name;
    version;
    chainId;
    revision;
    constructor(name, version, chainId, revision) {
        this.name = name;
        this.version = version;
        this.chainId = chainId;
        this.revision = revision;
    }
}
exports.StarknetDomain = StarknetDomain;
/**
 * Endpoint configuration
 */
class EndpointConfig {
    chainRpcUrl;
    apiBaseUrl;
    streamUrl;
    onboardingUrl;
    signingDomain;
    collateralAssetContract;
    assetOperationsContract;
    collateralAssetOnChainId;
    collateralDecimals;
    collateralAssetId;
    starknetDomain;
    constructor(chainRpcUrl, apiBaseUrl, streamUrl, onboardingUrl, signingDomain, collateralAssetContract, assetOperationsContract, collateralAssetOnChainId, collateralDecimals, collateralAssetId, starknetDomain) {
        this.chainRpcUrl = chainRpcUrl;
        this.apiBaseUrl = apiBaseUrl;
        this.streamUrl = streamUrl;
        this.onboardingUrl = onboardingUrl;
        this.signingDomain = signingDomain;
        this.collateralAssetContract = collateralAssetContract;
        this.assetOperationsContract = assetOperationsContract;
        this.collateralAssetOnChainId = collateralAssetOnChainId;
        this.collateralDecimals = collateralDecimals;
        this.collateralAssetId = collateralAssetId;
        this.starknetDomain = starknetDomain;
    }
}
exports.EndpointConfig = EndpointConfig;
/**
 * Testnet configuration
 */
exports.TESTNET_CONFIG = new EndpointConfig('https://rpc.sepolia.org', 'https://api.starknet.sepolia.extended.exchange/api/v1', 'wss://api.starknet.sepolia.extended.exchange/stream.extended.exchange/v1', 'https://api.starknet.sepolia.extended.exchange', 'starknet.sepolia.extended.exchange', '0x31857064564ed0ff978e687456963cba09c2c6985d8f9300a1de4962fafa054', '', '0x1', 6, '0x1', new StarknetDomain('Perpetuals', 'v0', 'SN_SEPOLIA', '1'));
/**
 * Mainnet configuration
 */
exports.MAINNET_CONFIG = new EndpointConfig('', 'https://api.starknet.extended.exchange/api/v1', 'wss://api.starknet.extended.exchange/stream.extended.exchange/v1', 'https://api.starknet.extended.exchange', 'extended.exchange', '', '', '0x1', 6, '0x1', new StarknetDomain('Perpetuals', 'v0', 'SN_MAIN', '1'));
//# sourceMappingURL=configuration.js.map