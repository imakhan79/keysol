import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, Plus } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { contentTypes } from "@/lib/cms";
import { createSessionClient } from "@/lib/supabase/server";
import { AdminHeader, Notice } from "../../ui";
import { PublishToggle } from "./publish-toggle";

export async function generateMetadata(props: PageProps<"/admin/content/[type]">): Promise<Metadata> {
  return { title: contentTypes[(await props.params).type]?.label ?? "Content" };
}

export default async function ContentListPage(props: PageProps<"/admin/content/[type]">) {
  const [{ type: typeKey }, sp] = await Promise.all([props.params, props.searchParams]);
  const type = contentTypes[typeKey];
  if (!type) notFound();
  await requireStaff(type.permission);

  const supabase = await createSessionClient();
  const { data, error } = await supabase
    .from(type.table)
    .select("*")
    .order(type.orderBy.column, { ascending: type.orderBy.ascending, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];

  const display = (value: unknown, column: string) => {
    if (value == null || value === "") return "—";
    if (column.endsWith("_at")) return new Date(String(value)).toLocaleDateString("en");
    return String(value);
  };

  return (
    <>
      <AdminHeader
        title={type.label}
        description={`${rows.length} items · ${rows.filter((r) => r.is_published).length} published`}
        actions={
          <Link href={`/admin/content/${type.key}/new`} className="btn-primary">
            <Plus className="size-4" /> New {type.singular.toLowerCase()}
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-8">
        {sp.saved && <Notice>Saved. Changes are live on the website.</Notice>}
        {sp.deleted && <Notice>Deleted.</Notice>}
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{type.singular}</th>
                {type.columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={type.columns.length + 3} className="px-4 py-12 text-center text-slate-500">
                    Nothing here yet.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const id = String(row.id);
                const path = type.publicPath?.(row);
                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/content/${type.key}/${id}`}
                        className="font-medium text-slate-900 hover:text-brand-600"
                      >
                        {String(row[type.titleField] ?? "Untitled")}
                      </Link>
                      {row.is_featured === true && (
                        <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                          Featured
                        </span>
                      )}
                    </td>
                    {type.columns.map((c) => (
                      <td key={c.name} className="px-4 py-3 text-slate-600">
                        {display(row[c.name], c.name)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <PublishToggle typeKey={type.key} id={id} published={row.is_published === true} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {path && row.is_published === true && (
                        <a
                          href={path}
                          target="_blank"
                          className="inline-flex text-slate-400 hover:text-brand-600"
                          aria-label="View on site"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
