-- TASK-275: quotation workflow with lines, and per-line discounts on sales orders.
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS workflow_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS valid_until date,
  ADD COLUMN IF NOT EXISTS territory_id uuid REFERENCES public.sales_territories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS approved_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS return_reason text NOT NULL DEFAULT '';
ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS quotations_workflow_status;
ALTER TABLE public.quotations ADD CONSTRAINT quotations_workflow_status CHECK (
  NOT workflow_managed OR (
    status IN ('รออนุมัติ','ส่งกลับแก้ไข','อนุมัติ','ไม่อนุมัติ','ยกเลิก') AND valid_until IS NOT NULL
  )
);
CREATE TABLE IF NOT EXISTS public.quotation_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= quantity * unit_price),
  UNIQUE (quotation_id, product_id)
);
CREATE INDEX IF NOT EXISTS quotation_lines_product ON public.quotation_lines(product_id);
ALTER TABLE public.quotation_lines ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quotation_lines FROM anon, authenticated;
ALTER TABLE public.sales_order_lines ADD COLUMN IF NOT EXISTS discount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.sales_order_lines DROP CONSTRAINT IF EXISTS sales_order_lines_discount;
ALTER TABLE public.sales_order_lines ADD CONSTRAINT sales_order_lines_discount CHECK (discount >= 0 AND discount <= quantity * unit_price);
-- One order per quotation; a quotation converts at most once.
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS quotation_id uuid REFERENCES public.quotations(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS sales_orders_quotation_key ON public.sales_orders(quotation_id) WHERE quotation_id IS NOT NULL;
