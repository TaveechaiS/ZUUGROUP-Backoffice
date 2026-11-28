CREATE TABLE IF NOT EXISTS public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('codeGroup','codeFormat','productType','category','brand','manufacturer','ingredient','dosageForm','legalType','unit')),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  code text CHECK (code IS NULL OR code ~ '^[A-Z0-9]{2,3}$'),
  active boolean NOT NULL DEFAULT true,
  legacy boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind NOT IN ('codeGroup','codeFormat','category','dosageForm') OR code IS NOT NULL),
  CHECK (NOT legacy OR kind IN ('category','dosageForm','ingredient'))
);
CREATE UNIQUE INDEX IF NOT EXISTS product_options_kind_name ON public.product_options(kind,lower(btrim(name)));
CREATE UNIQUE INDEX IF NOT EXISTS product_options_kind_code ON public.product_options(kind,code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS product_options_kind_active ON public.product_options(kind,active,name,id);
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_options FROM anon,authenticated;
