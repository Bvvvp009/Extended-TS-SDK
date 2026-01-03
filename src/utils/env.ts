/**
 * Environment variable utilities
 */

/**
 * Get environment variable or throw error
 */
export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set in environment variables`);
  }
  return value;
}

/**
 * Get environment variable or return default
 */
export function getEnvOptional(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(name: string): number {
  const value = getEnv(name);
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }
  return num;
}

/**
 * Get environment variable as number or return default
 */
export function getEnvNumberOptional(name: string, defaultValue?: number): number | undefined {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`${name} must be a valid number, got: ${value}`);
  }
  return num;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(name: string): boolean {
  const value = getEnv(name).toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get environment variable as boolean or return default
 */
export function getEnvBooleanOptional(name: string, defaultValue?: boolean): boolean | undefined {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  const lowerValue = value.toLowerCase();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
}

/**
 * Load environment variables from .env.local (if exists)
 * Note: This requires dotenv package
 */
export function loadEnv(): void {
  try {
    const dotenv = require('dotenv');
    const path = require('path');
    const fs = require('fs');
    
    const possiblePaths = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env'),
      path.join(__dirname, '../../.env.local'),
      path.join(__dirname, '../../.env'),
    ];
    
    for (const envPath of possiblePaths) {
      if (fs.existsSync(envPath)) {
        const result = dotenv.config({ path: envPath });
        if (!result.error) {
          break;
        }
      }
    }
    
    // Also try default dotenv.config() which looks in current working directory
    dotenv.config();
  } catch (error) {
    // dotenv not installed, skip
  }
}

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
export function getX10EnvConfig(requirePrivateApi: boolean = true): X10EnvConfig {
  loadEnv();

  // Support both X10_* and alternative naming conventions
  const apiKey = process.env.X10_API_KEY || process.env.API_KEY;
  const publicKey = process.env.X10_PUBLIC_KEY || process.env.X10_Stark_Key_Public || process.env.Stark_Key_Public;
  const privateKey = process.env.X10_PRIVATE_KEY || process.env.X10_Stark_Key_Private || process.env.Stark_Key_Private;
  const vaultId = process.env.X10_VAULT_ID || process.env.X10_Vault_Number || process.env.Vault_Number;
  const builderId = process.env.X10_BUILDER_ID || process.env.X10_Client_ID || process.env.Client_ID;
  const l1PrivateKey = process.env.L1_PRIVATE_KEY;
  const environment = (process.env.ENVIRONMENT || 'testnet') as 'testnet' | 'mainnet';

  if (requirePrivateApi) {
    if (!apiKey) throw new Error('API_KEY or X10_API_KEY is not set');
    if (!publicKey) throw new Error('Stark_Key_Public or X10_PUBLIC_KEY is not set');
    if (!privateKey) throw new Error('Stark_Key_Private or X10_PRIVATE_KEY is not set');
    if (!vaultId) throw new Error('Vault_Number or X10_VAULT_ID is not set');

    // Ensure keys have 0x prefix
    const normalizedPublicKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
    const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    if (!normalizedPublicKey.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error('Public key must be a valid hex string');
    }
    if (!normalizedPrivateKey.match(/^0x[0-9a-fA-F]+$/)) {
      throw new Error('Private key must be a valid hex string');
    }

    return {
      apiKey: apiKey,
      publicKey: normalizedPublicKey,
      privateKey: normalizedPrivateKey,
      vaultId: parseInt(vaultId, 10),
      builderId: builderId ? parseInt(builderId, 10) : undefined,
      l1PrivateKey: l1PrivateKey || undefined,
      environment,
    };
  }

  return {
    apiKey: apiKey || '',
    publicKey: publicKey ? (publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`) : '',
    privateKey: privateKey ? (privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`) : '',
    vaultId: vaultId ? parseInt(vaultId, 10) : 0,
    builderId: builderId ? parseInt(builderId, 10) : undefined,
    l1PrivateKey: l1PrivateKey || undefined,
    environment,
  };
}

