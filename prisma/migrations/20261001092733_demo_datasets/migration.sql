CREATE TABLE "demo_datasets" (
  "key" TEXT PRIMARY KEY,
  "source_file" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "is_sample" BOOLEAN NOT NULL DEFAULT true CHECK (is_sample = true)
);
CREATE TABLE "demo_rows" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "dataset_key" TEXT NOT NULL REFERENCES "demo_datasets"("key") ON DELETE RESTRICT ON UPDATE CASCADE,
  "ref" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "detail" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "is_sample" BOOLEAN NOT NULL DEFAULT true CHECK (is_sample = true)
);
CREATE UNIQUE INDEX "demo_rows_dataset_key_ref_key" ON "demo_rows"("dataset_key", "ref");
CREATE INDEX "demo_rows_dataset_key_position_id_idx" ON "demo_rows"("dataset_key", "position", "id");
CREATE INDEX "demo_rows_dataset_key_status_idx" ON "demo_rows"("dataset_key", "status");
ALTER TABLE "demo_datasets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "demo_rows" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "demo_datasets", "demo_rows" FROM anon, authenticated, PUBLIC;
