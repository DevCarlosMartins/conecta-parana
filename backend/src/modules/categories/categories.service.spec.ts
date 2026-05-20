import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { CategoriesService } from './categories.service';

const mockPrisma = {
  client: {
    category: {
      findMany: jest.fn(),
    },
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  // --------------------- // findAll // ---------------------
  describe('findAll', () => {
    it('retorna as categorias ordenadas por nome', async () => {
      const categories = [
        { id: 1, name: 'Hotel', icon: 'bed' },
        { id: 2, name: 'Restaurante', icon: 'utensils' },
      ];
      mockPrisma.client.category.findMany.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockPrisma.client.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('retorna lista vazia quando não há categorias', async () => {
      mockPrisma.client.category.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
