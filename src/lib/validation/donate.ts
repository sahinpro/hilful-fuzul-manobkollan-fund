import { z } from "zod";
import { isValidTrxId, normalizeTrxId } from "@/lib/donate/normalize-trx";

export const DONATE_PAYMENT_METHODS = ["bkash", "nagad", "rocket"] as const;
export type DonatePaymentMethod = (typeof DONATE_PAYMENT_METHODS)[number];

export const donateIntentBodySchema = z.object({
  donor_full_name: z.string().trim().min(2).max(500),
  donor_fathers_name: z.string().trim().max(500).optional().nullable(),
  amount_bdt: z.coerce.number().positive().max(1_000_000_000),
  payment_method: z.enum(DONATE_PAYMENT_METHODS),
  trx_id: z
    .string()
    .trim()
    .min(4)
    .max(32)
    .transform(normalizeTrxId)
    .refine(isValidTrxId, { message: "Invalid transaction id format." }),
  source: z.enum(["donate", "claim"]).optional().default("donate"),
});

export type DonateIntentBody = z.infer<typeof donateIntentBodySchema>;
