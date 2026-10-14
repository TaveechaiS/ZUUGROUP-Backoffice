ALTER TABLE public.customer_create_requests DROP CONSTRAINT IF EXISTS customer_create_requests_status_check;
ALTER TABLE public.customer_create_requests ADD CONSTRAINT customer_create_requests_status_check CHECK (
  status IN ('pending','submitted','returned','rejected','complete','cancelled')
);
ALTER TABLE public.customer_create_requests
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_reason text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS customer_create_requests_review ON public.customer_create_requests(status,submitted_at) WHERE submitted_at IS NOT NULL;
