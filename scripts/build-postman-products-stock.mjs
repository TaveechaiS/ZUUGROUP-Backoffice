import fs from 'node:fs';
const root = '{{baseUrl}}';
const okPage = { data: [], pagination: { offset: 0, limit: 10, total: 0, hasMore: false } };
const common =
  'Bearer accessToken ของผู้ใช้จริง; 401 ไม่เข้าสู่ระบบ, 403 ไม่มีสิทธิ์, 400 รูปแบบข้อมูลไม่ถูกต้อง, 409 ข้อมูลขัดแย้ง/เลขซ้ำ, 503 การเชื่อมต่อชั่วคราว. ตั้ง token ใน Environment ส่วนตัว. ตัวอย่าง response เป็นโครงสร้างสมมุติ ไม่ใช่ข้อมูลจริง.';
function req(
  name,
  method,
  path,
  body,
  example = {},
  description = '',
  code = method === 'POST' ? 201 : 200,
) {
  const request = {
    method,
    header: [{ key: 'Accept', value: 'application/json' }],
    url: root + path,
    description: description + '\n' + common,
  };
  if (body) {
    request.header.push({ key: 'Content-Type', value: 'application/json' });
    request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: { raw: { language: 'json' } },
    };
  }
  const response = (name, code, data) => ({
    name,
    originalRequest: request,
    status: code === 200 ? 'OK' : code === 201 ? 'Created' : 'Error',
    code,
    header: [{ key: 'Content-Type', value: 'application/json' }],
    body: JSON.stringify(data, null, 2),
  });
  return {
    name: `${method} ${name}`,
    request,
    event: [
      {
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            `pm.test("Expected success status", () => pm.expect(pm.response.code).to.equal(${code}));`,
            'if (pm.response.code >= 200 && pm.response.code < 300 && pm.response.headers.get("Content-Type")?.includes("json")) {',
            '  const data = pm.response.json();',
            '  if (data.pagination) pm.test("Pagination is bounded", () => { pm.expect(data.data).to.be.an("array"); pm.expect(data.data.length).to.be.at.most(data.pagination.limit); pm.expect(data.pagination.total).to.be.at.least(data.data.length); });',
            '}',
          ],
        },
      },
    ],
    response: [
      response('ตัวอย่างสำเร็จ', code, example),
      response(
        '401 ต้องเข้าสู่ระบบ',
        401,
        path.startsWith('/api/inventory')
          ? { error: { message: 'กรุณาเข้าสู่ระบบ' } }
          : { error: 'กรุณาเข้าสู่ระบบ' },
      ),
    ],
  };
}
const folder = (name, item) => ({ name, item });
const list = (name, query, desc = '') =>
  req(
    name,
    'GET',
    '/api/inventory?' + query + '&limit={{limit}}&offset={{offset}}',
    null,
    okPage,
    desc +
      ' ตารางเริ่ม10รายการ; เลือก10/20/50/100ได้; offset=(page-1)*limit. เพิ่มsortBy/sortDirectionตามdocs/api/table-sorting.md; ปกติไม่ส่งsort.',
  );
const actions = (action, extra) =>
  req(
    action === 'give' ? `${action} (${extra.giveType})` : action,
    'POST',
    '/api/inventory',
    {
      action,
      idempotencyKey: '{{idempotencyKey}}',
      lotId: '{{lotId}}',
      warehouseId: '{{warehouseId}}',
      reason: '{{reason}}',
      ...extra,
    },
    { data: { id: '{{operationId}}', lotId: '{{lotId}}', action } },
    'Adminเท่านั้น; retryต้องใช้idempotencyKeyและbodyเดิม เปลี่ยนkeyเฉพาะธุรกรรมใหม่.',
  );
