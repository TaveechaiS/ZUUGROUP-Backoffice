import { randomUUID } from 'node:crypto';
import process from 'node:process';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local', quiet: true });

if (!process.argv.includes('--i-am-project-owner')) {
  console.error('เครื่องมือนี้ใช้โดยเจ้าของโครงการเท่านั้น: npm.cmd run recover:admin -- --i-am-project-owner');
  process.exit(1);
}
if (!stdin.isTTY) {
  console.error('ต้องใช้งานใน Terminal แบบโต้ตอบบนเครื่องผู้ดูแล');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
if (!url || !key || !databaseUrl) {
  console.error('กรุณากำหนด NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY และ DATABASE_URL ใน .env.local');
  process.exit(1);
}

const input = readline.createInterface({ input: stdin, output: stdout });
const email = (await input.question('อีเมลบัญชี Admin ที่ตรวจสอบตัวตนแล้ว: ')).trim().toLowerCase();
const employeeCode = (await input.question('รหัสพนักงาน: ')).trim();
const name = (await input.question('ชื่อ - นามสกุล: ')).trim();
const authUserIdInput = (await input.question('Auth User ID จาก Dashboard (เว้นว่างเพื่อสร้าง Auth user ใหม่): ')).trim();
const confirmation = (await input.question('พิมพ์ RECOVER ADMIN เพื่อยืนยัน: ')).trim();
input.close();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !employeeCode ||
    [...employeeCode].length > 40 || ['create', '.', '..'].includes(employeeCode.toLowerCase()) ||
    /[\\/?#\x00-\x1f\x7f]/.test(employeeCode) || !name || confirmation !== 'RECOVER ADMIN') {
  console.error('ข้อมูลหรือคำยืนยันไม่ถูกต้อง');
  process.exit(1);
}

function hiddenPassword() {
  stdout.write('รหัสผ่านใหม่ (ไม่แสดงขณะพิมพ์; ขั้นต่ำ 8 ตัวอักษร): ');
  return new Promise((resolve, reject) => {
    let value = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    function done(error) {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error); else resolve(value);
    }
    function onData(chunk) {
      for (const char of chunk) {
        if (char === '\u0003') { done(new Error('ยกเลิกโดยผู้ใช้')); return; }
        if (char === '\r' || char === '\n') { done(); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else value += char;
      }
    }
    stdin.on('data', onData);
  });
}

const password = await hiddenPassword();
if ([...password].length < 8) {
  console.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  process.exit(1);
}

const auth = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const db = new pg.Client({ connectionString: databaseUrl });
let createdAuthId = null;
let authChanged = false;
try {
  await db.connect();
  const existing = await db.query(
    `SELECT u.id, u.status, ur.role_id, a.provider_user_id
       FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN auth_accounts a ON a.user_id = u.id AND a.provider = 'supabase'
      WHERE lower(u.email) = $1`, [email]);
  if (existing.rows[0]?.provider_user_id && authUserIdInput &&
      existing.rows[0].provider_user_id !== authUserIdInput) {
    throw new Error('Auth User ID ไม่ตรงกับบัญชีในฐานข้อมูล');
  }
  let authUserId = existing.rows[0]?.provider_user_id ?? authUserIdInput;
  if (authUserId) {
    const found = await auth.auth.admin.getUserById(authUserId);
    if (found.error || found.data.user?.email?.toLowerCase() !== email) {
      throw new Error('ตรวจ Auth User ID/อีเมลไม่ผ่าน');
    }
    const updated = await auth.auth.admin.updateUserById(authUserId, { password, email_confirm: true });
    if (updated.error) throw new Error('ตั้งรหัสใหม่ใน Supabase Auth ไม่สำเร็จ');
    authChanged = true;
  } else {
    const created = await auth.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw new Error('สร้าง Auth user ไม่สำเร็จ; ตรวจว่ามีอีเมลนี้ใน Supabase Auth แล้วหรือไม่');
    authUserId = created.data.user.id;
    createdAuthId = authUserId;
    authChanged = true;
  }

  await db.query('BEGIN');
  await db.query('SELECT pg_advisory_xact_lock(87654037)');
  const current = await db.query(`SELECT u.id, u.status, u.deleted_at, u.deleted_by, u.delete_reason,
      ur.role_id FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id
      WHERE lower(u.email) = $1 FOR UPDATE OF u`, [email]);
  const userId = current.rows[0]?.id ?? randomUUID();
  if (current.rows.length) {
    await db.query(`UPDATE users SET employee_code = $1, name = $2, status = $3,
      deleted_at = NULL, deleted_by = NULL, delete_reason = NULL, updated_at = now() WHERE id = $4`,
      [employeeCode, name, 'ACTIVE', userId]);
  } else {
    await db.query('INSERT INTO users (id, employee_code, email, name, status, updated_at) VALUES ($1, $2, $3, $4, $5, now())',
      [userId, employeeCode, email, name, 'ACTIVE']);
  }
  await db.query(`INSERT INTO auth_accounts (id, user_id, provider, provider_user_id)
    VALUES ($1, $2, 'supabase', $3)
    ON CONFLICT (user_id, provider) DO UPDATE SET provider_user_id = EXCLUDED.provider_user_id`,
  [randomUUID(), userId, authUserId]);
  await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, 'ADMIN')
    ON CONFLICT (user_id) DO UPDATE SET role_id = 'ADMIN'`, [userId]);
  await db.query(`INSERT INTO audit_events (id, actor_role, target_user_id, action, request_id, before, after)
    VALUES ($1, 'PROJECT_OWNER', $2, 'ADMIN_RECOVERED', $3, $4::jsonb, $5::jsonb)`,
  [randomUUID(), userId, randomUUID(), JSON.stringify(current.rows[0] ?? null),
    JSON.stringify({ status: 'ACTIVE', roleId: 'ADMIN', deletedAt: null, deletedBy: null, deleteReason: null })]);
  await db.query('COMMIT');
  console.log('กู้คืนบัญชี Admin สำเร็จ กรุณาทดสอบเข้าสู่ระบบและเก็บหลักฐานการดำเนินการโดยไม่บันทึกรหัสผ่าน');
} catch (error) {
  await db.query('ROLLBACK').catch(() => undefined);
  if (createdAuthId) {
    const cleanup = await auth.auth.admin.deleteUser(createdAuthId);
    if (cleanup.error) console.error('ต้องตรวจ Auth user ที่สร้างค้างอยู่ใน Supabase Dashboard');
  }
  console.error(error instanceof Error ? error.message : 'กู้คืนไม่สำเร็จ');
  if (authChanged && !createdAuthId) console.error('Auth อาจเปลี่ยนรหัสแล้ว กรุณาตรวจบัญชีนี้ก่อนลองอีกครั้ง');
  process.exitCode = 1;
} finally {
  await db.end().catch(() => undefined);
}
