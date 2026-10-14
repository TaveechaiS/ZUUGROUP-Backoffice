ALTER TABLE public.customer_options DROP CONSTRAINT IF EXISTS customer_options_kind_check;
ALTER TABLE public.customer_options ADD CONSTRAINT customer_options_kind_check CHECK (
  kind = ANY (ARRAY['codeGroup','creditStart','creditTerm','billingCycle','documentType','expenseCategory'])
);
INSERT INTO public.customer_options(kind,name)
SELECT 'expenseCategory',v.name FROM (VALUES
  ('ค่าเดินทาง'),('ค่าขนส่ง'),('ค่าสาธารณูปโภค'),('ค่าวัสดุอุปกรณ์'),('ค่าบริการ'),('ค่าใช้จ่ายอื่น')
) v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.customer_options o WHERE o.kind='expenseCategory' AND o.name=v.name);
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS expense_date date,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.customer_options(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS payee text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';
ALTER TABLE public.expenses ALTER COLUMN status SET DEFAULT 'บันทึกแล้ว';
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_rules;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_rules CHECK (
  status IN ('บันทึกแล้ว','ยกเลิก') AND expense_date IS NOT NULL AND category_id IS NOT NULL
  AND amount IS NOT NULL AND amount > 0
);
CREATE INDEX IF NOT EXISTS expenses_date ON public.expenses(expense_date);
CREATE TABLE IF NOT EXISTS public.expense_files (
  id uuid PRIMARY KEY,
  expense_id uuid NOT NULL REFERENCES public.expenses(id) ON DELETE RESTRICT,
  name text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL CHECK (size > 0),
  path text NOT NULL UNIQUE,
  created_by_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expense_files_expense ON public.expense_files(expense_id);
ALTER TABLE public.expense_files ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.expense_files FROM anon, authenticated;
