// Integration tests: real PostgreSQL inside one rolled-back transaction, real private Storage
// objects removed in finally. Run: node --loader ./scripts/ts-test-loader.mjs scripts/test-customer-full.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
dotenv.config({ path: '.env.local', quiet: true });
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const storage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
).storage.from('customer-attachments');
const uploaded = new Set();
const rollback = Error('ROLLBACK_TEST');
let passed = 0;
const baseline = await db.$queryRaw`SELECT count(*)::int AS customers FROM customers`;
try {
  await db.$transaction(
    async (tx) => {
      const admin = await tx.user.findFirst({
        where: { deletedAt: null, status: 'ACTIVE', userRole: { is: { roleId: 'ADMIN' } } },
        include: { userRole: true },
      });
      assert.ok(admin);
      let identity = admin;
      let sameOrigin = true;
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
          Date,
          Error,
          File,
          Intl,
          JSON,
          URLSearchParams,
          Uint8Array,
          Response,
          console,
          process,
          require(name) {
            if (name === 'server-only') return {};
            if (name === 'node:crypto') return crypto;
            if (name === 'next/server')
              return {
                NextResponse: class extends Response {
                  static json(body, init) {
                    return Response.json(body, init);
                  }
                },
              };
            if (name === '@/generated/prisma/client') return { Prisma };
            if (name === '@/server/db/prisma')
              return {
                getPrismaClient: () =>
                  new Proxy(tx, {
                    get: (target, key) =>
                      key === '$transaction'
                        ? (fn) => fn(tx)
                        : typeof target[key] === 'function'
                          ? target[key].bind(target)
                          : target[key],
                  }),
              };
            if (name === '@/server/auth/current-user')
              return { getCurrentApiUser: async () => identity };
            if (name === '@/server/auth/api-authorization')
              return { hasSameOrigin: () => sameOrigin };
            if (name === './storage')
              return {
                ...load('src/server/customers/storage.ts'),
                customerStorage: () => ({
                  upload: async (p, ...args) => {
                    const r = await storage.upload(p, ...args);
                    if (!r.error) uploaded.add(p);
                    return r;
                  },
                  download: (p) => storage.download(p),
                  remove: (p) => storage.remove(p),
                  list: (p, o) => storage.list(p, o),
                }),
              };
            if (name === '@supabase/supabase-js') return { createClient };
            if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
            if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
            throw Error('Unexpected dependency ' + name);
          },
        });
        return exports;
      }
      const service = load('src/server/customers/full.ts');
      const { customerHandler } = load('src/server/customers/handler.ts');
      async function call(action, params = {}, id, expected = 200) {
        await tx.$executeRawUnsafe('SAVEPOINT customer_test');
        const response = await customerHandler(
          {
            method: 'GET',
            headers: new Headers(),
            nextUrl: { searchParams: new URLSearchParams(params) },
          },
          action,
          id,
        );
        const data = await response.json();
        if (response.status >= 400)
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT customer_test');
        await tx.$executeRawUnsafe('RELEASE SAVEPOINT customer_test');
        assert.equal(response.status, expected, JSON.stringify(data));
        return data;
      }
      async function rejects(fn, pattern) {
        await tx.$executeRawUnsafe('SAVEPOINT customer_test');
        try {
          await assert.rejects(fn, pattern);
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT customer_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT customer_test');
        }
      }
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }
      const options =
        await tx.$queryRaw`SELECT id,kind,code,name,days FROM customer_options WHERE active ORDER BY kind,name`;
      const group = options.find((o) => o.kind === 'codeGroup' && o.code === 'PHA');
      const term = options.find((o) => o.kind === 'creditTerm' && o.days === 30);
      const docType = options.find((o) => o.kind === 'documentType');
      const territory =
        await tx.$queryRaw`INSERT INTO sales_territories(code,name) VALUES(${crypto.randomUUID()},'TASK263 เขตทดสอบ') RETURNING id,name`;
      const fields = {
        name: 'TASK263 ร้านยาทดสอบ',
        notes: 'บรรทัด 1\nบรรทัด 2',
        territoryId: territory[0].id,
        contactName: 'ผู้ติดต่อทดสอบ',
        phone: '02-000-0000',
        email: 'test@example.com',
        accountingContactName: 'บัญชีทดสอบ',
        accountingPhone: '02-000-0001',
        accountingEmail: 'account@example.com',
        taxId: '0105555000001',
        vatStatus: 'จดทะเบียน',
        branchType: 'สำนักงานใหญ่',
        billingAddress: '1 ถนนทดสอบ',
        billingSubdistrict: 'แขวงทดสอบ',
        billingDistrict: 'เขตทดสอบ',
        billingProvince: 'จังหวัดทดสอบ TASK263',
        billingPostcode: '10000',
        licenseExpiresAt: '2027-12-31',
        licenseStatus: 'รอตรวจ',
        profession: 'เภสัชกร',
        creditTermId: term.id,
        creditLimit: '50,000.50',
        billingCycle: 'พิมพ์เอง: ทุกวันที่ 5',
      };
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        'base64',
      );
      const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
      const fileId = crypto.randomUUID();
      const addressId = crypto.randomUUID();
      const data = {
        codeGroupId: group.id,
        sequence: '',
        fields,
        shippingAddresses: [
          {
            id: addressId,
            isDefault: false,
            name: 'สาขาส่งของ',
            address: '2 ถนนส่งของ',
            province: 'นนทบุรี',
          },
          { id: crypto.randomUUID(), isDefault: false },
        ],
        files: [
          {
            id: fileId,
            documentTypeId: docType.id,
            name: 'license.png',
            type: 'image/png',
            size: png.length,
            digest: hash(png),
          },
        ],
      };
      await test('Next sequence per code group', async () => {
        const result = await call('next', { codeGroupId: group.id });
        assert.match(result.sequence, /^\d{4,}$/);
        await call('next', { codeGroupId: term.id }, undefined, 409);
      });
      await test('Validation rejects missing required, bad tax id/email/date/limit, unknown fields', async () => {
        const bad = (patch, pattern) =>
          rejects(
            () =>
              service.beginCustomerRequest(
                crypto.randomUUID(),
                { ...data, fields: { ...fields, ...patch } },
                admin.id,
              ),
            pattern,
          );
        await bad({ name: ' ' }, /กรุณากรอก/);
        await bad({ contactName: '' }, /ผู้ติดต่อหลัก/);
        await bad({ taxId: '123' }, /13 หลัก/);
        await bad({ email: 'nope' }, /อีเมล/);
        await bad({ licenseExpiresAt: '2027-02-30' }, /วันหมดอายุ/);
        await bad({ creditLimit: '-1' }, /วงเงิน/);
        await bad({ vatStatus: 'อื่น' }, /เลือก/);
        await bad({ unknown: 'x' }, /ไม่รองรับ/);
        await rejects(
          () =>
            service.beginCustomerRequest(
              crypto.randomUUID(),
              { ...data, codeGroupId: term.id },
              admin.id,
            ),
          /กลุ่มรหัส/,
        );
      });
      const requestId = crypto.randomUUID();
      await test('Begin is idempotent; upload checks manifest and stores private file', async () => {
        assert.equal(
          (await service.beginCustomerRequest(requestId, data, admin.id)).status,
          'pending',
        );
        assert.equal(
          (await service.beginCustomerRequest(requestId, data, admin.id)).status,
          'pending',
        );
        await rejects(() => service.commitCustomerRequest(requestId, admin.id), /ยังอัปโหลดไม่ครบ/);
        await rejects(
          () =>
            service.uploadCustomerFile(
              requestId,
              fileId,
              admin.id,
              docType.id,
              new File([Buffer.from('%PDF-1.4 fake')], 'license.png', { type: 'application/pdf' }),
            ),
          /ไม่ตรง/,
        );
        const file = new File([png], 'license.png', { type: 'image/png' });
        await service.uploadCustomerFile(requestId, fileId, admin.id, docType.id, file);
        await service.uploadCustomerFile(requestId, fileId, admin.id, docType.id, file);
      });
      let customer;
      await test('Commit creates code PHA-xxxx with all fields, files and audit; retry is idempotent', async () => {
        customer = await service.commitCustomerRequest(requestId, admin.id);
        assert.match(customer.code, /^PHA-\d{4,}$/);
        assert.equal((await service.commitCustomerRequest(requestId, admin.id)).id, customer.id);
        const row = await tx.customer.findUnique({ where: { id: customer.id } });
        assert.equal(row.name, fields.name);
        assert.equal(row.province, fields.billingProvince);
        assert.equal(row.category, group.name);
        assert.equal(row.creditDays, 30);
        assert.equal(row.creditLimit.toString(), '50000.5');
        assert.equal(row.territoryId, territory[0].id);
        assert.equal(row.details.fields.notes, fields.notes);
        assert.equal(row.details.fields.billingCycle, fields.billingCycle);
        assert.equal(row.details.shippingAddresses.length, 1);
        assert.equal(row.details.shippingAddresses[0].isDefault, true);
        assert.equal(row.details.files[0].documentTypeName, docType.name);
        const bytes = await service.readCustomerFile(fileId);
        assert.equal(Buffer.from(bytes.bytes).toString('hex'), png.toString('hex'));
        assert.equal(
          await tx.auditEvent.count({ where: { action: 'CUSTOMER_CREATED_FULL', requestId } }),
          1,
        );
      });
      await test('Duplicate sequence in same group conflicts; other group may reuse number', async () => {
        const row = await tx.customer.findUnique({ where: { id: customer.id } });
        const duplicate = crypto.randomUUID();
        const plain = { ...data, files: [], sequence: String(row.sequence) };
        await service.beginCustomerRequest(duplicate, plain, admin.id);
        await rejects(() => service.commitCustomerRequest(duplicate, admin.id), /ซ้ำ|มีอยู่แล้ว/);
        const other = options.find((o) => o.kind === 'codeGroup' && o.code === 'CLN');
        const otherId = crypto.randomUUID();
        await service.beginCustomerRequest(otherId, { ...plain, codeGroupId: other.id }, admin.id);
        const created = await service.commitCustomerRequest(otherId, admin.id);
        assert.equal(created.code, `CLN-${String(row.sequence).padStart(4, '0')}`);
      });
      await test('List: search, filters, sort, pagination and include', async () => {
        const list = await call('list', { search: 'TASK263', include: 'filters,config' });
        assert.equal(list.pagination.total, 2);
        assert.equal(list.config.canWrite, true);
        assert.ok(list.filters.provinces.includes(fields.billingProvince));
        assert.ok(list.filters.territories.some((t) => t.id === territory[0].id));
        const first = list.data.find((row) => row.id === customer.id);
        assert.equal(first.creditTermName, term.name);
        assert.equal(first.territoryName, territory[0].name);
        assert.equal(first.licenseExpiresAt, '2027-12-31');
        assert.equal(
          (await call('list', { territoryId: territory[0].id, province: fields.billingProvince }))
            .pagination.total,
          2,
        );
        assert.equal((await call('list', { search: 'TASK263', limit: '1' })).data.length, 1);
        assert.ok(list.filters.licenseStatuses.includes('รอตรวจ'));
        assert.equal(
          (await call('list', { search: 'TASK263', licenseStatus: 'รอตรวจ' })).pagination.total,
          2,
        );
        assert.equal(
          (await call('list', { search: 'TASK263', licenseStatus: 'ผ่าน' })).pagination.total,
          0,
        );
        await tx.$executeRaw`UPDATE customers SET license_status='' WHERE id=${customer.id}::uuid`;
        assert.equal(
          (await call('list', { search: 'TASK263', licenseStatus: 'ยังไม่ระบุ' })).data[0].id,
          customer.id,
        );
        assert.ok(
          (await call('list', { include: 'filters' })).filters.licenseStatuses.includes(
            'ยังไม่ระบุ',
          ),
        );
        // TASK-271: single status filter follows the badge (Asia/Bangkok dates, 30-day warning).
        const only = async (status) =>
          (await call('list', { search: 'TASK263', status })).data.map((row) => row.id);
        await tx.$executeRaw`UPDATE customers SET license_expires_at=(now() AT TIME ZONE 'Asia/Bangkok')::date - 1 WHERE id=${customer.id}::uuid`;
        assert.deepEqual(await only('ใบอนุญาตหมดอายุ'), [customer.id]);
        assert.ok(!(await only('ใช้งาน')).includes(customer.id));
        await tx.$executeRaw`UPDATE customers SET license_expires_at=(now() AT TIME ZONE 'Asia/Bangkok')::date + 30 WHERE id=${customer.id}::uuid`;
        assert.deepEqual(await only('ใบอนุญาตใกล้หมดอายุ'), [customer.id]);
        await tx.$executeRaw`UPDATE customers SET license_expires_at=(now() AT TIME ZONE 'Asia/Bangkok')::date + 31 WHERE id=${customer.id}::uuid`;
        assert.ok((await only('ใช้งาน')).includes(customer.id));
        assert.deepEqual(await only('ใบอนุญาตใกล้หมดอายุ'), []);
        const sorted = await call('list', {
          search: 'TASK263',
          sortBy: 'code',
          sortDirection: 'desc',
        });
        assert.ok(sorted.data[0].code > sorted.data[1].code);
        await call('list', { sortBy: 'bad' }, undefined, 400);
        await call('list', { territoryId: 'bad' }, undefined, 400);
        await call('list', { unknown: '1' }, undefined, 400);
      });
      await test('Detail returns details and resolved options; unknown id 404', async () => {
        const detail = await call('detail', {}, customer.id);
        assert.equal(detail.data.codeGroup.code, 'PHA');
        assert.equal(detail.data.creditTerm.days, 30);
        assert.equal(detail.data.details.fields.taxId, fields.taxId);
        await call('detail', {}, crypto.randomUUID(), 404);
        await call('detail', {}, 'bad', 404);
      });
      await test('Edit: stale form 409, keeps number, swaps file, status/audit/history', async () => {
        const before = await tx.customer.findUnique({ where: { id: customer.id } });
        const expectedUpdatedAt = before.updatedAt.toISOString();
        const edited = {
          ...data,
          sequence: '',
          fields: { ...fields, name: 'TASK263 ร้านยาแก้ไขแล้ว', customerStatus: 'ระงับ' },
          files: [],
        };
        await rejects(
          () =>
            service.beginCustomerEditRequest(
              customer.id,
              {
                requestId: crypto.randomUUID(),
                expectedUpdatedAt: '2020-01-01T00:00:00.000Z',
                keepFileIds: [],
                data: edited,
              },
              admin.id,
            ),
          /ถูกเปลี่ยนแล้ว/,
        );
        await rejects(
          () =>
            service.beginCustomerEditRequest(
              customer.id,
              {
                requestId: crypto.randomUUID(),
                expectedUpdatedAt,
                keepFileIds: [crypto.randomUUID()],
                data: edited,
              },
              admin.id,
            ),
          /ไฟล์เดิม/,
        );
        const editId = crypto.randomUUID();
        await service.beginCustomerEditRequest(
          customer.id,
          { requestId: editId, expectedUpdatedAt, keepFileIds: [fileId], data: edited },
          admin.id,
        );
        const saved = await service.commitCustomerRequest(editId, admin.id);
        assert.equal(saved.id, customer.id);
        assert.equal(saved.code, customer.code);
        const row = await tx.customer.findUnique({ where: { id: customer.id } });
        assert.equal(row.name, 'TASK263 ร้านยาแก้ไขแล้ว');
        assert.equal(row.status, 'ระงับ');
        assert.equal(row.details.files.length, 1);
        assert.equal(
          Buffer.from((await service.readCustomerFile(fileId)).bytes).length,
          png.length,
        );
        assert.equal(
          await tx.auditEvent.count({
            where: { action: 'CUSTOMER_UPDATED_FULL', requestId: editId },
          }),
          1,
        );
        const detail = await call('detail', {}, customer.id);
        assert.equal(detail.data.status, 'ระงับ');
        assert.equal(detail.data.history.createdBy, admin.name);
        assert.equal(detail.data.history.updatedBy, admin.name);
        assert.equal(
          (await call('list', { search: 'TASK263', status: 'ระงับ' })).data[0].id,
          customer.id,
        );
        await call('list', { status: 'อื่น' }, undefined, 400);
        // Dropping the old file on the next edit removes it from the customer.
        const dropId = crypto.randomUUID();
        await service.beginCustomerEditRequest(
          customer.id,
          {
            requestId: dropId,
            expectedUpdatedAt: row.updatedAt.toISOString(),
            keepFileIds: [],
            data: edited,
          },
          admin.id,
        );
        await service.commitCustomerRequest(dropId, admin.id);
        await rejects(() => service.readCustomerFile(fileId), /ไม่พบไฟล์/);
      });
      await test('Soft delete needs reason, hides from list, admin sees deleted tab, restore', async () => {
        const remove = (body, expected) =>
          tx
            .$executeRawUnsafe('SAVEPOINT customer_test')
            .then(() =>
              customerHandler(
                {
                  method: 'DELETE',
                  headers: new Headers(),
                  nextUrl: { searchParams: new URLSearchParams() },
                  json: async () => body,
                },
                'delete',
                customer.id,
              ),
            )
            .then(async (response) => {
              if (response.status >= 400)
                await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT customer_test');
              await tx.$executeRawUnsafe('RELEASE SAVEPOINT customer_test');
              assert.equal(response.status, expected);
            });
        await remove({}, 400);
        await remove({ reason: 'ทดสอบลบ' }, 200);
        assert.equal((await call('list', { search: 'TASK263' })).pagination.total, 1);
        await call('detail', {}, customer.id, 404);
        const deleted = await call('list', { search: 'TASK263', deleted: 'true' });
        assert.equal(deleted.data[0].deleteReason, 'ทดสอบลบ');
        assert.equal((await call('detail', { deleted: 'true' }, customer.id)).data.id, customer.id);
        identity = { ...admin, userRole: { roleId: 'SALES' } };
        await call('list', { deleted: 'true' }, undefined, 403);
        identity = admin;
        await tx.$executeRawUnsafe('SAVEPOINT customer_test');
        const restored = await customerHandler(
          {
            method: 'PATCH',
            headers: new Headers(),
            nextUrl: { searchParams: new URLSearchParams() },
            json: async () => ({ action: 'restore' }),
          },
          'restore',
          customer.id,
        );
        await tx.$executeRawUnsafe('RELEASE SAVEPOINT customer_test');
        assert.equal(restored.status, 200);
        assert.equal((await call('list', { search: 'TASK263' })).pagination.total, 2);
        assert.equal(
          await tx.auditEvent.count({
            where: {
              action: { in: ['CUSTOMER_DELETED', 'CUSTOMER_RESTORED'] },
              after: { path: ['id'], equals: customer.id },
            },
          }),
          2,
        );
      });
      await test('Cancel removes uploaded files and blocks reuse', async () => {
        const cancelId = crypto.randomUUID();
        const otherFile = crypto.randomUUID();
        await service.beginCustomerRequest(
          cancelId,
          { ...data, files: [{ ...data.files[0], id: otherFile }] },
          admin.id,
        );
        await service.uploadCustomerFile(
          cancelId,
          otherFile,
          admin.id,
          docType.id,
          new File([png], 'license.png', { type: 'image/png' }),
        );
        await service.cancelCustomerRequest(cancelId, admin.id);
        const listed = await storage.list(`${admin.id}/${cancelId}`);
        assert.equal(listed.data.length, 0);
        await rejects(() => service.commitCustomerRequest(cancelId, admin.id), /ยกเลิก/);
        await rejects(() => service.cancelCustomerRequest(requestId, admin.id), /บันทึกแล้ว/);
      });
      await test('Roles: Sales reads, may start requests (TASK-288) but cannot commit; anonymous 401; origin checked', async () => {
        identity = { ...admin, userRole: { roleId: 'SALES' } };
        assert.equal((await call('list', { include: 'config' })).config.canWrite, false);
        await call('next', { codeGroupId: group.id });
        await call('commit', {}, requestId, 403);
        await call('restore', {}, requestId, 403);
        identity = admin;
        sameOrigin = false;
        await call('begin', {}, undefined, 403);
        sameOrigin = true;
        identity = null;
        await call('list', {}, undefined, 401);
        identity = admin;
      });
      await test('Tables keep RLS and no client grants', async () => {
        const rows =
          await tx.$queryRaw`SELECT bool_and(relrowsecurity) AS rls, bool_or(has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT')) AS client FROM pg_class WHERE oid IN ('public.customer_create_requests'::regclass,'public.customer_files'::regclass)`;
        assert.equal(rows[0].rls, true);
        assert.equal(rows[0].client, false);
      });
      throw rollback;
    },
    { timeout: 120000, maxWait: 10000 },
  );
} catch (error) {
  if (error !== rollback) {
    console.error(
      'Test failed:',
      error.code === 'ERR_ASSERTION' ? error.message : (error.stack ?? error.message),
    );
    process.exitCode = 1;
  } else console.log(`Completed ${passed} checks; database changes rolled back.`);
} finally {
  if (uploaded.size) await storage.remove([...uploaded]);
  const after = await db.$queryRaw`SELECT count(*)::int AS customers FROM customers`;
  assert.equal(after[0].customers, baseline[0].customers);
  console.log(`Storage cleanup: ${uploaded.size} test objects removed; customers unchanged.`);
  await db.$disconnect();
}
