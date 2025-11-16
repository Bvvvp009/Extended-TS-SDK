//! Stark Crypto WASM Module
//! 
//! This module provides WebAssembly bindings for StarkNet cryptographic operations.
//! Implements cryptographic algorithms compatible with Extended Exchange API.

use wasm_bindgen::prelude::*;
use starknet_crypto::{FieldElement, pedersen_hash as starknet_pedersen_hash, get_public_key, PoseidonHasher};
use num_bigint::BigUint;
use sha2::{Sha256, Digest};
use std::str::FromStr;

// We reimplement the exact algorithms from rust-crypto-lib-base
// using WASM-compatible types for full parity
// 
// KNOWN ISSUE: ecdsa_sign from starknet crate uses modified ECDSA algorithm
// that produces different s values than standard ECDSA (starknet_crypto::sign)
// Since starknet crate is not WASM-compatible, we use starknet_crypto::sign
// which produces correct r but different s values

/// Initialize the WASM module
#[wasm_bindgen]
pub fn init() {
    // WASM initialization - currently no-op
}

/// Grind key using exact algorithm from rust-crypto-lib-base
/// Uses SHA-256 (not Keccak!) for exact parity
fn grind_key(key_seed: BigUint) -> BigUint {
    let two_256 = BigUint::from_str(
        "115792089237316195423570985008687907853269984665640564039457584007913129639936",
    )
    .unwrap();
    let key_value_limit = BigUint::from_str(
        "3618502788666131213697322783095070105526743751716087489154079457884512865583",
    )
    .unwrap();

    let max_allowed_value = two_256.clone() - (two_256.clone() % (&key_value_limit));
    let mut index = BigUint::ZERO;
    loop {
        let hash_input = {
            let mut input = Vec::new();
            input.extend_from_slice(&key_seed.to_bytes_be());
            input.extend_from_slice(&index.to_bytes_be());
            input
        };
        let hash_result = Sha256::digest(&hash_input);
        let hash = hash_result.as_slice();
        let key = BigUint::from_bytes_be(hash);

        if key < max_allowed_value {
            return key % (&key_value_limit);
        }

        index += BigUint::from(1u32);
    }
}

/// Get private key from Ethereum signature using exact algorithm from rust-crypto-lib-base
fn get_private_key_from_eth_signature_internal(signature: &str) -> Result<FieldElement, String> {
    let eth_sig_truncated = signature.trim_start_matches("0x");
    if eth_sig_truncated.len() < 64 {
        return Err("Invalid signature length".to_string());
    }
    let r = &eth_sig_truncated[..64];
    let r_bytes = hex::decode(r).map_err(|e| format!("Failed to decode r as hex: {:?}", e))?;
    let r_int = BigUint::from_bytes_be(&r_bytes);

    let ground_key = grind_key(r_int);
    let key_hex = ground_key.to_str_radix(16);
    FieldElement::from_hex_be(&key_hex)
        .map_err(|e| format!("Failed to convert ground key to FieldElement: {:?}", e))
}

