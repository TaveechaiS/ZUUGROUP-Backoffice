ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS tax_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.suppliers ALTER COLUMN status SET DEFAULT 'ใช้งาน';
ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS suppliers_status;
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_status CHECK (status IN ('ใช้งาน','ระงับ'));

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS order_date date,
  ADD COLUMN IF NOT EXISTS expected_on date,
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS close_reason text NOT NULL DEFAULT '';
ALTER TABLE public.purchase_orders ALTER COLUMN status SET DEFAULT 'รอรับสินค้า';
ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_status CHECK (
  status IN ('รอรับสินค้า','รับบางส่วน','รับครบ','ปิดแล้ว','ยกเลิก') AND supplier_id IS NOT NULL AND order_date IS NOT NULL
);

CREATE TABLE IF NOT EXISTS public.purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_cost numeric(14,2) NOT NULL CHECK (unit_cost >= 0),
  discount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= quantity * unit_cost),
  UNIQUE (purchase_order_id, product_id)
);
CREATE INDEX IF NOT EXISTS purchase_order_lines_product ON public.purchase_order_lines(product_id);
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.purchase_order_lines FROM anon, authenticated;

ALTER TABLE public.stock_receipts
  ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS purchase_order_line_id uuid REFERENCES public.purchase_order_lines(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS stock_receipts_po_line ON public.stock_receipts(purchase_order_line_id) WHERE purchase_order_line_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stock_receipts_supplier ON public.stock_receipts(supplier_id) WHERE supplier_id IS NOT NULL;
