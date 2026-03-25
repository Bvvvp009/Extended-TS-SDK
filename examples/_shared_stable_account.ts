import {
  EndpointConfig,
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  createOfficialWrapperStarkSigner,
  createStarkPerpetualAccountWithCustomSigner,
} from '../src/index';
import { PerpetualTradingClient } from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import path from 'path';
import Decimal from 'decimal.js';

type EnvConfig = ReturnType<typeof getX10EnvConfig>;

function loadOfficialWrapper(): any {
  const candidatePaths = [
    path.resolve(__dirname, '../../external-signers/stark-crypto-wrapper-js/pkg/stark_crypto_wrapper_wasm.js'),
    path.resolve(__dirname, '../../../external-signers/stark-crypto-wrapper-js/pkg/stark_crypto_wrapper_wasm.js'),
  ];

  for (const candidatePath of candidatePaths) {
    try {
      return require(candidatePath);
    } catch {}
  }

  throw new Error(
    `Official wrapper build not found. Tried: ${candidatePaths.join(', ')}`
  );
}

export function createStableAccountFromEnv(requirePrivateApi = true): {
  env: EnvConfig;
  config: EndpointConfig;
  account: ReturnType<typeof createStarkPerpetualAccountWithCustomSigner>;
} {
  const env = getX10EnvConfig(requirePrivateApi);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  const officialWrapper = loadOfficialWrapper();
  const signer = createOfficialWrapperStarkSigner(officialWrapper, env.privateKey);
  const account = createStarkPerpetualAccountWithCustomSigner(
    env.vaultId,
    env.publicKey,
    env.apiKey,
    signer
  );

  return { env, config, account };
}

export function getMarketPricePrecision(market: any): number {
  const explicitPrecision = market?.tradingConfig?.pricePrecision;
  if (typeof explicitPrecision === 'number' && Number.isFinite(explicitPrecision)) {
    return explicitPrecision;
  }

  const minPriceChange = new Decimal(market?.tradingConfig?.minPriceChange ?? '1');
  if (!minPriceChange.gt(0) || minPriceChange.gte(1)) {
    return 0;
  }

  return Math.abs(Math.ceil(Math.log10(minPriceChange.toNumber())));
}

export async function findAffordableMarketOrder(
  client: PerpetualTradingClient,
  options: {
    preferredMarkets?: string[];
    budgetRatio?: Decimal;
  } = {}
): Promise<{
  marketName: string;
  quantity: Decimal;
  referencePrice: Decimal;
  postOnlyPrice: Decimal;
}> {
  const preferredMarkets = options.preferredMarkets ?? [
    'DOGE-USD',
    'XRP-USD',
    'XLM-USD',
    'ADA-USD',
    'SOL-USD',
    'ETH-USD',
    'BTC-USD',
  ];
  const budgetRatio = options.budgetRatio ?? new Decimal('0.8');

  const [balanceResponse, markets] = await Promise.all([
    client.account.getBalance(),
    client.marketsInfo.getMarketsDict(),
  ]);

  const availableForTrade = new Decimal(
    (balanceResponse.data as any)?.availableForTrade ?? (balanceResponse.data as any)?.balance ?? '0'
  );

  const candidates = Object.values(markets)
    .filter((market: any) => market?.active && market?.tradingConfig?.minOrderSize)
    .map((market: any) => {
      const referencePrice = new Decimal(
        market.marketStats?.markPrice ??
          market.marketStats?.lastPrice ??
          market.marketStats?.askPrice ??
          market.marketStats?.bidPrice ??
          '0'
      );
      const quantity = new Decimal(market.tradingConfig.minOrderSize as any);
      const estimatedCost = quantity.mul(referencePrice);

      return {
        marketName: market.name,
        quantity,
        referencePrice,
        estimatedCost,
        postOnlyPrice: referencePrice
          .mul(new Decimal('0.9'))
          .toDecimalPlaces(getMarketPricePrecision(market), Decimal.ROUND_DOWN),
      };
    })
    .filter((candidate) => candidate.referencePrice.gt(0) && candidate.quantity.gt(0));

  const sortedCandidates = candidates.sort((left, right) => left.estimatedCost.comparedTo(right.estimatedCost));
  const orderedCandidates = [
    ...preferredMarkets
      .map((marketName) => sortedCandidates.find((candidate) => candidate.marketName === marketName))
      .filter((candidate): candidate is (typeof sortedCandidates)[number] => Boolean(candidate)),
    ...sortedCandidates.filter(
      (candidate) => !preferredMarkets.includes(candidate.marketName)
    ),
  ];

  const affordable = orderedCandidates.find((candidate) =>
    candidate.estimatedCost.lte(availableForTrade.mul(budgetRatio))
  );

  if (!affordable) {
    throw new Error(
      `No affordable market found for available balance ${availableForTrade.toString()}`
    );
  }

  return affordable;
}