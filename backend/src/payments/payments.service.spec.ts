import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../config/prisma.service';
import { AbacatePayService } from './abacate-pay/abacate-pay.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              ticket: { findUniqueOrThrow: jest.fn(), update: jest.fn() },
              tableReservation: {
                findUniqueOrThrow: jest.fn(),
                update: jest.fn(),
              },
            },
          },
        },
        {
          provide: AbacatePayService,
          useValue: { createPixCharge: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
