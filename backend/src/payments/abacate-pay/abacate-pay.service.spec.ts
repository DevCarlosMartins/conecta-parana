import { Test, TestingModule } from '@nestjs/testing';
import { AbacatePayService } from './abacate-pay.service';

describe('AbacatePayService', () => {
  let service: AbacatePayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbacatePayService],
    }).compile();

    service = module.get<AbacatePayService>(AbacatePayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
