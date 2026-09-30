ALTER TABLE "users"
  ADD COLUMN "deleted_at" TIMESTAMPTZ(6),
  ADD COLUMN "deleted_by" UUID,
  ADD COLUMN "delete_reason" TEXT;

CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");
CREATE INDEX "users_deleted_by_idx" ON "users"("deleted_by");

ALTER TABLE "users"
  ADD CONSTRAINT "users_deleted_by_fkey"
  FOREIGN KEY ("deleted_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
