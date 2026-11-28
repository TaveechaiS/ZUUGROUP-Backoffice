ALTER TABLE public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_status CHECK (
  status IN ('รอรับสินค้า','รับบางส่วน','รับครบ','ปิดแล้ว','ยกเลิก') AND order_date IS NOT NULL
);
