ALTER TABLE public.sales_order_lines ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false;
ALTER TABLE public.sales_order_lines DROP CONSTRAINT IF EXISTS sales_order_lines_order_id_product_id_key;
ALTER TABLE public.sales_order_lines DROP CONSTRAINT IF EXISTS sales_order_lines_order_product_gift_key;
ALTER TABLE public.sales_order_lines ADD CONSTRAINT sales_order_lines_order_product_gift_key UNIQUE (order_id, product_id, is_gift);
ALTER TABLE public.sales_order_lines DROP CONSTRAINT IF EXISTS sales_order_lines_gift_price;
ALTER TABLE public.sales_order_lines ADD CONSTRAINT sales_order_lines_gift_price CHECK (NOT is_gift OR (unit_price = 0 AND discount = 0));
ALTER TABLE public.quotation_lines
  ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE RESTRICT;
ALTER TABLE public.quotation_lines DROP CONSTRAINT IF EXISTS quotation_lines_quotation_id_product_id_key;
ALTER TABLE public.quotation_lines DROP CONSTRAINT IF EXISTS quotation_lines_quote_product_gift_key;
ALTER TABLE public.quotation_lines ADD CONSTRAINT quotation_lines_quote_product_gift_key UNIQUE (quotation_id, product_id, is_gift);
ALTER TABLE public.quotation_lines DROP CONSTRAINT IF EXISTS quotation_lines_gift_rules;
ALTER TABLE public.quotation_lines ADD CONSTRAINT quotation_lines_gift_rules CHECK (
  (NOT is_gift AND warehouse_id IS NULL) OR (is_gift AND unit_price = 0 AND discount = 0 AND warehouse_id IS NOT NULL)
);
ALTER TABLE public.sales_orders
  ADD COLUMN IF NOT EXISTS promotion_id uuid REFERENCES public.promotions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS promotion_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS bill_discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (bill_discount >= 0);
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS promotion_id uuid REFERENCES public.promotions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS promotion_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS bill_discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (bill_discount >= 0);
CREATE INDEX IF NOT EXISTS sales_orders_promotion ON public.sales_orders(promotion_id) WHERE promotion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS quotations_promotion ON public.quotations(promotion_id) WHERE promotion_id IS NOT NULL;
