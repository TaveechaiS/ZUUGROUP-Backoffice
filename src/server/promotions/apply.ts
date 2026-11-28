import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { RecordError } from '@/server/validation/records';
import { bangkokDay, id } from '@/server/operations/domain';
import type { Tx } from '@/server/operations/service';

export type PaidLine = { productId: string; quantity: number; unitPrice: string; discount: string };
export type GiftLine = {
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
};
export type AppliedPromotion = {
  promotionId: string;
  snapshot: Record<string, unknown>;
  billDiscount: string;
  gifts: GiftLine[];
};

export function promotionIdOf(value: unknown) {
  return value === undefined || value === null || value === '' ? null : id(value, 'โปรโมชัน');
}

export async function evaluatePromotion(
  tx: Tx,
  promotionId: string,
  lines: PaidLine[],
): Promise<AppliedPromotion> {
  const today = bangkokDay();
  const promotion = (
    await tx.$queryRaw<
      {
        code: string;
        name: string;
        status: string;
        startsOn: string;
        endsOn: string;
        minType: string;
        minValue: string;
        rewardType: string;
        discountValue: string;
      }[]
    >(
      Prisma.sql`SELECT code,name,status,starts_on::text AS "startsOn",ends_on::text AS "endsOn",min_type AS "minType",min_value::text AS "minValue",reward_type AS "rewardType",discount_value::text AS "discountValue" FROM promotions WHERE id=${promotionId}::uuid AND deleted_at IS NULL FOR KEY SHARE`,
    )
  )[0];
  if (!promotion) throw new RecordError(400, 'ไม่พบโปรโมชัน');
  if (promotion.status !== 'ใช้งาน' || promotion.startsOn > today || promotion.endsOn < today)
    throw new RecordError(409, `โปรโมชัน ${promotion.code} ไม่อยู่ในช่วงใช้งาน`);
  const products = new Set(
    (
      await tx.$queryRaw<{ productId: string }[]>(
        Prisma.sql`SELECT product_id AS "productId" FROM promotion_products WHERE promotion_id=${promotionId}::uuid`,
      )
    ).map((row) => row.productId),
  );
  const eligible = lines.filter((line) => products.has(line.productId));
  const quantity = eligible.reduce((sum, line) => sum + line.quantity, 0);
  const value = eligible.reduce(
    (sum, line) =>
      sum.add(new Prisma.Decimal(line.unitPrice).mul(line.quantity)).sub(line.discount),
    new Prisma.Decimal(0),
  );
  const reached =
    promotion.minType === 'จำนวน'
      ? quantity >= Number(promotion.minValue)
      : value.gte(promotion.minValue);
  if (!reached)
    throw new RecordError(
      409,
      `ยังไม่ถึงเงื่อนไขโปรโมชัน ${promotion.code} (ต้องครบ ${
        promotion.minType === 'จำนวน'
          ? `${Number(promotion.minValue)} ชิ้น`
          : `${new Prisma.Decimal(promotion.minValue).toFixed(2)} บาท`
      } จากสินค้าที่ร่วมรายการ)`,
    );
  const gifts =
    promotion.rewardType === 'ของแถม'
      ? await tx.$queryRaw<GiftLine[]>(
          Prisma.sql`SELECT g.product_id AS "productId",g.product_name AS "productName",g.quantity,g.warehouse_id AS "warehouseId" FROM promotion_gifts g WHERE g.promotion_id=${promotionId}::uuid ORDER BY g.product_name,g.id`,
        )
      : [];
  const billDiscount =
    promotion.rewardType === 'ส่วนลดบาท'
      ? Prisma.Decimal.min(promotion.discountValue, value)
      : promotion.rewardType === 'ส่วนลด%'
        ? value.mul(promotion.discountValue).div(100).toDecimalPlaces(2)
        : new Prisma.Decimal(0);
  return {
    promotionId,
    billDiscount: billDiscount.toFixed(2),
    gifts,
    snapshot: {
      code: promotion.code,
      name: promotion.name,
      minType: promotion.minType,
      minValue: promotion.minValue,
      rewardType: promotion.rewardType,
      discountValue: promotion.discountValue,
      gifts: gifts.map((gift) => ({ productName: gift.productName, quantity: gift.quantity })),
    },
  };
}
