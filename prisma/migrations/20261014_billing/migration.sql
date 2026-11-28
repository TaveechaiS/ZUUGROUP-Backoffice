ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS sales_order_id uuid REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS issue_date date,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';
ALTER TABLE public.invoices ALTER COLUMN status SET DEFAULT 'ค้างชำระ';
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_rules;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_rules CHECK (
  status IN ('ค้างชำระ','ชำระบางส่วน','ชำระครบ','ยกเลิก')
  AND sales_order_id IS NOT NULL AND customer_id IS NOT NULL
  AND issue_date IS NOT NULL AND due_date IS NOT NULL AND due_date >= issue_date
  AND amount IS NOT NULL AND amount >= 0
);
CREATE UNIQUE INDEX IF NOT EXISTS invoices_sales_order_active ON public.invoices(sales_order_id) WHERE status <> 'ยกเลิก' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS invoices_due ON public.invoices(due_date);
CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  paid_on date NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('เงินสด','โอน','เช็ค')),
  reference text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  voided_at timestamptz,
  void_reason text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS invoice_payments_invoice ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_payments_paid_on ON public.invoice_payments(paid_on);
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.invoice_payments FROM anon, authenticated;
