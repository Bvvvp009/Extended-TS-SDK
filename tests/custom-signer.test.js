/**
 * Tests for custom signer functionality
 */

const {
  CustomStarkSigner,
  isCustomStarkSigner,
  createStarkPerpetualAccountWithCustomSigner,
  StarkPerpetualAccount,
} = require('../dist/index');

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
  });
});
