/**
 * Order management module for trading client
 */
import { BaseModule } from './base-module';
import { WrappedApiResponse } from '../../utils/http';
import { EmptyModel } from '../../utils/model';
import { NewOrderModel, PlacedOrderModel } from '../orders';
/**
 * Order management module for managing orders
 */
export declare class OrderManagementModule extends BaseModule {
    /**
     * Place a new order on the exchange
     * https://api.docs.extended.exchange/#create-order
     *
     * @param order Order object created by `createOrderObject` method
     */
    placeOrder(order: NewOrderModel): Promise<WrappedApiResponse<PlacedOrderModel>>;
    /**
     * Cancel order by ID
     * https://api.docs.extended.exchange/#cancel-order
     */
    cancelOrder(orderId: number): Promise<WrappedApiResponse<EmptyModel>>;
    /**
     * Cancel order by external ID
     * https://api.docs.extended.exchange/#cancel-order
     */
    cancelOrderByExternalId(orderExternalId: string): Promise<WrappedApiResponse<EmptyModel>>;
    /**
     * Mass cancel orders
     * https://api.docs.extended.exchange/#mass-cancel
     */
    massCancel(options?: {
        orderIds?: number[];
        externalOrderIds?: string[];
        markets?: string[];
        cancelAll?: boolean;
    }): Promise<WrappedApiResponse<EmptyModel>>;
}
//# sourceMappingURL=order-management-module.d.ts.map