/// Sign a message hash with a private key
/// 
/// # Arguments
/// * `private_key` - Private key as hex string (e.g., "0x123...")
/// * `msg_hash` - Message hash as hex string (e.g., "0x456...")
/// 
/// # Returns
/// Array of two hex strings: [r, s]
#[wasm_bindgen]
pub fn sign(private_key: &str, msg_hash: &str) -> Vec<String> {
    let priv_key_clean = private_key.strip_prefix("0x").unwrap_or(private_key);
    let hash_clean = msg_hash.strip_prefix("0x").unwrap_or(msg_hash);
    
    let priv_key = FieldElement::from_hex_be(priv_key_clean)
        .expect("Invalid private key format");
    let hash = FieldElement::from_hex_be(hash_clean)
        .expect("Invalid message hash format");
    
    // Use RFC6979 deterministic signing (matching ecdsa_sign from starknet crate)
    // Note: ecdsa_sign from starknet crate uses RFC6979 internally
    // The issue is that starknet_crypto::sign produces different s values than ecdsa_sign
    // even though r matches (meaning k is correct)
    let k = starknet_crypto::rfc6979_generate_k(&priv_key, &hash, None);
    
    // Get r from the signature (we know this matches ecdsa_sign)
    let temp_sig = starknet_crypto::sign(&priv_key, &hash, &k)
        .expect("Failed to sign message");
    let r = temp_sig.r;
    
    // Manually calculate s using the exact ECDSA formula with num-bigint
    // Standard ECDSA: s = k^(-1) * (hash + r * priv_key) mod n
    // Convert FieldElements to BigUint for modular arithmetic
    let curve_order = BigUint::from_str(
        "3618502788666131213697322783095070105526743751716087489154079457884512865583"
    ).unwrap();
    
    // Convert FieldElements to BigUint
    let k_bytes = k.to_bytes_be();
    let r_bytes = r.to_bytes_be();
    let hash_bytes = hash.to_bytes_be();
    let priv_bytes = priv_key.to_bytes_be();
    
    let k_big = BigUint::from_bytes_be(&k_bytes);
    let r_big = BigUint::from_bytes_be(&r_bytes);
    let hash_big = BigUint::from_bytes_be(&hash_bytes);
    let priv_big = BigUint::from_bytes_be(&priv_bytes);
    
    // Try to match ecdsa_sign's modified ECDSA algorithm
    // Standard ECDSA: s = k^(-1) * (hash + r * priv_key) mod n
    // ecdsa_sign might use a different formula to match Cairo's modified verification
    
    // Test different formula variations:
    // 1. Standard: s = k^(-1) * (hash + r * priv_key) mod n
    // 2. Alternative: s = (hash * k^(-1) + r * priv_key) mod n
    // 3. Alternative: s = k^(-1) * hash + r * priv_key mod n (no grouping)
    
    // Try formula that might match Cairo's verification:
    // If verification uses: verify = (s * k - hash) / r == priv_key mod n
    // Then signing might be: s = (hash + r * priv_key) / k mod n
    // But this is mathematically equivalent to standard ECDSA...
    
    // Actually, let's try: s = (hash + r * priv_key) * k^(-1) mod n
    // (same as standard, but let's ensure correct order)
    let r_times_priv = (&r_big * &priv_big) % &curve_order;
    let hash_plus_r_priv = (&hash_big + &r_times_priv) % &curve_order;
    
    // Modular inverse: k^(-1) mod n
    let k_inv = k_big.modpow(&(&curve_order - BigUint::from(2u32)), &curve_order);
    
    // Standard formula: s = k_inv * (hash + r * priv_key) mod n
    let s_big = (&k_inv * &hash_plus_r_priv) % &curve_order;
    
    // NOTE: This produces the same s as starknet_crypto::sign
    // ecdsa_sign from starknet crate uses a modified ECDSA algorithm
    // 
    // Based on Cairo's modified verification, the signing might need adjustment.
    // However, since we can't access ecdsa_sign source and starknet crate
    // is not WASM-compatible, we use starknet_crypto::sign which uses standard ECDSA.
    //
    // The signatures will have correct r but different s values.
    // This is a known limitation until we can replicate ecdsa_sign's exact algorithm.
    
    // Convert back to FieldElement
    let s_hex = format!("{:x}", s_big);
    let s = FieldElement::from_hex_be(&s_hex)
        .expect("Failed to convert s back to FieldElement");
    
    vec![
        format!("0x{}", hex::encode(r.to_bytes_be())),
        format!("0x{}", hex::encode(s.to_bytes_be())),
    ]
}

/// Compute Pedersen hash of two field elements
/// 
/// # Arguments
/// * `a` - First field element as hex string
/// * `b` - Second field element as hex string
/// 
/// # Returns
/// Hash result as hex string
#[wasm_bindgen]
pub fn pedersen_hash(a: &str, b: &str) -> String {
    let a_clean = a.strip_prefix("0x").unwrap_or(a);
    let b_clean = b.strip_prefix("0x").unwrap_or(b);
    
    let a_field = FieldElement::from_hex_be(a_clean)
        .expect("Invalid field element a");
    let b_field = FieldElement::from_hex_be(b_clean)
        .expect("Invalid field element b");
    
    let result = starknet_pedersen_hash(&a_field, &b_field);
    let result_bytes = result.to_bytes_be();
    format!("0x{}", hex::encode(result_bytes))
}

