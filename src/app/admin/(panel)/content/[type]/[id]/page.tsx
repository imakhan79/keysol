import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { contentTypes } from "@/lib/cms";
import { createSessionClient } from "@/lib/supabase/server";
import { AdminHeader } from "../../../ui";
import { ContentForm, DeleteContentButton } from "./content-form";

export async function generateMetadata(props: PageProps<"/admin/content/[type]/[id]">): Promise<Metadata> {
  const { type, id } = await props.params;
  const t = contentTypes[type];
  return { title: t ? `${id === "new" ? "New" : "Edit"} ${t.singular.toLowerCase()}` : "Content" };
}

export default async function ContentEditPage(props: PageProps<"/admin/content/[type]/[id]">) {
  const { type: typeKey, id } = await props.params;
  const type = contentTypes[typeKey];
  if (!type) notFound();
  await requireStaff(type.permission);
  const isNew = id === "new";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createSessionClient();
  const needsRefs = type.fields.flatMap((f) => (f.kind === "ref" ? [f.ref!] : f.kind === "serviceSlugs" ? ["services"] : []));
  const [record, services, industries, testimonials] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : supabase.from(type.table).select("*").eq("id", id).maybeSingle(),
    needsRefs.includes("services")
      ? supabase.from("services").select("id, slug, title").order("sort_order")
      : Promise.resolve({ data: [] }),
    needsRefs.includes("industries")
      ? supabase.from("industries").select("id, name").order("sort_order")
      : Promise.resolve({ data: [] }),
    needsRefs.includes("testimonials")
      ? supabase.from("testimonials").select("id, author_name, company").order("sort_order")
      : Promise.resolve({ data: [] }),
  ]);
  if (!isNew && !record.data) notFound();

  const row = (record.data ?? {}) as Record<string, unknown>;
  const refOptions = {
    services: ((services.data ?? []) as { id: string; title: string }[])
      .filter((s) => s.id !== id)
      .map((s) => ({ value: s.id, label: s.title })),
    serviceSlugs: ((services.data ?? []) as { slug: string; title: string }[]).map((s) => ({ value: s.slug, label: s.title })),
    industries: ((industries.data ?? []) as { id: string; name: string }[]).map((i) => ({ value: i.id, label: i.name })),
    testimonials: ((testimonials.data ?? []) as { id: string; author_name: string; company: string }[]).map((t) => ({
      value: t.id,
      label: [t.author_name, t.company].filter(Boolean).join(", "),
    })),
  };
  const path = !isNew && row.is_published ? type.publicPath?.(row) : undefined;

  return (
    <>
      <AdminHeader
        title={isNew ? `New ${type.singular.toLowerCase()}` : String(row[type.titleField] ?? type.singular)}
        description={type.label}
        actions={
          <>
            <Link href={`/admin/content/${type.key}`} className="btn-secondary">
              <ArrowLeft className="size-4" /> Back
            </Link>
            {path && (
              <a href={path} target="_blank" className="btn-secondary">
                View on site <ExternalLink className="size-4" />
              </a>
            )}
          </>
        }
      />
      <div className="p-4 sm:p-8">
        <ContentForm typeKey={type.key} id={isNew ? null : id} fields={type.fields} values={row} refOptions={refOptions} />
        {!isNew && (
          <div className="mt-8 max-w-4xl border-t border-slate-200 pt-6">
            <DeleteContentButton typeKey={type.key} id={id} label={type.singular.toLowerCase()} />
          </div>
        )}
      </div>
    </>
  );
}
