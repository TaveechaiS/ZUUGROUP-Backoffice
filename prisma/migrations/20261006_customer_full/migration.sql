ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS code_group_id uuid REFERENCES public.customer_options(id) ON DELETE RESTRICT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS sequence integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_name text NOT NULL DEFAULT '';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_term_id uuid REFERENCES public.customer_options(id) ON DELETE RESTRICT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_days integer;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_limit numeric(14,2);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_status text NOT NULL DEFAULT '';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS license_expires_at date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS details jsonb;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_full_shape;
ALTER TABLE public.customers ADD CONSTRAINT customers_full_shape CHECK (
  (code_group_id IS NULL AND sequence IS NULL AND details IS NULL) OR
  (code_group_id IS NOT NULL AND sequence BETWEEN 1 AND 999999 AND details IS NOT NULL AND code ~ '^[A-Z0-9]{2,3}-[0-9]{4,6}$')
);
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_credit_values;
ALTER TABLE public.customers ADD CONSTRAINT customers_credit_values CHECK (
  (credit_days IS NULL OR credit_days BETWEEN 0 AND 365) AND (credit_limit IS NULL OR credit_limit >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS customers_group_sequence_key ON public.customers(code_group_id,sequence) WHERE code_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS customers_province_idx ON public.customers(province);
CREATE TABLE IF NOT EXISTS public.customer_create_requests (
  id uuid PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  digest text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','complete','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.customer_files (
  id uuid PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.customer_create_requests(id) ON DELETE RESTRICT,
  document_type_id uuid NOT NULL REFERENCES public.customer_options(id) ON DELETE RESTRICT,
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL CHECK (size > 0 AND size <= 10485760),
  path text NOT NULL UNIQUE,
  digest text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_files_request_idx ON public.customer_files(request_id);
ALTER TABLE public.customer_create_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_create_requests,public.customer_files FROM anon,authenticated;
