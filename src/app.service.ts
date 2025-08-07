import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: number; message: string } {
    return {
      status: 200,
      message: 'ok',
    };
  }
}
