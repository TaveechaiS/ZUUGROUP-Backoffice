import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const file = 'postman/Zuugroup.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
const auth = {
  type: 'bearer',
  bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }],
};
const common =
  'Bearer accessToken จาก Login ใน Environment ส่วนตัว. 401 ไม่เข้าสู่ระบบ, 403 ไม่มีสิทธิ์/ไม่ใช่ Admin, 400 ข้อมูลไม่ถูกต้อง, 404 ไม่พบ, 409 ข้อมูลซ้ำ/ถูกแก้ไขแล้ว, 503 เชื่อมต่อชั่วคราว. ตัวอย่าง response เป็นโครงสร้างสมมุติ ไม่ใช่ข้อมูลจริง.';
const json = (value) => JSON.stringify(value, null, 2);

function request({
  name,
  method,
  url,
  description,
  body,
  formdata,
  status = 200,
  example,
  save,
  prerequest,
}) {
  const header = [{ key: 'Accept', value: 'application/json' }];
  if (body) header.push({ key: 'Content-Type', value: 'application/json' });
  const req = {
    method,
    header,
    url: '{{baseUrl}}' + url,
    description: description + '\n\n' + common,
    auth,
    ...(body
      ? {
          body: {
            mode: 'raw',
            raw: json(body).replace(/"(\{\{\w+Version\}\})"/g, '$1'),
            options: { raw: { language: 'json' } },
          },
        }
      : {}),
    ...(formdata ? { body: { mode: 'formdata', formdata } } : {}),
  };
  const exec = [
    `pm.test("HTTP ${status}", () => pm.response.to.have.status(${status}));`,
    `if (pm.response.code === ${status} && pm.response.headers.get("Content-Type")?.includes("json")) {`,
    '  const data = pm.response.json();',
    '  if (data.pagination) pm.test("Pagination is bounded", () => { pm.expect(data.data).to.be.an("array"); pm.expect(data.data.length).to.be.at.most(data.pagination.limit); });',
    ...(save ?? []).map(([variable, path]) => `  pm.environment.set("${variable}", data.${path});`),
    '}',
  ];
  return {
    id: randomUUID(),
    name,
    request: req,
    event: [
      ...(prerequest
        ? [{ listen: 'prerequest', script: { type: 'text/javascript', exec: prerequest } }]
        : []),
      { listen: 'test', script: { type: 'text/javascript', exec } },
    ],
    response: [
      {
        name: 'ตัวอย่างสำเร็จ',
        originalRequest: req,
        status: status === 201 ? 'Created' : 'OK',
        code: status,
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: json(example),
      },
    ],
  };
}

const key = { idempotencyKey: '{{$guid}}' };
const actor = { id: '55555555-5555-4555-8555-555555555555', roleId: 'ADMIN', name: 'Admin' };
const page = { offset: 0, limit: 10, total: 1, hasMore: false };
const purchaseRow = {
  id: '77777777-7777-4777-8777-777777777777',
  code: 'PO-2569-0001',
  status: 'รอรับสินค้า',
  orderDate: '2026-10-08',
  expectedOn: '2026-10-15',
  amount: '480.00',
  ordered: 10,
  received: 0,
};
const lines = [{ productId: '{{productId}}', quantity: 10, unitCost: '50.00', discount: '20.00' }];
const patch = (name, url, body, description, example) =>
  request({
    name,
    method: 'PATCH',
    url,
    description,
    body: { ...key, expectedUpdatedAt: '{{documentUpdatedAt}}', ...body },
    example: { data: example },
  });

