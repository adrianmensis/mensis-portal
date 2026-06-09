// Shared commercial constants for quotes and the prospect pipeline.
export const AVATAR_PRICE = 40; // USD per avatar / month (standard).
export const COMMISSION_RATE = 0.2; // 20% partner commission.

export function avatarAmount(avatars: number | null | undefined) {
  return (avatars ?? 0) * AVATAR_PRICE;
}

export function commission(amount: number) {
  return amount * COMMISSION_RATE;
}

// Annual partner commission on a license: 20% of each month's amount × 12.
export function annualCommission(avatars: number | null | undefined) {
  return avatarAmount(avatars) * COMMISSION_RATE * 12;
}
