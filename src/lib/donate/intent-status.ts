export type PublicIntentStatus = {
  status: "pending" | "confirmed" | "rejected" | "expired";
  amountBdt: string;
  paymentMethod: string;
  receiptNo: string | null;
  createdAt: string;
  confirmedAt: string | null;
};

type IntentStatusInput = {
  status: string;
  expires_at: string;
};

export function resolveIntentStatus(row: IntentStatusInput): PublicIntentStatus["status"] {
  if (row.status === "pending" && new Date(row.expires_at).getTime() < Date.now()) {
    return "expired";
  }
  if (
    row.status === "pending" ||
    row.status === "confirmed" ||
    row.status === "rejected" ||
    row.status === "expired"
  ) {
    return row.status;
  }
  return "pending";
}
