/**
 * Amount conversion utilities
 */

import Decimal from 'decimal.js';
import { Asset } from './assets';

/**
 * Rounding contexts
 */
export const ROUNDING_SELL_CONTEXT = Decimal.ROUND_DOWN;
export const ROUNDING_BUY_CONTEXT = Decimal.ROUND_UP;
export const ROUNDING_FEE_CONTEXT = Decimal.ROUND_UP;

/**
 * Human-readable amount
 */
export class HumanReadableAmount {
  value: Decimal;
  asset: Asset;

  constructor(value: Decimal, asset: Asset) {
    this.value = value;
    this.asset = asset;
  }

  toL1Amount(): L1Amount {
    const convertedValue = this.asset.convertInternalQuantityToL1Quantity(this.value);
    return new L1Amount(convertedValue, this.asset);
  }

  toStarkAmount(roundingMode: Decimal.Rounding = ROUNDING_BUY_CONTEXT): StarkAmount {
		if (!(this as any).asset) {
			throw new Error(`HumanReadableAmount.asset is undefined. value=${String(this.value)}`);
		}
		const convertedValue = (this as any).asset.convertHumanReadableToStarkQuantity(
      this.value,
      Decimal as any // Type workaround
    );
		if (convertedValue === undefined) {
			throw new Error('Asset conversion failed: asset or conversion method undefined');
		}
		return new StarkAmount(convertedValue, this.asset);
  }
}

/**
 * L1 amount
 */
export class L1Amount {
  value: number;
  asset: Asset;

  constructor(value: number, asset: Asset) {
    this.value = value;
    this.asset = asset;
  }

  toInternalAmount(): HumanReadableAmount {
    const convertedValue = this.asset.convertL1QuantityToInternalQuantity(this.value);
    return new HumanReadableAmount(convertedValue, this.asset);
  }
}

/**
 * Stark amount
 */
export class StarkAmount {
  value: number;
  asset: Asset;

  constructor(value: number, asset: Asset) {
    this.value = value;
    this.asset = asset;
  }

  toInternalAmount(): HumanReadableAmount {
    const convertedValue = this.asset.convertStarkToInternalQuantity(this.value);
    return new HumanReadableAmount(convertedValue, this.asset);
  }

  negate(): StarkAmount {
    return new StarkAmount(-this.value, this.asset);
  }
}



