# TASK-213 — สลับลูกศร Sort

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

สลับstrokeconditionsแล้ว; ESLint/diffผ่าน ไม่เปลี่ยนลำดับจริง/API/3จังหวะ.

1. sharedsortable-table.tsx path M5...ลงเปลี่ยนactiveconditiondesc→asc; path M15...ขึ้นเปลี่ยนasc→desc.
2. คงsize/colors/aria-sort/hooks/serverAPIและ3จังหวะเดิม.
3. ESLint/diff; UATกดแรก↓น้อยอยู่บน กดสอง↑มากอยู่บน กดสามสีปกติ/ลำดับเดิมทุกตาราง.
