import { randomUUID } from 'node:crypto';
import { BaseService } from './base.service.js';
import path from 'node:path';
import sharp from 'sharp';
import { ClientError } from '../utils/errors.js';

export class ImageService extends BaseService {
  public async checkAccess(userId: string, filename: string) {
    return this.repositories.image.checkAccess(userId, filename);
  }

  public async saveImageToDisk(data: ArrayBuffer) {
    try {
      const ext = '.jpg';
      const filename = `${randomUUID()}${ext}`;

      const path = this.getImagePath(filename);
      await sharp(Buffer.from(data))
        .jpeg({ quality: 50, mozjpeg: true })
        .flop() // Because the image is mirrored
        .toFile(path);

      console.log(`Image saved to ${path}`);

      return filename;
    } catch (error) {
      throw new ClientError('Unable to save image, please try again.');
    }
  }

  public getImagePath(filename: string) {
    return path.join(process.env.API_IMAGE_DIR, filename);
  }
}
