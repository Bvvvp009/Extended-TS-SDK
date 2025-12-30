/* tslint:disable */
/* eslint-disable */
/**
 * Initialize the WASM module
 */
export function init(): void;
/**
 * Sign a message hash with a private key
 * 
 * # Arguments
 * * `private_key` - Private key as hex string (e.g., "0x123...")
 * * `msg_hash` - Message hash as hex string (e.g., "0x456...")
 * 
 * # Returns
 * Array of two hex strings: [r, s]
 */
export function sign(private_key: string, msg_hash: string): string[];
/**
 * Compute Pedersen hash of two field elements
 * 
 * # Arguments
 * * `a` - First field element as hex string
 * * `b` - Second field element as hex string
 * 
 * # Returns
 * Hash result as hex string
 */
export function pedersen_hash(a: string, b: string): string;
/**
 * Generate Stark keypair from Ethereum signature
 * 
 * This function derives a Stark keypair from an Ethereum signature.
 * Uses the exact implementation compatible with Extended Exchange API.
 * 
 * # Arguments
 * * `eth_signature` - Ethereum signature as hex string (65 bytes: r(32) + s(32) + v(1))
 * 
 * # Returns
 * Array of two hex strings: [private_key, public_key]
 */
export function generate_keypair_from_eth_signature(eth_signature: string): string[];
/**
 * Get order message hash
 * 
 * Computes the structured hash for an order according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 */
export function get_order_msg_hash(position_id: bigint, base_asset_id: string, base_amount: string, quote_asset_id: string, quote_amount: string, fee_amount: string, fee_asset_id: string, expiration: bigint, salt: bigint, user_public_key: string, domain_name: string, domain_version: string, domain_chain_id: string, domain_revision: string): string;
/**
 * Get transfer message hash
 * 
 * Computes the structured hash for a transfer according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 */
export function get_transfer_msg_hash(recipient_position_id: bigint, sender_position_id: bigint, amount: string, expiration: bigint, salt: string, user_public_key: string, domain_name: string, domain_version: string, domain_chain_id: string, domain_revision: string, collateral_id: string): string;
/**
 * Get withdrawal message hash
 * 
 * Computes the structured hash for a withdrawal according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 */
export function get_withdrawal_msg_hash(recipient_hex: string, position_id: bigint, amount: string, expiration: bigint, salt: string, user_public_key: string, domain_name: string, domain_version: string, domain_chain_id: string, domain_revision: string, collateral_id: string): string;
export function main(): void;
