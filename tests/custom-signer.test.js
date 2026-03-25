/**
 * Tests for custom signer functionality
 */

const {
  CustomStarkSigner,
  isCustomStarkSigner,
  CallbackStarkSigner,
  createCustomStarkSigner,
  createOfficialWrapperStarkSigner,
  normalizeSignatureResult,
  createStarkPerpetualAccountWithCustomSigner,
  StarkPerpetualAccount,
} = require('../dist/cjs/index');

describe('Custom Signer', () => {
  describe('isCustomStarkSigner', () => {
    it('should return true for valid custom signer', () => {
      const validSigner = {
        sign: async (msgHash) => [BigInt(1), BigInt(2)],
      };
      expect(isCustomStarkSigner(validSigner)).toBe(true);
    });

    it('should return false for invalid custom signer (no sign method)', () => {
      const invalidSigner = {
        someOtherMethod: () => {},
      };
      expect(isCustomStarkSigner(invalidSigner)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isCustomStarkSigner(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isCustomStarkSigner(undefined)).toBe(false);
    });
  });

  describe('normalizeSignatureResult', () => {
    it('normalizes bigint tuple signatures', () => {
      expect(normalizeSignatureResult([BigInt(1), BigInt(2)])).toEqual([BigInt(1), BigInt(2)]);
    });

    it('normalizes hex object signatures', () => {
      expect(normalizeSignatureResult({ r: '0x10', s: '0x20' })).toEqual([BigInt(16), BigInt(32)]);
    });

    it('normalizes decimal string tuple signatures', () => {
      expect(normalizeSignatureResult(['123', '456'])).toEqual([BigInt(123), BigInt(456)]);
    });

    it('throws for malformed signatures', () => {
      expect(() => normalizeSignatureResult(['0x1'])).toThrow(
        'Invalid signature result: expected [r, s] tuple'
      );
    });
  });

  describe('CallbackStarkSigner', () => {
    it('normalizes callback results returned as objects', async () => {
      const signer = new CallbackStarkSigner(async () => ({ r: '0x12', s: '34' }));
      await expect(signer.sign(BigInt(1))).resolves.toEqual([BigInt(18), BigInt(34)]);
    });

    it('createCustomStarkSigner wraps callbacks', async () => {
      const signer = createCustomStarkSigner(async () => ['0x55', '0x66']);
      await expect(signer.sign(BigInt(2))).resolves.toEqual([BigInt(85), BigInt(102)]);
    });
  });

  describe('createOfficialWrapperStarkSigner', () => {
    it('wraps official wrapper sign_message getters', async () => {
      const signer = createOfficialWrapperStarkSigner(
        {
          sign_message: jest.fn(() => ({
            r: () => '0x123',
            s: () => '456',
          })),
        },
        '0xabc'
      );

      await expect(signer.sign(BigInt(7))).resolves.toEqual([BigInt(0x123), BigInt(456)]);
    });

    it('throws for invalid official wrapper modules', () => {
      expect(() => createOfficialWrapperStarkSigner({}, '0xabc')).toThrow(
        'Invalid official wrapper module: expected sign_message(privateKeyHex, messageHex)'
      );
    });
  });

  describe('StarkPerpetualAccount with custom signer', () => {
    const testVault = 12345;
    const testPrivateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const testPublicKey = '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
    const testApiKey = 'test-api-key';

    it('should create account and set custom signer', () => {
      const customSigner = {
        sign: async (msgHash) => [BigInt(1), BigInt(2)],
      };

      const account = new StarkPerpetualAccount(
        testVault,
        testPrivateKey,
        testPublicKey,
        testApiKey
      );

      expect(() => account.setCustomSigner(customSigner)).not.toThrow();
      expect(account.getCustomSigner()).toBe(customSigner);
    });

    it('should throw error for invalid custom signer', () => {
      const invalidSigner = {
        someOtherMethod: () => {},
      };

      const account = new StarkPerpetualAccount(
        testVault,
        testPrivateKey,
        testPublicKey,
        testApiKey
      );

      expect(() => account.setCustomSigner(invalidSigner)).toThrow(
        'Invalid custom signer: must implement CustomStarkSigner interface'
      );
    });

    it('should clear custom signer', () => {
      const customSigner = {
        sign: async (msgHash) => [BigInt(1), BigInt(2)],
      };

      const account = new StarkPerpetualAccount(
        testVault,
        testPrivateKey,
        testPublicKey,
        testApiKey
      );

      account.setCustomSigner(customSigner);
      expect(account.getCustomSigner()).toBe(customSigner);

      account.clearCustomSigner();
      expect(account.getCustomSigner()).toBeUndefined();
    });

    it('should reject trading signatures without a custom signer', async () => {
      const account = new StarkPerpetualAccount(
        testVault,
        testPrivateKey,
        testPublicKey,
        testApiKey
      );

      await expect(account.sign(BigInt(1))).rejects.toThrow(
        'Trading signatures require a stable custom signer.'
      );
    });

    it('should use custom signer for signing', async () => {
      const mockR = BigInt('0x1234');
      const mockS = BigInt('0x5678');
      const customSigner = {
        sign: jest.fn(async (msgHash) => [mockR, mockS]),
      };

      const account = new StarkPerpetualAccount(
        testVault,
        testPrivateKey,
        testPublicKey,
        testApiKey
      );

      account.setCustomSigner(customSigner);

      const testMsgHash = BigInt('0xabcd');
      const result = await account.sign(testMsgHash);

      expect(customSigner.sign).toHaveBeenCalledWith(testMsgHash);
      expect(result).toEqual([mockR, mockS]);
    });
  });

  describe('createStarkPerpetualAccountWithCustomSigner', () => {
    const testVault = 12345;
    const testPublicKey = '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
    const testApiKey = 'test-api-key';

    it('should create account with custom signer', () => {
      const customSigner = {
        sign: async (msgHash) => [BigInt(1), BigInt(2)],
      };

      const account = createStarkPerpetualAccountWithCustomSigner(
        testVault,
        testPublicKey,
        testApiKey,
        customSigner
      );

      expect(account).toBeInstanceOf(StarkPerpetualAccount);
      expect(account.getCustomSigner()).toBe(customSigner);
      expect(account.getVault()).toBe(testVault);
      expect(account.getApiKey()).toBe(testApiKey);
    });

    it('should use custom signer instead of private key', async () => {
      const mockR = BigInt('0x9999');
      const mockS = BigInt('0xaaaa');
      const customSigner = {
        sign: jest.fn(async (msgHash) => [mockR, mockS]),
      };

      const account = createStarkPerpetualAccountWithCustomSigner(
        testVault,
        testPublicKey,
        testApiKey,
        customSigner
      );

      const testMsgHash = BigInt('0xbbbb');
      const result = await account.sign(testMsgHash);

      expect(customSigner.sign).toHaveBeenCalledWith(testMsgHash);
      expect(result).toEqual([mockR, mockS]);
    });

    it('should reject signing after clearing the custom signer', async () => {
      const customSigner = {
        sign: jest.fn(async () => [BigInt(1), BigInt(2)]),
      };

      const account = createStarkPerpetualAccountWithCustomSigner(
        testVault,
        testPublicKey,
        testApiKey,
        customSigner
      );

      account.clearCustomSigner();

      await expect(account.sign(BigInt(3))).rejects.toThrow(
        'Trading signatures require a stable custom signer.'
      );
    });

    it('should work with callback-based signer helper', async () => {
      const account = createStarkPerpetualAccountWithCustomSigner(
        testVault,
        testPublicKey,
        testApiKey,
        createCustomStarkSigner(async (msgHash) => ({ r: '0x123', s: msgHash.toString() }))
      );

      await expect(account.sign(BigInt(7))).resolves.toEqual([BigInt(0x123), BigInt(7)]);
    });
  });
});
