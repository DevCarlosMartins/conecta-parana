import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../config/prisma.service';
import { ComunicadosService } from './comunicados.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  client: {
    comunicado: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
};

describe('ComunicadoService', () => {
  let service: ComunicadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunicadosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ComunicadosService>(ComunicadosService);
    jest.clearAllMocks();
  });
  //-----------------------// find All // --------------------------------------
  describe('findAll', () => {
    it('sem filtro, busca com where vazio', async () => {
      mockPrisma.client.comunicado.findMany.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(mockPrisma.client.comunicado.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([]);
    });

    it('busca com o filtro ativo', async () => {
      mockPrisma.client.comunicado.findMany.mockResolvedValue([]);

      const result = await service.findAll({ isActive: true });

      expect(mockPrisma.client.comunicado.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });
  //-----------------------// find One // --------------------------------------
  describe('findOne', () => {
    it('Retorna o comunicado encontrado', async () => {
      const comunicado = { id: 1, title: 'titulo comunicado' };
      mockPrisma.client.comunicado.findUniqueOrThrow.mockResolvedValue(
        comunicado,
      );

      const result = await service.findOne(1);

      expect(result).toEqual(comunicado);
    });
    it('aciona NotFoundException se nao encontrada', async () => {
      mockPrisma.client.comunicado.findUniqueOrThrow.mockRejectedValue(
        new Error('not found'),
      );
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
  //-----------------------// create // --------------------------------------

  describe('create', () => {
    const dto = {
      title: 'novo comunicado',
      description: 'descricao foda',
    };

    it('respeita isActive=false explicito', async () => {
      mockPrisma.client.comunicado.create.mockResolvedValue({});

      await service.create({ ...dto, isActive: false });

      expect(mockPrisma.client.comunicado.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          isActive: false,
        },
      });
    });
    it('respeita isActive=true', async () => {
      mockPrisma.client.comunicado.create.mockResolvedValue({});

      await service.create({ title: dto.title, description: dto.description });

      expect(mockPrisma.client.comunicado.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          isActive: true,
        },
      });
    });
  });
  //-----------------------// update // --------------------------------------

  describe('update', () => {
    it('comunicado incexistente lanca NotFoundException', async () => {
      mockPrisma.client.comunicado.findUniqueOrThrow.mockRejectedValue(
        new Error(),
      );

      await expect(service.update(999, { title: 'titulo' })).rejects.toThrow(
        NotFoundException,
      );
    });
    it(' atualiza comunicado ', async () => {
      mockPrisma.client.comunicado.findUniqueOrThrow.mockResolvedValue({
        id: 1,
      });
      mockPrisma.client.comunicado.update.mockResolvedValue({
        id: 1,
        title: 'novo titulo',
      });
      const result = await service.update(1, { title: 'novo titulo' });
      expect(mockPrisma.client.comunicado.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'novo titulo' },
      });
      expect(result).toEqual({ id: 1, title: 'novo titulo' });
    });
  });
  // --------------------- // delete // ---------------------
  describe('remove', () => {
    it('comunicado incexistente lanca NotFoundException', async () => {
      mockPrisma.client.comunicado.findUniqueOrThrow.mockRejectedValue(
        new Error(),
      );

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
    it(' deleta comunicado ', async () => {
      mockPrisma.client.comunicado.findUniqueOrThrow.mockResolvedValue({
        id: 1,
      });
      mockPrisma.client.comunicado.delete.mockResolvedValue({
        id: 1,
        title: 'novo titulo',
      });
      const result = await service.remove(1);
      expect(mockPrisma.client.comunicado.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({ id: 1, title: 'novo titulo' });
    });
  });
});
