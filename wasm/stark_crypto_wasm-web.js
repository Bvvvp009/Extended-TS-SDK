import * as wasm from "./stark_crypto_wasm_bg.wasm";
export * from "./stark_crypto_wasm_bg.js";
import { __wbg_set_wasm } from "./stark_crypto_wasm_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
