"use strict";
/**
 * Onboarding logic for deriving L2 keys from L1 Ethereum account
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUB_ACCOUNT_ACTION = exports.REGISTER_ACTION = exports.SubAccountOnboardingPayload = exports.OnboardingPayLoad = exports.AccountRegistration = exports.OnboardedClientModel = exports.StarkKeyPair = void 0;
exports.getRegistrationStructToSign = getRegistrationStructToSign;
exports.getKeyDerivationStructToSign = getKeyDerivationStructToSign;
exports.getL2KeysFromL1Account = getL2KeysFromL1Account;
exports.getOnboardingPayload = getOnboardingPayload;
exports.getSubAccountCreationPayload = getSubAccountCreationPayload;
const ethers_1 = require("ethers");
const model_1 = require("../../utils/model");
const signer_1 = require("../crypto/signer");
/**
 * Stark key pair
 */
class StarkKeyPair {
    private;
    public;
    constructor(privateKey, publicKey) {
        this.private = privateKey;
        this.public = publicKey;
    }
    get publicHex() {
        return '0x' + this.public.toString(16);
    }
    get privateHex() {
        return '0x' + this.private.toString(16);
    }
}
exports.StarkKeyPair = StarkKeyPair;
/**
 * Onboarded client model
 */
class OnboardedClientModel extends model_1.X10BaseModel {
    l1Address;
    defaultAccount;
    constructor(l1Address, defaultAccount) {
        super();
        this.l1Address = l1Address;
        this.defaultAccount = defaultAccount;
    }
}
exports.OnboardedClientModel = OnboardedClientModel;
/**
 * Account registration
 */
class AccountRegistration {
    accountIndex;
    wallet;
    tosAccepted;
    time;
    action;
    host;
    constructor(accountIndex, wallet, tosAccepted, time, action, host) {
        this.accountIndex = accountIndex;
        this.wallet = wallet;
        this.tosAccepted = tosAccepted;
        this.time = time;
        this.action = action;
        this.host = host;
    }
    get timeString() {
        return this.time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }
    /**
     * Convert to EIP-712 signable message
     */
    toSignableMessage(signingDomain) {
        const domain = {
            name: signingDomain,
        };
        // Ethers v6 expects types without EIP712Domain included
        const types = {
            AccountRegistration: [
                { name: 'accountIndex', type: 'int8' },
                { name: 'wallet', type: 'address' },
                { name: 'tosAccepted', type: 'bool' },
                { name: 'time', type: 'string' },
                { name: 'action', type: 'string' },
                { name: 'host', type: 'string' },
            ],
        };
        const message = {
            accountIndex: this.accountIndex,
            wallet: this.wallet,
            tosAccepted: this.tosAccepted,
            time: this.timeString,
            action: this.action,
            host: this.host,
        };
        return {
            domain,
            types: types,
            primaryType: 'AccountRegistration',
            message,
        };
    }
    toJson() {
        return {
            accountIndex: this.accountIndex,
            wallet: this.wallet,
            tosAccepted: this.tosAccepted,
            time: this.timeString,
            action: this.action,
            host: this.host,
        };
    }
}
exports.AccountRegistration = AccountRegistration;
/**
 * Onboarding payload
 */
class OnboardingPayLoad {
    l1Signature;
    l2Key;
    l2R;
    l2S;
    accountRegistration;
    referralCode;
    constructor(l1Signature, l2Key, l2R, l2S, accountRegistration, referralCode) {
        this.l1Signature = l1Signature;
        this.l2Key = l2Key;
        this.l2R = l2R;
        this.l2S = l2S;
        this.accountRegistration = accountRegistration;
        this.referralCode = referralCode;
    }
    toJson() {
        return {
            l1Signature: this.l1Signature,
            l2Key: '0x' + this.l2Key.toString(16),
            l2Signature: {
                r: '0x' + this.l2R.toString(16),
                s: '0x' + this.l2S.toString(16),
            },
            accountCreation: this.accountRegistration.toJson(),
            referralCode: this.referralCode,
        };
    }
}
exports.OnboardingPayLoad = OnboardingPayLoad;
/**
 * Sub-account onboarding payload
 */
