// Admin configuration
// For MVP, admin access is determined by email address
const ADMIN_EMAILS = [
  'qingxinyu2024@gmail.com',
];

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
