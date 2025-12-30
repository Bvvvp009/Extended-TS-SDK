/**
 * Onboarding logic for deriving L2 keys from L1 Ethereum account
 */
import { AccountModel } from '../accounts';
import { X10BaseModel } from '../../utils/model';
/**
 * Stark key pair
 */
export declare class StarkKeyPair {
    private: bigint;
    public: bigint;
    constructor(privateKey: bigint, publicKey: bigint);
    get publicHex(): string;
    get privateHex(): string;
}
/**
 * Onboarded client model
 */
export declare class OnboardedClientModel extends X10BaseModel {
    l1Address: string;
    defaultAccount: AccountModel;
    constructor(l1Address: string, defaultAccount: AccountModel);
}
/**
 * On-boarded account
 */
export interface OnBoardedAccount {
    account: AccountModel;
    l2KeyPair: StarkKeyPair;
}
/**
 * Account registration
 */
export declare class AccountRegistration {
    accountIndex: number;
    wallet: string;
    tosAccepted: boolean;
    time: Date;
    action: string;
    host: string;
    constructor(accountIndex: number, wallet: string, tosAccepted: boolean, time: Date, action: string, host: string);
    get timeString(): string;
    /**
     * Convert to EIP-712 signable message
     */
    toSignableMessage(signingDomain: string): {
        domain: any;
        types: any;
        message: any;
        primaryType?: string;
    };
    toJson(): Record<string, any>;
}
/**
 * Onboarding payload
 */
export declare class OnboardingPayLoad {
    l1Signature: string;
    l2Key: bigint;
    l2R: bigint;
    l2S: bigint;
    accountRegistration: AccountRegistration;
    referralCode?: string;
    constructor(l1Signature: string, l2Key: bigint, l2R: bigint, l2S: bigint, accountRegistration: AccountRegistration, referralCode?: string);
    toJson(): Record<string, any>;
}
/**
 * Sub-account onboarding payload
 */
export declare class SubAccountOnboardingPayload {
    l2Key: bigint;
    l2R: bigint;
    l2S: bigint;
    accountRegistration: AccountRegistration;
    description: string;
    constructor(l2Key: bigint, l2R: bigint, l2S: bigint, accountRegistration: AccountRegistration, description: string);
    toJson(): Record<string, any>;
}
export declare const REGISTER_ACTION = "REGISTER";
export declare const SUB_ACCOUNT_ACTION = "CREATE_SUB_ACCOUNT";
/**
 * Get registration struct to sign
 */
export declare function getRegistrationStructToSign(accountIndex: number, address: string, timestamp: Date, action: string, host: string): AccountRegistration;
/**
 * Get key derivation struct to sign (EIP-712)
 */
export declare function getKeyDerivationStructToSign(accountIndex: number, address: string, signingDomain: string): any;
/**
 * Get L2 keys from L1 account
 */
export declare function getL2KeysFromL1Account(l1PrivateKey: string, accountIndex: number, signingDomain: string): Promise<StarkKeyPair>;
/**
 * Get onboarding payload
 */
export declare function getOnboardingPayload(l1PrivateKey: string, signingDomain: string, keyPair: StarkKeyPair, host: string, referralCode?: string, time?: Date): Promise<OnboardingPayLoad>;
/**
 * Get sub-account creation payload
 */
export declare function getSubAccountCreationPayload(accountIndex: number, l1Address: string, keyPair: StarkKeyPair, description: string, host: string, time?: Date): Promise<SubAccountOnboardingPayload>;
//# sourceMappingURL=onboarding.d.ts.map