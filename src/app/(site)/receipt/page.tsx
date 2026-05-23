import { redirect } from "next/navigation";

/** Receipt hub — search & verify by number. */
export default function ReceiptIndexPage() {
  redirect("/receipt/verify");
}
