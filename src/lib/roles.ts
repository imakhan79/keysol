// Staff roles and what each may do in the admin panel. Mirrors the RLS policies in
// supabase/migrations; the database is the final authority.

export const staffRoles = [
  "super_admin",
  "admin",
  "sales_manager",
  "sales_rep",
  "marketing_manager",
  "content_manager",
  "support_staff",
] as const;
export type StaffRole = (typeof staffRoles)[number];

export const roleLabels: Record<StaffRole | "customer", string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  sales_manager: "Sales Manager",
  sales_rep: "Sales Representative",
  marketing_manager: "Marketing Manager",
  content_manager: "Content Manager",
  support_staff: "Support Staff",
  customer: "Customer (no admin access)",
};

const matrix = {
  /** Open the leads screens (each role sees a different subset via RLS). */
  leads: ["super_admin", "admin", "sales_manager", "sales_rep", "marketing_manager", "support_staff"],
  /** Change status, value and notes. */
  workLeads: ["super_admin", "admin", "sales_manager", "sales_rep", "support_staff"],
  /** Assign leads to any team member. */
  assignLeads: ["super_admin", "admin", "sales_manager"],
  exportLeads: ["super_admin", "admin", "sales_manager", "marketing_manager"],
  deleteLeads: ["super_admin", "admin"],
  /** Services, industries, solutions, portfolio, case studies, testimonials, blog, FAQs, media. */
  marketingContent: ["super_admin", "admin", "content_manager", "marketing_manager"],
  /** Pages, team, site settings. */
  siteContent: ["super_admin", "admin", "content_manager"],
  team: ["super_admin", "admin"],
} satisfies Record<string, StaffRole[]>;

export type Permission = keyof typeof matrix;

export function roleCan(role: StaffRole, permission: Permission) {
  return (matrix[permission] as readonly StaffRole[]).includes(role);
}
