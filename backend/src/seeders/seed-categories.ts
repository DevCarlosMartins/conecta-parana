import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const CATEGORIES: { name: string; icon: string }[] = [
  { name: 'Restaurante', icon: 'utensils' },
  { name: 'Hotel', icon: 'bed' },
  { name: 'Ponto Turístico', icon: 'camera' },
  { name: 'Parque', icon: 'trees' },
  { name: 'Shopping', icon: 'shopping-bag' },
  { name: 'Hospital', icon: 'hospital' },
  { name: 'Escola', icon: 'graduation-cap' },
  { name: 'Igreja', icon: 'church' },
  { name: 'Museu', icon: 'landmark' },
  { name: 'Outro', icon: 'map-pin' },
];

async function main() {
  for (const c of CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: c.name },
    });
    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon: c.icon },
      });
    } else {
      await prisma.category.create({ data: c });
    }
  }

  const all = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  console.log(`[seed-categories] ${all.length} categorias na base:`);
  console.table(all);
}

main()
  .catch((err) => {
    console.error('[seed-categories] failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
