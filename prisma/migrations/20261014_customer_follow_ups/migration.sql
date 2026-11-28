ALTER TABLE public.customer_follow_ups
  ADD COLUMN IF NOT EXISTS contacted_on date,
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'โทร',
  ADD COLUMN IF NOT EXISTS next_on date,
  ADD COLUMN IF NOT EXISTS result text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';
ALTER TABLE public.customer_follow_ups ALTER COLUMN status SET DEFAULT 'รอติดตาม';
ALTER TABLE public.customer_follow_ups DROP CONSTRAINT IF EXISTS customer_follow_ups_rules;
ALTER TABLE public.customer_follow_ups ADD CONSTRAINT customer_follow_ups_rules CHECK (
  status IN ('รอติดตาม','เสร็จแล้ว','ยกเลิก') AND customer_id IS NOT NULL AND contacted_on IS NOT NULL
  AND channel IN ('โทร','เข้าพบ','LINE','อีเมล') AND (next_on IS NULL OR next_on >= contacted_on)
);
CREATE INDEX IF NOT EXISTS customer_follow_ups_next ON public.customer_follow_ups(next_on) WHERE status='รอติดตาม';
