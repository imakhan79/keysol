// Grants a staff role to an existing Supabase Auth user. Use it to create the first
// Super Admin; after that, administrators manage roles in Admin → Staff & roles.
// Create the user first (Supabase dashboard → Authentication → Add user), then:
//
//   npm run admin:grant -- you@company.com super_admin
//
// Roles: super_admin | admin | sales_manager | sales_rep | marketing_manager |
//        content_manager | support_staff | customer | none
//
// The role is stored in app_metadata, which users cannot change themselves.
// The user must sign out and in again for the new role to reach their session token.

import "dotenv/config";
import pg from "pg";

const [email, role = "super_admin"] = process.argv.slice(2);
const roles = [
  "super_admin",
  "admin",
  "sales_manager",
  "sales_rep",
  "marketing_manager",
  "content_manager",
  "support_staff",
  "customer",
  "none",
];

if (!email || !roles.includes(role)) {
  console.error(`usage: npm run admin:grant -- <email> <${roles.join("|")}>`);
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  const { rowCount } = await client.query(
    role === "none"
      ? `update auth.users set raw_app_meta_data = raw_app_meta_data - 'role' where lower(email) = lower($1)`
      : `update auth.users
           set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', $2::text)
         where lower(email) = lower($1)`,
    role === "none" ? [email] : [email, role],
  );
  if (rowCount === 0) {
    console.error(`No auth user with email ${email}. Create it in the Supabase dashboard first.`);
    process.exit(1);
  }
  console.log(role === "none" ? `Removed staff role from ${email}` : `${email} is now '${role}'`);
} finally {
  await client.end();
}
