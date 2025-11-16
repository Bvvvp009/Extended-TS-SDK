/**
 * Account module for trading client
 */

import Decimal from 'decimal.js';
import { BaseModule } from './base-module';
import {
  WrappedApiResponse,
  sendGetRequest,
  sendPatchRequest,
  sendPostRequest,
  sendDeleteRequest,
} from '../../utils/http';
import { EmptyModel } from '../../utils/model';
import {
  AccountModel,
  AccountLeverage,
  BalanceModel,
} from '../accounts';
import {
  OrderSide,
  OrderType,
  OpenOrderModel,
} from '../orders';
import { TradingFeeModel } from '../fees';
import { MarketModel } from '../markets';
import { toEpochMillis } from '../../utils/date';
import { ClientModel } from '../clients';
import { BridgesConfig, Quote } from '../bridges';
import { TransferResponseModel } from '../transfers';
import { createTransferObject } from '../transfer-object';
import { createWithdrawalObject } from '../withdrawal-object';

/**
 * Account module for managing account operations
 */
export class AccountModule extends BaseModule {
  /**
   * Get account information
   */
  async getAccount(): Promise<WrappedApiResponse<AccountModel>> {
    const url = this.getUrl('/user/account/info');
    return await sendGetRequest<AccountModel>(url, this.getApiKey());
  }

  /**
   * Get client information
   */
  async getClient(): Promise<WrappedApiResponse<ClientModel>> {
    const url = this.getUrl('/user/client/info');
    return await sendGetRequest<ClientModel>(url, this.getApiKey());
  }

  /**
   * Get account balance
   * https://api.docs.extended.exchange/#get-balance
   */
  async getBalance(): Promise<WrappedApiResponse<BalanceModel>> {
    const url = this.getUrl('/user/balance');
    return await sendGetRequest<BalanceModel>(url, this.getApiKey());
  }

