import { z } from "zod";

const optionalIsoInstant = z
  .string()
  .max(40)
  .optional()
  .refine((s) => s == null || s === "" || !Number.isNaN(Date.parse(s)), {
    message: "Must be a valid ISO date-time string",
  });

export const donorCreateBodySchema = z.object({
  full_name: z.string().min(1).max(500),
  fathers_name: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(320).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const donationCreateBodySchema = z
  .object({
    donor_id: z.string().uuid().optional().nullable(),
    donor: donorCreateBodySchema.optional(),
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

const donorIdPatch = z
  .union([z.string().uuid(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? undefined : v));

export const donationUpdateBodySchema = z
  .object({
    donor_id: donorIdPatch,
    amount_bdt: z.coerce.number().positive().max(1_000_000_000_000).optional(),
    payment_method: z.string().min(1).max(64).optional(),
    reference_note: z.string().max(2000).nullable().optional(),
    received_at: optionalIsoInstant,
    is_published: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const keys = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field is required.",
        path: [],
      });
    }
  });

export const donorUpdateBodySchema = z
  .object({
    full_name: z.string().min(1).max(500).optional(),
    fathers_name: z.union([z.string().max(500), z.literal("")]).nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    email: z.union([z.string().email().max(320), z.literal("")]).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const keys = (["full_name", "fathers_name", "phone", "email"] as const).filter(
      (k) => data[k] !== undefined,
    );
    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field is required.",
        path: [],
      });
    }
  });

export const leadershipCategorySchema = z.enum(["advisor", "executive"]);

export const leadershipMemberCreateBodySchema = z.object({
  category: leadershipCategorySchema,
  full_name: z.string().min(1).max(500),
  fathers_name: z.string().max(500).optional().nullable(),
  designation: z.string().max(500).optional().nullable(),
  sort_order: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
});

export const leadershipMemberUpdateBodySchema = z
  .object({
    full_name: z.string().min(1).max(500).optional(),
    fathers_name: z.union([z.string().max(500), z.literal("")]).nullable().optional(),
    designation: z.union([z.string().max(500), z.literal("")]).nullable().optional(),
    sort_order: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .superRefine((data, ctx) => {
    const keys = (["full_name", "fathers_name", "designation", "sort_order"] as const).filter(
      (k) => data[k] !== undefined,
    );
    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field is required.",
        path: [],
      });
    }
  });

export const expenseUpdateBodySchema = z
  .object({
    category: z.string().min(1).max(200).optional(),
    amount_bdt: z.coerce.number().positive().max(1_000_000_000_000).optional(),
    description: z.string().min(1).max(4000).optional(),
    beneficiary_note: z.string().max(2000).nullable().optional(),
    spent_at: optionalIsoInstant,
    is_published: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const keys = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field is required.",
        path: [],
      });
    }
  });
