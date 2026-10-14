// TASK-275: adds or replaces the quotation and sales-order folders in
// postman/Zuugroup.postman_collection.json. Run again after API changes.
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
            // Version placeholders must stay numeric in the sent JSON.
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
const quoteRow = {
  id: '33333333-3333-4333-8333-333333333333',
  code: 'QT-2569-0001',
  status: 'รออนุมัติ',
  displayStatus: 'รออนุมัติ',
  customerName: 'ลูกค้าตัวอย่าง',
  validUntil: '2026-11-06',
  amount: '1191.00',
  workflowManaged: true,
  orderId: null,
  orderCode: null,
};
const orderRow = {
  id: '44444444-4444-4444-8444-444444444444',
  code: 'SO-2569-0001',
  status: 'รอตรวจ',
  amount: '550.00',
  quotationCode: 'QT-2569-0001',
};
const lines = [{ productId: '{{productId}}', quantity: 2, discount: '10.00' }];
const patch = (name, url, body, description, status = 'อนุมัติ') =>
  request({
    name,
    method: 'PATCH',
    url,
    description,
    body: { ...key, expectedUpdatedAt: '{{documentUpdatedAt}}', ...body },
    example: { data: { id: quoteRow.id, status } },
  });

const folders = [
  {
    name: 'ใบเสนอราคา (Quotes)',
    description:
      'TASK-275. เลข QT-ปีพ.ศ.-0001 ระบบออกเอง. ราคารวม VAT ล็อก ณ วันบันทึก, ส่วนลดบาทต่อรายการ. Sales สร้าง → รออนุมัติ → Manager อนุมัติ/ไม่อนุมัติ/ส่งกลับ; Admin สร้างหรือแก้ = อนุมัติทันที. ใช้ได้ถึงค่าเริ่มต้น 30 วัน เลยวันแสดง displayStatus=หมดอายุ. ไม่จองสต็อก. convert สร้างคำสั่งซื้อครั้งเดียวและจองสต็อก. ทุกคำสั่งเขียนต้องมี idempotencyKey ใหม่.',
    item: [
      request({
        name: 'GET รายการใบเสนอราคา',
        method: 'GET',
        url: '/api/quotes?limit={{limit}}&offset={{offset}}&search=&status=',
        description:
          'status: รออนุมัติ|ส่งกลับแก้ไข|อนุมัติ|ไม่อนุมัติ|ยกเลิก|หมดอายุ. sortBy: code|customerName|territoryName|validUntil|amount|status.',
        example: {
          data: [quoteRow],
          pagination: { offset: 0, limit: 10, total: 1, hasMore: false },
          actor: { id: '55555555-5555-4555-8555-555555555555', roleId: 'ADMIN', name: 'Admin' },
        },
        save: [['quoteId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดใบเสนอราคา',
        method: 'GET',
        url: '/api/quotes/{{quoteId}}',
        description: 'รับ id หรือเลขที่ QT. มี lines (ราคา/ส่วนลด) และ orderCode เมื่อแปลงแล้ว.',
        example: { data: { ...quoteRow, lines: [] } },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST สร้างใบเสนอราคา',
        method: 'POST',
        url: '/api/quotes',
        status: 201,
        description: 'Sales/Admin. validUntil ไม่ส่ง = วันนี้ + 30 วัน, ห้ามก่อนวันนี้. promotionId (TASK-285) ไม่บังคับ: โปรสถานะใช้งานในช่วงวันที่ ระบบตรวจขั้นต่ำจากสินค้าที่ร่วม เพิ่มบรรทัดของแถม isGift ราคา 0 หรือ bill_discount; ไม่ถึงเงื่อนไข 409.',
        body: { ...key, customerId: '{{customerId}}', notes: '', promotionId: '', lines },
        example: { data: { id: quoteRow.id, code: quoteRow.code, status: 'รออนุมัติ' } },
        save: [['quoteId', 'data.id']],
      }),
      patch(
        'PATCH แก้ไขใบเสนอราคา',
        '/api/quotes/{{quoteId}}',
        { action: 'edit', notes: '', lines },
        'Sales (ใบตัวเองที่ยังไม่อนุมัติ) / Manager / Admin. สินค้าเดิมคงราคาเดิม. แก้แล้วกลับรออนุมัติ ยกเว้น Admin. validUntil ไม่ส่ง = คงเดิม.',
        'รออนุมัติ',
      ),
      patch('PATCH อนุมัติ', '/api/quotes/{{quoteId}}', { action: 'approve' }, 'Manager เท่านั้น.'),
      patch(
        'PATCH ไม่อนุมัติ',
        '/api/quotes/{{quoteId}}',
        { action: 'reject', reason: 'เหตุผล' },
        'Manager เท่านั้น ต้องมี reason.',
        'ไม่อนุมัติ',
      ),
      patch(
        'PATCH ส่งกลับแก้ไข',
        '/api/quotes/{{quoteId}}',
        { action: 'return', reason: 'เหตุผล' },
        'Manager/Admin ต้องมี reason.',
        'ส่งกลับแก้ไข',
      ),
      request({
        name: 'PATCH สร้างคำสั่งซื้อจากใบเสนอราคา',
        method: 'PATCH',
        url: '/api/quotes/{{quoteId}}',
        description:
          'Admin หรือ Sales เจ้าของใบ. ต้องอนุมัติแล้วและยังไม่หมดอายุ. คำสั่งซื้อเข้าสถานะ อนุมัติ ทันที (ผู้อนุมัติเดียวกับใบเสนอราคา). คืน orderId/orderCode. ของไม่พอ 409.',
        body: { ...key, expectedUpdatedAt: '{{documentUpdatedAt}}', action: 'convert' },
        example: { data: { id: quoteRow.id, orderId: orderRow.id, orderCode: orderRow.code } },
        save: [['orderId', 'data.orderId']],
      }),
      request({
        name: 'DELETE ยกเลิกใบเสนอราคา',
        method: 'DELETE',
        url: '/api/quotes/{{quoteId}}',
        description: 'เท่ากับ action=cancel ต้องมี reason.',
        body: { ...key, reason: 'เหตุผล' },
        example: { data: { id: quoteRow.id, status: 'ยกเลิก' } },
      }),
    ],
  },
  {
    name: 'คำสั่งซื้อ (Orders)',
    description:
      'TASK-274/275. เลข SO-ปีพ.ศ.-0001 ระบบออกเอง. จองสต็อกตอนสร้าง (FEFO), ส่วนลดบาทต่อรายการ, สินค้าเดิมคงราคาเดิมเมื่อแก้. Manager อนุมัติ → Admin complete ตัดคลัง.',
    item: [
      request({
        name: 'GET รายการคำสั่งซื้อ',
        method: 'GET',
        url: '/api/orders?limit={{limit}}&offset={{offset}}&search=&status=',
        description: 'status: รอตรวจ|อนุมัติ|ส่งกลับแก้ไข|เสร็จสิ้น|ยกเลิก.',
        example: {
          data: [orderRow],
          pagination: { offset: 0, limit: 10, total: 1, hasMore: false },
        },
        save: [['orderId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดคำสั่งซื้อ',
        method: 'GET',
        url: '/api/orders/{{orderId}}',
        description: 'มี lines (ราคา/ส่วนลด/ล็อตที่จอง) และ quotationCode ถ้ามาจากใบเสนอราคา.',
        example: { data: { ...orderRow, lines: [] } },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST สร้างคำสั่งซื้อ',
        method: 'POST',
        url: '/api/orders',
        status: 201,
        description: 'Sales/Admin. ของไม่พอ 409.',
        body: { ...key, customerId: '{{customerId}}', notes: '', promotionId: '', lines },
        example: { data: { id: orderRow.id, code: orderRow.code, status: 'รอตรวจ' } },
        save: [['orderId', 'data.id']],
      }),
      patch(
        'PATCH แก้รายการสินค้า',
        '/api/orders/{{orderId}}',
        { action: 'edit', notes: '', lines },
        'ล้างการจองแล้วจองใหม่ กลับรอตรวจ.',
        'รอตรวจ',
      ),
      patch('PATCH อนุมัติ', '/api/orders/{{orderId}}', { action: 'approve' }, 'Manager เท่านั้น.'),
      patch(
        'PATCH ส่งกลับแก้ไข',
        '/api/orders/{{orderId}}',
        { action: 'return', reason: 'เหตุผล' },
        'Manager/Admin.',
        'ส่งกลับแก้ไข',
      ),
      patch(
        'PATCH ยืนยันจัดของและตัดคลัง',
        '/api/orders/{{orderId}}',
        { action: 'complete' },
        'Admin เท่านั้น สถานะต้องอนุมัติ.',
        'เสร็จสิ้น',
      ),
      patch(
        'PATCH ยกเลิกและคืนจอง',
        '/api/orders/{{orderId}}',
        { action: 'cancel', reason: 'เหตุผล' },
        'ต้องมี reason.',
        'ยกเลิก',
      ),
    ],
  },
];

for (const folder of folders) {
  const index = collection.item.findIndex((entry) => entry.name === folder.name);
  const previous = index >= 0 ? collection.item[index] : null;
  const next = { id: previous?.id ?? randomUUID(), ...folder };
  // Keep request IDs stable across rebuilds so Postman updates rather than duplicates.
  next.item = next.item.map((entry) => ({
    ...entry,
    id: previous?.item?.find((old) => old.name === entry.name)?.id ?? entry.id,
  }));
  if (index >= 0) collection.item[index] = next;
  else collection.item.push(next);
}
for (const variable of ['quoteId', 'orderId', 'productId', 'documentUpdatedAt'])
  if (!collection.variable.some((entry) => entry.key === variable))
    collection.variable.push({ key: variable, value: '', type: 'string' });
fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
console.log(collection.item.map((entry) => `${entry.name}: ${entry.item?.length ?? 0}`).join('\n'));
