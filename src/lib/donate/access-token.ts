import { randomBytes } from "crypto";

/** Opaque token for donor status/receipt URLs (not guessable). */
export function createDonationIntentAccessToken(): string {
  return randomBytes(24).toString("base64url");
}
