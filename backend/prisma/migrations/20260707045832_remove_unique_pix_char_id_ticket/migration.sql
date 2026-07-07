-- DropIndex
DROP INDEX "tickets_pix_char_id_key";

-- CreateIndex
CREATE INDEX "tickets_pix_char_id_idx" ON "tickets"("pix_char_id");
