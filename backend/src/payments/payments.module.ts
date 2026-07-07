import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { AbacatePayService } from './abacate-pay/abacate-pay.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, AbacatePayService],
})
export class PaymentsModule {}
