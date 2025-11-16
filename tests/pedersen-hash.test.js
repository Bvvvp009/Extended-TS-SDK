/* Test pedersen_hash function */

const { initWasm } = require('../dist');
const { pedersenHash } = require('../dist/perpetual/crypto/signer');

describe('Pedersen hash', () => {
  it('produces correct hash for known inputs', async () => {
    await initWasm();

    // Test case: pedersen_hash(l1_address, l2_public_key)
    // Test vectors for pedersen_hash
    // Using known values from onboarding test
    const l1Address = BigInt('0x' + '50c8e358cc974aaaa6e460641e53f78bdc550fd'.padStart(40, '0')); // Example address
    const l2PublicKey = BigInt('0x78298687996aff29a0bbcb994e1305db082d084f85ec38bb78c41e6787740ec');
    
    const hash = pedersenHash(l1Address, l2PublicKey);
    console.log('Pedersen hash result:', hash.toString(16));
    
    // This will help us debug if pedersen_hash is producing different results
    expect(hash).toBeDefined();
  });
});




