-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('PISTA', 'CAMAROTE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "TicketType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "qr_code" TEXT NOT NULL,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMP(3),
    "pix_char_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_reservations" (
    "id" TEXT NOT NULL,
    "local_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "responsible_name" TEXT NOT NULL,
    "number_of_people" INTEGER NOT NULL,
    "reservation_time" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "qr_code" TEXT NOT NULL,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMP(3),
    "pix_char_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "table_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qr_code_key" ON "tickets"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_pix_char_id_key" ON "tickets"("pix_char_id");

-- CreateIndex
CREATE INDEX "tickets_event_id_status_idx" ON "tickets"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "table_reservations_qr_code_key" ON "table_reservations"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "table_reservations_pix_char_id_key" ON "table_reservations"("pix_char_id");

-- CreateIndex
CREATE INDEX "table_reservations_local_id_status_idx" ON "table_reservations"("local_id", "status");

-- CreateIndex
CREATE INDEX "table_reservations_expires_at_idx" ON "table_reservations"("expires_at");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_reservations" ADD CONSTRAINT "table_reservations_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "locals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_reservations" ADD CONSTRAINT "table_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
