import { HttpService } from '@nestjs/axios';
import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class WebRequestService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private headersRequest = {
    'Content-Type': 'application/json', // afaik this one is not needed
    Authorization: `Bearer ${this.configService.get('OPP_PAYMENT_KEY')}`,
  };

  async sendPostRequest(url: string, param: any) {
    const result = await firstValueFrom(
      this.httpService.post(url, param, { headers: this.headersRequest }).pipe(
        catchError((error) => {
          console.log(url);
          console.log(error?.response);
          if (error?.response?.data) {
            throw new GatewayTimeoutException(error?.response?.data);
          } else {
            throw new GatewayTimeoutException('OPP Create Bank Error');
          }
        }),
      ),
    );
    return result.data;
  }

  async sendGetRequest(url: string) {
    const result = await firstValueFrom(
      this.httpService.get(url, { headers: this.headersRequest }).pipe(
        catchError((error) => {
          if (error?.response?.data) {
            throw new GatewayTimeoutException(error?.response?.data);
          } else {
            throw new GatewayTimeoutException('OPP Create Bank Error');
          }
        }),
      ),
    );
    return result.data;
  }
}
