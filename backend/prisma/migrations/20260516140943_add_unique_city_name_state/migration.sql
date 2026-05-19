/*
  Warnings:

  - You are about to alter the column `coordinates` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Unsupported("geometry(Point, 4326)")`.
  - A unique constraint covering the columns `[name,state]` on the table `cities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "coordinates" DROP NOT NULL,
ALTER COLUMN "coordinates" SET DATA TYPE geometry(Point, 4326);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_state_key" ON "cities"("name", "state");

-- CreateIndex
CREATE INDEX "events_coordinates_idx" ON "events" USING GIST ("coordinates");

-- CreateIndex
CREATE INDEX "locals_coordinates_idx" ON "locals" USING GIST ("coordinates");
