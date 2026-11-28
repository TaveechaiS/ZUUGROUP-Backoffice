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
const promotionRow = {
  id: '11111111-2222-4333-8444-555555555555',
  code: 'PR-2569-0001',
  name: 'ซื้อครบ 10 กล่อง แถม 1',
  status: 'ใช้งาน',
  savedStatus: 'ใช้งาน',
  startsOn: '2026-10-14',
  endsOn: '2026-11-13',
  minType: 'จำนวน',
  minValue: '10.00',
  rewardType: 'ของแถม',
  discountValue: '0.00',
  productCount: 1,
  giftCount: 1,
};
const promotionBody = {
  name: 'ซื้อครบ 10 กล่อง แถม 1',
  status: 'ใช้งาน',
  startsOn: '2026-10-14',
  endsOn: '2026-11-13',
  minType: 'จำนวน',
  minValue: '10',
  rewardType: 'ของแถม',
  discountValue: '0',
  description: '',
  notes: '',
  productIds: ['{{productId}}'],
  gifts: [{ productId: '{{productId}}', quantity: 1, warehouseId: '{{warehouseId}}' }],
};

const folders = [
  {
    name: 'โปรโมชัน (Promotions)',
    description:
      'TASK-278. เลข PR-ปีพ.ศ.-0001 ระบบออกเอง. status บันทึกได้ ใช้งาน|ร่าง; ตอนอ่าน ใช้งานที่ endsOn < วันนี้ (Asia/Bangkok) แสดง หมดอายุ. minType: จำนวน (จำนวนเต็ม)|มูลค่า (บาท). rewardType: ของแถม (gifts 1–20, คลัง MAIN/MARKETING)|ส่วนลดบาท|ส่วนลด% (≤100). ยังไม่ผูกกับใบเสนอราคา/คำสั่งซื้อ. อ่านได้ทุก Role ที่ login; เขียนเฉพาะ Admin. ทุกคำสั่งเขียนต้องมี idempotencyKey ใหม่.',
    item: [
      request({
        name: 'GET รายการโปรโมชัน',
        method: 'GET',
        url: '/api/promotions?limit={{limit}}&offset={{offset}}&search=&status=&rewardType=',
        description:
          'status: ใช้งาน|ร่าง|หมดอายุ|ยกเลิก. rewardType: ของแถม|ส่วนลดบาท|ส่วนลด%. search: รหัส/ชื่อ/สินค้าที่ร่วม. sortBy: code|name|startsOn|endsOn|rewardType|status.',
        example: { data: [promotionRow], pagination: page, actor },
        save: [['promotionId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดโปรโมชัน',
        method: 'GET',
        url: '/api/promotions/{{promotionId}}',
        description: 'รับ id หรือรหัส PR. มี products (สินค้าที่ร่วม) และ gifts (ของแถม).',
        example: { data: { ...promotionRow, products: [], gifts: [] }, actor },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST เพิ่มโปรโมชัน',
        method: 'POST',
        url: '/api/promotions',
        status: 201,
        description:
          'Admin. endsOn ต้องไม่ก่อน startsOn; productIds 1–100 ไม่ซ้ำ; สินค้าต้อง ACTIVE.',
        body: { ...key, ...promotionBody },
        example: { data: { id: promotionRow.id, code: promotionRow.code } },
        save: [['promotionId', 'data.id']],
      }),
      request({
        name: 'PATCH แก้ไขโปรโมชัน',
        method: 'PATCH',
        url: '/api/promotions/{{promotionId}}',
        description: 'Admin. แทนที่สินค้าที่ร่วมและของแถมทั้งชุด. ยกเลิกแล้วแก้ไม่ได้ (409).',
        body: {
          ...key,
          action: 'edit',
          expectedUpdatedAt: '{{documentUpdatedAt}}',
          ...promotionBody,
        },
        example: { data: { id: promotionRow.id } },
      }),
      request({
        name: 'DELETE ยกเลิกโปรโมชัน',
        method: 'DELETE',
        url: '/api/promotions/{{promotionId}}',
        description: 'เท่ากับ action=cancel ต้องมี reason.',
        body: { ...key, reason: 'เหตุผล' },
        example: { data: { id: promotionRow.id, status: 'ยกเลิก', reason: 'เหตุผล' } },
      }),
    ],
  },
  {
    name: 'รายงานยอดขาย (Sales Reports)',
    description:
      'TASK-279. อ้างคำสั่งซื้อสถานะ เสร็จสิ้น (workflow) วันที่ขาย = วันที่ตัดคลังขาย (Asia/Bangkok); ยกเลิกไม่นับ. ยอด = Σ(จำนวน×ราคา − ส่วนลดบรรทัด) รวม VAT, net = ÷1.07. from/to ค่าเริ่มต้น วันที่ 1 ของเดือนนี้ถึงวันนี้; ช่วงไม่เกิน 366 วัน (400). view ไม่รู้จัก 404. ทุก Role ที่ login อ่านได้.',
    item: [
      [
        'summary',
        'สรุปยอดขายรายวัน',
        'sortBy: soldOn|orders|quantity|total. search ไม่ใช้.',
        { soldOn: '2026-10-14', orders: 1, quantity: 2, total: '190.00', net: '177.57' },
      ],
      [
        'products',
        'ยอดขายตามสินค้า',
        'search: ชื่อ/รหัสสินค้า. sortBy: code|name|orders|quantity|total.',
        {
          id: '{{productId}}',
          code: 'ZP-ZP-0001',
          name: 'สินค้า',
          unit: 'กล่อง',
          orders: 1,
          quantity: 2,
          total: '190.00',
          net: '177.57',
        },
      ],
      [
        'customers',
        'ยอดขายตามลูกค้า',
        'search: ชื่อ/รหัสลูกค้า. sortBy: code|name|territoryName|orders|total.',
        {
          id: '{{customerId}}',
          code: 'PHA-0001',
          name: 'ลูกค้า',
          territoryName: 'เขต',
          orders: 1,
          quantity: 2,
          total: '190.00',
          net: '177.57',
        },
      ],
      [
        'sellers',
        'ยอดขายตามผู้ขาย',
        'ผู้ขาย = ผู้สร้างคำสั่งซื้อ. search: ชื่อ/รหัสพนักงาน. sortBy: code|name|orders|customers|total.',
        {
          id: '55555555-5555-4555-8555-555555555555',
          code: 'EMP-01',
          name: 'Sales',
          orders: 1,
          customers: 1,
          total: '190.00',
          net: '177.57',
        },
      ],
      [
        'details',
        'รายละเอียดรายการขาย',
        'search: เลขที่/ลูกค้า/สินค้า. sortBy: soldOn|orderCode|customerName|productName|quantity|total.',
        {
          id: '66666666-6666-4666-8666-666666666666',
          soldOn: '2026-10-14',
          orderCode: 'SO-2569-0001',
          customerName: 'ลูกค้า',
          productName: 'สินค้า',
          quantity: 2,
          unitPrice: '100.00',
          discount: '10.00',
          total: '190.00',
        },
      ],
    ].map(([view, name, note, row]) =>
      request({
        name: 'GET ' + name,
        method: 'GET',
        url: '/api/reports/sales/' + view + '?from=&to=&search=&limit={{limit}}&offset={{offset}}',
        description: note,
        example: {
          data: [row],
          pagination: page,
          summary: { orders: 1, quantity: 2, total: '190.00', net: '177.57' },
          range: { from: '2026-10-01', to: '2026-10-14' },
          actor,
        },
      }),
    ),
  },
  {
    name: 'รายงานคลังสินค้า (Inventory Reports)',
    description:
      'TASK-280. ยอดปัจจุบัน (ไม่ย้อนวันที่). summary: คงเหลือแยกคลัง + value เฉพาะ Admin/CFO (seesCost). movements/counts ใช้ from/to. expiry: ล็อตคงเหลือ > 0 ที่หมดอายุภายใน 90 วันหรือหมดแล้ว. low-stock: สินค้า ACTIVE ที่ MAIN 0–50. counts: รอบตรวจนับ (เทียบยอด ไม่ปรับยอด). warehouseCode: MAIN|MARKETING|DISPOSAL. ทุก Role ที่ login อ่านได้.',
    item: [
      [
        'summary',
        'สรุปคงเหลือ',
        '',
        'sortBy: name|main|available|marketing|disposal|quantity|value.',
        {
          id: '{{productId}}',
          code: 'ZP-ZP-0001',
          name: 'สินค้า',
          unit: 'กล่อง',
          main: 48,
          reserved: 0,
          available: 48,
          marketing: 0,
          disposal: 0,
          quantity: 48,
          value: '480.00',
        },
      ],
      [
        'movements',
        'ความเคลื่อนไหวสินค้า',
        '&from=&to=&kind=&warehouseCode=',
        'kind: รับเข้า|แก้รับเข้า|ขาย|โอนออก|โอนเข้า|ปรับยอด|ทำลายแล้ว. sortBy: occurredAt|kind|productName|warehouseName|quantity.',
        {
          id: '77777777-7777-4777-8777-777777777777',
          occurredAt: '2026-10-14T03:00:00.000Z',
          kind: 'ขาย',
          quantity: -2,
          productName: 'สินค้า',
          receiptCode: 'GR-2569-00001',
          lotNumber: 'L1',
          warehouseName: 'คลังหลัก',
          reference: 'SO-2569-0001',
          actorName: 'Admin',
        },
      ],
      [
        'expiry',
        'สินค้าใกล้หมดอายุ',
        '&warehouseCode=',
        'daysLeft ติดลบ = หมดอายุแล้ว. sortBy: productName|expiresOn|warehouseName|quantity.',
        {
          id: 'lot:warehouse',
          productName: 'สินค้า',
          receiptCode: 'GR-2569-00001',
          lotNumber: 'L1',
          expiresOn: '2026-12-13',
          daysLeft: 60,
          warehouseName: 'คลังหลัก',
          quantity: 48,
        },
      ],
      [
        'low-stock',
        'สินค้าคงเหลือต่ำ',
        '&status=',
        'status: สินค้าใกล้หมด|สินค้าหมด. sortBy: name|main|available|quantity.',
        {
          id: '{{productId}}',
          code: 'ZP-ZP-0001',
          name: 'สินค้า',
          main: 48,
          reserved: 0,
          available: 48,
          marketing: 0,
          quantity: 48,
          status: 'สินค้าใกล้หมด',
        },
      ],
      [
        'counts',
        'ผลตรวจนับ',
        '&from=&to=&warehouseCode=',
        'sortBy: code|warehouseName|createdAt|status.',
        {
          id: '88888888-8888-4888-8888-888888888888',
          code: 'SC-0001',
          name: 'ตรวจนับ',
          status: 'ตรวจแล้ว',
          warehouseName: 'คลังหลัก',
          resultText: 'ขาด 1',
          createdAt: '2026-10-14T03:00:00.000Z',
        },
      ],
    ].map(([view, name, query, note, row]) =>
      request({
        name: 'GET ' + name,
        method: 'GET',
        url:
          '/api/reports/inventory/' +
          view +
          '?search=' +
          query +
          '&limit={{limit}}&offset={{offset}}',
        description: note,
        example: { data: [row], pagination: page, seesCost: true, actor },
      }),
    ),
  },
  {
    name: 'ค่าใช้จ่าย (Expenses)',
    description:
      'TASK-282. เลข EX-ปีพ.ศ.-0001. เขียนได้เฉพาะ Admin/CFO (403 อื่น). categoryId จาก GET /api/customer-options?kinds=expenseCategory. expenseDate ห้ามเกินวันนี้; amount > 0 รวม VAT. สถานะ บันทึกแล้ว|ยกเลิก (reason บังคับ). ไฟล์แนบ multipart field file (JPEG/PNG/WebP/GIF/PDF ≤10MB).',
    item: [
      request({
        name: 'GET รายการค่าใช้จ่าย',
        method: 'GET',
        url: '/api/expenses?from=&to=&search=&status=&categoryId=&limit={{limit}}&offset={{offset}}',
        description:
          'from/to ค่าเริ่มต้นเดือนนี้. คืน totalAmount (เฉพาะบันทึกแล้ว) และ categories. sortBy: code|expenseDate|name|categoryName|amount|status.',
        example: {
          data: [
            {
              id: '99999999-1111-4111-8111-111111111111',
              code: 'EX-2569-0001',
              name: 'ค่าน้ำมัน',
              status: 'บันทึกแล้ว',
              expenseDate: '2026-10-14',
              categoryName: 'ค่าเดินทาง',
              amount: '1250.50',
              fileCount: 1,
            },
          ],
          pagination: page,
          totalAmount: '1250.50',
          range: { from: '2026-10-01', to: '2026-10-14' },
          categories: [],
          actor,
        },
        save: [['expenseId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดค่าใช้จ่าย',
        method: 'GET',
        url: '/api/expenses/{{expenseId}}',
        description: 'รับ id หรือเลข EX. มี files.',
        example: { data: { code: 'EX-2569-0001', files: [] }, actor },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST เพิ่มค่าใช้จ่าย',
        method: 'POST',
        url: '/api/expenses',
        status: 201,
        description: 'Admin/CFO.',
        body: {
          ...key,
          name: 'ค่าน้ำมัน',
          expenseDate: '2026-10-14',
          categoryId: '{{expenseCategoryId}}',
          amount: '1250.50',
          payee: '',
          description: '',
          notes: '',
        },
        example: { data: { id: '99999999-1111-4111-8111-111111111111', code: 'EX-2569-0001' } },
        save: [['expenseId', 'data.id']],
      }),
      request({
        name: 'PATCH แก้ไขค่าใช้จ่าย',
        method: 'PATCH',
        url: '/api/expenses/{{expenseId}}',
        description: 'Admin/CFO. ยกเลิกแล้วแก้ไม่ได้ (409).',
        body: {
          ...key,
          action: 'edit',
          expectedUpdatedAt: '{{documentUpdatedAt}}',
          name: 'ค่าน้ำมัน',
          expenseDate: '2026-10-14',
          categoryId: '{{expenseCategoryId}}',
          amount: '900',
        },
        example: { data: { id: '99999999-1111-4111-8111-111111111111' } },
      }),
      request({
        name: 'POST แนบไฟล์ค่าใช้จ่าย',
        method: 'POST',
        url: '/api/expenses/{{expenseId}}/files',
        status: 201,
        description: 'multipart/form-data field file.',
        formdata: [{ key: 'file', type: 'file', src: [] }],
        example: { data: { id: 'file-id', name: 'receipt.pdf', type: 'application/pdf' } },
      }),
      request({
        name: 'DELETE ยกเลิกค่าใช้จ่าย',
        method: 'DELETE',
        url: '/api/expenses/{{expenseId}}',
        description: 'เท่ากับ action=cancel ต้องมี reason.',
        body: { ...key, reason: 'เหตุผล' },
        example: { data: { status: 'ยกเลิก', reason: 'เหตุผล' } },
      }),
    ],
  },
  {
    name: 'วางบิล & รับชำระ (Billing)',
    description:
      'TASK-283. INV-ปีพ.ศ.-0001 จากคำสั่งซื้อ workflow สถานะ เสร็จสิ้น 1 SO = 1 ใบ (ยกเลิกแล้วออกใหม่ได้). ยอด = ยอด SO; due = issueDate + เครดิตลูกค้า (credit_days หรือ creditTerm). รับชำระหลายครั้ง ห้ามเกินยอดค้าง (409). สถานะ ค้างชำระ|ชำระบางส่วน|ชำระครบ|ยกเลิก + เกินกำหนด (คำนวณตอนอ่าน). เขียนเฉพาะ Admin/CFO.',
    item: [
      request({
        name: 'GET รายการใบแจ้งหนี้',
        method: 'GET',
        url: '/api/billing?search=&status=&limit={{limit}}&offset={{offset}}',
        description:
          'status: ค้างชำระ|ชำระบางส่วน|เกินกำหนด|ชำระครบ|ยกเลิก. คืน totalOutstanding. sortBy: code|customerName|issueDate|dueDate|amount|outstanding|status.',
        example: {
          data: [
            {
              id: 'aaaaaaaa-1111-4111-8111-111111111111',
              code: 'INV-2569-0001',
              status: 'ค้างชำระ',
              salesOrderCode: 'SO-2569-0001',
              customerName: 'ลูกค้า',
              issueDate: '2026-10-14',
              dueDate: '2026-11-13',
              amount: '300.00',
              paid: '0.00',
              outstanding: '300.00',
            },
          ],
          pagination: page,
          totalOutstanding: '300.00',
          actor,
        },
        save: [['invoiceId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET คำสั่งซื้อรอวางบิล',
        method: 'GET',
        url: '/api/billing?view=uninvoiced',
        description: 'SO เสร็จสิ้นที่ยังไม่มีใบแจ้งหนี้ใช้งาน สูงสุด 200 รายการ.',
        example: {
          data: [
            {
              id: '{{salesOrderId}}',
              code: 'SO-2569-0001',
              customerName: 'ลูกค้า',
              amount: '300.00',
              creditDays: 30,
            },
          ],
          actor,
        },
        save: [['salesOrderId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดใบแจ้งหนี้',
        method: 'GET',
        url: '/api/billing/{{invoiceId}}',
        description: 'รับ id หรือเลข INV. มี payments (รวมรายการที่ยกเลิก voidedAt).',
        example: { data: { code: 'INV-2569-0001', payments: [] }, actor },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'POST วางบิล',
        method: 'POST',
        url: '/api/billing',
        status: 201,
        description: 'Admin/CFO. issueDate ไม่ส่ง = วันนี้ ห้ามเกินวันนี้.',
        body: { ...key, salesOrderId: '{{salesOrderId}}', issueDate: '', notes: '' },
        example: {
          data: {
            id: 'aaaaaaaa-1111-4111-8111-111111111111',
            code: 'INV-2569-0001',
            dueDate: '2026-11-13',
          },
        },
        save: [['invoiceId', 'data.id']],
      }),
      request({
        name: 'PATCH บันทึกรับชำระ',
        method: 'PATCH',
        url: '/api/billing/{{invoiceId}}',
        description: 'action=pay. method: เงินสด|โอน|เช็ค. amount ≤ ยอดค้าง.',
        body: {
          ...key,
          action: 'pay',
          expectedUpdatedAt: '{{documentUpdatedAt}}',
          paidOn: '2026-10-14',
          amount: '100',
          method: 'โอน',
          reference: '',
          notes: '',
        },
        example: {
          data: {
            id: 'aaaaaaaa-1111-4111-8111-111111111111',
            paymentId: 'bbbbbbbb-1111-4111-8111-111111111111',
          },
        },
      }),
      request({
        name: 'PATCH ยกเลิกรายการรับชำระ',
        method: 'PATCH',
        url: '/api/billing/{{invoiceId}}',
        description: 'action=void-payment ต้องมี reason.',
        body: {
          ...key,
          action: 'void-payment',
          expectedUpdatedAt: '{{documentUpdatedAt}}',
          paymentId: '{{paymentId}}',
          reason: 'เหตุผล',
        },
        example: { data: { id: 'aaaaaaaa-1111-4111-8111-111111111111' } },
      }),
      request({
        name: 'DELETE ยกเลิกใบแจ้งหนี้',
        method: 'DELETE',
        url: '/api/billing/{{invoiceId}}',
        description: 'action=cancel ต้องมี reason; มีรับชำระที่ใช้งานอยู่ยกเลิกไม่ได้ (409).',
        body: { ...key, reason: 'เหตุผล' },
        example: { data: { status: 'ยกเลิก', reason: 'เหตุผล' } },
      }),
    ],
  },
  {
    name: 'รายงานการเงิน (Finance Reports)',
    description:
      'TASK-284. aging: ยอดค้างชำระแยกตามอายุหนี้ ณ วันนี้ (ยังไม่ถึงกำหนด/1–30/31–60/61–90/>90). payments: รับชำระที่ไม่ถูกยกเลิกตาม from/to. expenses: ค่าใช้จ่ายบันทึกแล้วรวมตามหมวดตาม from/to. คืน totalAmount. view ไม่รู้จัก 404.',
    item: [
      [
        'aging',
        'อายุลูกหนี้',
        '',
        'sortBy: name|invoices|outstanding.',
        {
          id: '{{customerId}}',
          code: 'PHA-0001',
          name: 'ลูกค้า',
          invoices: 3,
          current: '100.00',
          d30: '200.00',
          d60: '0.00',
          d90: '0.00',
          over90: '250.00',
          outstanding: '550.00',
        },
      ],
      [
        'payments',
        'รับชำระ',
        '&from=&to=',
        'sortBy: paidOn|invoiceCode|customerName|method|amount.',
        {
          id: 'p',
          paidOn: '2026-10-14',
          invoiceCode: 'INV-2569-0001',
          customerName: 'ลูกค้า',
          method: 'โอน',
          amount: '50.00',
        },
      ],
      [
        'expenses',
        'ค่าใช้จ่ายตามหมวด',
        '&from=&to=',
        'sortBy: name|count|amount.',
        { id: 'c', name: 'ค่าขนส่ง', count: 1, amount: '75.25' },
      ],
    ].map(([view, name, query, note, row]) =>
      request({
        name: 'GET ' + name,
        method: 'GET',
        url:
          '/api/reports/finance/' +
          view +
          '?search=' +
          query +
          '&limit={{limit}}&offset={{offset}}',
        description: note,
        example: {
          data: [row],
          pagination: page,
          totalAmount: '550.00',
          range: { from: '2026-10-01', to: '2026-10-14' },
          actor,
        },
      }),
    ),
  },
  {
    name: 'ติดตามลูกค้า (Customer Follow-ups)',
    description:
      'TASK-286. FU-ปีพ.ศ.-0001. เขียนได้ Admin/Manager/Sales (Sales แก้ได้เฉพาะของตน และเฉพาะลูกค้าในเขต TASK-290). channel: โทร|เข้าพบ|LINE|อีเมล. status กรอง: ครบนัดวันนี้|เกินนัด|รอติดตาม|เสร็จแล้ว|ยกเลิก.',
    item: [
      request({
        name: 'GET รายการติดตาม',
        method: 'GET',
        url: '/api/customer-follow-ups?search=&status=รอติดตาม&customerId=&limit={{limit}}&offset={{offset}}',
        description: 'sortBy: code|customerName|contactedOn|nextOn|status.',
        example: {
          data: [{ code: 'FU-2569-0001', status: 'ครบนัดวันนี้' }],
          pagination: page,
          actor,
        },
        save: [['followUpId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'POST บันทึกการติดตาม',
        method: 'POST',
        url: '/api/customer-follow-ups',
        status: 201,
        description: 'contactedOn ห้ามเกินวันนี้; nextOn ห้ามก่อน contactedOn.',
        body: {
          ...key,
          customerId: '{{customerId}}',
          name: 'เสนอสินค้า',
          contactedOn: '2026-10-14',
          channel: 'โทร',
          nextOn: '2026-10-21',
          summary: '',
          notes: '',
        },
        example: { data: { id: 'fu-id', code: 'FU-2569-0001' } },
        save: [['followUpId', 'data.id']],
      }),
      request({
        name: 'PATCH ปิดการติดตาม',
        method: 'PATCH',
        url: '/api/customer-follow-ups/{{followUpId}}',
        description:
          'action=done ต้องมี result; action=edit ส่งข้อมูลเต็ม; action=cancel ต้องมี reason.',
        body: { ...key, action: 'done', result: 'สั่งซื้อแล้ว' },
        example: { data: { status: 'เสร็จแล้ว' } },
      }),
    ],
  },
  {
    name: 'คำขอเพิ่มลูกค้า (Customer Requests)',
    description:
      'TASK-288. Sales/Manager เริ่มคำขอด้วย POST /api/customers/requests + อัปโหลดไฟล์เดิม แล้ว PATCH submit; Admin approve (สร้างลูกค้า) / return / reject (reason บังคับ). รายการแสดงเฉพาะคำขอที่ส่งแล้ว (ผู้ขอเห็นของตน).',
    item: [
      request({
        name: 'GET รายการคำขอ',
        method: 'GET',
        url: '/api/customer-requests?search=&status=รอตรวจสอบ&limit={{limit}}&offset={{offset}}',
        description: 'status: รอตรวจสอบ|ส่งกลับแก้ไข|อนุมัติแล้ว|ไม่อนุมัติ|ยกเลิก.',
        example: {
          data: [{ id: 'request-id', status: 'รอตรวจสอบ', name: 'ร้านยา' }],
          pagination: page,
          actor,
        },
        save: [['customerRequestId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดคำขอ',
        method: 'GET',
        url: '/api/customer-requests/{{customerRequestId}}',
        description: 'มี draft (ข้อมูลเต็ม), files, duplicates (ลูกค้าที่อาจซ้ำ).',
        example: { data: { id: 'request-id', status: 'รอตรวจสอบ', duplicates: [] }, actor },
        save: [['documentUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'PATCH ส่งคำขอ (Sales/Manager)',
        method: 'PATCH',
        url: '/api/customer-requests/{{customerRequestId}}',
        description: 'action=submit หลังอัปโหลดไฟล์ครบ.',
        body: { action: 'submit' },
        example: { data: { id: 'request-id', status: 'รอตรวจสอบ' } },
      }),
      request({
        name: 'PATCH ตรวจคำขอ (Admin)',
        method: 'PATCH',
        url: '/api/customer-requests/{{customerRequestId}}',
        description: 'action: approve | return | reject (reason บังคับเมื่อ return/reject).',
        body: { action: 'approve', reason: '', expectedUpdatedAt: '{{documentUpdatedAt}}' },
        example: {
          data: { status: 'อนุมัติแล้ว', customer: { id: 'customer-id', code: 'PHA-0016' } },
        },
      }),
    ],
  },
  {
    name: 'ตรวจนับ (Stock Counts)',
    description:
      'TASK-289. SC-ปีพ.ศ.-0001. Admin เท่านั้น. เริ่มรอบดึงล็อตคงเหลือในคลังเป็นยอดระบบ; count บันทึกจำนวนนับ; close ต้องนับครบ; ไม่ปรับยอดสต็อก.',
    item: [
      request({
        name: 'GET รายการรอบตรวจนับ',
        method: 'GET',
        url: '/api/stock-counts?search=&status=&limit={{limit}}&offset={{offset}}',
        description: 'status: กำลังนับ|ปิดแล้ว|ยกเลิก. คืน warehouses สำหรับเริ่มรอบ.',
        example: {
          data: [{ code: 'SC-2569-0001', status: 'กำลังนับ', lineCount: 12, diffCount: 0 }],
          pagination: page,
          warehouses: [],
          actor,
        },
        save: [['stockCountId', 'data[0]?.id ?? ""']],
      }),
      request({
        name: 'POST เริ่มรอบตรวจนับ',
        method: 'POST',
        url: '/api/stock-counts',
        status: 201,
        description: 'คลังว่าง 409.',
        body: { ...key, warehouseId: '{{warehouseId}}', name: '', notes: '' },
        example: { data: { id: 'sc-id', code: 'SC-2569-0001', lines: 12 } },
        save: [['stockCountId', 'data.id']],
      }),
      request({
        name: 'PATCH บันทึกจำนวนนับ',
        method: 'PATCH',
        url: '/api/stock-counts/{{stockCountId}}',
        description:
          'action=count lines [{id,countedQuantity,note}]; action=close; action=cancel (reason).',
        body: {
          ...key,
          action: 'count',
          lines: [{ id: '{{stockCountLineId}}', countedQuantity: 10, note: '' }],
        },
        example: { data: { result: 'ตรงกัน 11 ล็อต · ขาด 2 ชิ้น · เกิน 0 ชิ้น' } },
      }),
    ],
  },
  {
    name: 'เอกสารลูกค้า (Customer Documents)',
    description:
      'TASK-287. อ่านอย่างเดียว รวมไฟล์แนบจากข้อมูลลูกค้า เปิดไฟล์ที่ /api/customers/files/{id}.',
    item: [
      request({
        name: 'GET เอกสารลูกค้า',
        method: 'GET',
        url: '/api/customer-documents?search=&documentTypeId=&limit={{limit}}&offset={{offset}}',
        description: 'sortBy: customerName|documentTypeName|name|createdAt|licenseExpiresAt.',
        example: { data: [], pagination: page, documentTypes: [] },
      }),
    ],
  },
];

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
  'promotionId',
  'productId',
  'warehouseId',
  'documentUpdatedAt',
  'expenseId',
  'expenseCategoryId',
  ,
  'invoiceId',
  'salesOrderId',
  'paymentId',
  ,
  'followUpId',
  'customerRequestId',
  'stockCountId',
  'stockCountLineId',
  'customerId',
])
  if (!collection.variable.some((entry) => entry.key === variable))
    collection.variable.push({ key: variable, value: '', type: 'string' });
fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
console.log(collection.item.map((entry) => `${entry.name}: ${entry.item?.length ?? 0}`).join('\n'));
