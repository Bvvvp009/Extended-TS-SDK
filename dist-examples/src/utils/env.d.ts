/**
 * Environment variable utilities
 */
/**
 * Get environment variable or throw error
 */
export declare function getEnv(name: string): string;
/**
 * Get environment variable or return default
 */
export declare function getEnvOptional(name: string, defaultValue?: string): string | undefined;
/**
 * Get environment variable as number
 */
export declare function getEnvNumber(name: string): number;
/**
 * Get environment variable as number or return default
 */
export declare function getEnvNumberOptional(name: string, defaultValue?: number): number | undefined;
/**
 * Get environment variable as boolean
 */
export declare function getEnvBoolean(name: string): boolean;
/**
 * Get environment variable as boolean or return default
 */
export declare function getEnvBooleanOptional(name: string, defaultValue?: boolean): boolean | undefined;
/**
 * Load environment variables from .env.local (if exists)
 * Note: This requires dotenv package
 */
export declare function loadEnv(): void;
/**
 * X10 SDK environment configuration
 */
export interface X10EnvConfig {
    apiKey: string;
    publicKey: string;
    privateKey: string;
    vaultId: number;
    builderId?: number;
    l1PrivateKey?: string;
    environment?: 'testnet' | 'mainnet';
}
/**
 * Get X10 SDK environment configuration
 * Supports both X10_* and alternative naming conventions
 */
export declare function getX10EnvConfig(requirePrivateApi?: boolean): X10EnvConfig;
//# sourceMappingURL=env.d.ts.map