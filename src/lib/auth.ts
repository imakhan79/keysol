import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";
import { staffRoles, type Permission, type StaffRole, roleCan } from "./roles";

export type { StaffRole } from "./roles";
export type Staff = { id: string; email: string; role: StaffRole };

/**
 * Current staff member, or null (visitors and customers). Verifies the JWT
 * (getClaims) and reads the role from app_metadata, which users cannot edit.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const role = (claims?.app_metadata as { role?: string } | undefined)?.role as StaffRole | undefined;
  if (!claims?.sub || !role || !staffRoles.includes(role)) return null;
  return { id: claims.sub, email: String(claims.email ?? ""), role };
});

/** Use at the top of every admin page and server action. RLS enforces the same rules. */
export async function requireStaff(permission?: Permission): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (permission && !roleCan(staff.role, permission)) redirect("/admin?denied=1");
  return staff;
}

export function can(staff: Staff, permission: Permission) {
  return roleCan(staff.role, permission);
}
