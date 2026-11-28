SELECT
  p.code,
  p.name,
  c.code AS category_code,
  f.code AS dosage_form_code,
  d.name AS drug_name,
  w.name AS warehouse_name,
  p.unit,
  p.sale_price,
  p.status,
  p.is_sample,
  p.deleted_at
FROM public.products AS p
JOIN public.product_categories AS c ON c.id = p.category_id
JOIN public.dosage_forms AS f ON f.id = p.dosage_form_id
JOIN public.drugs AS d ON d.id = p.drug_id
JOIN public.warehouses AS w ON w.id = p.default_warehouse_id
ORDER BY p.created_at DESC
LIMIT 50;