const folders = [
  {
    name: 'ใบสั่งซื้อ (Purchase Orders)',
    description:
      'TASK-276/277. ไม่มีผู้ขาย (TASK-277). เลข PO-ปีพ.ศ.-0001 ระบบออกเอง. Admin สร้างมีผลทันที (ไม่มีขั้นอนุมัติ). ต้นทุนต่อหน่วยรวม VAT + ส่วนลดบาทต่อรายการ. สถานะ รอรับสินค้า → รับบางส่วน → รับครบ ตามรับเข้าจริง (POST /api/inventory action=receive + purchaseOrderLineId); รับเกินจำนวนสั่งไม่ได้. แก้ได้ก่อนรับครั้งแรก. ปิดแล้ว = ปิดใบที่รับบางส่วน, ยกเลิก = ใบที่ยังไม่รับ; ทั้งสองต้องมี reason.',
    item: [
      request({
        name: 'GET รายการใบสั่งซื้อ',
        method: 'GET',
        url: '/api/purchases?limit={{limit}}&offset={{offset}}&search=&status=',
        description:
          'status: รอรับสินค้า|รับบางส่วน|รับครบ|ปิดแล้ว|ยกเลิก. search: เลขที่/ชื่อสินค้า/หมายเหตุ. sortBy: code|orderDate|expectedOn|amount|status.',
        example: { data: [purchaseRow], pagination: page, actor },
        save: [['purchaseOrderId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายการค้างรับ (สำหรับรับเข้า)',
        method: 'GET',
        url: '/api/purchases?view=open-lines',
        description:
          'บรรทัดของใบที่ยังเปิดและค้างรับ > 0. ใช้ id เป็น purchaseOrderLineId ตอนรับเข้า.',
        example: {
          data: [
            {
              id: '88888888-8888-4888-8888-888888888888',
              purchaseOrderCode: 'PO-2569-0001',
              productId: '{{productId}}',
              quantity: 10,
              received: 0,
              remaining: 10,
            },
          ],
          actor,
        },
        save: [['purchaseOrderLineId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดใบสั่งซื้อ',
        method: 'GET',
        url: '/api/purchases/{{purchaseOrderId}}',
        description: 'รับ id หรือเลขที่ PO. มี lines (สั่ง/รับแล้ว/ค้างรับ) และ receipts.',
        example: { data: { ...purchaseRow, lines: [], receipts: [] }, actor },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST สร้างใบสั่งซื้อ',
        method: 'POST',
        url: '/api/purchases',
        status: 201,
        description:
          'Admin. orderDate ไม่ส่ง = วันนี้ และห้ามเกินวันนี้; expectedOn ไม่บังคับ ห้ามก่อน orderDate.',
        body: {
          ...key,
          orderDate: '',
          expectedOn: '',
          notes: '',
          lines,
        },
        example: { data: { id: purchaseRow.id, code: purchaseRow.code, status: 'รอรับสินค้า' } },
        save: [['purchaseOrderId', 'data.id']],
      }),
      patch(
        'PATCH แก้ไขใบสั่งซื้อ',
        '/api/purchases/{{purchaseOrderId}}',
        { action: 'edit', notes: '', lines },
        'Admin. ได้เฉพาะก่อนรับสินค้าครั้งแรก มิฉะนั้น 409.',
        { id: purchaseRow.id },
      ),
      patch(
        'PATCH ปิดใบสั่งซื้อ (ไม่รับส่วนที่เหลือ)',
        '/api/purchases/{{purchaseOrderId}}',
        { action: 'close', reason: 'เหตุผล' },
        'Admin. ต้องรับสินค้าแล้วบางส่วน; ยังไม่รับเลยใช้ยกเลิก.',
        { id: purchaseRow.id, status: 'ปิดแล้ว', reason: 'เหตุผล' },
      ),
      request({
        name: 'DELETE ยกเลิกใบสั่งซื้อ',
        method: 'DELETE',
        url: '/api/purchases/{{purchaseOrderId}}',
        description: 'เท่ากับ action=cancel ต้องมี reason. ได้เฉพาะใบที่ยังไม่รับสินค้า.',
        body: { ...key, reason: 'เหตุผล' },
        example: { data: { id: purchaseRow.id, status: 'ยกเลิก', reason: 'เหตุผล' } },
      }),
      request({
        name: 'POST รับเข้าจากใบสั่งซื้อ',
        method: 'POST',
        url: '/api/inventory',
        status: 201,
        description:
          'Admin. action=receive เดิม + purchaseOrderLineId (ไม่บังคับ). สินค้าต้องตรงบรรทัด, จำนวนไม่เกินค้างรับ (409). code = nextReceiptCode จาก GET /api/inventory?view=options&scope=receive.',
        body: {
          ...key,
          action: 'receive',
          code: '{{receiptCode}}',
          purchaseOrderLineId: '{{purchaseOrderLineId}}',
          notes: '',
          lots: [
            {
              productId: '{{productId}}',
              warehouseId: '{{warehouseId}}',
              quantity: 4,
              totalCost: '192.00',
              manufacturedOn: '2026-01-01',
              expiresOn: '2029-01-01',
            },
          ],
        },
        example: {
          data: {
            id: '99999999-9999-4999-8999-999999999999',
            code: 'GR-2569-00001',
            lotIds: [],
            purchaseOrderId: purchaseRow.id,
          },
        },
      }),
    ],
  },
];

collection.item = collection.item.filter((entry) => entry.name !== 'ผู้ขาย (Suppliers)');
collection.variable = collection.variable.filter((entry) => entry.key !== 'supplierId');
for (const folder of folders) {
  const index = collection.item.findIndex((entry) => entry.name === folder.name);
  const previous = index >= 0 ? collection.item[index] : null;
  const next = { id: previous?.id ?? randomUUID(), ...folder };
  next.item = next.item.map((entry) => ({
    ...entry,
    id: previous?.item?.find((old) => old.name === entry.name)?.id ?? entry.id,
  }));
  if (index >= 0) collection.item[index] = next;
  else collection.item.push(next);
}
for (const variable of [
  'purchaseOrderId',
  'purchaseOrderLineId',
  'productId',
  'warehouseId',
  'receiptCode',
  'documentUpdatedAt',
])
  if (!collection.variable.some((entry) => entry.key === variable))
    collection.variable.push({ key: variable, value: '', type: 'string' });
fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
console.log(collection.item.map((entry) => `${entry.name}: ${entry.item?.length ?? 0}`).join('\n'));
