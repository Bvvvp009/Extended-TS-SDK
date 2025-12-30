"use strict";
/**
 * Order management module for trading client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManagementModule = void 0;
const base_module_1 = require("./base-module");
const http_1 = require("../../utils/http");
const model_1 = require("../../utils/model");
/**
 * Mass cancel request model
 */
class MassCancelRequestModel extends model_1.X10BaseModel {
    orderIds;
    externalOrderIds;
    markets;
    cancelAll;
    constructor(orderIds, externalOrderIds, markets, cancelAll) {
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
class OrderManagementModule extends base_module_1.BaseModule {
    /**
     * Place a new order on the exchange
     * https://api.docs.extended.exchange/#create-order
     *
     * @param order Order object created by `createOrderObject` method
     */
    async placeOrder(order) {
        const url = this.getUrl('/user/order');
        return await (0, http_1.sendPostRequest)(url, order.toApiRequestJson(true), this.getApiKey());
    }
    /**
     * Cancel order by ID
     * https://api.docs.extended.exchange/#cancel-order
     */
    async cancelOrder(orderId) {
        const url = this.getUrl('/user/order/<order_id>', {
            pathParams: { order_id: orderId },
        });
        return await (0, http_1.sendDeleteRequest)(url, this.getApiKey());
    }
    /**
     * Cancel order by external ID
     * https://api.docs.extended.exchange/#cancel-order
     */
    async cancelOrderByExternalId(orderExternalId) {
        const url = this.getUrl('/user/order', {
            query: { externalId: orderExternalId },
        });
        return await (0, http_1.sendDeleteRequest)(url, this.getApiKey());
    }
    /**
     * Mass cancel orders
     * https://api.docs.extended.exchange/#mass-cancel
     */
    async massCancel(options = {}) {
        const url = this.getUrl('/user/order/massCancel');
        const requestModel = new MassCancelRequestModel(options.orderIds, options.externalOrderIds, options.markets, options.cancelAll);
        return await (0, http_1.sendPostRequest)(url, requestModel.toApiRequestJson(true), this.getApiKey());
    }
}
exports.OrderManagementModule = OrderManagementModule;
//# sourceMappingURL=order-management-module.js.map