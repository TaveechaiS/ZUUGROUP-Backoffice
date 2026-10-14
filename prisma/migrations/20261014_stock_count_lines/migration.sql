ALTER TABLE public.stock_count_sessions
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';
ALTER TABLE public.stock_count_sessions ALTER COLUMN status SET DEFAULT 'กำลังนับ';
ALTER TABLE public.stock_count_sessions DROP CONSTRAINT IF EXISTS stock_count_sessions_rules;
ALTER TABLE public.stock_count_sessions ADD CONSTRAINT stock_count_sessions_rules CHECK (
  status IN ('กำลังนับ','ปิดแล้ว','ยกเลิก') AND warehouse_id IS NOT NULL
);
CREATE TABLE IF NOT EXISTS public.stock_count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.stock_count_sessions(id) ON DELETE RESTRICT,
  lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE RESTRICT,
  system_quantity integer NOT NULL CHECK (system_quantity >= 0),
  counted_quantity integer CHECK (counted_quantity >= 0),
  note text NOT NULL DEFAULT '',
  UNIQUE (session_id, lot_id)
);
CREATE INDEX IF NOT EXISTS stock_count_lines_lot ON public.stock_count_lines(lot_id);
ALTER TABLE public.stock_count_lines ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stock_count_lines FROM anon, authenticated;
