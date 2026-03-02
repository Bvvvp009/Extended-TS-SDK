/* Golden test for order/transfer/withdrawal hash functions */

const { initWasm, getOrderMsgHash, getTransferMsgHash, getWithdrawalMsgHash } = require('../dist/cjs/perpetual/crypto/signer');

describe('Hash Functions', () => {
  beforeAll(async () => {
    await initWasm();
  }, 60000);

  it('computes order hash matching rust-crypto-lib-base test', () => {
    // Test values from rust-crypto-lib-base/src/lib.rs test_get_order_hash
    const hash = getOrderMsgHash({
      positionId: 100,
      baseAssetId: '0x2',
      baseAmount: '100',
      quoteAssetId: '0x1',
      quoteAmount: '-156',
      feeAmount: '74',
      feeAssetId: '0x1',
      expiration: 100,
      salt: 123,
      userPublicKey: '0x5d05989e9302dcebc74e241001e3e3ac3f4402ccf2f8e6f74b034b07ad6a904',
      domainName: 'Perpetuals',
      domainVersion: 'v0',
      domainChainId: 'SN_SEPOLIA',
      domainRevision: '1',
    });

    // Expected from rust-crypto-lib-base test_get_order_hash
    const expectedHex = '0x4de4c009e0d0c5a70a7da0e2039fb2b99f376d53496f89d9f437e736add6b48';
    const actualHex = '0x' + hash.toString(16);
    console.log('Order hash:', actualHex);
    console.log('Expected:', expectedHex);
    expect(hash).toBe(BigInt(expectedHex));
  });

  it('computes transfer hash matching rust-crypto-lib-base test', () => {
    // Test values from rust-crypto-lib-base/src/starknet_messages.rs test_message_hash_transfer
    const userKeyDec = '2629686405885377265612250192330550814166101744721025672593857097107510831364';
    const userKeyHex = '0x' + BigInt(userKeyDec).toString(16);
    const hash = getTransferMsgHash({
      recipientPositionId: 1,
      senderPositionId: 2,
      amount: '4',
      expiration: 5,
      salt: '6',
      userPublicKey: userKeyHex,
      domainName: 'Perpetuals',
      domainVersion: 'v0',
      domainChainId: 'SN_SEPOLIA',
      domainRevision: '1',
      collateralId: '0x3',
    });

    // Expected from rust-crypto-lib-base test_message_hash_transfer
    const expectedHex = '0x56c7b21d13b79a33d7700dda20e22246c25e89818249504148174f527fc3f8f';
    const actualHex = '0x' + hash.toString(16);
    console.log('Transfer hash:', actualHex);
    console.log('Expected:', expectedHex);
    expect(hash).toBe(BigInt(expectedHex));
  });

  it('computes withdrawal hash matching rust-crypto-lib-base test', () => {
    // Test values from rust-crypto-lib-base/src/lib.rs test_get_withdrawal_hash
    // Note: recipient_hex and collateral_id_hex are converted from decimal strings
    const recipientHex = '0x' + BigInt('206642948138484946401984817000601902748248360221625950604253680558965863254').toString(16);
    const collateralIdHex = '0x' + BigInt('1386727789535574059419576650469753513512158569780862144831829362722992755422').toString(16);
    
    const hash = getWithdrawalMsgHash({
      recipientHex: recipientHex,
      positionId: 2,
      amount: '1000',
      expiration: 0,
      salt: '0',
      userPublicKey: '0x5D05989E9302DCEBC74E241001E3E3AC3F4402CCF2F8E6F74B034B07AD6A904',
      domainName: 'Perpetuals',
      domainVersion: 'v0',
      domainChainId: 'SN_SEPOLIA',
      domainRevision: '1',
      collateralId: collateralIdHex,
    });

    // Expected from rust-crypto-lib-base test_get_withdrawal_hash (decimal)
    // "2182119571682827544073774098906745929330860211691330979324731407862023927178"
    const expectedDecimal = '2182119571682827544073774098906745929330860211691330979324731407862023927178';
    const expectedHex = '0x' + BigInt(expectedDecimal).toString(16);
    const actualHex = '0x' + hash.toString(16);
    console.log('Withdrawal hash:', actualHex);
    console.log('Expected:', expectedHex);
    expect(hash).toBe(BigInt(expectedHex));
  });
});

