import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { randomInt } from 'node:crypto';
import { Logger, LoggerService } from '../../libraries/logger'
import { ConfigurationService } from '../configuration';
//common imports


@Injectable()
export class CryptoService {
  private algorithm: string;
  private readonly key: Buffer;
  private logger: Logger

  constructor(private loggerService: LoggerService, private configurationService: ConfigurationService) {
    this.algorithm = 'aes-192-cbc';
    this.key = crypto.scryptSync(this.configurationService.get("ENCRYPTION_KEY"), 'salt', 24);
    this.logger = this.loggerService.create({ name: 'CryptoService' })
  }

  public async createHash(plain: string) {
    try {
      const hash = await argon2.hash(plain);
      return hash;
    } catch (e) {
      this.logger.error('hashing Error' + e)
      throw new ServiceUnavailableException('Internal Server Error');
    }
  }

  public async verifyHash(hash: string, plain: string) {
    try {
      return await argon2.verify(hash, plain);
    } catch (e) {
      this.logger.error('verifyHashErr-' + e)
      this.logger.log({ hash } + " " + { plain })

      throw new ServiceUnavailableException('Internal server Error');
    }
  }

  public encrypt(clearText) {
    const iv = crypto.randomBytes(ALGORITHM.IV_BYTE_LEN);
    const cipher = crypto.createCipheriv(ALGORITHM.CIPHER_ALGO, this.key, iv);
    const encrypted = cipher.update(clearText, 'utf8', 'hex');
    return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
  }

  public decrypt(encryptedText) {
    const [encrypted, iv] = encryptedText.split('|');
    if (!iv) throw new Error('IV not found');
    const decipher = crypto.createDecipheriv(
      ALGORITHM.CIPHER_ALGO,
      this.key,
      Buffer.from(iv, 'hex'),
    );
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }

  public randomCode() {
    return randomInt(1000_000).toString().padStart(6, '0');
  }


}

const ALGORITHM = {
  /**
   * GCM is an authenticated encryption mode that
   * not only provides confidentiality but also
   * provides integrity in a secured way
   * */
  BLOCK_CIPHER: 'aes-256-gcm',
  CIPHER_ALGO: 'aes-192-cbc',
  /**
   * 128 bit auth tag is recommended for GCM
   */
  AUTH_TAG_BYTE_LEN: 16,

  /**
   * NIST recommends 96 bits or 12 bytes IV for GCM
   * to promote interoperability, efficiency, and
   * simplicity of design
   */
  IV_BYTE_LEN: 12,

  /**
   * Note: 256 (in algorithm name) is key size.
   * Block size for AES is always 128
   */
  KEY_BYTE_LEN: 32,

  /**
   * To prevent rainbow table attacks
   * */
  SALT_BYTE_LEN: 16,
};
