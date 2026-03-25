import {
  createCustomStarkSigner,
  CustomStarkSigner,
  normalizeSignatureResult,
  SignatureResultLike,
} from './custom-signer.js';

type WrapperSignatureValue =
  | string
  | (() => string)
  | bigint
  | number;

type WrapperSignature = {
  r: WrapperSignatureValue;
  s: WrapperSignatureValue;
};

export interface OfficialStarkWrapperModule {
  sign_message?: (privateKeyHex: string, messageHex: string) => WrapperSignature;
  signMessage?: (privateKeyHex: string, messageHex: string) => WrapperSignature;
}

function readWrapperComponent(
  value: WrapperSignatureValue,
  field: 'r' | 's'
): string | bigint | number {
  if (typeof value === 'function') {
    const result = value();

    if (typeof result !== 'string') {
      throw new Error(
        `Invalid official wrapper signature ${field}: getter must return a string`
      );
    }

    return result;
  }

  return value;
}

function normalizeWrapperSignature(signature: WrapperSignature): [bigint, bigint] {
  const normalized: SignatureResultLike = {
    r: readWrapperComponent(signature.r, 'r'),
    s: readWrapperComponent(signature.s, 's'),
  };

  return normalizeSignatureResult(normalized);
}

export function createOfficialWrapperStarkSigner(
  wrapper: OfficialStarkWrapperModule,
  privateKeyHex: string
): CustomStarkSigner {
  const signMessage = wrapper.sign_message ?? wrapper.signMessage;

  if (typeof signMessage !== 'function') {
    throw new Error(
      'Invalid official wrapper module: expected sign_message(privateKeyHex, messageHex)'
    );
  }

  return createCustomStarkSigner((msgHash) => {
    const messageHex = '0x' + msgHash.toString(16);
    const signature = signMessage(privateKeyHex, messageHex);
    return normalizeWrapperSignature(signature);
  });
}