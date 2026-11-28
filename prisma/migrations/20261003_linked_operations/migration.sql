ALTER TABLE public.sales_territories ADD COLUMN manager_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_territories ADD COLUMN sales_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX sales_territory_manager_unique ON public.sales_territories(manager_id);
CREATE UNIQUE INDEX sales_territory_sales_unique ON public.sales_territories(sales_id);
ALTER TABLE public.sales_territories ADD CONSTRAINT territory_distinct_people CHECK (manager_id IS NULL OR sales_id IS NULL OR manager_id<>sales_id);
UPDATE public.customers c SET category=g.name FROM public.customer_groups g WHERE c.group_id=g.id AND btrim(c.category)='';
INSERT INTO public.sales_territories(code,name,status) VALUES ('ZONE-N','เหนือ','ใช้งานอยู่'),('ZONE-E','ออก','ใช้งานอยู่'),('ZONE-W','ตก','ใช้งานอยู่'),('ZONE-S','ใต้','ใช้งานอยู่') ON CONFLICT(code) DO NOTHING;
ALTER TABLE public.sales_orders ADD COLUMN workflow_managed boolean NOT NULL DEFAULT false;
ALTER TABLE public.sales_orders ADD COLUMN created_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_orders ADD COLUMN approved_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_orders ADD COLUMN completed_by_id uuid REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_orders ADD COLUMN territory_id uuid REFERENCES public.sales_territories(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_orders ADD COLUMN return_reason text NOT NULL DEFAULT '';
CREATE TABLE public.stock_receipts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE,
 source text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '',
 actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.product_lots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), receipt_id uuid NOT NULL REFERENCES public.stock_receipts(id) ON DELETE RESTRICT,
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
 lot_number text NOT NULL, received_quantity integer NOT NULL CHECK(received_quantity>0),
 total_cost numeric(14,2) NOT NULL CHECK(total_cost>=0), manufactured_on date NOT NULL, expires_on date NOT NULL,
 condition text NOT NULL DEFAULT 'ปกติ' CHECK(condition IN ('ปกติ','เสื่อมสภาพ')),
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(expires_on>manufactured_on)
);
CREATE INDEX product_lots_product_expiry ON public.product_lots(product_id,expires_on,id);
CREATE INDEX product_lots_receipt ON public.product_lots(receipt_id);
CREATE TABLE public.stock_balances (
 lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE RESTRICT,
 warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
 quantity integer NOT NULL DEFAULT 0 CHECK(quantity>=0), reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0 AND reserved<=quantity),
 PRIMARY KEY(lot_id,warehouse_id)
);
CREATE INDEX stock_balances_warehouse ON public.stock_balances(warehouse_id,lot_id);
CREATE TABLE public.stock_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE RESTRICT,
 warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
 quantity integer NOT NULL CHECK(quantity<>0), kind text NOT NULL,
 source_id uuid NOT NULL, reason text NOT NULL DEFAULT '',
 actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stock_movements_lot_date ON public.stock_movements(lot_id,occurred_at);
CREATE TABLE public.receipt_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE RESTRICT,
 actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
 reason text NOT NULL CHECK(btrim(reason)<>''), before_data jsonb NOT NULL, after_data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX receipt_revisions_lot ON public.receipt_revisions(lot_id,created_at);
CREATE TABLE public.sales_order_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.sales_orders(id) ON DELETE RESTRICT,
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
 quantity integer NOT NULL CHECK(quantity>0), unit_price numeric(12,2) NOT NULL CHECK(unit_price>=0), product_name text NOT NULL,
 UNIQUE(order_id,product_id)
);
CREATE INDEX sales_order_lines_product ON public.sales_order_lines(product_id);
CREATE TABLE public.stock_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_line_id uuid NOT NULL REFERENCES public.sales_order_lines(id) ON DELETE RESTRICT,
 lot_id uuid NOT NULL REFERENCES public.product_lots(id) ON DELETE RESTRICT,
 warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
 quantity integer NOT NULL CHECK(quantity>0), status text NOT NULL DEFAULT 'จอง' CHECK(status IN ('จอง','จ่ายแล้ว','คืนจอง')),
 unit_cost numeric(20,8), UNIQUE(order_line_id,lot_id,warehouse_id)
);
CREATE INDEX stock_reservations_lot ON public.stock_reservations(lot_id,status);
CREATE TABLE public.operation_commands (
 id uuid PRIMARY KEY, actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
 fingerprint text NOT NULL, result jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.inventory_policy (
 id integer PRIMARY KEY CHECK(id=1), sale_months integer NOT NULL CHECK(sale_months BETWEEN 0 AND 24),
 donation_months integer NOT NULL CHECK(donation_months BETWEEN 6 AND 36), warning_days integer NOT NULL CHECK(warning_days BETWEEN 1 AND 730)
);
INSERT INTO public.inventory_policy VALUES(1,6,12,90);
ALTER TABLE public.stock_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_policy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stock_receipts,public.product_lots,public.stock_balances,public.stock_movements,public.receipt_revisions,public.sales_order_lines,public.stock_reservations,public.operation_commands,public.inventory_policy FROM anon,authenticated;
