// Adds or replaces the customer folders in postman/Zuugroup.postman_collection.json.
// Run again after API changes; other folders are left untouched.
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

const optionExample = {
  id: '11111111-1111-4111-8111-111111111111',
  kind: 'creditTerm',
  name: 'เครดิต 30 วัน',
  code: null,
  days: 30,
  active: true,
  version: 1,
};

const folders = [
  {
    name: 'ข้อมูลพื้นฐานลูกค้า (Customer Options)',
    description:
      'รายการกลางของลูกค้า 5 ชุด: codeGroup (กลุ่มรหัสลูกค้า มี code 2–3 ตัว), creditTerm (ระยะเวลาเครดิต มี days 0–365, 0=เงินสด), creditStart (วันเริ่มนับเครดิต), billingCycle (รอบวางบิล), documentType (ประเภทเอกสารแนบ). อ่าน=ผู้ใช้ที่ login, เขียน=Admin. ไม่มีลบ ใช้ active=false ปิดรายการแทน.',
    item: [
      request({
        name: 'GET ตัวเลือกทั้งหมดสำหรับฟอร์มลูกค้า',
        method: 'GET',
        url: '/api/customer-options?kinds=codeGroup,creditTerm,creditStart,billingCycle,documentType',
        description:
          'คืนเฉพาะรายการที่เปิดใช้ ครบทุกแถวของแต่ละ kind (ไม่แบ่งหน้า) สำหรับ combobox ในฟอร์มลูกค้า. ห้ามส่ง query อื่นร่วมกับ kinds.',
        example: {
          options: {
            codeGroup: [],
            creditTerm: [optionExample],
            creditStart: [],
            billingCycle: [],
            documentType: [],
          },
        },
        save: [
          ['customerCodeGroupId', 'options.codeGroup[0]?.id ?? ""'],
          ['customerCreditTermId', 'options.creditTerm[0]?.id ?? ""'],
          ['customerDocumentTypeId', 'options.documentType[0]?.id ?? ""'],
        ],
      }),
      request({
        name: 'GET รายการสำหรับตารางตั้งค่า',
        method: 'GET',
        url: '/api/customer-options?kind=creditTerm&includeInactive=true&limit={{limit}}&offset={{offset}}',
        description:
          'ตารางหน้าตั้งค่า. kind บังคับ; search ค้นชื่อ/รหัส; sortBy=code|name|days|active กับ sortDirection=asc|desc; limit 1–100. includeInactive=true เฉพาะ Admin.',
        example: { data: [optionExample], pagination: { total: 1, limit: 10, offset: 0 } },
      }),
      request({
        name: 'POST เพิ่มรายการ',
        method: 'POST',
        url: '/api/customer-options',
        description:
          'เฉพาะ Admin; เขียน DB จริงเมื่อกด Send และบันทึก audit. รับ kind, name (≤160) และ code เฉพาะ codeGroup (A-Z/0-9 2–3 ตัว, ห้ามซ้ำ), days เฉพาะ creditTerm (0–365). ชื่อซ้ำใน kind เดียวกันได้ 409. ผล 201 เก็บ customerOptionId และ customerOptionVersion.',
        body: { kind: 'creditTerm', name: 'เครดิต 45 วัน', days: 45 },
        status: 201,
        example: { item: { ...optionExample, name: 'เครดิต 45 วัน', days: 45 } },
        save: [
          ['customerOptionId', 'item.id'],
          ['customerOptionVersion', 'item.version'],
        ],
      }),
      request({
        name: 'PATCH แก้ชื่อ/จำนวนวัน/เปิดปิด',
        method: 'PATCH',
        url: '/api/customer-options',
        description:
          'เฉพาะ Admin. ส่ง id และ version ล่าสุด (กันแก้ทับ ได้ 409 เมื่อไม่ตรง) พร้อม name, days (creditTerm เท่านั้น) หรือ active. เปลี่ยน kind/code ไม่ได้. ผลสำเร็จเก็บ version ใหม่.',
        body: { id: '{{customerOptionId}}', version: '{{customerOptionVersion}}', active: false },
        example: { item: { ...optionExample, active: false, version: 2 } },
        save: [['customerOptionVersion', 'item.version']],
      }),
    ],
  },
  {
    name: 'ลูกค้า (Customers)',
    description:
      'ลูกค้าจริงตาม TASK-263. อ่าน=ผู้ใช้ที่ login, เพิ่ม=Admin. การเพิ่มมี 3 ขั้นแบบเดียวกับสินค้า: (1) POST เริ่มคำขอพร้อมข้อมูลและรายการไฟล์ (2) POST อัปโหลดไฟล์ทีละไฟล์ ถ้ามี (3) POST บันทึกคำขอ. ส่งซ้ำด้วย requestId เดิมได้ผลเดิม. เริ่มจาก GET ตัวเลือกในโฟลเดอร์ข้อมูลพื้นฐานลูกค้าเพื่อเก็บ customerCodeGroupId/customerCreditTermId. ไม่มีแก้ไข/ลบในรอบนี้.',
    item: [
      request({
        name: 'GET รายการลูกค้า',
        method: 'GET',
        url: '/api/customers?include=filters,config&limit={{limit}}&offset={{offset}}',
        description:
          'ตารางลูกค้า 7 คอลัมน์. search ค้นรหัส/ชื่อ/จังหวัด/ผู้ติดต่อ/เบอร์/เขต; territoryId, province, status (ใช้งาน/ระงับ/เลิกค้าขาย/ใบอนุญาตหมดอายุ/ใบอนุญาตใกล้หมดอายุ — ตรงกับป้ายในตาราง), licenseStatus กรอง (licenseStatus=ยังไม่ระบุ ได้ลูกค้าที่ยังไม่กรอกผลตรวจ); sortBy=code|name|contactName|licenseStatus|creditDays|province|territoryName กับ sortDirection=asc|desc; limit 1–100. include=filters คืน provinces/territories/licenseStatuses สำหรับตัวกรอง, include=config คืน canWrite. ?view=options ยังเป็น records API เดิมสำหรับตัวเลือกลูกค้าในโมดูลอื่น (ต้อง login).',
        example: {
          data: [
            {
              id: '22222222-2222-4222-8222-222222222222',
              code: 'PHA-0001',
              name: 'ร้านยาตัวอย่าง',
              province: 'กรุงเทพมหานคร',
              contactName: 'ผู้ติดต่อตัวอย่าง',
              phone: '02-000-0000',
              licenseStatus: '',
              licenseExpiresAt: '2027-12-31',
              creditDays: 30,
              creditTermName: 'เครดิต 30 วัน',
              creditLimit: '50000.00',
              territoryId: null,
              territoryName: null,
            },
          ],
          pagination: { total: 1, limit: 10, offset: 0 },
          filters: {
            provinces: ['กรุงเทพมหานคร'],
            territories: [],
            licenseStatuses: ['ยังไม่ระบุ'],
          },
          config: { canWrite: true },
        },
        save: [['customerId', 'data[0]?.id ?? pm.environment.get("customerId") ?? ""']],
      }),
      request({
        name: 'GET รายละเอียดลูกค้า',
        method: 'GET',
        url: '/api/customers/{{customerId}}',
        description:
          'ข้อมูลครบทุกหมวดใน data.details.fields, shippingAddresses, files พร้อม codeGroup/creditTerm/creditStart ที่อ่านชื่อแล้ว. id ผิดรูปแบบหรือไม่พบได้ 404.',
        example: {
          data: { id: '22222222-2222-4222-8222-222222222222', code: 'PHA-0001' },
          config: { canWrite: true },
        },
        save: [['customerUpdatedAt', 'data.updatedAt']],
      }),
      request({
        name: 'GET เลขรันถัดไปของกลุ่มรหัส',
        method: 'GET',
        url: '/api/customers/next-sequence?codeGroupId={{customerCodeGroupId}}',
        description:
          'เฉพาะ Admin. เลขรันนับแยกต่อกลุ่มรหัส แสดงอย่างน้อย 4 หลัก. เป็นข้อเสนอเท่านั้น ไม่จองเลข; ตอนบันทึก server ตรวจซ้ำอีกครั้ง.',
        example: { sequence: '0001' },
      }),
      request({
        name: 'POST 1) เริ่มคำขอเพิ่มลูกค้า',
        method: 'POST',
        url: '/api/customers/requests',
        description:
          'เฉพาะ Admin. requestId สร้างอัตโนมัติใน pre-request. data.sequence ว่าง = ใช้เลขถัดไป. ช่องบังคับ: name, ข้อมูลติดต่อ 6 ช่อง, taxId 13 หลัก, vatStatus (จดทะเบียน/ไม่จดทะเบียน), branchType (สำนักงานใหญ่/สาขา), ที่อยู่ออกบิล 5 ช่อง. files ประกาศไฟล์ที่จะอัปโหลด (id, documentTypeId, name, type, size, digest sha256) หรือเว้นว่าง []. ช่องที่ไม่รู้จักได้ 400.',
        prerequest: [
          'pm.environment.set("customerRequestId", pm.variables.replaceIn("{{$guid}}"));',
        ],
        body: {
          requestId: '{{customerRequestId}}',
          data: {
            codeGroupId: '{{customerCodeGroupId}}',
            sequence: '',
            fields: {
              name: 'ร้านยาทดลอง Postman',
              contactName: 'ผู้ติดต่อทดลอง',
              phone: '02-000-0000',
              email: 'contact@example.com',
              accountingContactName: 'ฝ่ายบัญชีทดลอง',
              accountingPhone: '02-000-0001',
              accountingEmail: 'account@example.com',
              taxId: '0105555000001',
              vatStatus: 'จดทะเบียน',
              branchType: 'สำนักงานใหญ่',
              billingAddress: '1 ถนนทดลอง',
              billingSubdistrict: 'แขวงทดลอง',
              billingDistrict: 'เขตทดลอง',
              billingProvince: 'กรุงเทพมหานคร',
              billingPostcode: '10000',
              creditTermId: '{{customerCreditTermId}}',
              creditLimit: '50000',
              billingCycle: 'ทุกสิ้นเดือน',
            },
            shippingAddresses: [],
            files: [],
          },
        },
        status: 201,
        example: { requestId: '33333333-3333-4333-8333-333333333333', status: 'pending' },
      }),
      request({
        name: 'POST 2) อัปโหลดไฟล์แนบ (ถ้ามี)',
        method: 'POST',
        url: '/api/customers/requests/{{customerRequestId}}/files',
        description:
          'เฉพาะ Admin. form-data: fileId, documentTypeId และ file (ภาพ JPEG/PNG/WebP/GIF หรือ PDF ≤10 MB) ต้องตรงกับรายการ files ที่ประกาศในขั้น 1 ทั้งชื่อ ขนาด และ sha256. ข้ามขั้นนี้เมื่อ files ว่าง.',
        formdata: [
          { key: 'fileId', value: '{{customerFileId}}', type: 'text' },
          { key: 'documentTypeId', value: '{{customerDocumentTypeId}}', type: 'text' },
          { key: 'file', type: 'file', src: [] },
        ],
        status: 201,
        example: {
          id: '44444444-4444-4444-8444-444444444444',
          name: 'license.pdf',
          type: 'application/pdf',
          size: 1024,
        },
      }),
      request({
        name: 'POST 3) บันทึกลูกค้า',
        method: 'POST',
        url: '/api/customers/requests/{{customerRequestId}}',
        description:
          'เฉพาะ Admin. สร้างลูกค้าจริงใน DB และ audit CUSTOMER_CREATED_FULL. รหัสซ้ำ/เลขรันซ้ำได้ 409; ไฟล์ไม่ครบได้ 409. ส่งซ้ำได้ผลลูกค้าเดิม. ผลสำเร็จเก็บ customerId.',
        example: { customer: { id: '22222222-2222-4222-8222-222222222222', code: 'PHA-0001' } },
        save: [['customerId', 'customer.id']],
      }),
      request({
        name: 'GET สถานะคำขอ',
        method: 'GET',
        url: '/api/customers/requests/{{customerRequestId}}',
        description: 'เฉพาะ Admin เจ้าของคำขอ. status = pending | complete | cancelled.',
        example: {
          status: 'complete',
          customer: { id: '22222222-2222-4222-8222-222222222222', code: 'PHA-0001' },
        },
      }),
      request({
        name: 'DELETE ยกเลิกคำขอ',
        method: 'DELETE',
        url: '/api/customers/requests/{{customerRequestId}}',
        description:
          'เฉพาะ Admin เจ้าของคำขอ. ลบไฟล์ที่อัปโหลดไว้และปิดคำขอ; คำขอที่บันทึกแล้วยกเลิกไม่ได้ (409).',
        example: { cancelled: true },
      }),
      request({
        name: 'GET เปิดไฟล์แนบ',
        method: 'GET',
        url: '/api/customers/files/{{customerFileId}}',
        description:
          'ผู้ใช้ที่ login. คืนไฟล์จริง (ภาพ/PDF) แบบ private, no-store เฉพาะไฟล์ที่อยู่ในลูกค้าที่บันทึกแล้ว.',
        example: {},
      }),
      request({
        name: 'POST แก้ไข 1) เริ่มคำขอแก้ไขลูกค้า',
        method: 'POST',
        url: '/api/customers/{{customerId}}/edit-requests',
        description:
          'เฉพาะ Admin (TASK-268). ส่ง expectedUpdatedAt = data.updatedAt จาก GET รายละเอียดล่าสุด (ไม่ตรงได้ 409 กันแก้ทับ), keepFileIds = id ไฟล์เดิมที่จะเก็บ, data = ข้อมูลครบทุกช่องแบบเดียวกับการเพิ่ม (fields.customerStatus = ใช้งาน/ระงับ/เลิกค้าขาย). sequence ว่าง + กลุ่มเดิม = คงเลขเดิม. จากนั้นใช้ POST 2) อัปโหลดไฟล์ (ถ้ามี) และ POST 3) บันทึกลูกค้า ด้วย customerRequestId เดิม.',
        prerequest: [
          'pm.environment.set("customerRequestId", pm.variables.replaceIn("{{$guid}}"));',
        ],
        body: {
          requestId: '{{customerRequestId}}',
          expectedUpdatedAt: '{{customerUpdatedAt}}',
          keepFileIds: [],
          data: {
            codeGroupId: '{{customerCodeGroupId}}',
            sequence: '',
            fields: {
              name: 'ร้านยาทดลอง Postman (แก้ไข)',
              customerStatus: 'ระงับ',
              contactName: 'ผู้ติดต่อทดลอง',
              phone: '02-000-0000',
              email: 'contact@example.com',
              accountingContactName: 'ฝ่ายบัญชีทดลอง',
              accountingPhone: '02-000-0001',
              accountingEmail: 'account@example.com',
              taxId: '0105555000001',
              vatStatus: 'จดทะเบียน',
              branchType: 'สำนักงานใหญ่',
              billingAddress: '1 ถนนทดลอง',
              billingSubdistrict: 'แขวงทดลอง',
              billingDistrict: 'เขตทดลอง',
              billingProvince: 'กรุงเทพมหานคร',
              billingPostcode: '10000',
              creditTermId: '{{customerCreditTermId}}',
              creditLimit: '50000',
              billingCycle: 'ทุกสิ้นเดือน',
            },
            shippingAddresses: [],
            files: [],
          },
        },
        status: 201,
        example: { requestId: '33333333-3333-4333-8333-333333333333', status: 'pending' },
      }),
      request({
        name: 'DELETE ลบลูกค้า (กู้คืนได้)',
        method: 'DELETE',
        url: '/api/customers/{{customerId}}',
        description:
          'เฉพาะ Admin. body {reason} บังคับ ≤500 ตัวอักษร. ซ่อนจากรายการ ดูได้ที่ GET รายการ ?deleted=true และรายละเอียด ?deleted=true (Admin). audit CUSTOMER_DELETED.',
        body: { reason: 'ทดสอบลบจาก Postman' },
        example: { customer: { id: '22222222-2222-4222-8222-222222222222', code: 'PHA-0001' } },
      }),
      request({
        name: 'PATCH กู้คืนลูกค้า',
        method: 'PATCH',
        url: '/api/customers/{{customerId}}',
        description: 'เฉพาะ Admin. body {action:"restore"}. audit CUSTOMER_RESTORED.',
        body: { action: 'restore' },
        example: { customer: { id: '22222222-2222-4222-8222-222222222222', code: 'PHA-0001' } },
      }),
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
for (const key of [
  'customerOptionId',
  'customerOptionVersion',
  'customerCodeGroupId',
  'customerCreditTermId',
  'customerDocumentTypeId',
  'customerRequestId',
  'customerFileId',
  'customerId',
  'customerUpdatedAt',
])
  if (!collection.variable.some((entry) => entry.key === key))
    collection.variable.push({ key, value: '', type: 'string' });
fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
console.log(collection.item.map((entry) => `${entry.name}: ${entry.item?.length ?? 0}`).join('\n'));
