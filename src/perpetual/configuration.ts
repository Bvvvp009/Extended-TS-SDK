/**
 * Configuration types and constants for X10 Perpetual API
 */

/**
 * StarkNet domain configuration
 */
export class StarknetDomain {
  name: string;
  version: string;
  chainId: string;
  revision: string;

  constructor(name: string, version: string, chainId: string, revision: string) {
    this.name = name;
    this.version = version;
    this.chainId = chainId;
    this.revision = revision;
  }
}

/**
 * Endpoint configuration
 */
export class EndpointConfig {
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

  constructor(
    chainRpcUrl: string,
    apiBaseUrl: string,
    streamUrl: string,
    onboardingUrl: string,
    signingDomain: string,
    collateralAssetContract: string,
    assetOperationsContract: string,
    collateralAssetOnChainId: string,
    collateralDecimals: number,
    collateralAssetId: string,
    starknetDomain: StarknetDomain
  ) {
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

/**
 * Testnet configuration
 */
export const TESTNET_CONFIG = new EndpointConfig(
  'https://rpc.sepolia.org',
  'https://api.starknet.sepolia.extended.exchange/api/v1',
  'wss://api.starknet.sepolia.extended.exchange/stream.extended.exchange/v1',
  'https://api.starknet.sepolia.extended.exchange',
  'starknet.sepolia.extended.exchange',
  '0x31857064564ed0ff978e687456963cba09c2c6985d8f9300a1de4962fafa054',
  '',
  '0x1',
  6,
  '0x1',
  new StarknetDomain('Perpetuals', 'v0', 'SN_SEPOLIA', '1')
);

/**
 * Mainnet configuration
 */
export const MAINNET_CONFIG = new EndpointConfig(
  '',
  'https://api.starknet.extended.exchange/api/v1',
  'wss://api.starknet.extended.exchange/stream.extended.exchange/v1',
  'https://api.starknet.extended.exchange',
  'extended.exchange',
  '',
  '',
  '0x1',
  6,
  '0x1',
  new StarknetDomain('Perpetuals', 'v0', 'SN_MAIN', '1')
);







