'use client';
import ProductOptionCombobox from './product-option-combobox';
export default function ProductNameCombobox({
  id,
  kind,
}: {
  id: string;
  kind: 'brand' | 'manufacturer';
}) {
  return <ProductOptionCombobox id={id} kind={kind} canManage />;
}