/// Generate Stark keypair from Ethereum signature
/// 
/// This function derives a Stark keypair from an Ethereum signature.
/// Uses the exact implementation compatible with Extended Exchange API.
/// 
/// # Arguments
/// * `eth_signature` - Ethereum signature as hex string (65 bytes: r(32) + s(32) + v(1))
/// 
/// # Returns
/// Array of two hex strings: [private_key, public_key]
#[wasm_bindgen]
pub fn generate_keypair_from_eth_signature(eth_signature: &str) -> Vec<String> {
    let private_key = get_private_key_from_eth_signature_internal(eth_signature)
        .expect("Failed to derive private key from Ethereum signature");
    
    // Get public key from private key
    let public_key = get_public_key(&private_key);
    
    vec![
        format!("0x{}", hex::encode(private_key.to_bytes_be())),
        format!("0x{}", hex::encode(public_key.to_bytes_be())),
    ]
}

// Helper: Convert Cairo short string to FieldElement
// Cairo short strings are up to 31 characters, encoded as big-endian bytes
fn cairo_short_string_to_felt(s: &str) -> Result<FieldElement, String> {
    if s.len() > 31 {
        return Err("String too long for Cairo short string (max 31 chars)".to_string());
    }
    let bytes = s.as_bytes();
    let mut felt_bytes = [0u8; 32];
    felt_bytes[32 - bytes.len()..].copy_from_slice(bytes);
    FieldElement::from_bytes_be(&felt_bytes)
        .map_err(|e| format!("Failed to convert string to FieldElement: {:?}", e))
}

// Helper: Convert i64 to FieldElement (handles negative numbers)
fn i64_to_felt(value: i64) -> FieldElement {
    if value >= 0 {
        FieldElement::from(value as u64)
    } else {
        let pos = FieldElement::from((-value) as u64);
        let zero = FieldElement::from(0u8);
        zero - pos
    }
}

// Constants from rust-crypto-lib-base (hardcoded SELECTOR values)
const STARKNET_DOMAIN_SELECTOR: &str = "0x1ff2f602e42168014d405a94f75e8a93d640751d71d16311266e140d8b0a210";
const ORDER_SELECTOR: &str = "0x36da8d51815527cabfaa9c982f564c80fa7429616739306036f1f9b608dd112";
const TRANSFER_ARGS_SELECTOR: &str = "0x1db88e2709fdf2c59e651d141c3296a42b209ce770871b40413ea109846a3b4";
const WITHDRAWAL_ARGS_SELECTOR: &str = "0x250a5fa378e8b771654bd43dcb34844534f9d1e29e16b14760d7936ea7f4b1d";

/// Hash StarknetDomain using Poseidon
fn hash_starknet_domain(
    name: &str,
    version: &str,
    chain_id: &str,
    revision: u32,
) -> Result<FieldElement, String> {
    let selector = FieldElement::from_hex_be(STARKNET_DOMAIN_SELECTOR.strip_prefix("0x").unwrap())
        .map_err(|e| format!("Invalid domain selector: {:?}", e))?;
    let name_felt = cairo_short_string_to_felt(name)?;
    let version_felt = cairo_short_string_to_felt(version)?;
    let chain_id_felt = cairo_short_string_to_felt(chain_id)?;
    let revision_felt = FieldElement::from(revision);
    
    let mut hasher = PoseidonHasher::new();
    hasher.update(selector);
    hasher.update(name_felt);
    hasher.update(version_felt);
    hasher.update(chain_id_felt);
    hasher.update(revision_felt);
    Ok(hasher.finalize())
}

