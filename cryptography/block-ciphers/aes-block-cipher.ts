import {
  AbstractBlock,
  BlockDefinition} from "../deps.ts";
import { IFBlockCipher } from "../interfaces/block-cipher.ts";

// type IN = Pick<IFBlockCipher, "plainText" | "key" | "direction">;
// type OUT = Pick<IFBlockCipher, "cipherText" | "blockSize">;

const AES_BLOCK_BYTES = 16;

class AESBlockCipherBlock extends AbstractBlock<AESBlockCipherBlock> implements IFBlockCipher {
  // 
  //readonly $helper!: BlockHelper<this>;

  //
  direction: "encrypt" | "decrypt" = "encrypt";

  // setter, imports raw key to WebCrypto
  #cryptoKey?: Promise<CryptoKey>;
  set key(key: Uint8Array) {
    this.#cryptoKey = crypto.subtle.importKey("raw", key, "AES-CBC", true, ["encrypt", "decrypt"]);
  }

  blockSize = 128;

  plainText!: Uint8Array;

  cipherText!: Uint8Array;

  async run(): Promise<void> {
    const { plainText } = this;
    const len = plainText.length;

    const iv = new Uint8Array(AES_BLOCK_BYTES)

    const cryptoKey = await this.#cryptoKey!;

    if (this.direction == "encrypt")
      // encrypt, and remove last block
      this.cipherText = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, cryptoKey, plainText)).slice(0, len);
    else {
      const len = plainText.length;

      // GAMBI to use WebCrypto AES-CBC as AES-ECB
      const plain = new Uint8Array(len + AES_BLOCK_BYTES);
      plain.set(plainText);

      // add "fake" last block (16 bytes of 0x10 padding) and decrypt
      const fake = new Uint8Array(AES_BLOCK_BYTES);
      for (let i = 0; i < AES_BLOCK_BYTES; ++i)
        fake[i] = plain[len - AES_BLOCK_BYTES + i] ^ 0x10;

      const fakeDecrypted = await crypto.subtle.encrypt({
        name: "AES-CBC",
        iv: new Uint8Array(AES_BLOCK_BYTES)
      },
        cryptoKey,
        fake);

      // append to our forged 'cryptoText' 
      plain.set(
        new Uint8Array(fakeDecrypted).slice(0, AES_BLOCK_BYTES),
        len);

      this.cipherText = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, cryptoKey, plain)).slice(0, len);
    }

    return Promise.resolve();
  }
}

export const AESBlockCipher: BlockDefinition<AESBlockCipherBlock> = {
  type: "block",
  ctor: AESBlockCipherBlock,
  name: "AES Block Cipher",
  category: "crypto",

  propertyDefinitions: {
    ...IFBlockCipher.propertyDefinitions,
    key: {
      ...IFBlockCipher.propertyDefinitions.key,
      dataType: "u8[]",
      minLength: 16,
      maxLength: 32,
      lengthStep: 8,
    },
    blockSize: {
      ...IFBlockCipher.propertyDefinitions.blockSize,
      default: 128,
      constant: true,
    },
  },
};