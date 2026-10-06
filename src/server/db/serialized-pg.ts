import { PrismaPg } from '@prisma/adapter-pg';

/** Prisma relation queries can run concurrently on a transaction's single connection. */
export class SerializedPrismaPg extends PrismaPg {
  override async connect() {
    const adapter = await super.connect();
    const startTransaction = adapter.startTransaction.bind(adapter);
    adapter.startTransaction = async (isolationLevel) => {
      const transaction = await startTransaction(isolationLevel);
      let pending: Promise<void> = Promise.resolve();
      function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const result = pending.then(work);
        // Keep the queue usable after a rejection; the caller still receives that rejection.
        pending = result.then(
          () => {},
          () => {},
        );
        return result;
      }
      const queryRaw = transaction.queryRaw.bind(transaction);
      const executeRaw = transaction.executeRaw.bind(transaction);
      const commit = transaction.commit.bind(transaction);
      const rollback = transaction.rollback.bind(transaction);
      transaction.queryRaw = (query) => enqueue(() => queryRaw(query));
      transaction.executeRaw = (query) => enqueue(() => executeRaw(query));
      transaction.commit = async () => {
        await pending;
        await commit();
      };
      transaction.rollback = async () => {
        await pending;
        await rollback();
      };
      return transaction;
    };
    return adapter;
  }
}
