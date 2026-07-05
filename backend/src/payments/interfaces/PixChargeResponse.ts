export interface PixChargeResponse {
  data: {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    brCode: string;
    brCodeBase64: string;
    expiresAt: string;
  };
  error: string | null;
}
