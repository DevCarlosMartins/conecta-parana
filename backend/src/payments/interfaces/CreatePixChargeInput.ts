export interface CreatePixChargeInput {
  amount: number;
  expiresIn?: number;
  description?: string;
  metadata?: {
    externalId: string;
  };
}
