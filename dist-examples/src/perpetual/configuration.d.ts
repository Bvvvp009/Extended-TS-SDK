/**
 * Configuration types and constants for X10 Perpetual API
 */
/**
 * StarkNet domain configuration
 */
export declare class StarknetDomain {
    name: string;
    version: string;
    chainId: string;
    revision: string;
    constructor(name: string, version: string, chainId: string, revision: string);
}
/**
 * Endpoint configuration
 */
export declare class EndpointConfig {
    chainRpcUrl: string;
    apiBaseUrl: string;
    streamUrl: string;
    onboardingUrl: string;
    signingDomain: string;
    collateralAssetContract: string;
    assetOperationsContract: string;
    collateralAssetOnChainId: string;
    collateralDecimals: number;
    collateralAssetId: string;
    starknetDomain: StarknetDomain;
    constructor(chainRpcUrl: string, apiBaseUrl: string, streamUrl: string, onboardingUrl: string, signingDomain: string, collateralAssetContract: string, assetOperationsContract: string, collateralAssetOnChainId: string, collateralDecimals: number, collateralAssetId: string, starknetDomain: StarknetDomain);
}
/**
 * Testnet configuration
 */
export declare const TESTNET_CONFIG: EndpointConfig;
/**
 * Mainnet configuration
 */
export declare const MAINNET_CONFIG: EndpointConfig;
//# sourceMappingURL=configuration.d.ts.map