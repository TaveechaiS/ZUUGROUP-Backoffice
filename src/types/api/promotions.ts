type Pagination = { offset: number; limit: number; total: number; hasMore: boolean };
type Actor = { id: string; roleId: string; name: string };

export type PromotionProductRow = { productId: string; productCode: string; productName: string };
export type PromotionGiftRow = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
};
export type PromotionRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  savedStatus: string;
  startsOn: string;
  endsOn: string;
  minType: string;
  minValue: string;
  rewardType: string;
  discountValue: string;
  description: string;
  notes: string;
  cancelReason: string;
  productCount: number;
  giftCount: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  products?: PromotionProductRow[];
  gifts?: PromotionGiftRow[];
};
export type PromotionPage = { data: PromotionRow[]; pagination: Pagination; actor: Actor };

export type PromotionSnapshot = {
  code: string;
  name: string;
  minType: string;
  minValue: string;
  rewardType: string;
  discountValue: string;
  gifts: { productName: string; quantity: number }[];
};
