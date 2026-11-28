// Exercise the real Prisma pg adapter against isolated fake connections, without DB access.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/server/db/serialized-pg.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  { exports, require: () => ({ PrismaPg }), Promise },
);
const connections = [];
let activeTotal = 0;
let maximumTotal = 0;
const pool = new pg.Pool();
pool.connect = async () => {
  let active = false;
  const state = { statements: [], released: false };
  connections.push(state);
  return {
    on() {},
    removeListener() {},
    release() {
      assert.equal(active, false, 'must drain queries before releasing the connection');
      state.released = true;
    },
    async query(query) {
      assert.equal(state.released, false);
      assert.equal(active, false, 'queries must never overlap on one connection');
      active = true;
      activeTotal++;
      maximumTotal = Math.max(maximumTotal, activeTotal);
      state.statements.push(query.text);
      try {
        await new Promise((resolve) => setTimeout(resolve, 5));
        if (query.text === 'FAIL')
          throw Object.assign(new Error('test failure'), { code: '22012' });
        return { fields: [], rows: [], rowCount: 1 };
      } finally {
        active = false;
        activeTotal--;
      }
    },
  };
};
const adapter = await new exports.SerializedPrismaPg(pool).connect();
const query = (sql) => ({ sql, args: [], argTypes: [] });
try {
  const tx = await adapter.startTransaction('RepeatableRead');
  const results = await Promise.all([
    tx.queryRaw(query('READ')),
    tx.executeRaw(query('WRITE')),
    tx.queryRaw(query('READ_AGAIN')),
  ]);
  assert.equal(results[1], 1);
  assert.deepEqual(connections[0].statements, [
    'BEGIN',
    'SET TRANSACTION ISOLATION LEVEL RepeatableRead',
    'READ',
    'WRITE',
    'READ_AGAIN',
  ]);
  const outcomes = await Promise.allSettled([
    tx.queryRaw(query('FAIL')),
    tx.executeRaw(query('AFTER_FAILURE')),
  ]);
  assert.equal(outcomes[0].status, 'rejected');
  assert.equal(outcomes[1].status, 'fulfilled');
  const pending = tx.queryRaw(query('LAST'));
  await tx.rollback();
  await pending;
  assert.equal(connections[0].released, true);

  const [left, right] = await Promise.all([adapter.startTransaction(), adapter.startTransaction()]);
  maximumTotal = 0;
  await Promise.all([left.queryRaw(query('LEFT')), right.queryRaw(query('RIGHT'))]);
  assert.equal(maximumTotal, 2, 'independent transactions retain pool concurrency');
  await Promise.all([left.commit(), right.commit()]);
  assert.ok(connections.every((connection) => connection.released));
  console.log(
    'PASS: shared read/write queue, ordering, rejection propagation, recovery, drain before release, isolation and independent transactions',
  );
} finally {
  await adapter.dispose();
  await pool.end();
}