const login = req(
  'เข้าสู่ระบบ',
  'POST',
  '/api/auth/login',
  { email: '{{loginEmail}}', password: '{{loginPassword}}' },
  { ok: true, user: {}, accessToken: '<private token>', tokenType: 'Bearer', expiresIn: 3600 },
  'กำหนดloginEmail/loginPasswordในEnvironmentส่วนตัว; ไม่เก็บรหัสในCollection.',
  200,
);
login.request.auth = { type: 'noauth' };
login.event[0].script.exec.push(
  'if (pm.response.code === 200) { const token = pm.response.json().accessToken; if (token) pm.environment.set("accessToken", token); } else { pm.environment.unset("accessToken"); }',
);
const fields = {
  กลุ่มรหัส: '{{groupId}}',
  รูปแบบ: '{{formatId}}',
  'ชื่อสินค้าเต็ม (ไทย)': '{{productName}}',
  'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)': '',
  ประเภทผลิตภัณฑ์: '{{productTypeId}}',
  หมวดหมู่สินค้า: '{{categoryId}}',
  หน่วยสินค้า: '{{unitId}}',
  ราคาขาย: '100.00',
};
const upload = req(
  'แนบไฟล์ทีละไฟล์',
  'POST',
  '/api/products/full/requests/{{requestId}}/files',
  null,
  { id: '{{fileId}}', kind: 'image', name: 'example.png', type: 'image/png', size: 100 },
  'Adminเจ้าของrequest. imageหรือPDF10MB/file. ตั้งmanifestid/name/type/size/digestก่อนbegin. ไม่รวมหลายไฟล์ในrequestเดียว.',
);
upload.request.body = {
  mode: 'formdata',
  formdata: [
    { key: 'fileId', value: '{{fileId}}', type: 'text' },
    { key: 'kind', value: '{{fileKind}}', type: 'text' },
    { key: 'file', type: 'file', src: [] },
  ],
};
const file = req(
  'ดูรูปหรือเอกสาร',
  'GET',
  '/api/products/full/files/{{fileId}}',
  null,
  {},
  'ไฟล์privateตรวจสิทธิ์; responseเป็นbytesimage/PDFจริง ไม่ใช่JSON.',
);
file.response = file.response.filter((x) => x.code !== 200);
const collection = {
  info: {
    name: 'Zuugroup',
    schema: 'https://schema.postman.com/json/collection/v2.1.0/collection.json',
    description:
      'สินค้าและสต็อกตามroutesจริง TASK-207/210. 1รับเข้า=1ล็อต. Folderแยกตามทรัพยากร. เริ่มทดสอบGETก่อน; writeต้องใช้รายการทดสอบที่เตรียมไว้. Comboครบทุกตัวเลือก/scroll10; ตารางเลือก10/20/50/100ต่อหน้า default10. ตั้งlimitตามขนาดและoffset=(page-1)*limit; detail1ยังใช้ได้. ไม่มีsecretหรือข้อมูลลูกค้าจริง.',
  },
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
  variable: Object.entries({
    baseUrl: 'http://localhost:5000',
    limit: '10',
    offset: '0',
    accessToken: '',
    loginEmail: '',
    loginPassword: '',
    productId: '',
    productName: 'สินค้าทดสอบ',
    categoryId: '',
    dosageFormId: '',
    drugId: '',
    unitId: '',
    groupId: '',
    formatId: '',
    productTypeId: '',
    lotId: '',
    warehouseId: '',
    targetWarehouseId: '',
    optionId: '',
    requestId: '',
    expectedVersion: '',
    fileId: '',
    fileKind: 'image',
    idempotencyKey: '',
    operationId: '',
    receiptCode: '',
    reason: 'ทดสอบกับรายการที่เตรียมไว้',
    manufacturedOn: '',
    expiresOn: '',
    arrivalOn: '',
    recipient: '',
  }).map(([key, value]) => ({ key, value, type: 'string' })),
  item: [
    folder('auth', [login]),
    folder('products', [
      folder('product', [
        list('รายการสินค้า', 'view=products&projection=summary'),
        req(
          'รายละเอียดสินค้า',
          'GET',
          '/api/products/{{productId}}',
          null,
          {
            product: {
              id: '{{productId}}',
              code: 'RX-TB-00001',
              name: 'สินค้าทดสอบ',
              version: '0123456789abcdef0123456789abcdef',
              details: { fields: {}, options: {}, files: [] },
            },
          },
          'productIdเป็นUUID; หน้าดูเว็บใช้codeในURL. Admin/CFOเห็นต้นทุนตามสิทธิ์. เก็บproduct.versionเป็นexpectedVersionก่อนเริ่มแก้ไขเต็ม.',
        ),
        req(
          'ประวัติการแก้ไขสินค้า',
          'GET',
          '/api/products/{{productId}}/history?limit={{limit}}&offset={{offset}}',
          null,
          {
            data: [],
            pagination: { total: 0, offset: 0, limit: 10, page: 1, pageSize: 10, totalPages: 1 },
          },
          'เข้าสู่ระบบ/สิทธิ์ดูสินค้าตามGET; แสดงผู้แก้ไข/วันเวลา/ก่อนหลัง/code/unit/ไฟล์. ซ่อนต้นทุนตามสิทธิ์. limit10/20/50/100; sortBy=occurredAt|actorName, sortDirection=asc|desc; ปกติไม่ส่งsort.',
        ),
        req(
          'แก้ไขสินค้าแบบเดิม',
          'PATCH',
          '/api/products/{{productId}}',
          {
            action: 'update',
            name: '{{productName}}',
            categoryId: '{{categoryId}}',
            dosageFormId: '{{dosageFormId}}',
            drugId: '{{drugId}}',
            defaultWarehouseId: '{{warehouseId}}',
            unit: 'กล่อง',
            salePrice: '100.00',
            status: 'ACTIVE',
          },
          { product: {} },
          'Admin; endpointนี้รองรับเฉพาะสินค้าlegacyไม่มีdetails. การแก้ทุกช่อง/code/unitและไฟล์ใช้ POST edit-requests แล้ว upload/commit; endpointlegacyคงพฤติกรรมเดิม.',
        ),
        req(
          'ลบสินค้าเชิงตรรกะ',
          'DELETE',
          '/api/products/{{productId}}',
          { reason: '{{reason}}' },
          { product: {} },
          'Admin; ไม่ลบข้อมูลสต็อกจริง.',
        ),
        req(
          'กู้คืนสินค้า',
          'PATCH',
          '/api/products/{{productId}}',
          { action: 'restore', reason: '{{reason}}' },
          { product: {} },
          'Admin',
        ),
      ]),
      folder('product-option', [
        req(
          'รายการสำหรับตารางตั้งค่า',
          'GET',
          '/api/product-options?kind=codeGroup&limit={{limit}}&offset={{offset}}',
          null,
          { data: [], pagination: { total: 0, offset: 0, limit: 10 } },
        ),
        req(
          'ตัวเลือกฟอร์มครบทุกประเภทเป็นชุด',
          'GET',
          '/api/product-options?kinds=codeGroup,codeFormat,productType,category,brand,manufacturer,ingredient,dosageForm,legalType,unit',
          null,
          {
            options: {
              codeGroup: [],
              codeFormat: [],
              productType: [],
              category: [],
              brand: [],
              manufacturer: [],
              ingredient: [],
              dosageForm: [],
              legalType: [],
              unit: [],
            },
          },
          'ทุกkindactiveครบ; ไม่แบ่งหน้าและไม่รับsearch/limit. ค้นฝั่งเว็บ เลื่อน10แถว.',
        ),
        req(
          'เพิ่มตัวเลือก',
          'POST',
          '/api/product-options',
          { kind: 'codeGroup', code: 'ZZ', name: 'กลุ่มทดสอบ' },
          { item: {} },
          'Admin; codeRequiredตามkind,code2–3ตัวA-Z0-9.',
        ),
        req(
          'แก้ชื่อ',
          'PATCH',
          '/api/product-options',
          { id: '{{optionId}}', version: 1, name: 'ชื่อทดสอบ' },
          { item: {} },
          'Admin; versionจากGETล่าสุด; code/kindแก้ไม่ได้.',
        ),
        req(
          'ปิดตัวเลือก',
          'PATCH',
          '/api/product-options',
          { id: '{{optionId}}', version: 1, active: false },
          { item: {} },
          'Admin; versionจากGETล่าสุด.',
        ),
        req(
          'เปิดตัวเลือก',
          'PATCH',
          '/api/product-options',
          { id: '{{optionId}}', version: 1, active: true },
          { item: {} },
          'Admin; versionจากGETล่าสุด.',
        ),
      ]),
      folder('product-request', [
        req(
          'เริ่มแก้ไขสินค้าเต็ม',
          'POST',
          '/api/products/{{productId}}/edit-requests',
          {
            requestId: '{{requestId}}',
            expectedVersion: '{{expectedVersion}}',
            keepFileIds: [],
            data: { fields, sequence: '00001', files: [] },
          },
          { requestId: '{{requestId}}', status: 'pending' },
          'Adminเท่านั้น. expectedVersionจากGETล่าสุด. รหัส/code/group/format/sequence/unitแก้ได้แม้มีล็อต แต่ตรวจเลขซ้ำ. keepFileIdsใส่IDไฟล์เดิมที่ต้องการเก็บ; []คือนำไฟล์เดิมออกทั้งหมด. filesเป็นmanifestเฉพาะไฟล์ใหม่; ใช้ upload/status/commit/cancelเส้นเดิม. 409staleต้องโหลดข้อมูลล่าสุด ไม่ทับข้อมูล; retryใช้requestId/bodyเดิม. ไม่มีเปิดปิดขาย.',
        ),
        req(
          'เลขลำดับสินค้าถัดไป',
          'GET',
          '/api/products/full/next?groupId={{groupId}}&formatId={{formatId}}',
          null,
          { sequence: '00001' },
          'Admin; เลขที่แนะนำยังไม่จอง untilcommit.',
        ),
        req(
          'เริ่มสร้างสินค้า',
          'POST',
          '/api/products/full/requests',
          { requestId: '{{requestId}}', data: { fields, sequence: '', files: [] } },
          { requestId: '{{requestId}}', status: 'pending' },
          'Admin; requestIdUUIDสร้างเอง1ครั้งเก็บไว้retry. ตัวอย่างไม่มีไฟล์; ถ้าจะแนบให้เติมmanifestก่อนbeginตามdocs/api/product-full.md.',
        ),
        req(
          'ตรวจคำขอ',
          'GET',
          '/api/products/full/requests/{{requestId}}',
          null,
          { status: 'pending' },
          'Adminเจ้าของrequest.',
        ),
        upload,
        req(
          'ยืนยันสร้างสินค้า',
          'POST',
          '/api/products/full/requests/{{requestId}}',
          null,
          { product: { id: '{{productId}}', code: 'RX-TB-00001' } },
          'Adminเจ้าของ; commitสร้างหรือแก้ไขตามpurposeที่begin. ไฟล์ใหม่ต้องครบmanifest; editตรวจversion/เลขซ้ำ/auditในtransactionเดียว. retryคืนสินค้าเดิมไม่สร้างauditซ้ำ.',
          200,
        ),
        req(
          'ยกเลิกคำขอ',
          'DELETE',
          '/api/products/full/requests/{{requestId}}',
          null,
          { cancelled: true },
          'Adminเจ้าของ; completeยกเลิกไม่ได้. Canceleditล้างเฉพาะไฟล์ใหม่ในpendingrequest ไม่แตะไฟล์เดิมของสินค้า.',
        ),
      ]),
      folder('product-file', [file]),
    ]),
    folder('stock', [
      folder('stock-summary', [
        list('คลังทั้งหมด', 'view=products&projection=summary'),
        ...['MAIN', 'MARKETING', 'DISPOSAL'].map((code) =>
          list('คลัง ' + code, 'view=products&projection=summary&warehouseCode=' + code),
        ),
        list(
          'สินค้าใกล้หมดเฉพาะคลังหลัก',
          'view=products&warehouseCode=MAIN&stock=low&projection=summary',
        ),
        list(
          'สินค้าหมดเฉพาะคลังหลัก',
          'view=products&warehouseCode=MAIN&stock=empty&projection=summary',
        ),
        list('หน้าถัดไปไม่ส่งmetadataซ้ำ', 'view=products&projection=summary&metadata=false'),
      ]),
      folder('stock-lot', [
        list(
          'ล็อตคงเหลือของสินค้า',
          'view=lots&productId={{productId}}&remaining=true&warehouseCode=MAIN',
        ),
        list('ประวัติล็อตของสินค้า', 'view=lots&productId={{productId}}'),
        list(
          'ล็อตรอทำลายรวมแถวทำลายแล้ว',
          'view=lots&productId={{productId}}&remaining=true&warehouseCode=DISPOSAL',
        ),
      ]),
      folder('stock-receipt', [
        list('ประวัติรับเข้ารายล็อต', 'view=receipt-items'),
        req(
          'รายละเอียดรับเข้า1ล็อตและสิทธิ์แก้',
          'GET',
          '/api/inventory?view=receipt-items&lotId={{lotId}}&limit=1&offset=0',
          null,
          {
            ...okPage,
            pagination: { ...okPage.pagination, limit: 1 },
            capabilities: { canCorrectReceipt: true },
          },
          'lotIdUUIDของล็อต ไม่ใช่stock_receiptsUUID; รายการแก้ได้Adminภายใน7วันตามwrite.',
        ),
        req(
          'รับเข้า1ล็อต',
          'POST',
          '/api/inventory',
          {
            action: 'receive',
            idempotencyKey: '{{idempotencyKey}}',
            code: '{{receiptCode}}',
            notes: '',
            lots: [
              {
                productId: '{{productId}}',
                warehouseId: '{{warehouseId}}',
                quantity: '20',
                totalCost: '1000.00',
                manufacturedOn: '{{manufacturedOn}}',
                expiresOn: '{{expiresOn}}',
              },
            ],
          },
          { data: { id: '{{operationId}}', code: '{{receiptCode}}', lotIds: ['{{lotId}}'] } },
          'Admin; codeจากoptionsGR-ปีพ.ศ.ปัจจุบัน-5หลักแก้เลขเองได้ไม่ซ้ำ. เลือกMAINเริ่มต้น; lotsมี1รายการเท่านั้น. ไม่มีเลขล็อตแยก.',
        ),
        actions('correct', {
          quantity: '20',
          totalCost: '1000.00',
          manufacturedOn: '{{manufacturedOn}}',
          expiresOn: '{{expiresOn}}',
        }),
      ]),
      folder('stock-movement', [list('ประวัติเคลื่อนไหว', 'view=movements')]),
      folder('stock-action', [
        actions('transfer', { targetWarehouseId: '{{targetWarehouseId}}', quantity: '20' }),
        actions('adjust', { quantity: '20' }),
        actions('condition', { condition: 'เสื่อมสภาพ' }),
        actions('give', { giveType: 'แจก', recipient: '{{recipient}}', quantity: '1' }),
        actions('give', {
          giveType: 'บริจาค',
          recipient: '{{recipient}}',
          quantity: '1',
          arrivalOn: '{{arrivalOn}}',
          recipientConfirmed: true,
        }),
        actions('destroy', { expectedQuantity: '20', confirmed: true }),
      ]),
      folder('stock-options', [
        req(
          'ตัวเลือกฟอร์มรับเข้า',
          'GET',
          '/api/inventory?view=options&scope=receive',
          null,
          { data: { products: [], warehouses: [], actor: {}, nextReceiptCode: 'GR-2569-00001' } },
          'ชุดเล็กสำหรับรับเข้า; productsactiveครบแต่ไม่มีavailable/cost/customers/users/policy.',
        ),
      ]),
    ]),
  ],
};
const bindingPath = 'postman/Zuugroup.remote.json';
const editRequest = collection.item
  .find((item) => item.name === 'products')
  .item.find((item) => item.name === 'product-request')
  .item.find((item) => item.name === 'POST เริ่มแก้ไขสินค้าเต็ม');
editRequest.response.push({
  name: '409 ข้อมูลเปลี่ยนแล้ว',
  originalRequest: editRequest.request,
  status: 'Conflict',
  code: 409,
  header: [{ key: 'Content-Type', value: 'application/json' }],
  body: JSON.stringify(
    { error: 'ข้อมูลสินค้าถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนแก้ไขอีกครั้ง' },
    null,
    2,
  ),
});
if (fs.existsSync(bindingPath)) {
  const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
  collection.info._postman_id = binding.collectionId;
  function bind(items, prefix = '') {
    for (const item of items) {
      const key = prefix + '/' + item.name;
      if (binding.itemIds[key]) item.id = binding.itemIds[key];
      if (item.item) bind(item.item, key);
    }
  }
  bind(collection.item);
}
fs.writeFileSync(
  'postman/Zuugroup.postman_collection.json',
  JSON.stringify(collection, null, 2) + '\n',
);
const count = (items) => items.reduce((n, x) => n + (x.item ? count(x.item) : 1), 0);
console.log(
  JSON.stringify({
    name: collection.info.name,
    requests: count(collection.item),
    folders: collection.item.map((x) => x.name),
  }),
);
