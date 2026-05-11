import { z } from "zod";

const optionalIsoInstant = z
  .string()
  .max(40)
  .optional()
  .refine((s) => s == null || s === "" || !Number.isNaN(Date.parse(s)), {
    message: "Must be a valid ISO date-time string",
  });

const donorCreate = z.object({
  full_name: z.string().min(1).max(500),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(320).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const donationCreateBodySchema = z
  .object({
    donor_id: z.string().uuid().optional().nullable(),
    donor: donorCreate.optional(),
    amount_bdt: z.coerce.number().positive().max(1_000_000_000_000),
    payment_method: z.string().min(1).max(64).default("cash"),
    reference_note: z.string().max(2000).optional().nullable(),
    received_at: optionalIsoInstant,
    is_published: z.coerce.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.donor_id && data.donor) {
      ctx.addIssue({
        code: "custom",
        message: "Use either donor_id or donor, not both.",
        path: ["donor_id"],
      });
    }
  });

export const expenseCreateBodySchema = z.object({
  category: z.string().min(1).max(200),
  amount_bdt: z.coerce.number().positive().max(1_000_000_000_000),
  description: z.string().min(1).max(4000),
  beneficiary_note: z.string().max(2000).optional().nullable(),
  spent_at: optionalIsoInstant,
  is_published: z.coerce.boolean().optional().default(true),
});
