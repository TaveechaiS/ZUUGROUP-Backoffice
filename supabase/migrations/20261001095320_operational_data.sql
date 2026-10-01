CREATE TABLE "system_settings" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "value" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "stock_count_sessions" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "warehouse_id" UUID,
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "result_text" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "promotions" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "conditions" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "invoices" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "customer_id" UUID,
 "due_text" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "amount" DECIMAL(14,2),
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "sales_orders" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "customer_id" UUID,
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "amount" DECIMAL(14,2),
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "quotations" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "customer_id" UUID,
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "amount" DECIMAL(14,2),
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "purchase_orders" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "supplier_id" UUID,
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "amount" DECIMAL(14,2),
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "expenses" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "amount" DECIMAL(14,2),
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "suppliers" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "location" TEXT NOT NULL DEFAULT '',
 "contact" TEXT NOT NULL DEFAULT '',
 "payment_terms" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "customer_follow_ups" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "customer_id" UUID,
 "category" TEXT NOT NULL DEFAULT '',
 "province" TEXT NOT NULL DEFAULT '',
 "follow_up_text" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "customer_documents" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "customer_id" UUID,
 "document_type" TEXT NOT NULL DEFAULT '',
 "date_text" TEXT NOT NULL DEFAULT '',
 "file_url" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "sales_territories" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "area" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "customer_groups" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "description" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE TABLE "customers" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "code" TEXT NOT NULL DEFAULT '',
 "name" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'ใช้งานอยู่',
 "category" TEXT NOT NULL DEFAULT '',
 "province" TEXT NOT NULL DEFAULT '',
 "owner" TEXT NOT NULL DEFAULT '',
 "payment_terms" TEXT NOT NULL DEFAULT '',
 "group_id" UUID,
 "territory_id" UUID,
 "notes" TEXT NOT NULL DEFAULT '',
 "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "deleted_at" TIMESTAMPTZ,
 "deleted_by_id" UUID,
 "delete_reason" TEXT
);
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");
ALTER TABLE "customers" ADD CONSTRAINT "customers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "customer_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "customers_group_id_idx" ON "customers"("group_id");
ALTER TABLE "customers" ADD CONSTRAINT "customers_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "sales_territories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "customers_territory_id_idx" ON "customers"("territory_id");
CREATE INDEX "customers_deleted_at_created_at_idx" ON "customers"("deleted_at","created_at");
CREATE INDEX "customers_status_idx" ON "customers"("status");
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "customers" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "customer_groups_code_key" ON "customer_groups"("code");
CREATE INDEX "customer_groups_deleted_at_created_at_idx" ON "customer_groups"("deleted_at","created_at");
CREATE INDEX "customer_groups_status_idx" ON "customer_groups"("status");
ALTER TABLE "customer_groups" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "customer_groups" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "sales_territories_code_key" ON "sales_territories"("code");
CREATE INDEX "sales_territories_deleted_at_created_at_idx" ON "sales_territories"("deleted_at","created_at");
CREATE INDEX "sales_territories_status_idx" ON "sales_territories"("status");
ALTER TABLE "sales_territories" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "sales_territories" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "customer_documents_code_key" ON "customer_documents"("code");
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "customer_documents_customer_id_idx" ON "customer_documents"("customer_id");
CREATE INDEX "customer_documents_deleted_at_created_at_idx" ON "customer_documents"("deleted_at","created_at");
CREATE INDEX "customer_documents_status_idx" ON "customer_documents"("status");
ALTER TABLE "customer_documents" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "customer_documents" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "customer_follow_ups_code_key" ON "customer_follow_ups"("code");
ALTER TABLE "customer_follow_ups" ADD CONSTRAINT "customer_follow_ups_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "customer_follow_ups_customer_id_idx" ON "customer_follow_ups"("customer_id");
CREATE INDEX "customer_follow_ups_deleted_at_created_at_idx" ON "customer_follow_ups"("deleted_at","created_at");
CREATE INDEX "customer_follow_ups_status_idx" ON "customer_follow_ups"("status");
ALTER TABLE "customer_follow_ups" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "customer_follow_ups" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "suppliers_code_key" ON "suppliers"("code");
CREATE INDEX "suppliers_deleted_at_created_at_idx" ON "suppliers"("deleted_at","created_at");
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "suppliers" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "expenses_code_key" ON "expenses"("code");
CREATE INDEX "expenses_deleted_at_created_at_idx" ON "expenses"("deleted_at","created_at");
CREATE INDEX "expenses_status_idx" ON "expenses"("status");
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "expenses" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "purchase_orders_code_key" ON "purchase_orders"("code");
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");
CREATE INDEX "purchase_orders_deleted_at_created_at_idx" ON "purchase_orders"("deleted_at","created_at");
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");
ALTER TABLE "purchase_orders" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "purchase_orders" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "quotations_code_key" ON "quotations"("code");
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "quotations_customer_id_idx" ON "quotations"("customer_id");
CREATE INDEX "quotations_deleted_at_created_at_idx" ON "quotations"("deleted_at","created_at");
CREATE INDEX "quotations_status_idx" ON "quotations"("status");
ALTER TABLE "quotations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "quotations" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "sales_orders_code_key" ON "sales_orders"("code");
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "sales_orders_customer_id_idx" ON "sales_orders"("customer_id");
CREATE INDEX "sales_orders_deleted_at_created_at_idx" ON "sales_orders"("deleted_at","created_at");
CREATE INDEX "sales_orders_status_idx" ON "sales_orders"("status");
ALTER TABLE "sales_orders" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "sales_orders" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");
CREATE INDEX "invoices_deleted_at_created_at_idx" ON "invoices"("deleted_at","created_at");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "invoices" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");
CREATE INDEX "promotions_deleted_at_created_at_idx" ON "promotions"("deleted_at","created_at");
CREATE INDEX "promotions_status_idx" ON "promotions"("status");
ALTER TABLE "promotions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "promotions" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "stock_count_sessions_code_key" ON "stock_count_sessions"("code");
ALTER TABLE "stock_count_sessions" ADD CONSTRAINT "stock_count_sessions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "stock_count_sessions_warehouse_id_idx" ON "stock_count_sessions"("warehouse_id");
CREATE INDEX "stock_count_sessions_deleted_at_created_at_idx" ON "stock_count_sessions"("deleted_at","created_at");
CREATE INDEX "stock_count_sessions_status_idx" ON "stock_count_sessions"("status");
ALTER TABLE "stock_count_sessions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "stock_count_sessions" FROM anon, authenticated, PUBLIC;
CREATE UNIQUE INDEX "system_settings_code_key" ON "system_settings"("code");
CREATE INDEX "system_settings_deleted_at_created_at_idx" ON "system_settings"("deleted_at","created_at");
CREATE INDEX "system_settings_status_idx" ON "system_settings"("status");
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "system_settings" FROM anon, authenticated, PUBLIC;
CREATE TABLE record_import_map(source_id UUID PRIMARY KEY,source_module TEXT NOT NULL,entity TEXT NOT NULL,record_id UUID NOT NULL);
CREATE INDEX record_import_map_entity_record_id_idx ON record_import_map(entity,record_id);
ALTER TABLE record_import_map ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON record_import_map FROM anon, authenticated, PUBLIC;