/// Get order message hash
/// 
/// Computes the structured hash for an order according to StarkEx protocol.
/// Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
#[wasm_bindgen]
pub fn get_order_msg_hash(
    position_id: u64,
    base_asset_id: &str,
    base_amount: &str,
    quote_asset_id: &str,
    quote_amount: &str,
    fee_amount: &str,
    fee_asset_id: &str,
    expiration: u64,
    salt: u64,
    user_public_key: &str,
    domain_name: &str,
    domain_version: &str,
    domain_chain_id: &str,
    domain_revision: &str,
) -> String {
    // Parse inputs
    let position_id_u32 = position_id as u32;
    let base_asset_id_felt = FieldElement::from_hex_be(base_asset_id.strip_prefix("0x").unwrap_or(base_asset_id))
        .expect("Invalid base_asset_id");
    let base_amount_i64 = i64::from_str_radix(base_amount, 10)
        .expect("Invalid base_amount");
    let quote_asset_id_felt = FieldElement::from_hex_be(quote_asset_id.strip_prefix("0x").unwrap_or(quote_asset_id))
        .expect("Invalid quote_asset_id");
    let quote_amount_i64 = i64::from_str_radix(quote_amount, 10)
        .expect("Invalid quote_amount");
    let fee_asset_id_felt = FieldElement::from_hex_be(fee_asset_id.strip_prefix("0x").unwrap_or(fee_asset_id))
        .expect("Invalid fee_asset_id");
    let fee_amount_u64 = u64::from_str_radix(fee_amount, 10)
        .expect("Invalid fee_amount");
    let salt_felt = FieldElement::from(salt);
    let user_key_felt = FieldElement::from_hex_be(user_public_key.strip_prefix("0x").unwrap_or(user_public_key))
        .expect("Invalid user_public_key");
    let revision_u32 = u32::from_str_radix(domain_revision, 10)
        .expect("Invalid domain_revision");
    
    // Hash the order struct
    let order_selector = FieldElement::from_hex_be(ORDER_SELECTOR.strip_prefix("0x").unwrap())
        .expect("Invalid order selector");
    let mut order_hasher = PoseidonHasher::new();
    order_hasher.update(order_selector);
    order_hasher.update(FieldElement::from(position_id_u32));
    order_hasher.update(base_asset_id_felt);
    order_hasher.update(i64_to_felt(base_amount_i64));
    order_hasher.update(quote_asset_id_felt);
    order_hasher.update(i64_to_felt(quote_amount_i64));
    order_hasher.update(fee_asset_id_felt);
    order_hasher.update(FieldElement::from(fee_amount_u64));
    order_hasher.update(FieldElement::from(expiration));
    order_hasher.update(salt_felt);
    let order_hash = order_hasher.finalize();
    
    // Hash the domain
    let domain_hash = hash_starknet_domain(domain_name, domain_version, domain_chain_id, revision_u32)
        .expect("Failed to hash domain");
    
    // Compute final message hash: Poseidon(MESSAGE_FELT, domain_hash, user_key, order_hash)
    let message_felt = cairo_short_string_to_felt("StarkNet Message").expect("Invalid MESSAGE_FELT");
    let mut msg_hasher = PoseidonHasher::new();
    msg_hasher.update(message_felt);
    msg_hasher.update(domain_hash);
    msg_hasher.update(user_key_felt);
    msg_hasher.update(order_hash);
    let result = msg_hasher.finalize();
    // Convert to minimal hex without leading zero padding
    {
        let n = BigUint::from_bytes_be(&result.to_bytes_be());
        let hx = n.to_str_radix(16);
        let prefixed = if hx.is_empty() { "0".to_string() } else { hx };
        format!("0x{}", prefixed)
    }
}

