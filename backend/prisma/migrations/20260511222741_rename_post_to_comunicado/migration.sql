/*
  Warnings:

  - You are about to alter the column `coordinates` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Unsupported("geometry(Point, 4326)")`.
  - You are about to drop the column `post_id` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_post_id_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_post_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_post_id_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "coordinates" DROP NOT NULL,
ALTER COLUMN "coordinates" SET DATA TYPE geometry(Point, 4326);

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "post_id",
ADD COLUMN     "comunicado_id" INTEGER;

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "post_id",
ADD COLUMN     "comunicado_id" INTEGER;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "post_id",
ADD COLUMN     "comunicado_id" INTEGER;

-- DropTable
DROP TABLE "posts";

-- CreateTable
CREATE TABLE "comunicados" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_coordinates_idx" ON "events" USING GIST ("coordinates");

-- CreateIndex
CREATE INDEX "locals_coordinates_idx" ON "locals" USING GIST ("coordinates");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
