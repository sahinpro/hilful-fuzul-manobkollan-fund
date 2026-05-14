/** Stored `payment_method` values aligned with seed / API usage. */
export const PAYMENT_METHOD_PRESETS = [
  "cash",
  "bank",
  "bkash",
  "nagad",
  "rocket",
  "other",
] as const;

export type PaymentMethodPreset = (typeof PAYMENT_METHOD_PRESETS)[number];

export function isPresetPaymentMethod(value: string): value is PaymentMethodPreset {
  return (PAYMENT_METHOD_PRESETS as readonly string[]).includes(value);
}

/** Common expense categories (Bengali labels, used in seed). */
export const EXPENSE_CATEGORY_PRESETS = [
  "চিকিৎসা",
  "শিক্ষা",
  "সেবা",
  "মসজিদ/সমাজ",
  "প্রশাসনিক",
] as const;

export type ExpenseCategoryPreset = (typeof EXPENSE_CATEGORY_PRESETS)[number];

export function isPresetExpenseCategory(value: string): value is ExpenseCategoryPreset {
  return (EXPENSE_CATEGORY_PRESETS as readonly string[]).includes(value);
}
