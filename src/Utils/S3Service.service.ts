import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly AWS_S3_BUCKET: string;
  private readonly s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.AWS_S3_BUCKET = this.configService.get<string>('AWS_BUCKET');
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_S3_KEY_SECRET'),
      },
    });
  }

  async uploadFile(file) {
    console.log(file);
    const { originalname, buffer, mimetype, size } = file;

    // Security validations
    if (!file || !originalname || !buffer || !mimetype) {
      throw new Error('Invalid file data');
    }

    // File size validation (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // MIME type validation with spreadsheet support
    const allowedMimeTypes = [
      // Images - Safe when processed properly
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      
      // Documents - Safe formats only
      'application/pdf', 
      'text/plain',
      
      // Modern Office formats - XML-based, safer than legacy formats
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      
      // Spreadsheet files - Modern formats only (no macro execution)
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv', // .csv
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      
      // Additional safe formats
      'text/rtf', // Rich Text Format
      'application/rtf' // Alternative RTF MIME type
    ];
    
    if (!allowedMimeTypes.includes(mimetype)) {
      throw new Error('File type not allowed');
    }

    // Secure filename generation with proper sanitization
    const fileExtension = originalname.split('.').pop()?.toLowerCase() || '';
    const sanitizedName = originalname
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .substring(0, 50);
    const uuid = require('crypto').randomUUID();
    const key = `${Date.now()}-${uuid}-${sanitizedName}`;

    let resizedImageBuffer = buffer; // Initialize with original buffer
    let finalSize = size;

    if (this.isImageFile(mimetype)) {
      resizedImageBuffer = await sharp(buffer)
        .resize(1000, 1000, { fit: 'inside' }) // Resize to maximum 1000x1000 while maintaining aspect ratio
        .toBuffer();
      
      // Get the new size after resizing
      finalSize = resizedImageBuffer.length;
    }

    const result = await this.s3_upload(
      resizedImageBuffer,
      this.AWS_S3_BUCKET,
      key,
      file.mimetype,
      originalname,
    );
    
    // Add size and mimetype to the response
    return {
      ...result,
      size: finalSize,
      mimeType: mimetype
    };
  }

  private isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  async s3_upload(file, bucket, name, mimetype, originalname) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: this.configService.get<string>('AWS_S3_REGION'),
      },
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      return {
        filename: originalname,
        Location: s3Response.Location,
      };
    } catch (e) {
      return { success: false, message: 'Unable to Upload the file', data: e };
    }
  }
}
