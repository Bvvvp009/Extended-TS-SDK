"use strict";
/**
 * User client for onboarding and account management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserClient = void 0;
const ethers_1 = require("ethers");
const accounts_1 = require("../accounts");
const errors_1 = require("../../errors");
const http_1 = require("../../utils/http");
const date_1 = require("../../utils/date");
const onboarding_1 = require("./onboarding");
const L1_AUTH_SIGNATURE_HEADER = 'L1_SIGNATURE';
const L1_MESSAGE_TIME_HEADER = 'L1_MESSAGE_TIME';
const ACTIVE_ACCOUNT_HEADER = 'X-X10-ACTIVE-ACCOUNT';
/**
 * User client for onboarding and L1 account operations
 */
class UserClient {
    endpointConfig;
    l1PrivateKey;
    constructor(endpointConfig, l1PrivateKey) {
        this.endpointConfig = endpointConfig;
        this.l1PrivateKey = l1PrivateKey;
    }
    /**
     * Get URL
     */
    getUrl(baseUrl, path, options = {}) {
        return (0, http_1.getUrl)(`${baseUrl}${path}`, options);
    }
    /**
     * Onboard new account
     */
    async onboard(referralCode) {
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const keyPair = await (0, onboarding_1.getL2KeysFromL1Account)(this.l1PrivateKey(), 0, this.endpointConfig.signingDomain);
        const payload = await (0, onboarding_1.getOnboardingPayload)(this.l1PrivateKey(), this.endpointConfig.signingDomain, keyPair, this.endpointConfig.onboardingUrl, referralCode);
        const url = this.getUrl(this.endpointConfig.onboardingUrl, '/auth/onboard');
        const onboardingResponse = await (0, http_1.sendPostRequest)(url, payload.toJson());
        const onboardedClient = onboardingResponse.data;
        if (!onboardedClient) {
            throw new Error('No account data returned from onboarding');
        }
        return {
            account: onboardedClient.defaultAccount,
            l2KeyPair: keyPair,
        };
    }
    /**
     * Onboard sub-account
     */
    async onboardSubaccount(accountIndex, description) {
        const requestPath = '/auth/onboard/subaccount';
        const finalDescription = description || `Subaccount ${accountIndex}`;
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const time = (0, date_1.utcNow)();
        const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const l1Message = `${requestPath}@${authTimeString}`;
        // Sign with ethers
        const l1Signature = await wallet.signMessage(l1Message);
        const keyPair = await (0, onboarding_1.getL2KeysFromL1Account)(this.l1PrivateKey(), accountIndex, this.endpointConfig.signingDomain);
        const payload = await (0, onboarding_1.getSubAccountCreationPayload)(accountIndex, wallet.address, keyPair, finalDescription, this.endpointConfig.onboardingUrl);
        const headers = {
            [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
            [L1_MESSAGE_TIME_HEADER]: authTimeString,
        };
        const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
        try {
            const onboardingResponse = await (0, http_1.sendPostRequest)(url, payload.toJson(), undefined, headers, new Map([[409, errors_1.SubAccountExists]]));
            const onboardedAccount = onboardingResponse.data;
            if (!onboardedAccount) {
                throw new Error('No account data returned from onboarding');
            }
            return {
                account: onboardedAccount,
                l2KeyPair: keyPair,
            };
        }
        catch (error) {
            if (error instanceof errors_1.SubAccountExists) {
                const clientAccounts = await this.getAccounts();
                const accountWithIndex = clientAccounts.find((acc) => acc.account.accountIndex === accountIndex);
                if (!accountWithIndex) {
                    throw new errors_1.SubAccountExists('Subaccount already exists but not found in client accounts');
                }
                return accountWithIndex;
            }
            throw error;
        }
    }
    /**
     * Get all accounts
     */
    async getAccounts() {
        const requestPath = '/api/v1/user/accounts';
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const time = (0, date_1.utcNow)();
        const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const l1Message = `${requestPath}@${authTimeString}`;
        const l1Signature = await wallet.signMessage(l1Message);
        const headers = {
            [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
            [L1_MESSAGE_TIME_HEADER]: authTimeString,
        };
        const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
        const response = await (0, http_1.sendGetRequest)(url, undefined, headers);
        const accounts = response.data || [];
        const result = [];
        for (const account of accounts) {
            const keyPair = await (0, onboarding_1.getL2KeysFromL1Account)(this.l1PrivateKey(), account.accountIndex, this.endpointConfig.signingDomain);
            result.push({
                account,
                l2KeyPair: keyPair,
            });
        }
        return result;
    }
    /**
     * Create account API key
     */
    async createAccountApiKey(account, description) {
        const requestPath = '/api/v1/user/account/api-key';
        const finalDescription = description || `trading api key for account ${account.id}`;
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const time = (0, date_1.utcNow)();
        const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const l1Message = `${requestPath}@${authTimeString}`;
        const l1Signature = await wallet.signMessage(l1Message);
        const headers = {
            [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
            [L1_MESSAGE_TIME_HEADER]: authTimeString,
            [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
        };
        const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
        const request = new accounts_1.ApiKeyRequestModel(finalDescription);
        const response = await (0, http_1.sendPostRequest)(url, request.toApiRequestJson(), undefined, headers);
        const responseData = response.data;
        if (!responseData) {
            throw new Error('No API key data returned from onboarding');
        }
        return responseData.key;
    }
    /**
     * Delete account API key
     * https://api.docs.extended.exchange/#delete-api-key
     */
    async deleteAccountApiKey(account, apiKeyId) {
        const requestPath = `/api/v1/user/account/api-key/${apiKeyId}`;
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const time = (0, date_1.utcNow)();
        const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const l1Message = `${requestPath}@${authTimeString}`;
        const l1Signature = await wallet.signMessage(l1Message);
        const headers = {
            [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
            [L1_MESSAGE_TIME_HEADER]: authTimeString,
            [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
        };
        const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
        await (0, http_1.sendDeleteRequest)(url, undefined, headers);
    }
    /**
     * Get list of account API keys
     * https://api.docs.extended.exchange/#get-api-keys
     */
    async getAccountApiKeys(account) {
        const requestPath = '/api/v1/user/account/api-key';
        const wallet = new ethers_1.ethers.Wallet(this.l1PrivateKey());
        const time = (0, date_1.utcNow)();
        const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
        const l1Message = `${requestPath}@${authTimeString}`;
        const l1Signature = await wallet.signMessage(l1Message);
        const headers = {
            [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
            [L1_MESSAGE_TIME_HEADER]: authTimeString,
            [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
        };
        const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
        const response = await (0, http_1.sendGetRequest)(url, undefined, headers);
        return response.data || [];
    }
}
exports.UserClient = UserClient;
//# sourceMappingURL=user-client.js.map