import * as wasm from "./stark_crypto_wasm_bg-web.wasm";
export * from "./stark_crypto_wasm_bg-web.js";
import { __wbg_set_wasm } from "./stark_crypto_wasm_bg-web.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
