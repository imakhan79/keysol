import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import { AdminHeader } from "../ui";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireStaff("siteContent");
  const supabase = await createSessionClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(error.message);
  const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Partial<SiteSettings>;

  const integrations = [
    {
      name: "Google Analytics 4",
      env: "NEXT_PUBLIC_GA_MEASUREMENT_ID",
      configured: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
      note: "Page views plus a generate_lead conversion event on form submissions.",
    },
    {
      name: "Lead webhook",
      env: "LEAD_WEBHOOK_URL",
      configured: Boolean(process.env.LEAD_WEBHOOK_URL),
      note: "Posts each new lead as JSON. Works with Slack, Teams, Zapier, Make and n8n.",
    },
    {
      name: "First-party analytics",
      env: "built in",
      configured: true,
      note: "Cookieless page views stored in Supabase and shown on the dashboard.",
    },
  ];

  return (
    <>
      <AdminHeader title="Settings" description="Company details, homepage copy and integrations" />
      <div className="space-y-6 p-4 sm:p-8">
        <SettingsForm settings={settings} />
        <section className="card max-w-4xl p-6">
          <h2 className="font-semibold">Integrations</h2>
          <p className="mt-1 text-sm text-slate-500">Configured with environment variables on your hosting platform.</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {integrations.map((i) => (
              <li key={i.name} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-slate-500">{i.note}</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-xs text-slate-500">{i.env}</code>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      i.configured ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i.configured ? "Active" : "Not set"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
