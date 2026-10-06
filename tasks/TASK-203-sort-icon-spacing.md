# TASK-203 — ไอคอน sortเล็กลงและชิดหัวคอลัมน์

สถานะ: COMPLETED

1. ACTIVE/Specs/Plan.
2. src/components/ui/sortable-table.tsx buttonถอนw-full/justify-between gap2→gap1.5; SVG20×18→14×13 คงviewBox/pathและสี.
3. scopedESLint/diff ตรวจsharedคงhandlers/aria-sort ไม่เปลี่ยนAPI/DBหรือsortingbehavior.

ผล: ถอนw-full/between/gap2และลดSVG14×13แล้ว scopedlint/diffผ่าน. ยังไม่ตรวจbrowser.
