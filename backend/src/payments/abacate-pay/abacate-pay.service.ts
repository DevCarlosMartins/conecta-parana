import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePixChargeInput } from '../interfaces/CreatePixChargeInput';
import { PixChargeResponse } from '../interfaces/PixChargeResponse';
@Injectable()
export class AbacatePayService {
  private readonly baseUrl = 'https://api.abacatepay.com/v1';
  private readonly apiKey = process.env.ABACATEPAY_API_KEY;

  async createPixCharge(
    input: CreatePixChargeInput,
  ): Promise<PixChargeResponse> {
    const response = await fetch(`${this.baseUrl}/pixQrCode/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result = (await response.json()) as PixChargeResponse;

    if (!response.ok || result.error) {
      throw new InternalServerErrorException(
        `Erro AbacatePay: ${result.error ?? response.statusText}`,
      );
    }

    return result;
  }
}
