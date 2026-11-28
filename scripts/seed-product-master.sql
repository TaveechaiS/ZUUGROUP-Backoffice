-- Initial data. Existing rows, including rows edited by Admin, are never updated.
INSERT INTO public.product_categories (id, code, name) VALUES
  (gen_random_uuid(), 'MED', 'ยาแผนปัจจุบัน'),
  (gen_random_uuid(), 'HER', 'ยาสมุนไพร/ยาแผนไทย'),
  (gen_random_uuid(), 'SUP', 'เวชภัณฑ์')
ON CONFLICT DO NOTHING;

INSERT INTO public.dosage_forms (id, code, name) VALUES
  (gen_random_uuid(), 'TAB', 'ยาเม็ด'),
  (gen_random_uuid(), 'CAP', 'แคปซูล'),
  (gen_random_uuid(), 'SYR', 'น้ำเชื่อม'),
  (gen_random_uuid(), 'INJ', 'ยาฉีด')
ON CONFLICT DO NOTHING;

INSERT INTO public.warehouses (id, code, name) VALUES
  (gen_random_uuid(), 'MAIN', 'คลังหลัก'),
  (gen_random_uuid(), 'MARKETING', 'คลังการตลาด'),
  (gen_random_uuid(), 'DISPOSAL', 'คลังรอทำลาย')
ON CONFLICT DO NOTHING;

INSERT INTO public.drugs (id, name) VALUES
  (gen_random_uuid(), 'พาราเซตามอล'),
  (gen_random_uuid(), 'อะม็อกซีซิลลิน')
ON CONFLICT DO NOTHING;

WITH inserted AS (
INSERT INTO public.products
  (id, code, sequence, name, category_id, dosage_form_id, drug_id,
   default_warehouse_id, unit, sale_price, status, is_sample, updated_at)
SELECT gen_random_uuid(), 'MED-TAB-0001', 1, 'พาราเซตามอล 500 มก.',
  c.id, f.id, d.id, w.id, 'กล่อง', 120.00, 'ACTIVE', false, now()
FROM public.product_categories c, public.dosage_forms f, public.drugs d, public.warehouses w
WHERE c.code = 'MED' AND f.code = 'TAB' AND d.name = 'พาราเซตามอล' AND w.code = 'MAIN'
ON CONFLICT DO NOTHING
RETURNING id, code
)
INSERT INTO public.audit_events (id, actor_role, action, request_id, after)
SELECT gen_random_uuid(), 'SYSTEM', 'PRODUCT_SEEDED', 'seed-product-master:' || p.code,
  jsonb_build_object('productId', p.id, 'code', p.code)
FROM inserted p;

WITH inserted AS (
INSERT INTO public.products
  (id, code, sequence, name, category_id, dosage_form_id, drug_id,
   default_warehouse_id, unit, sale_price, status, is_sample, updated_at)
SELECT gen_random_uuid(), 'MED-CAP-0001', 1, 'อะม็อกซีซิลลิน 250 มก.',
  c.id, f.id, d.id, w.id, 'กล่อง', 175.00, 'ACTIVE', false, now()
FROM public.product_categories c, public.dosage_forms f, public.drugs d, public.warehouses w
WHERE c.code = 'MED' AND f.code = 'CAP' AND d.name = 'อะม็อกซีซิลลิน' AND w.code = 'MAIN'
ON CONFLICT DO NOTHING
RETURNING id, code
)
INSERT INTO public.audit_events (id, actor_role, action, request_id, after)
SELECT gen_random_uuid(), 'SYSTEM', 'PRODUCT_SEEDED', 'seed-product-master:' || p.code,
  jsonb_build_object('productId', p.id, 'code', p.code)
FROM inserted p;