/// Get transfer message hash
/// 
/// Computes the structured hash for a transfer according to StarkEx protocol.
/// Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
#[wasm_bindgen]
pub fn get_transfer_msg_hash(
    recipient_position_id: u64,
    sender_position_id: u64,
    amount: &str,
    expiration: u64,
    salt: &str,
    user_public_key: &str,
    domain_name: &str,
    domain_version: &str,
    domain_chain_id: &str,
    domain_revision: &str,
    collateral_id: &str,
) -> String {
    // Parse inputs
    let recipient = recipient_position_id as u32;
    let position_id = sender_position_id as u32;
    let amount_u64 = u64::from_str_radix(amount, 10)
        .expect("Invalid amount");
    let salt_felt = FieldElement::from_dec_str(salt)
        .expect("Invalid salt");
    let collateral_id_felt = FieldElement::from_hex_be(collateral_id.strip_prefix("0x").unwrap_or(collateral_id))
        .expect("Invalid collateral_id");
    let user_key_felt = FieldElement::from_hex_be(user_public_key.strip_prefix("0x").unwrap_or(user_public_key))
        .expect("Invalid user_public_key");
    let revision_u32 = u32::from_str_radix(domain_revision, 10)
        .expect("Invalid domain_revision");
    
    // Hash the transfer struct
    let transfer_selector = FieldElement::from_hex_be(TRANSFER_ARGS_SELECTOR.strip_prefix("0x").unwrap())
        .expect("Invalid transfer selector");
    let mut transfer_hasher = PoseidonHasher::new();
    transfer_hasher.update(transfer_selector);
    transfer_hasher.update(FieldElement::from(recipient));
    transfer_hasher.update(FieldElement::from(position_id));
    transfer_hasher.update(collateral_id_felt);
    transfer_hasher.update(FieldElement::from(amount_u64));
    transfer_hasher.update(FieldElement::from(expiration));
    transfer_hasher.update(salt_felt);
    let transfer_hash = transfer_hasher.finalize();
    
    // Hash the domain
    let domain_hash = hash_starknet_domain(domain_name, domain_version, domain_chain_id, revision_u32)
        .expect("Failed to hash domain");
    
    // Compute final message hash: Poseidon(MESSAGE_FELT, domain_hash, user_key, transfer_hash)
    let message_felt = cairo_short_string_to_felt("StarkNet Message").expect("Invalid MESSAGE_FELT");
    let mut msg_hasher = PoseidonHasher::new();
    msg_hasher.update(message_felt);
    msg_hasher.update(domain_hash);
    msg_hasher.update(user_key_felt);
    msg_hasher.update(transfer_hash);
    let result = msg_hasher.finalize();
    {
        let n = BigUint::from_bytes_be(&result.to_bytes_be());
        let hx = n.to_str_radix(16);
        let prefixed = if hx.is_empty() { "0".to_string() } else { hx };
        format!("0x{}", prefixed)
    }
}

/// Get withdrawal message hash
/// 
/// Computes the structured hash for a withdrawal according to StarkEx protocol.
/// Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
#[wasm_bindgen]
pub fn get_withdrawal_msg_hash(
    recipient_hex: &str,
    position_id: u64,
    amount: &str,
    expiration: u64,
    salt: &str,
    user_public_key: &str,
    domain_name: &str,
    domain_version: &str,
    domain_chain_id: &str,
    domain_revision: &str,
    collateral_id: &str,
) -> String {
    // Parse inputs
    let recipient_felt = FieldElement::from_hex_be(recipient_hex.strip_prefix("0x").unwrap_or(recipient_hex))
        .expect("Invalid recipient_hex");
    let position_id_u32 = position_id as u32;
    let amount_u64 = u64::from_str_radix(amount, 10)
        .expect("Invalid amount");
    let salt_felt = FieldElement::from_dec_str(salt)
        .expect("Invalid salt");
    let collateral_id_felt = FieldElement::from_hex_be(collateral_id.strip_prefix("0x").unwrap_or(collateral_id))
        .expect("Invalid collateral_id");
    let user_key_felt = FieldElement::from_hex_be(user_public_key.strip_prefix("0x").unwrap_or(user_public_key))
        .expect("Invalid user_public_key");
    let revision_u32 = u32::from_str_radix(domain_revision, 10)
        .expect("Invalid domain_revision");
    
    // Hash the withdrawal struct
    let withdrawal_selector = FieldElement::from_hex_be(WITHDRAWAL_ARGS_SELECTOR.strip_prefix("0x").unwrap())
        .expect("Invalid withdrawal selector");
    let mut withdrawal_hasher = PoseidonHasher::new();
    withdrawal_hasher.update(withdrawal_selector);
    withdrawal_hasher.update(recipient_felt);
    withdrawal_hasher.update(FieldElement::from(position_id_u32));
    withdrawal_hasher.update(collateral_id_felt);
    withdrawal_hasher.update(FieldElement::from(amount_u64));
    withdrawal_hasher.update(FieldElement::from(expiration));
    withdrawal_hasher.update(salt_felt);
    let withdrawal_hash = withdrawal_hasher.finalize();
    
    // Hash the domain
    let domain_hash = hash_starknet_domain(domain_name, domain_version, domain_chain_id, revision_u32)
        .expect("Failed to hash domain");
    
    // Compute final message hash: Poseidon(MESSAGE_FELT, domain_hash, user_key, withdrawal_hash)
    let message_felt = cairo_short_string_to_felt("StarkNet Message").expect("Invalid MESSAGE_FELT");
    let mut msg_hasher = PoseidonHasher::new();
    msg_hasher.update(message_felt);
    msg_hasher.update(domain_hash);
    msg_hasher.update(user_key_felt);
    msg_hasher.update(withdrawal_hash);
    let result = msg_hasher.finalize();
    {
        let n = BigUint::from_bytes_be(&result.to_bytes_be());
        let hx = n.to_str_radix(16);
        let prefixed = if hx.is_empty() { "0".to_string() } else { hx };
        format!("0x{}", prefixed)
    }
}

