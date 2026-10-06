import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
dotenv.config({ path: '.env.local', quiet: true });
const require = createRequire(import.meta.url);
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const storage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
).storage.from('product-attachments');
const uploaded = new Set();
const rollback = Error('ROLLBACK_TEST');
let passed = 0;
const baseline =
  await db.$queryRaw`SELECT (SELECT count(*)::int FROM products) AS products,(SELECT coalesce(sum(quantity),0)::int FROM stock_balances) AS quantity`;
try {
  await db.$transaction(
    async (tx) => {
      const admin = await tx.user.findFirst({
        where: { deletedAt: null, status: 'ACTIVE', userRole: { is: { roleId: 'ADMIN' } } },
        include: { userRole: true },
      });
      assert.ok(admin);
      let identity = admin;
      let origin = true;
      let storageFail = false;
      const cache = new Map();
      function load(file) {
        file = path.resolve(file);
        if (cache.has(file)) return cache.get(file);
        const exports = {};
        cache.set(file, exports);
        const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText;
        vm.runInNewContext(code, {
          exports,
          Buffer,
          Uint8Array,
          File,
          Blob,
          FormData,
          Response,
          Date,
          Error,
          JSON,
          URLSearchParams,
          console,
          require(name) {
            if (name === 'server-only') return {};
            if (name === 'node:crypto') return crypto;
            if (name === '@/generated/prisma/client') return { Prisma };
            if (name === '@/server/db/prisma') {
              const testDb = {
                $transaction: (fn) => fn(tx),
                $queryRaw: tx.$queryRaw.bind(tx),
                product: tx.product,
              };
              return { getPrismaClient: () => testDb, readWithConnectionRetry: (fn) => fn(testDb) };
            }
            if (name === '@/server/auth/current-user')
              return { getCurrentApiUser: async () => identity };
            if (name === '@/server/auth/api-authorization')
              return {
                authorizeUserManagement: async () => ({
                  user: origin && identity?.userRole?.roleId === 'ADMIN' ? identity : null,
                  error: !identity
                    ? Response.json({ error: 'login' }, { status: 401 })
                    : !origin || identity.userRole.roleId !== 'ADMIN'
                      ? Response.json({ error: 'denied' }, { status: 403 })
                      : null,
                }),
              };
            if (name === './storage')
              return {
                ...load('src/server/products/storage.ts'),
                productStorage: () => ({
                  upload: async (p, ...args) => {
                    const r = await storage.upload(p, ...args);
                    if (!r.error) uploaded.add(p);
                    return r;
                  },
                  download: (p) => storage.download(p),
                  remove: (p) =>
                    storageFail
                      ? Promise.resolve({ error: { message: 'TEST FAILURE' } })
                      : storage.remove(p),
                  list: (p, o) => storage.list(p, o),
                }),
              };
            if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
            if (name.startsWith('.')) return load(path.join(path.dirname(file), name + '.ts'));
            return require(name);
          },
        });
        return exports;
      }
      const service = load('src/server/products/full.ts');
      const validation = load('src/server/validation/product-full.ts');
      const handler = load('src/server/products/full-handler.ts').fullProductHandler;
      async function test(name, fn) {
        await tx.$executeRawUnsafe('SAVEPOINT product_test');
        try {
          await fn();
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT product_test');
          passed++;
          console.log('PASS: ' + name);
        } catch (e) {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT product_test');
          throw e;
        }
      }
      const options = await tx.productOption.findMany({ where: { active: true } });
      const pick = (kind) => options.find((o) => o.kind === kind);
      const fields = {
        'ชื่อสินค้าเต็ม (ไทย)': 'TASK177 ทดสอบ',
        'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)': 'TASK177 Test',
        ชื่อการค้า: 'Test Brand',
        รายละเอียดสินค้า: 'ข้อมูลทดสอบ rollback',
        ราคาขาย: '35.00',
        ความแรง: 'ข้อมูลทดสอบ',
        ข้อมูลทะเบียนผลิตภัณฑ์: 'TEST ONLY',
        'สรรพคุณ / ข้อบ่งใช้': 'Test',
        คำเตือนและข้อห้ามใช้: 'Test warning',
        เงื่อนไขการสั่งจ่าย: 'Test condition',
      };
      for (const [label, kind] of Object.entries(
        load('src/types/api/product-full.ts').PRODUCT_OPTION_FIELDS,
      ))
        fields[label] = pick(kind).id;
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aKpUAAAAASUVORK5CYII=',
        'base64',
      );
      const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
      const imageId = crypto.randomUUID();
      const documentId = crypto.randomUUID();
      const expectedFile = (id, kind, name, type, bytes) => ({
        id,
        kind,
        name,
        type,
        size: bytes.length,
        digest: crypto.createHash('sha256').update(bytes).digest('hex'),
      });
      const data = {
        fields,
        sequence: '',
        files: [
          expectedFile(imageId, 'image', 'test.png', 'image/png', png),
          expectedFile(documentId, 'document', 'test.pdf', 'application/pdf', pdf),
        ],
      };
      const requestId = crypto.randomUUID();
      await test('Validation required/bilingual/unknown field/sequence', async () => {
        assert.ok(validation.fullDraft(data));
        assert.throws(
          () => validation.fullDraft({ fields: { ...fields, ราคาต้นทุน: '25.00' } }),
          /ไม่รองรับ/,
        );
        assert.throws(
          () => validation.fullDraft({ fields: { ...fields, ภาษี: '7' } }),
          /ไม่รองรับ/,
        );
        assert.throws(() => validation.fullDraft({ fields: { ...fields, ราคาขาย: '-1' } }));
        assert.throws(() => validation.fullDraft({ ...data, sequence: '00000' }));
        assert.throws(() =>
          validation.fullDraft({
            fields: { ...fields, 'ชื่อสินค้าเต็ม (ไทย)': '', 'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)': '' },
          }),
        );
        assert.throws(() => validation.fullDraft({ fields: { ...fields, unexpected: 'ignored' } }));
      });
      await test('Next five-digit sequence and invalid kind', async () => {
        assert.match(
          await service.nextFullSequence(fields['กลุ่มรหัส'], fields['รูปแบบ']),
          /^\d{5}$/,
        );
        await assert.rejects(() => service.nextFullSequence(fields['ยี่ห้อ'], fields['รูปแบบ']));
      });
      await test('Begin and retry same request', async () => {
        const a = await service.beginProductRequest(requestId, data, admin.id);
        assert.equal(a.status, 'pending');
        await service.beginProductRequest(requestId, data, admin.id);
        await assert.rejects(() =>
          service.beginProductRequest(
            requestId,
            { ...data, fields: { ...fields, ราคาขาย: '36' } },
            admin.id,
          ),
        );
      });
      await test('Manifest requires complete files and rejects undeclared upload', async () => {
        await assert.rejects(
          () => service.commitProductRequest(requestId, admin.id),
          /ไฟล์แนบยังอัปโหลดไม่ครบ/,
        );
        await assert.rejects(
          () =>
            service.uploadProductFile(
              requestId,
              crypto.randomUUID(),
              admin.id,
              'image',
              new File([png], 'test.png', { type: 'image/png' }),
            ),
          /ไม่ตรงกับรายการ/,
        );
        assert.throws(
          () => validation.fullDraft({ ...data, files: [data.files[0], data.files[0]] }),
          /รหัสไฟล์แนบซ้ำ/,
        );
      });
      let image, document;
      await test('Real private image/PDF upload and retry', async () => {
        const id = imageId;
        image = await service.uploadProductFile(
          requestId.toUpperCase(),
          id.toUpperCase(),
          admin.id,
          'image',
          new File([png], 'test.png', { type: 'image/png' }),
        );
        const again = await service.uploadProductFile(
          requestId,
          id,
          admin.id,
          'image',
          new File([png], 'test.png', { type: 'image/png' }),
        );
        assert.equal(again.id, image.id);
        await assert.rejects(
          () => service.commitProductRequest(requestId, admin.id),
          /ไฟล์แนบยังอัปโหลดไม่ครบ/,
        );
        document = await service.uploadProductFile(
          requestId,
          documentId,
          admin.id,
          'document',
          new File([pdf], 'test.pdf', { type: 'application/pdf' }),
        );
      });
      await test('File limit and forged MIME rejected', async () => {
        await assert.rejects(() =>
          service.uploadProductFile(
            requestId,
            crypto.randomUUID(),
            admin.id,
            'image',
            new File([png], 'fake.jpg', { type: 'image/jpeg' }),
          ),
        );
        await assert.rejects(() =>
          service.uploadProductFile(
            requestId,
            crypto.randomUUID(),
            admin.id,
            'image',
            new File([new Uint8Array(10485761)], 'big.png', { type: 'image/png' }),
          ),
        );
        await assert.rejects(() =>
          service.uploadProductFile(
            requestId,
            crypto.randomUUID(),
            admin.id,
            'image',
            new File([pdf], 'test.pdf', { type: 'application/pdf' }),
          ),
        );
      });
      let product;
      await test('Commit/readback all fields/files and idempotent retry', async () => {
        product = await service.commitProductRequest(requestId, admin.id);
        assert.match(product.code, /^[A-Z0-9]{2,3}-[A-Z0-9]{2,3}-\d{5}$/);
        const again = await service.commitProductRequest(requestId, admin.id);
        assert.equal(again.id, product.id);
        await tx.$executeRaw`UPDATE product_options SET active=false WHERE id=${fields['กลุ่มรหัส']}::uuid`;
        assert.equal(
          (await service.beginProductRequest(requestId, data, admin.id)).status,
          'complete',
        );
        await tx.$executeRaw`UPDATE product_options SET active=true WHERE id=${fields['กลุ่มรหัส']}::uuid`;
        const row = await tx.product.findUnique({ where: { id: product.id } });
        for (const label of load('src/types/api/product-full.ts').PRODUCT_TEXT_FIELDS)
          assert.equal(row.details.fields[label], fields[label] ?? '');
        assert.ok(!('ราคาต้นทุน' in row.details.fields));
        assert.ok(!('ภาษี' in row.details.fields));
        for (const [label, id] of Object.entries(row.details.options)) {
          assert.equal(id, fields[label]);
          assert.equal(row.details.fields[label], options.find((o) => o.id === id).name);
        }
        assert.equal(row.details.files.length, 2);
        const bytes = await service.readProductFile(image.id, false);
        assert.equal(Buffer.from(bytes.bytes).toString('hex'), png.toString('hex'));
        const doc = await service.readProductFile(document.id, false);
        assert.equal(Buffer.from(doc.bytes).toString(), pdf.toString());
        const balances =
          await tx.$queryRaw`SELECT coalesce(sum(quantity),0)::int AS quantity FROM stock_balances`;
        assert.equal(balances[0].quantity, baseline[0].quantity);
      });
      await test('Duplicate sequence returns conflict', async () => {
        const duplicate = crypto.randomUUID();
        const row = await tx.product.findUnique({ where: { id: product.id } });
        await service.beginProductRequest(
          duplicate,
          { ...data, sequence: String(row.sequence) },
          admin.id,
        );
        await assert.rejects(
          () => service.commitProductRequest(duplicate, admin.id),
          /ซ้ำ|มีอยู่แล้ว/,
        );
      });
      await test('Cost filtered and legacy reads preserved', async () => {
        const products = load('src/server/products/service.ts');
        // Simulate a profile saved before TASK180; historical cost remains protected.
        await tx.$executeRaw`UPDATE products SET details=jsonb_set(details, '{fields,ราคาต้นทุน}', to_jsonb('25.00'::text)) WHERE id=${product.id}::uuid`;
        const privateView = await products.getProductById(product.id, true);
        const publicView = await products.getProductById(product.id, false);
        assert.equal(privateView.details.fields['ราคาต้นทุน'], '25.00');
        assert.ok(!('ราคาต้นทุน' in publicView.details.fields));
        const legacy = await tx.product.findFirst({
          where: { details: { equals: Prisma.DbNull } },
        });
        assert.ok(legacy);
        assert.ok(await products.getProductById(legacy.id));
      });
      await test('Full edit changes code/unit with a referenced lot, retains UUID/quantity and audits once', async () => {
        const products = load('src/server/products/service.ts');
        const before = await products.getProductById(product.id, true);
        assert.match(before.version, /^[a-f0-9]{32}$/);
        const receipt = await tx.stockReceipt.create({
          data: { code: `TEST-${crypto.randomUUID()}`, actorUserId: admin.id },
        });
        const lot = await tx.productLot.create({
          data: {
            receiptId: receipt.id,
            productId: product.id,
            lotNumber: receipt.code,
            receivedQuantity: 3,
            totalCost: '3',
            manufacturedOn: new Date('2026-01-01'),
            expiresOn: new Date('2099-01-01'),
          },
        });
        const warehouse = await tx.warehouse.findFirst();
        await tx.stockBalance.create({
          data: { lotId: lot.id, warehouseId: warehouse.id, quantity: 3 },
        });
        const unit = await tx.productOption.create({
          data: { kind: 'unit', name: `TEST-${crypto.randomUUID()}` },
        });
        const editId = crypto.randomUUID(),
          staleId = crypto.randomUUID(),
          replacementId = crypto.randomUUID();
        const nextSequence = await service.nextFullSequence(fields['กลุ่มรหัส'], fields['รูปแบบ']);
        const editFields = {
          ...fields,
          หน่วยสินค้า: unit.id,
          ราคาขาย: '88.50',
          'ชื่อสินค้าเต็ม (ไทย)': 'TASK215 แก้ข้อมูลจริง',
          รายละเอียดสินค้า: 'edited details',
          ความแรง: 'edited strength',
        };
        const payload = {
          requestId: editId,
          expectedVersion: before.version,
          keepFileIds: [imageId],
          data: {
            fields: editFields,
            sequence: nextSequence,
            files: [
              expectedFile(replacementId, 'document', 'replacement.pdf', 'application/pdf', pdf),
            ],
          },
        };
        await service.beginProductEditRequest(product.id, payload, admin.id);
        await service.beginProductEditRequest(
          product.id,
          { ...payload, requestId: staleId, data: { ...payload.data, files: [] } },
          admin.id,
        );
        await assert.rejects(() => service.commitProductRequest(editId, admin.id), /อัปโหลดไม่ครบ/);
        await service.uploadProductFile(
          editId,
          replacementId,
          admin.id,
          'document',
          new File([pdf], 'replacement.pdf', { type: 'application/pdf' }),
        );
        // Unchanged inactive option remains valid for edits.
        await tx.$executeRaw`UPDATE product_options SET active=false WHERE id=${fields['กลุ่มรหัส']}::uuid`;
        const result = await service.commitProductRequest(editId, admin.id);
        assert.equal(result.id, product.id);
        assert.notEqual(result.code, before.code);
        assert.equal((await service.commitProductRequest(editId, admin.id)).id, product.id);
        assert.equal(
          (await service.beginProductEditRequest(product.id, payload, admin.id)).status,
          'complete',
        );
        const after = await products.getProductById(product.id, true);
        assert.notEqual(after.version, before.version);
        assert.equal(after.unit, unit.name);
        assert.equal(after.salePrice, '88.50');
        for (const label of load('src/types/api/product-full.ts').PRODUCT_TEXT_FIELDS)
          assert.equal(after.details.fields[label], editFields[label]);
        assert.deepEqual(
          [...after.details.files.map((f) => f.id)].sort(),
          [imageId, replacementId].sort(),
        );
        assert.equal(
          (await tx.productLot.findUnique({ where: { id: lot.id } })).productId,
          product.id,
        );
        assert.equal(
          (
            await tx.stockBalance.findUnique({
              where: { lotId_warehouseId: { lotId: lot.id, warehouseId: warehouse.id } },
            })
          ).quantity,
          3,
        );
        await assert.rejects(
          () => service.commitProductRequest(staleId, admin.id),
          /ถูกเปลี่ยนแล้ว/,
        );
        await assert.rejects(
          () =>
            service.beginProductEditRequest(
              product.id,
              { ...payload, requestId: crypto.randomUUID() },
              admin.id,
            ),
          /ถูกเปลี่ยนแล้ว/,
        );
        assert.equal(
          (await service.productRequestStatus(editId, admin.id)).product.code,
          result.code,
        );
        assert.equal(
          await tx.auditEvent.count({
            where: { action: 'PRODUCT_UPDATED_FULL', requestId: editId },
          }),
          1,
        );
        await assert.rejects(() => service.readProductFile(documentId, true), /ไม่พบไฟล์/);
        assert.ok(await service.readProductFile(imageId, false));
        assert.ok(await service.readProductFile(replacementId, false));
        const history = load('src/server/products/history.ts');
        const visible = await history.productHistory(
          product.id,
          new URLSearchParams('limit=10&offset=0'),
          true,
          true,
        );
        assert.equal(visible.pagination.total, 2);
        assert.equal(visible.data[0].actorName, admin.name);
        assert.ok(
          visible.data[0].changes.some(
            (change) =>
              change.field === 'รหัสสินค้าเต็ม' &&
              change.before === before.code &&
              change.after === result.code,
          ),
        );
        assert.ok(visible.data[0].changes.some((change) => change.field === 'ราคาต้นทุน'));
        const redacted = await history.productHistory(
          product.id,
          new URLSearchParams('limit=1&offset=0'),
          false,
          false,
        );
        assert.ok(!redacted.data[0].changes.some((change) => change.field === 'ราคาต้นทุน'));
        await assert.rejects(() =>
          history.productHistory(product.id, new URLSearchParams('limit=101'), true, true),
        );
        await tx.$executeRaw`UPDATE product_options SET active=true WHERE id=${fields['กลุ่มรหัส']}::uuid`;
        await tx.stockBalance.delete({
          where: { lotId_warehouseId: { lotId: lot.id, warehouseId: warehouse.id } },
        });
        product = result;
      });
      await test('Edit rejects foreign/duplicate files, wrong kinds, duplicate codes and cleans only new pending files', async () => {
        const before = await load('src/server/products/service.ts').getProductById(
          product.id,
          true,
        );
        const body = {
          requestId: crypto.randomUUID(),
          expectedVersion: before.version,
          keepFileIds: [imageId],
          data: { fields: { ...fields }, sequence: before.sequence, files: [] },
        };
        await assert.rejects(
          () =>
            service.beginProductEditRequest(
              product.id,
              { ...body, keepFileIds: [crypto.randomUUID()] },
              admin.id,
            ),
          /ไม่ใช่ของ/,
        );
        await assert.rejects(
          () =>
            service.beginProductEditRequest(
              product.id,
              { ...body, keepFileIds: [imageId, imageId] },
              admin.id,
            ),
          /ซ้ำ/,
        );
        await assert.rejects(() =>
          service.beginProductEditRequest(
            product.id,
            {
              ...body,
              data: { ...body.data, fields: { ...fields, หมวดหมู่สินค้า: fields['ยี่ห้อ'] } },
            },
            admin.id,
          ),
        );
        const pendingId = crypto.randomUUID(),
          pendingFileId = crypto.randomUUID();
        await service.beginProductEditRequest(
          product.id,
          {
            ...body,
            requestId: pendingId,
            data: {
              ...body.data,
              files: [expectedFile(pendingFileId, 'image', 'pending-edit.png', 'image/png', png)],
            },
          },
          admin.id,
        );
        await service.uploadProductFile(
          pendingId,
          pendingFileId,
          admin.id,
          'image',
          new File([png], 'pending-edit.png', { type: 'image/png' }),
        );
        await service.cancelProductRequest(pendingId, admin.id);
        assert.ok(await service.readProductFile(imageId, true));
        assert.equal(await tx.productFile.count({ where: { requestId: pendingId } }), 0);
        assert.equal(
          (await load('src/server/products/service.ts').getProductById(product.id, true)).version,
          before.version,
        );
        const otherId = crypto.randomUUID();
        await service.beginProductRequest(otherId, { ...body.data, sequence: '' }, admin.id);
        const other = await service.commitProductRequest(otherId, admin.id);
        const otherRow = await tx.product.findUnique({ where: { id: other.id } });
        const conflictId = crypto.randomUUID();
        await service.beginProductEditRequest(
          product.id,
          {
            ...body,
            requestId: conflictId,
            data: { ...body.data, sequence: String(otherRow.sequence) },
          },
          admin.id,
        );
        await assert.rejects(
          () => service.commitProductRequest(conflictId, admin.id),
          /มีอยู่แล้ว|ซ้ำ/,
        );
      });
      await test('Pending cleanup and inaccessible pending file', async () => {
        const id = crypto.randomUUID();
        const fileId = crypto.randomUUID();
        await service.beginProductRequest(
          id,
          { ...data, files: [expectedFile(fileId, 'image', 'pending.png', 'image/png', png)] },
          admin.id,
        );
        const f = await service.uploadProductFile(
          id,
          fileId,
          admin.id,
          'image',
          new File([png], 'pending.png', { type: 'image/png' }),
        );
        await assert.rejects(() => service.readProductFile(f.id, true));
        storageFail = true;
        await assert.rejects(() => service.cancelProductRequest(id, admin.id));
        storageFail = false;
        assert.equal((await service.productRequestStatus(id, admin.id)).status, 'cancelled');
        await assert.rejects(() => service.commitProductRequest(id, admin.id));
        await assert.rejects(() =>
          service.uploadProductFile(
            id,
            f.id,
            admin.id,
            'image',
            new File([png], 'pending.png', { type: 'image/png' }),
          ),
        );
        await service.cancelProductRequest(id, admin.id);
        assert.equal((await service.productRequestStatus(id, admin.id)).status, 'cancelled');
        assert.equal(await tx.productFile.count({ where: { requestId: id } }), 0);
        await assert.rejects(() => service.commitProductRequest(id, admin.id));
      });
      await test('HTTP auth/origin and owner boundaries', async () => {
        identity = null;
        assert.equal((await handler({}, 'begin-edit', product.id)).status, 401);
        assert.equal(
          (await handler({ nextUrl: { searchParams: new URLSearchParams() } }, 'next')).status,
          401,
        );
        assert.equal((await handler({}, 'file', image.id)).status, 401);
        identity = { ...admin, userRole: { roleId: 'MANAGER' } };
        assert.equal((await handler({}, 'begin-edit', product.id)).status, 403);
        assert.equal(
          (await handler({ nextUrl: { searchParams: new URLSearchParams() } }, 'next')).status,
          403,
        );
        identity = admin;
        origin = false;
        assert.equal((await handler({}, 'begin-edit', product.id)).status, 403);
        assert.equal(
          (await handler({ nextUrl: { searchParams: new URLSearchParams() } }, 'next')).status,
          403,
        );
        origin = true;
        await assert.rejects(() => service.productRequestStatus(requestId, crypto.randomUUID()));
      });
      await test('History HTTP auth, cost redaction and invalid query responses', async () => {
        const historyGET = load('src/app/api/products/[id]/history/route.ts').GET;
        const context = { params: Promise.resolve({ id: product.id }) };
        identity = null;
        assert.equal((await historyGET({}, context)).status, 401);
        identity = { ...admin, userRole: { roleId: 'SALES' } };
        const response = await historyGET(
          { nextUrl: { searchParams: new URLSearchParams('limit=10') } },
          context,
        );
        assert.equal(response.status, 200);
        assert.ok(
          !(await response.json()).data.some((entry) =>
            entry.changes.some((change) => change.field === 'ราคาต้นทุน'),
          ),
        );
        assert.equal(
          (
            await historyGET(
              { nextUrl: { searchParams: new URLSearchParams('sortBy=unknown') } },
              context,
            )
          ).status,
          400,
        );
        assert.equal(
          (
            await historyGET(
              { nextUrl: { searchParams: new URLSearchParams('limit=101') } },
              context,
            )
          ).status,
          400,
        );
        identity = admin;
      });
      const current =
        await tx.$queryRaw`SELECT coalesce(sum(quantity),0)::int AS quantity FROM stock_balances`;
      assert.equal(current[0].quantity, baseline[0].quantity);
      throw rollback;
    },
    { timeout: 180000, maxWait: 10000 },
  );
} catch (e) {
  if (e !== rollback) throw e;
} finally {
  for (const p of uploaded) {
    const { error } = await storage.remove([p]);
    if (error) throw Error('Test file cleanup failed');
  }
  const after =
    await db.$queryRaw`SELECT (SELECT count(*)::int FROM products) AS products,(SELECT coalesce(sum(quantity),0)::int FROM stock_balances) AS quantity`;
  assert.deepEqual(after, baseline);
  await db.$disconnect();
}
console.log(
  'PASS: ' + passed + ' tests, DB rolled back, temporary files removed, counts preserved',
);
