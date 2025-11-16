/**
 * Order management module for trading client
 */

import { BaseModule } from './base-module';
import {
  WrappedApiResponse,
  sendPostRequest,
  sendDeleteRequest,
} from '../../utils/http';
import { EmptyModel, X10BaseModel } from '../../utils/model';
import { NewOrderModel, PlacedOrderModel } from '../orders';

/**
 * Mass cancel request model
 */
class MassCancelRequestModel extends X10BaseModel {
  orderIds?: number[];
  externalOrderIds?: string[];
  markets?: string[];
  cancelAll?: boolean;

  constructor(
    orderIds?: number[],
    externalOrderIds?: string[],
    markets?: string[],
    cancelAll?: boolean
  ) {
    super();
    this.orderIds = orderIds;
    this.externalOrderIds = externalOrderIds;
    this.markets = markets;
    this.cancelAll = cancelAll;
  }
}

/**
 * Order management module for managing orders
 */
export class OrderManagementModule extends BaseModule {
  /**
   * Place a new order on the exchange
   * https://api.docs.extended.exchange/#create-order
   * 
   * @param order Order object created by `createOrderObject` method
   */
  async placeOrder(order: NewOrderModel): Promise<WrappedApiResponse<PlacedOrderModel>> {
    const url = this.getUrl('/user/order');
    return await sendPostRequest<PlacedOrderModel>(
      url,
      order.toApiRequestJson(true),
      this.getApiKey()
    );
  }

  /**
   * Cancel order by ID
   * https://api.docs.extended.exchange/#cancel-order
   */
  async cancelOrder(orderId: number): Promise<WrappedApiResponse<EmptyModel>> {
    const url = this.getUrl('/user/order/<order_id>', {
      pathParams: { order_id: orderId },
    });
    return await sendDeleteRequest<EmptyModel>(url, this.getApiKey());
  }

  /**
   * Cancel order by external ID
   * https://api.docs.extended.exchange/#cancel-order
   */
  async cancelOrderByExternalId(orderExternalId: string): Promise<WrappedApiResponse<EmptyModel>> {
    const url = this.getUrl('/user/order', {
      query: { externalId: orderExternalId },
    });
    return await sendDeleteRequest<EmptyModel>(url, this.getApiKey());
  }

  /**
   * Mass cancel orders
   * https://api.docs.extended.exchange/#mass-cancel
   */
  async massCancel(options: {
    orderIds?: number[];
    externalOrderIds?: string[];
    markets?: string[];
    cancelAll?: boolean;
  } = {}): Promise<WrappedApiResponse<EmptyModel>> {
    const url = this.getUrl('/user/order/massCancel');
    const requestModel = new MassCancelRequestModel(
      options.orderIds,
      options.externalOrderIds,
      options.markets,
      options.cancelAll
    );
    return await sendPostRequest<EmptyModel>(
      url,
      requestModel.toApiRequestJson(true),
      this.getApiKey()
    );
  }
}







