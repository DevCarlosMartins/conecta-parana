-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cities_name_state_key" ON "cities"("name", "state");