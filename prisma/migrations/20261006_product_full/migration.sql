ALTER TABLE public.products ADD COLUMN IF NOT EXISTS details jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code_group_id uuid REFERENCES public.product_options(id) ON DELETE RESTRICT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code_format_id uuid REFERENCES public.product_options(id) ON DELETE RESTRICT;
ALTER TABLE public.products ALTER COLUMN dosage_form_id DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN drug_id DROP NOT NULL;
ALTER TABLE public.products ALTER COLUMN default_warehouse_id DROP NOT NULL;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_code_format;
ALTER TABLE public.products ADD CONSTRAINT products_code_format CHECK (
 (code_group_id IS NULL AND code_format_id IS NULL AND code ~ '^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-[0-9]{4}$') OR
 (code_group_id IS NOT NULL AND code_format_id IS NOT NULL AND code ~ '^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-[0-9]{5}$')
);
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sequence_range;
ALTER TABLE public.products ADD CONSTRAINT products_sequence_range CHECK (sequence BETWEEN 1 AND CASE WHEN code_group_id IS NULL THEN 9999 ELSE 99999 END);
DROP INDEX IF EXISTS public.products_category_id_dosage_form_id_sequence_key;
DROP INDEX IF EXISTS public."products_categoryId_dosageFormId_sequence_key";
CREATE UNIQUE INDEX IF NOT EXISTS products_legacy_sequence_key ON public.products(category_id,dosage_form_id,sequence) WHERE code_group_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_full_sequence_key ON public.products(code_group_id,code_format_id,sequence);
CREATE TABLE IF NOT EXISTS public.product_create_requests (
 id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
 product_id uuid NOT NULL UNIQUE, payload jsonb NOT NULL, digest text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','complete','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.product_files (
 id uuid PRIMARY KEY, request_id uuid NOT NULL REFERENCES public.product_create_requests(id) ON DELETE RESTRICT,
 kind text NOT NULL CHECK(kind IN ('image','document')), name text NOT NULL, type text NOT NULL,
 size integer NOT NULL CHECK(size > 0 AND size <= 10485760), path text NOT NULL UNIQUE,
 digest text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_files_request_idx ON public.product_files(request_id);
ALTER TABLE public.product_create_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_create_requests,public.product_files FROM anon,authenticated;
