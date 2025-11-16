/* Test wrapper package signing in Node.js (not Jest) */

const { initWasm, sign, pedersenHash } = require('../dist/perpetual/crypto/signer');
const { getL2KeysFromL1Account, getOnboardingPayload } = require('../dist/perpetual/user-client/onboarding');

async function testWrapperSigning() {
  await initWasm();

  // Known test values
  const knownPrivateKey = '0x50c8e358cc974aaaa6e460641e53f78bdc550fd372984aa78ef8fd27c751e6f4';
  const expectedL2PublicKey = '0x78298687996aff29a0bbcb994e1305db082d084f85ec38bb78c41e6787740ec';
  const expectedL2R = '0x70881694c59c7212b1a47fbbc07df4d32678f0326f778861ec3a2a5dbc09157';
  const expectedL2S = '0x558805193faa5d780719cba5f699ae1c888eec1fee23da4215fdd94a744d2cb';

  // Derive L2 keys
  const keyPair = await getL2KeysFromL1Account(knownPrivateKey, 0, 'x10.exchange');
  console.log('L2 Public Key matches:', keyPair.publicHex === expectedL2PublicKey);

  // Build onboarding payload
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

  console.log('\n=== Signature Results ===');
  console.log('L2 Signature R - Expected:', expectedL2R);
  console.log('L2 Signature R - Received:', json.l2Signature.r);
  console.log('R matches:', json.l2Signature.r === expectedL2R);
  
  console.log('\nL2 Signature S - Expected:', expectedL2S);
  console.log('L2 Signature S - Received:', json.l2Signature.s);
  console.log('S matches:', json.l2Signature.s === expectedL2S);

  if (json.l2Signature.s === expectedL2S) {
    console.log('\n✅ SUCCESS: Wrapper package produces correct s value!');
  } else {
    console.log('\n❌ FAILED: s value still doesn\'t match (wrapper may not be loaded)');
  }
}

testWrapperSigning().catch(console.error);




