
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}
/**
 * Initialize the WASM module
 */
exports.init = function() {
    wasm.main();
};

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}
/**
 * Sign a message hash with a private key
 *
 * # Arguments
 * * `private_key` - Private key as hex string (e.g., "0x123...")
 * * `msg_hash` - Message hash as hex string (e.g., "0x456...")
 *
 * # Returns
 * Array of two hex strings: [r, s]
 * @param {string} private_key
 * @param {string} msg_hash
 * @returns {string[]}
 */
exports.sign = function(private_key, msg_hash) {
    const ptr0 = passStringToWasm0(private_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(msg_hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.sign(ptr0, len0, ptr1, len1);
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
};

/**
 * Compute Pedersen hash of two field elements
 *
 * # Arguments
 * * `a` - First field element as hex string
 * * `b` - Second field element as hex string
 *
 * # Returns
 * Hash result as hex string
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
exports.pedersen_hash = function(a, b) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(a, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(b, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.pedersen_hash(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
};

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
 * @param {string} eth_signature
 * @returns {string[]}
 */
exports.generate_keypair_from_eth_signature = function(eth_signature) {
    const ptr0 = passStringToWasm0(eth_signature, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.generate_keypair_from_eth_signature(ptr0, len0);
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
};

/**
 * Get order message hash
 *
 * Computes the structured hash for an order according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 * @param {bigint} position_id
 * @param {string} base_asset_id
 * @param {string} base_amount
 * @param {string} quote_asset_id
 * @param {string} quote_amount
 * @param {string} fee_amount
 * @param {string} fee_asset_id
 * @param {bigint} expiration
 * @param {bigint} salt
 * @param {string} user_public_key
 * @param {string} domain_name
 * @param {string} domain_version
 * @param {string} domain_chain_id
 * @param {string} domain_revision
 * @returns {string}
 */
exports.get_order_msg_hash = function(position_id, base_asset_id, base_amount, quote_asset_id, quote_amount, fee_amount, fee_asset_id, expiration, salt, user_public_key, domain_name, domain_version, domain_chain_id, domain_revision) {
    let deferred12_0;
    let deferred12_1;
    try {
        const ptr0 = passStringToWasm0(base_asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(base_amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(quote_asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(quote_amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(fee_amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(fee_asset_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passStringToWasm0(user_public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passStringToWasm0(domain_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passStringToWasm0(domain_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len8 = WASM_VECTOR_LEN;
        const ptr9 = passStringToWasm0(domain_chain_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len9 = WASM_VECTOR_LEN;
        const ptr10 = passStringToWasm0(domain_revision, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len10 = WASM_VECTOR_LEN;
        const ret = wasm.get_order_msg_hash(position_id, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, expiration, salt, ptr6, len6, ptr7, len7, ptr8, len8, ptr9, len9, ptr10, len10);
        deferred12_0 = ret[0];
        deferred12_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred12_0, deferred12_1, 1);
    }
};

/**
 * Get transfer message hash
 *
 * Computes the structured hash for a transfer according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 * @param {bigint} recipient_position_id
 * @param {bigint} sender_position_id
 * @param {string} amount
 * @param {bigint} expiration
 * @param {string} salt
 * @param {string} user_public_key
 * @param {string} domain_name
 * @param {string} domain_version
 * @param {string} domain_chain_id
 * @param {string} domain_revision
 * @param {string} collateral_id
 * @returns {string}
 */
exports.get_transfer_msg_hash = function(recipient_position_id, sender_position_id, amount, expiration, salt, user_public_key, domain_name, domain_version, domain_chain_id, domain_revision, collateral_id) {
    let deferred9_0;
    let deferred9_1;
    try {
        const ptr0 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(salt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(user_public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(domain_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(domain_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(domain_chain_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passStringToWasm0(domain_revision, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passStringToWasm0(collateral_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len7 = WASM_VECTOR_LEN;
        const ret = wasm.get_transfer_msg_hash(recipient_position_id, sender_position_id, ptr0, len0, expiration, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7);
        deferred9_0 = ret[0];
        deferred9_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred9_0, deferred9_1, 1);
    }
};

/**
 * Get withdrawal message hash
 *
 * Computes the structured hash for a withdrawal according to StarkEx protocol.
 * Reimplements exact logic from rust-crypto-lib-base using WASM-compatible types.
 * @param {string} recipient_hex
 * @param {bigint} position_id
 * @param {string} amount
 * @param {bigint} expiration
 * @param {string} salt
 * @param {string} user_public_key
 * @param {string} domain_name
 * @param {string} domain_version
 * @param {string} domain_chain_id
 * @param {string} domain_revision
 * @param {string} collateral_id
 * @returns {string}
 */
exports.get_withdrawal_msg_hash = function(recipient_hex, position_id, amount, expiration, salt, user_public_key, domain_name, domain_version, domain_chain_id, domain_revision, collateral_id) {
    let deferred10_0;
    let deferred10_1;
    try {
        const ptr0 = passStringToWasm0(recipient_hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(amount, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(salt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(user_public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ptr4 = passStringToWasm0(domain_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len4 = WASM_VECTOR_LEN;
        const ptr5 = passStringToWasm0(domain_version, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len5 = WASM_VECTOR_LEN;
        const ptr6 = passStringToWasm0(domain_chain_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len6 = WASM_VECTOR_LEN;
        const ptr7 = passStringToWasm0(domain_revision, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len7 = WASM_VECTOR_LEN;
        const ptr8 = passStringToWasm0(collateral_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len8 = WASM_VECTOR_LEN;
        const ret = wasm.get_withdrawal_msg_hash(ptr0, len0, position_id, ptr1, len1, expiration, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, ptr6, len6, ptr7, len7, ptr8, len8);
        deferred10_0 = ret[0];
        deferred10_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred10_0, deferred10_1, 1);
    }
};

exports.main = function() {
    wasm.main();
};

exports.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

const wasmPath = `${__dirname}/stark_crypto_wasm_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasm = exports.__wasm = new WebAssembly.Instance(wasmModule, imports).exports;

wasm.__wbindgen_start();

