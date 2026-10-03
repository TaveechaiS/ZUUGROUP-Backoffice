import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const seconds = (start) => `${((performance.now() - start) / 1000).toFixed(1)} วินาที`;

export function seedChecks(cwd = root) {
  if (!existsSync(path.join(cwd, 'scripts/snapshots/TASK-076-before.json'))) {
    throw new Error(
      'ไม่พบ scripts/snapshots/TASK-076-before.json ชุดตรวจ seed ต้องใช้ snapshot เฉพาะเครื่องจาก TASK-076',
    );
  }
  return [
    { name: 'ตรวจแผนข้อมูล seed (ไม่เขียนฐานข้อมูล)', args: ['scripts/test-business-seed.mjs'] },
  ];
}

export async function runChecks(checks, { cwd = root, log = console.log } = {}) {
  const started = performance.now();
  let child;
  let interrupted = 0;
  const stop = (signal) => {
    interrupted ||= signal === 'SIGINT' ? 130 : 143;
    child?.kill(signal);
  };
  const onInterrupt = () => stop('SIGINT');
  const onTerminate = () => stop('SIGTERM');
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onTerminate);

  try {
    for (const [index, check] of checks.entries()) {
      if (interrupted) return interrupted;
      const stepStart = performance.now();
      log(`\n[${index + 1}/${checks.length}] ${check.name}`);
      const code = await new Promise((resolve) => {
        child = spawn(process.execPath, check.args, { cwd, stdio: 'inherit', shell: false });
        child.once('error', (error) => {
          log(`เริ่มขั้นตอนไม่ได้: ${error.message}`);
          resolve(1);
        });
        child.once('close', (exitCode) =>
          resolve(interrupted || exitCode || (exitCode === 0 ? 0 : 1)),
        );
      });
      child = undefined;
      if (code || interrupted) {
        log(`หยุดที่ ${check.name} (${seconds(stepStart)}) — รหัส ${interrupted || code}`);
        return interrupted || code;
      }
      log(`ผ่าน: ${check.name} (${seconds(stepStart)})`);
    }
    log(`\nผ่าน ${checks.length}/${checks.length} ขั้นตอน ใช้เวลารวม ${seconds(started)}`);
    return 0;
  } finally {
    process.removeListener('SIGINT', onInterrupt);
    process.removeListener('SIGTERM', onTerminate);
  }
}

const coreChecks = [
  { name: 'ตรวจ ESLint', args: ['node_modules/eslint/bin/eslint.js', '.'] },
  { name: 'สร้างประเภทข้อมูล Next routes', args: ['node_modules/next/dist/bin/next', 'typegen'] },
  {
    name: 'ตรวจ TypeScript',
    args: ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false'],
  },
  { name: 'ตรวจสัญญา API', args: ['scripts/test-api-contracts.mjs'] },
  { name: 'ตรวจการแบ่งหน้า', args: ['scripts/test-pagination.mjs'] },
  { name: 'ตรวจหน้าของ routes', args: ['scripts/test-route-pages.mjs'] },
  { name: 'ตรวจ resource API ด้วยข้อมูลจำลอง', args: ['scripts/test-resource-api.mjs'] },
  { name: 'ตรวจชื่อฟิลด์ API', args: ['scripts/test-api-field-names.mjs'] },
  { name: 'สร้าง production build', args: ['node_modules/next/dist/bin/next', 'build'] },
];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== '--seed')) {
      throw new Error('ใช้ npm run verify หรือ npm run verify:seed');
    }
    process.exitCode = await runChecks(args[0] === '--seed' ? seedChecks() : coreChecks);
  } catch (error) {
    console.error(`ตรวจไม่สำเร็จ: ${error.message}`);
    process.exitCode = 1;
  }
}
