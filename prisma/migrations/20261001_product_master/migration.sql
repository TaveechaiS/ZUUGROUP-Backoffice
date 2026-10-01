-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosage_forms" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dosage_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "dosage_form_id" UUID NOT NULL,
    "drug_id" UUID NOT NULL,
    "default_warehouse_id" UUID NOT NULL,
    "unit" TEXT NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "status" "product_status" NOT NULL DEFAULT 'ACTIVE',
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,
    "delete_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_code_key" ON "product_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dosage_forms_code_key" ON "dosage_forms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dosage_forms_name_key" ON "dosage_forms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_name_key" ON "drugs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_name_key" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_deleted_at_created_at_idx" ON "products"("deleted_at", "created_at");

-- CreateIndex
CREATE INDEX "products_category_id_status_idx" ON "products"("category_id", "status");

-- CreateIndex
CREATE INDEX "products_drug_id_idx" ON "products"("drug_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_category_id_dosage_form_id_sequence_key" ON "products"("category_id", "dosage_form_id", "sequence");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_dosage_form_id_fkey" FOREIGN KEY ("dosage_form_id") REFERENCES "dosage_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_default_warehouse_id_fkey" FOREIGN KEY ("default_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_code_format" CHECK ("code" ~ '^[A-Z0-9]{2,3}$');
ALTER TABLE "dosage_forms" ADD CONSTRAINT "dosage_forms_code_format" CHECK ("code" ~ '^[A-Z0-9]{2,3}$');
ALTER TABLE "products" ADD CONSTRAINT "products_code_format" CHECK ("code" ~ '^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-[0-9]{4}$');
ALTER TABLE "products" ADD CONSTRAINT "products_sequence_range" CHECK ("sequence" BETWEEN 1 AND 9999);
ALTER TABLE "products" ADD CONSTRAINT "products_sale_price_nonnegative" CHECK ("sale_price" >= 0);

CREATE UNIQUE INDEX "product_categories_name_lower_key" ON "product_categories" (lower("name"));
CREATE UNIQUE INDEX "dosage_forms_name_lower_key" ON "dosage_forms" (lower("name"));
CREATE UNIQUE INDEX "drugs_name_lower_key" ON "drugs" (lower("name"));

-- Server-only Prisma access. No Data API policy for anon or authenticated users.
ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dosage_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drugs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "warehouses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "product_categories", "dosage_forms", "drugs", "warehouses", "products" FROM anon, authenticated;
