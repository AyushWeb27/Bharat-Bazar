export type CouponType = "flat" | "percent";

export const APPLIED_COUPON_STORAGE_KEY = "bharat-bazar-applied-coupon";

export function calculateCouponDiscount(
  type: CouponType,
  value: number,
  maxDiscount: number,
  subtotal: number
) {
  const discount = type === "percent"
    ? Math.min(subtotal * value / 100, maxDiscount)
    : value;
  return Math.round(Math.min(subtotal, discount) * 100) / 100;
}
