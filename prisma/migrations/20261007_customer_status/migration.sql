ALTER TABLE public.customers ALTER COLUMN status SET DEFAULT 'ใช้งาน';
UPDATE public.customers SET status='ใช้งาน' WHERE details IS NOT NULL AND status NOT IN ('ใช้งาน','ระงับ','เลิกค้าขาย');
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_full_status;
ALTER TABLE public.customers ADD CONSTRAINT customers_full_status CHECK (details IS NULL OR status IN ('ใช้งาน','ระงับ','เลิกค้าขาย'));
CREATE INDEX IF NOT EXISTS customers_deleted_status_idx ON public.customers(deleted_at,status);
