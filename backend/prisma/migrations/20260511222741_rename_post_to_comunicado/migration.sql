CREATE TABLE "comunicados" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);



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
ALTER TABLE "favorites" ADD column comunicado_id INTEGER;
UPDATE "favorites" SET comunicado_id = post_id;
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_comunicado_id_fkey" 
FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "favorites" DROP COLUMN "post_id";

-- AlterTable
ALTER TABLE "likes" ADD COLUMN "comunicado_id" INTEGER;
UPDATE "likes" SET comunicado_id = post_id;
ALTER TABLE "likes" ADD CONSTRAINT "likes_comunicado_id_fkey" 
FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "likes" DROP COLUMN "post_id";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "comunicado_id" INTEGER;
UPDATE "notifications" SET comunicado_id = post_id;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comunicado_id_fkey" 
FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" DROP COLUMN "post_id";

-- DropTable
DROP TABLE "posts";

-- CreateIndex
CREATE INDEX "events_coordinates_idx" ON "events" USING GIST ("coordinates");

-- CreateIndex
CREATE INDEX "locals_coordinates_idx" ON "locals" USING GIST ("coordinates");