#[wasm_bindgen(start)]
pub fn main() {
    // WASM module initialization
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_order_msg_hash_parity() {
        let hex = get_order_msg_hash(
            100,
            "0x2",
            "100",
            "0x1",
            "-156",
            "74",
            "0x1",
            100,
            123,
            "0x5d05989e9302dcebc74e241001e3e3ac3f4402ccf2f8e6f74b034b07ad6a904",
            "Perpetuals",
            "v0",
            "SN_SEPOLIA",
            "1",
        );
        assert_eq!(
            hex.to_lowercase(),
            "0x4de4c009e0d0c5a70a7da0e2039fb2b99f376d53496f89d9f437e736add6b48".to_string()
        );
    }

    #[test]
    fn test_transfer_msg_hash_parity() {
        // user key from rust-crypto-lib-base tests (decimal to hex)
        let user_key_dec = "2629686405885377265612250192330550814166101744721025672593857097107510831364";
        let user_key_hex = format!("0x{:x}", BigUint::from_str(user_key_dec).unwrap());
        let hex = get_transfer_msg_hash(
            1,
            2,
            "4",
            5,
            "6",
            &user_key_hex,
            "Perpetuals",
            "v0",
            "SN_SEPOLIA",
            "1",
            "0x3",
        );
        assert_eq!(
            hex.to_lowercase(),
            "0x56c7b21d13b79a33d7700dda20e22246c25e89818249504148174f527fc3f8f".to_string()
        );
    }

    #[test]
    fn test_withdrawal_msg_hash_parity() {
        // recipient and collateral from rust-crypto-lib-base tests (decimal to hex)
        let recipient_hex = format!(
            "0x{:x}",
            BigUint::from_str(
                "206642948138484946401984817000601902748248360221625950604253680558965863254"
            )
            .unwrap()
        );
        let collateral_hex = format!(
            "0x{:x}",
            BigUint::from_str(
                "1386727789535574059419576650469753513512158569780862144831829362722992755422"
            )
            .unwrap()
        );
        let hex = get_withdrawal_msg_hash(
            &recipient_hex,
            2,
            "1000",
            0,
            "0",
            "0x5D05989E9302DCEBC74E241001E3E3AC3F4402CCF2F8E6F74B034B07AD6A904",
            "Perpetuals",
            "v0",
            "SN_SEPOLIA",
            "1",
            &collateral_hex,
        );
        assert_eq!(
            hex.to_lowercase(),
            "0x4d309315e433ca868b82a041fb63c6d79364e67f93fb067638c3428044d358a".to_string()
        );
    }
}
