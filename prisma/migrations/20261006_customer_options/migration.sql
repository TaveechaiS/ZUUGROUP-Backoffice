CREATE TABLE IF NOT EXISTS public.customer_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('codeGroup','creditStart','creditTerm','billingCycle','documentType')),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  code text CHECK (code IS NULL OR code ~ '^[A-Z0-9]{2,3}$'),
  days integer CHECK (days IS NULL OR days BETWEEN 0 AND 365),
  active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'codeGroup' OR code IS NOT NULL),
  CHECK (kind = 'codeGroup' OR code IS NULL),
  CHECK ((kind = 'creditTerm') = (days IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS customer_options_kind_name ON public.customer_options(kind,lower(btrim(name)));
CREATE UNIQUE INDEX IF NOT EXISTS customer_options_kind_code ON public.customer_options(kind,code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS customer_options_kind_active ON public.customer_options(kind,active,name,id);
ALTER TABLE public.customer_options ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_options FROM anon,authenticated;
INSERT INTO public.customer_options(kind,name,code,days) VALUES
  ('codeGroup','ร้านขายยา','PHA',NULL),
  ('codeGroup','คลินิกเวชกรรม / ทันตกรรม','CLN',NULL),
  ('codeGroup','โรงพยาบาล','HOS',NULL),
  ('codeGroup','ยี่ปั๊ว / ผู้ค้าส่ง','WSL',NULL),
  ('codeGroup','หน่วยงานราชการ / โรงพยาบาลรัฐ','GOV',NULL),
  ('creditTerm','เงินสด',NULL,0),
  ('creditTerm','เครดิต 30 วัน',NULL,30),
  ('creditTerm','เครดิต 60 วัน',NULL,60),
  ('creditTerm','เครดิต 90 วัน',NULL,90),
  ('documentType','ใบอนุญาตสถานพยาบาล / ใบอนุญาตขายยา',NULL,NULL),
  ('documentType','ภ.พ.20',NULL,NULL),
  ('documentType','หนังสือรับรองบริษัท',NULL,NULL),
  ('documentType','สำเนาบัตรประชาชนเจ้าของร้าน',NULL,NULL),
  ('documentType','เอกสารอื่น',NULL,NULL)
ON CONFLICT DO NOTHING;
