CREATE TABLE public.sales_territory_sales (
  territory_id uuid NOT NULL REFERENCES public.sales_territories(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (territory_id, user_id),
  CONSTRAINT sales_territory_sales_user_unique UNIQUE (user_id)
);
ALTER TABLE public.sales_territory_sales ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales_territory_sales FROM PUBLIC, anon, authenticated;
INSERT INTO public.sales_territory_sales (territory_id, user_id)
SELECT id, sales_id FROM public.sales_territories WHERE sales_id IS NOT NULL;