class SubAccountOnboardingPayload {
    l2Key;
    l2R;
    l2S;
    accountRegistration;
    description;
    constructor(l2Key, l2R, l2S, accountRegistration, description) {
        this.l2Key = l2Key;
        this.l2R = l2R;
        this.l2S = l2S;
        this.accountRegistration = accountRegistration;
        this.description = description;
    }
    toJson() {
        return {
            l2Key: '0x' + this.l2Key.toString(16),
            l2Signature: {
                r: '0x' + this.l2R.toString(16),
                s: '0x' + this.l2S.toString(16),
            },
            accountCreation: this.accountRegistration.toJson(),
            description: this.description,
        };
    }
}
exports.SubAccountOnboardingPayload = SubAccountOnboardingPayload;
exports.REGISTER_ACTION = 'REGISTER';
exports.SUB_ACCOUNT_ACTION = 'CREATE_SUB_ACCOUNT';
/**
 * Get registration struct to sign
 */
function getRegistrationStructToSign(accountIndex, address, timestamp, action, host) {
    return new AccountRegistration(accountIndex, address, true, timestamp, action, host);
}
/**
 * Get key derivation struct to sign (EIP-712)
 */
function getKeyDerivationStructToSign(accountIndex, address, signingDomain) {
    const domain = {
        name: signingDomain,
    };
    // Ethers v6 expects types without EIP712Domain included
    const types = {
        AccountCreation: [
            { name: 'accountIndex', type: 'int8' },
            { name: 'wallet', type: 'address' },
            { name: 'tosAccepted', type: 'bool' },
        ],
    };
    const message = {
        accountIndex,
        wallet: address,
        tosAccepted: true,
    };
    return {
        domain,
        types,
        primaryType: 'AccountCreation',
        message,
    };
}
/**
 * Get L2 keys from L1 account
 */
async function getL2KeysFromL1Account(l1PrivateKey, accountIndex, signingDomain) {
    const wallet = new ethers_1.ethers.Wallet(l1PrivateKey);
    const struct = getKeyDerivationStructToSign(accountIndex, wallet.address, signingDomain);
    // Sign with ethers.js EIP-712
    const signature = await wallet.signTypedData(struct.domain, struct.types, struct.message);
    // Generate keypair from Ethereum signature using WASM
    const [privateKey, publicKey] = (0, signer_1.generateKeypairFromEthSignature)(signature);
    return new StarkKeyPair(privateKey, publicKey);
}
/**
 * Get onboarding payload
 */
async function getOnboardingPayload(l1PrivateKey, signingDomain, keyPair, host, referralCode, time) {
    const wallet = new ethers_1.ethers.Wallet(l1PrivateKey);
    const timestamp = time || new Date();
    const registrationPayload = getRegistrationStructToSign(0, wallet.address, timestamp, exports.REGISTER_ACTION, host);
    const signableMessage = registrationPayload.toSignableMessage(signingDomain);
    const l1Signature = await wallet.signTypedData(signableMessage.domain, signableMessage.types, signableMessage.message);
    // L2 message: pedersen_hash(l1_address, l2_public_key)
    const l1AddressInt = BigInt(wallet.address);
    const l2Message = (0, signer_1.pedersenHash)(l1AddressInt, keyPair.public);
    const [l2R, l2S] = (0, signer_1.sign)(keyPair.private, l2Message);
    return new OnboardingPayLoad(l1Signature, keyPair.public, l2R, l2S, registrationPayload, referralCode);
}
/**
 * Get sub-account creation payload
 */
async function getSubAccountCreationPayload(accountIndex, l1Address, keyPair, description, host, time) {
    const timestamp = time || new Date();
    const registrationPayload = getRegistrationStructToSign(accountIndex, l1Address, timestamp, exports.SUB_ACCOUNT_ACTION, host);
    // L2 message: pedersen_hash(l1_address, l2_public_key)
    const l1AddressInt = BigInt(l1Address);
    const l2Message = (0, signer_1.pedersenHash)(l1AddressInt, keyPair.public);
    const [l2R, l2S] = (0, signer_1.sign)(keyPair.private, l2Message);
    return new SubAccountOnboardingPayload(keyPair.public, l2R, l2S, registrationPayload, description);
}
//# sourceMappingURL=onboarding.js.map