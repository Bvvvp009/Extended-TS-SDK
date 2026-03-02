/* Golden test against known test vectors for onboarding/key derivation */

const path = require('path');

// Import from built dist (the test script runs build first)
const {
  initWasm,
} = require('../dist/cjs');

const {
  getL2KeysFromL1Account,
  getOnboardingPayload,
} = require('../dist/cjs/perpetual/user-client/onboarding');

describe('Onboarding', () => {
  it('derives L2 keys and onboarding payload matching test vectors', async () => {
    await initWasm();

    // Known test vectors for onboarding - TEST VECTOR ONLY, NOT A REAL PRIVATE KEY
    // This is a deterministic test key used for golden tests against known outputs
    const knownPrivateKey = '0x50c8e358cc974aaaa6e460641e53f78bdc550fd372984aa78ef8fd27c751e6f4';
    const expectedL2PublicKey =
      '0x78298687996aff29a0bbcb994e1305db082d084f85ec38bb78c41e6787740ec';
    const expectedL1Signature =
      '0x9a59eb699eb58f2ec975455f33dd7205c8a569f7b6d7647c25b71e7ab7eec3d30f2b8c9038f06f077167eb90e0c002602e4ecbab180fad4b2c91d2259883e6571c';
    const expectedL2R =
      '0x43dafa05a707a431c2a173e33925cd13133c63ca681872905f23c2e4ad5bdc7';
    const expectedL2S =
      '0x4cd209605a8716a4656e514a9aa739b385d1d248228fe5e2b0c9b36d753026f';

    // 1) Derive L2 keys
    const keyPair = await getL2KeysFromL1Account(knownPrivateKey, 0, 'x10.exchange');
    expect(keyPair.publicHex).toBe(expectedL2PublicKey);

    // 2) Build onboarding payload with fixed timestamp to produce deterministic L1 signature
    const fixedTime = new Date('2024-07-30T16:01:02.000Z');
    const payload = await getOnboardingPayload(
      knownPrivateKey,
      'x10.exchange',
      keyPair,
      'host',
      undefined,
      fixedTime
    );
    const json = payload.toJson();

    // Debug output to see actual values
    console.log('L2 Public Key - Expected:', expectedL2PublicKey);
    console.log('L2 Public Key - Received:', json.l2Key);
    console.log('L2 Signature R - Expected:', expectedL2R);
    console.log('L2 Signature R - Received:', json.l2Signature.r);
    console.log('L2 Signature S - Expected:', expectedL2S);
    console.log('L2 Signature S - Received:', json.l2Signature.s);

    expect('0x' + json.l1Signature.replace(/^0x/, '')).toBe(expectedL1Signature);
    expect(json.l2Key).toBe(expectedL2PublicKey);
    expect(json.l2Signature.r).toBe(expectedL2R);
    expect(json.l2Signature.s).toBe(expectedL2S);
    expect(json.accountCreation.time).toBe('2024-07-30T16:01:02Z');
    expect(json.accountCreation.action).toBe('REGISTER');
    expect(json.accountCreation.tosAccepted).toBe(true);
  }, 60000);
});


