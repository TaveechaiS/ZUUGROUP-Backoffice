ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS starts_on date,
  ADD COLUMN IF NOT EXISTS ends_on date,
  ADD COLUMN IF NOT EXISTS min_type text NOT NULL DEFAULT 'จำนวน',
  ADD COLUMN IF NOT EXISTS min_value numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reward_type text NOT NULL DEFAULT 'ของแถม',
  ADD COLUMN IF NOT EXISTS discount_value numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';
ALTER TABLE public.promotions ALTER COLUMN status SET DEFAULT 'ใช้งาน';
ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_rules;
ALTER TABLE public.promotions ADD CONSTRAINT promotions_rules CHECK (
  status IN ('ร่าง','ใช้งาน','ยกเลิก')
  AND starts_on IS NOT NULL AND ends_on IS NOT NULL AND ends_on >= starts_on
  AND min_type IN ('จำนวน','มูลค่า') AND min_value > 0
  AND reward_type IN ('ของแถม','ส่วนลดบาท','ส่วนลด%')
  AND (
    (reward_type = 'ของแถม' AND discount_value = 0)
    OR (reward_type = 'ส่วนลดบาท' AND discount_value > 0)
    OR (reward_type = 'ส่วนลด%' AND discount_value > 0 AND discount_value <= 100)
  )
);
CREATE TABLE IF NOT EXISTS public.promotion_products (
  promotion_id uuid NOT NULL REFERENCES public.promotions(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  PRIMARY KEY (promotion_id, product_id)
);
CREATE INDEX IF NOT EXISTS promotion_products_product ON public.promotion_products(product_id);
ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promotion_products FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.promotion_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL REFERENCES public.promotions(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
  UNIQUE (promotion_id, product_id)
);
CREATE INDEX IF NOT EXISTS promotion_gifts_product ON public.promotion_gifts(product_id);
ALTER TABLE public.promotion_gifts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promotion_gifts FROM anon, authenticated;