  /**
   * Get positions
   * https://api.docs.extended.exchange/#get-positions
   */
  async getPositions(options: {
    marketNames?: string[];
    positionSide?: string;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/positions', {
      query: {
        market: options.marketNames,
        side: options.positionSide ? [options.positionSide] : undefined,
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get positions history
   * https://api.docs.extended.exchange/#get-positions-history
   */
  async getPositionsHistory(options: {
    marketNames?: string[];
    positionSide?: string;
    cursor?: number;
    limit?: number;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/positions/history', {
      query: {
        market: options.marketNames,
        side: options.positionSide ? [options.positionSide] : undefined,
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get open orders
   * https://api.docs.extended.exchange/#get-open-orders
   */
  async getOpenOrders(options: {
    marketNames?: string[];
    orderType?: OrderType;
    orderSide?: OrderSide;
  } = {}): Promise<WrappedApiResponse<OpenOrderModel[]>> {
    const url = this.getUrl('/user/orders', {
      query: {
        market: options.marketNames,
        type: options.orderType ? [options.orderType] : undefined,
        side: options.orderSide ? [options.orderSide] : undefined,
      },
    });
    return await sendGetRequest<OpenOrderModel[]>(url, this.getApiKey());
  }

  /**
   * Get orders history
   * https://api.docs.extended.exchange/#get-orders-history
   */
  async getOrdersHistory(options: {
    marketNames?: string[];
    orderType?: OrderType;
    orderSide?: OrderSide;
    cursor?: number;
    limit?: number;
  } = {}): Promise<WrappedApiResponse<OpenOrderModel[]>> {
    const url = this.getUrl('/user/orders/history', {
      query: {
        market: options.marketNames,
        type: options.orderType ? [options.orderType] : undefined,
        side: options.orderSide ? [options.orderSide] : undefined,
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
      },
    });
    return await sendGetRequest<OpenOrderModel[]>(url, this.getApiKey());
  }

  /**
   * Get order by ID
   * https://api.docs.extended.exchange/#get-order-by-id
   */
  async getOrderById(orderId: number): Promise<WrappedApiResponse<OpenOrderModel>> {
    const url = this.getUrl('/user/orders/<order_id>', {
      pathParams: { order_id: orderId },
    });
    return await sendGetRequest<OpenOrderModel>(url, this.getApiKey());
  }

  /**
   * Get order by external ID
   * https://api.docs.extended.exchange/#get-order-by-external-id
   */
  async getOrderByExternalId(externalId: string): Promise<WrappedApiResponse<OpenOrderModel[]>> {
    const url = this.getUrl('/user/orders/external/<external_id>', {
      pathParams: { external_id: externalId },
    });
    return await sendGetRequest<OpenOrderModel[]>(url, this.getApiKey());
  }

  /**
   * Get trades
   * https://api.docs.extended.exchange/#get-trades
   */
  async getTrades(options: {
    marketNames: string[];
    tradeSide?: OrderSide;
    tradeType?: string;
    cursor?: number;
    limit?: number;
  }): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/trades', {
      query: {
        market: options.marketNames,
        side: options.tradeSide ? [options.tradeSide] : undefined,
        type: options.tradeType ? [options.tradeType] : undefined,
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get fees
   * https://api.docs.extended.exchange/#get-fees
   */
  async getFees(options: {
    marketNames: string[];
    builderId?: number;
  }): Promise<WrappedApiResponse<TradingFeeModel[]>> {
    const url = this.getUrl('/user/fees', {
      query: {
        market: options.marketNames,
        builderId: options.builderId?.toString(),
      },
    });
    return await sendGetRequest<TradingFeeModel[]>(url, this.getApiKey());
  }

  /**
   * Get leverage
   * https://api.docs.extended.exchange/#get-current-leverage
   */
  async getLeverage(marketNames: string[]): Promise<WrappedApiResponse<AccountLeverage[]>> {
    const url = this.getUrl('/user/leverage', {
      query: {
        market: marketNames,
      },
    });
    return await sendGetRequest<AccountLeverage[]>(url, this.getApiKey());
  }

  /**
   * Update leverage
   * https://api.docs.extended.exchange/#update-leverage
   */
  async updateLeverage(marketName: string, leverage: Decimal): Promise<WrappedApiResponse<EmptyModel>> {
    const url = this.getUrl('/user/leverage');
    const requestModel = new AccountLeverage(marketName, leverage);
    return await sendPatchRequest<EmptyModel>(
      url,
      requestModel.toApiRequestJson(),
      this.getApiKey()
    );
  }

  /**
   * Get asset operations
   */
  async assetOperations(options: {
    id?: number;
    operationsType?: string[];
    operationsStatus?: string[];
    startTime?: number;
    endTime?: number;
    cursor?: number;
    limit?: number;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/assetOperations', {
      query: {
        type: options.operationsType,
        status: options.operationsStatus,
        startTime: options.startTime?.toString(),
        endTime: options.endTime?.toString(),
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
        id: options.id?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get bridge config
   */
  async getBridgeConfig(): Promise<WrappedApiResponse<BridgesConfig>> {
    const url = this.getUrl('/user/bridge/config');
    return await sendGetRequest<BridgesConfig>(url, this.getApiKey());
  }

  /**
   * Get bridge quote
   */
  async getBridgeQuote(
    chainIn: string,
    chainOut: string,
    amount: Decimal
  ): Promise<WrappedApiResponse<Quote>> {
    const url = this.getUrl('/user/bridge/quote', {
      query: {
        chainIn,
        chainOut,
        amount: amount.toString(),
      },
    });
    return await sendGetRequest<Quote>(url, this.getApiKey());
  }

  /**
   * Commit bridge quote
   */
  async commitBridgeQuote(id: string): Promise<WrappedApiResponse<EmptyModel>> {
    const url = this.getUrl('/user/bridge/quote', {
      query: { id },
    });
    return await sendPostRequest<EmptyModel>(url, undefined, this.getApiKey());
  }

  /**
   * Transfer
   */
  async transfer(options: {
    toVault: number;
    toL2Key: number | string;
    amount: Decimal;
    nonce?: number;
  }): Promise<WrappedApiResponse<TransferResponseModel>> {
    const fromVault = this.getStarkAccount().getVault();
    const url = this.getUrl('/user/transfer/onchain');

    const toL2KeyNum =
      typeof options.toL2Key === 'string' ? parseInt(options.toL2Key, 16) : options.toL2Key;

    const requestModel = createTransferObject(
      fromVault,
      options.toVault,
      toL2KeyNum,
      options.amount,
      this.getEndpointConfig(),
      this.getStarkAccount(),
      options.nonce
    );

    return await sendPostRequest<TransferResponseModel>(
      url,
      requestModel.toApiRequestJson(),
      this.getApiKey()
    );
  }

  /**
   * Withdraw
   */
  async withdraw(options: {
    amount: Decimal;
    chainId?: string;
    starkAddress?: string;
    nonce?: number;
    quoteId?: string;
  }): Promise<WrappedApiResponse<number>> {
    const url = this.getUrl('/user/withdrawal');
    const accountResponse = await this.getAccount();
    const account = accountResponse.data;
    
    if (!account) {
      throw new Error('Account not found');
    }

    const chainId = options.chainId || 'STRK';
    
    if (!options.quoteId && chainId !== 'STRK') {
      throw new Error('quote_id is required for EVM withdrawals');
    }

    let recipientStarkAddress: string | undefined = options.starkAddress;

    if (!recipientStarkAddress) {
      if (chainId === 'STRK') {
        const clientResponse = await this.getClient();
        const client = clientResponse.data;
        
        if (!client) {
          throw new Error('Client not found');
        }
        
        if (!client.starknetWalletAddress) {
          throw new Error(
            'Client does not have attached starknet_wallet_address. Cannot determine withdrawal address.'
          );
        }
        
        recipientStarkAddress = client.starknetWalletAddress;
      } else {
        if (!account.bridgeStarknetAddress) {
          throw new Error('Account bridge_starknet_address not found');
        }
        recipientStarkAddress = account.bridgeStarknetAddress;
      }
    }

    if (!recipientStarkAddress) {
      throw new Error('Recipient stark address not found');
    }

    const requestModel = createWithdrawalObject(
      options.amount,
      recipientStarkAddress,
      this.getStarkAccount(),
      this.getEndpointConfig(),
      account.id,
      chainId,
      undefined,
      options.nonce,
      options.quoteId
    );

    return await sendPostRequest<number>(url, requestModel.toApiRequestJson(), this.getApiKey());
  }

  /**
   * Create deposit
   * https://api.docs.extended.exchange/#create-deposit
   */
  async createDeposit(options: {
    amount: Decimal;
    chainId?: string;
    starkAddress?: string;
    quoteId?: string;
  }): Promise<WrappedApiResponse<number>> {
    const url = this.getUrl('/user/deposit');
    const accountResponse = await this.getAccount();
    const account = accountResponse.data;
    
    if (!account) {
      throw new Error('Account not found');
    }

    const chainId = options.chainId || 'STRK';
    
    if (!options.quoteId && chainId !== 'STRK') {
      throw new Error('quote_id is required for EVM deposits');
    }

    let recipientStarkAddress: string | undefined = options.starkAddress;

    if (!recipientStarkAddress) {
      if (chainId === 'STRK') {
        const clientResponse = await this.getClient();
        const client = clientResponse.data;
        
        if (!client) {
          throw new Error('Client not found');
        }
        
        if (!client.starknetWalletAddress) {
          throw new Error(
            'Client does not have attached starknet_wallet_address. Cannot determine deposit address.'
          );
        }
        
        recipientStarkAddress = client.starknetWalletAddress;
      } else {
        if (!account.bridgeStarknetAddress) {
          throw new Error('Account bridge_starknet_address not found');
        }
        recipientStarkAddress = account.bridgeStarknetAddress;
      }
    }

    if (!recipientStarkAddress) {
      throw new Error('Recipient stark address not found');
    }

    const requestBody: any = {
      amount: options.amount.toString(),
      chainId,
      starkAddress: recipientStarkAddress,
    };

    if (options.quoteId) {
      requestBody.quoteId = options.quoteId;
    }

    return await sendPostRequest<number>(url, requestBody, this.getApiKey());
  }

  /**
   * Get deposits list
   * https://api.docs.extended.exchange/#get-deposits
   */
  async getDeposits(options: {
    cursor?: number;
    limit?: number;
    startTime?: number;
    endTime?: number;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/deposits', {
      query: {
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
        startTime: options.startTime?.toString(),
        endTime: options.endTime?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get withdrawals list
   * https://api.docs.extended.exchange/#get-withdrawals
   */
  async getWithdrawals(options: {
    cursor?: number;
    limit?: number;
    startTime?: number;
    endTime?: number;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/withdrawals', {
      query: {
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
        startTime: options.startTime?.toString(),
        endTime: options.endTime?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get transfers list
   * https://api.docs.extended.exchange/#get-transfers
   */
  async getTransfers(options: {
    cursor?: number;
    limit?: number;
    startTime?: number;
    endTime?: number;
  } = {}): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/user/transfers', {
      query: {
        cursor: options.cursor?.toString(),
        limit: options.limit?.toString(),
        startTime: options.startTime?.toString(),
        endTime: options.endTime?.toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }
}

