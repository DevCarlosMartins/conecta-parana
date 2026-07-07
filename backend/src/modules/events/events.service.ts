import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateEventDto, EventCoordinatesDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const eventInclude = {
  city: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      cityId: true,
    },
  },
  local: true,
} satisfies Prisma.EventInclude;

type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

type EventResponse = Omit<EventWithRelations, 'user'> & {
  author: EventWithRelations['user'];
  coordinates: EventCoordinatesDto | null;
};

type CoordinateRow = {
  id: number;
  lat: number | null;
  lng: number | null;
};

type CurrentUser = Pick<JwtPayload, 'sub' | 'cityId'>;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: ListEventsQueryDto): Promise<EventResponse[]> {
    const where: Prisma.EventWhereInput = {};

    if (dto.cityId !== undefined) {
      where.cityId = dto.cityId;
    }

    if (dto.type !== undefined) {
      where.type = dto.type;
    }

    if (dto.status !== undefined) {
      where.status = dto.status;
    }

    if (dto.localId !== undefined) {
      where.localId = dto.localId;
    }

    const events = await this.prisma.client.event.findMany({
      where,
      include: eventInclude,
      orderBy: { eventDate: 'asc' },
    });

    return this.withCoordinates(events);
  }

  async findOne(id: number): Promise<EventResponse> {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
      include: eventInclude,
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    const [eventWithCoordinates] = await this.withCoordinates([event]);
    return eventWithCoordinates;
  }

  async create(
    dto: CreateEventDto,
    currentUser: CurrentUser,
  ): Promise<EventResponse> {
    const cityId = this.resolveCityId(currentUser, dto.cityId);

    await this.validateLocalBelongsToCity(dto.localId, cityId);

    const event = await this.prisma.client.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        eventDate: new Date(dto.eventDate),
        cityId,
        userId: currentUser.sub,
        localId: dto.localId,
      },
    });

    await this.setCoordinates(event.id, dto.coordinates);
    return this.findOne(event.id);
  }

  async update(
    id: number,
    dto: UpdateEventDto,
    currentUser: CurrentUser,
  ): Promise<EventResponse> {
    const event = await this.findEventForMutation(id);

    if (currentUser.cityId !== null && currentUser.cityId !== undefined) {
      this.assertEventBelongsToAdminCity(event.cityId, currentUser.cityId);
      await this.validateLocalBelongsToCity(dto.localId, currentUser.cityId);
    }

    const data: Prisma.EventUncheckedUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.type !== undefined) {
      data.type = dto.type;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.eventDate !== undefined) {
      data.eventDate = new Date(dto.eventDate);
    }

    if (dto.localId !== undefined) {
      data.localId = dto.localId;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.client.event.update({ where: { id }, data });
    }

    if (dto.coordinates !== undefined) {
      await this.setCoordinates(id, dto.coordinates);
    }

    return this.findOne(id);
  }

  async remove(id: number, currentUser: CurrentUser) {
    const event = await this.findEventForMutation(id);

    if (currentUser.cityId !== null && currentUser.cityId !== undefined) {
      this.assertEventBelongsToAdminCity(event.cityId, currentUser.cityId);
    }

    try {
      return await this.prisma.client.event.delete({
        where: { id },
      });
    } catch (error: unknown) {
      this.handleDeleteError(error);
    }
  }

  private resolveCityId(
    currentUser: CurrentUser,
    dtoCityId: number | undefined,
  ): number {
    if (currentUser.cityId !== null && currentUser.cityId !== undefined) {
      return currentUser.cityId;
    }
    if (dtoCityId !== undefined) {
      return dtoCityId;
    }
    throw new ForbiddenException(
      'Super admin deve informar cityId no body para criar eventos',
    );
  }

  private async findEventForMutation(id: number) {
    const event = await this.prisma.client.event.findUnique({
      where: { id },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  private assertEventBelongsToAdminCity(
    eventCityId: number,
    adminCityId: number,
  ) {
    if (eventCityId !== adminCityId) {
      throw new ForbiddenException(
        'Não é permitido alterar eventos de outra cidade',
      );
    }
  }

  private async validateLocalBelongsToCity(
    localId: number | undefined,
    cityId: number,
  ) {
    if (localId === undefined) return;

    const local = await this.prisma.client.local.findUnique({
      where: { id: localId },
      select: { cityId: true },
    });

    if (!local) throw new NotFoundException('Local não encontrado');

    if (local.cityId !== cityId) {
      throw new ForbiddenException(
        'Não é permitido vincular evento a local de outra cidade',
      );
    }
  }

  private async setCoordinates(
    eventId: number,
    coordinates: EventCoordinatesDto | undefined,
  ): Promise<void> {
    if (coordinates === undefined) return;

    await this.prisma.client.$executeRaw`
      UPDATE "events"
      SET "coordinates" = ST_SetSRID(ST_MakePoint(${coordinates.lng}, ${coordinates.lat}), 4326)
      WHERE "id" = ${eventId}
    `;
  }

  private async withCoordinates(
    events: EventWithRelations[],
  ): Promise<EventResponse[]> {
    const coordinatesById = await this.findCoordinatesByEventIds(
      events.map((e) => e.id),
    );
    return events.map((event) =>
      this.formatEvent(event, coordinatesById.get(event.id) ?? null),
    );
  }

  private async findCoordinatesByEventIds(
    eventIds: number[],
  ): Promise<Map<number, EventCoordinatesDto | null>> {
    const coordinatesById = new Map<number, EventCoordinatesDto | null>();
    if (eventIds.length === 0) return coordinatesById;

    const rows = await this.prisma.client.$queryRaw<CoordinateRow[]>`
      SELECT
        "id",
        ST_Y("coordinates"::geometry) AS "lat",
        ST_X("coordinates"::geometry) AS "lng"
      FROM "events"
      WHERE "id" IN (${Prisma.join(eventIds)})
    `;

    for (const row of rows) {
      coordinatesById.set(
        row.id,
        row.lat !== null && row.lng !== null
          ? { lat: Number(row.lat), lng: Number(row.lng) }
          : null,
      );
    }

    return coordinatesById;
  }

  private formatEvent(
    event: EventWithRelations,
    coordinates: EventCoordinatesDto | null,
  ): EventResponse {
    const { user, ...eventWithoutUser } = event;
    return { ...eventWithoutUser, author: user, coordinates };
  }

  private handleDeleteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new ConflictException(
        'Não é possível deletar o evento, pois existem dados vinculados a ele',
      );
    }
    throw error;
  }
}
