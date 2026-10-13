"use client";

import { useActionState, useState, useTransition } from "react";
import { Eye, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { Markdown } from "@/components/markdown";
import type { FieldDef } from "@/lib/cms";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { deleteContent, saveContent, type FormState } from "../../../../actions";

type Option = { value: string; label: string };

export function ContentForm({
  typeKey,
  id,
  fields,
  values,
  refOptions,
}: {
  typeKey: string;
  id: string | null;
  fields: FieldDef[];
  values: Record<string, unknown>;
  refOptions: Record<"services" | "industries" | "testimonials" | "serviceSlugs", Option[]>;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveContent.bind(null, typeKey, id), {});
  const main = fields.filter((f) => !f.name.startsWith("seo_"));
  const seo = fields.filter((f) => f.name.startsWith("seo_"));

  return (
    <form action={action} className="max-w-4xl space-y-6">
      <section className="card grid gap-5 p-6 lg:grid-cols-2">
        {main.map((field) => (
          <div key={field.name} className={field.half ? "" : "lg:col-span-2"}>
            <FieldInput
              field={field}
              value={values[field.name]}
              options={field.kind === "serviceSlugs" ? refOptions.serviceSlugs : field.ref ? refOptions[field.ref] : field.options}
            />
          </div>
        ))}
      </section>

      {seo.length > 0 && (
        <section className="card space-y-5 p-6">
          <h2 className="font-semibold">Search engine optimisation</h2>
          {seo.map((field) => (
            <FieldInput key={field.name} field={field} value={values[field.name]} />
          ))}
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        {state.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : (
          <span />
        )}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending && <Loader2 className="size-4 animate-spin" />} Save
        </button>
      </div>
    </form>
  );
}

function FieldInput({ field, value, options }: { field: FieldDef; value: unknown; options?: Option[] }) {
  const id = `f-${field.name}`;
  const label = (
    <label htmlFor={id} className="field-label">
      {field.label}
      {field.required && <span className="text-red-600"> *</span>}
    </label>
  );
  const help = field.help && <p className="mt-1.5 text-xs text-slate-500">{field.help}</p>;
  const str = value == null ? "" : String(value);

  switch (field.kind) {
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={value === true}
            className="size-4 rounded border-slate-300 accent-brand-600"
          />
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          {field.help && <span className="text-xs text-slate-500">— {field.help}</span>}
        </label>
      );
    case "textarea":
      return (
        <>
          {label}
          <textarea id={id} name={field.name} rows={3} defaultValue={str} className="field" />
          {help}
        </>
      );
    case "markdown":
      return <MarkdownField id={id} field={field} initial={str} label={label} />;
    case "tags":
      return (
        <>
          {label}
          <textarea
            id={id}
            name={field.name}
            rows={4}
            defaultValue={Array.isArray(value) ? value.join("\n") : ""}
            className="field"
          />
          {help}
        </>
      );
    case "metrics":
      return (
        <>
          {label}
          <textarea
            id={id}
            name={field.name}
            rows={4}
            defaultValue={
              Array.isArray(value) ? (value as { label: string; value: string }[]).map((m) => `${m.label} | ${m.value}`).join("\n") : ""
            }
            className="field font-mono"
          />
          {help}
        </>
      );
    case "serviceSlugs": {
      const chosen = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="field-label">{field.label}</legend>
          <div className="grid max-h-72 gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
            {options?.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={field.name}
                  value={o.value}
                  defaultChecked={chosen.includes(o.value)}
                  className="size-4 accent-brand-600"
                />
                {o.label}
              </label>
            ))}
          </div>
          {help}
        </fieldset>
      );
    }
    case "select":
    case "ref":
      return (
        <>
          {label}
          <select id={id} name={field.name} defaultValue={str} required={field.required} className="field">
            {!field.required && <option value="">— None —</option>}
            {options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {help}
        </>
      );
    case "number":
      return (
        <>
          {label}
          <input id={id} name={field.name} type="number" step={1} defaultValue={str || "0"} className="field" />
          {help}
        </>
      );
    case "date":
      return (
        <>
          {label}
          <input id={id} name={field.name} type="date" defaultValue={str.slice(0, 10)} className="field" />
          {help}
        </>
      );
    case "datetime":
      return <DateTimeField id={id} field={field} initial={str} label={label} />;
    case "image":
      return <ImageField id={id} field={field} initial={str} label={label} />;
    case "images":
      return <ImagesField id={id} field={field} initial={Array.isArray(value) ? (value as string[]) : []} label={label} />;
    default:
      return (
        <>
          {label}
          <input
            id={id}
            name={field.name}
            type={field.kind === "url" ? "url" : "text"}
            defaultValue={str}
            required={field.required}
            className={`field ${field.kind === "slug" ? "font-mono" : ""}`}
          />
          {help}
        </>
      );
  }
}

function MarkdownField({ id, field, initial, label }: { id: string; field: FieldDef; initial: string; label: React.ReactNode }) {
  const [text, setText] = useState(initial);
  const [preview, setPreview] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        {label}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-600"
        >
          {preview ? <Pencil className="size-3.5" /> : <Eye className="size-3.5" />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      <textarea
        id={id}
        name={field.name}
        rows={14}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`field font-mono text-[13px] leading-relaxed ${preview ? "hidden" : ""}`}
      />
      {preview && (
        <div className="min-h-40 rounded-lg border border-slate-200 bg-white p-4">
          <Markdown>{text || "_Nothing to preview_"}</Markdown>
        </div>
      )}
      <p className="mt-1.5 text-xs text-slate-500">
        Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list</code>, <code>[link](https://…)</code>
      </p>
    </>
  );
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DateTimeField({ id, field, initial, label }: { id: string; field: FieldDef; initial: string; label: React.ReactNode }) {
  // The visible input is in the editor's local time; the submitted value is UTC ISO.
  const [iso, setIso] = useState(initial);
  return (
    <>
      {label}
      <input
        id={id}
        type="datetime-local"
        defaultValue={toLocalInput(initial)}
        onChange={(e) => setIso(e.target.value ? new Date(e.target.value).toISOString() : "")}
        className="field"
      />
      <input type="hidden" name={field.name} value={iso} />
      {field.help && <p className="mt-1.5 text-xs text-slate-500">{field.help}</p>}
    </>
  );
}

const imageTypes = "image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml";

/** Uploads to the public media bucket and hands back the public URL. */
function useMediaUpload(onUploaded: (url: string) => void) {
  const [error, setError] = useState("");
  const [uploading, start] = useTransition();

  const upload = (file: File) =>
    start(async () => {
      setError("");
      const supabase = createBrowserSupabase();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: err } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
      if (err) {
        setError(err.message);
        return;
      }
      onUploaded(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    });

  return { upload, uploading, error };
}

function ImageField({ id, field, initial, label }: { id: string; field: FieldDef; initial: string; label: React.ReactNode }) {
  const [url, setUrl] = useState(initial);
  const { upload, uploading, error } = useMediaUpload(setUrl);

  return (
    <>
      {label}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary CMS URL
          <img src={url} alt="" className="h-24 w-36 shrink-0 rounded-lg border border-slate-200 object-cover" />
        )}
        <div className="flex-1 space-y-2">
          <input
            id={id}
            name={field.name}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… or upload"
            className="field"
          />
          <label className="btn-secondary cursor-pointer">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload image
            <input
              type="file"
              accept={imageTypes}
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </>
  );
}

function ImagesField({ id, field, initial, label }: { id: string; field: FieldDef; initial: string[]; label: React.ReactNode }) {
  const [text, setText] = useState(initial.join("\n"));
  const { upload, uploading, error } = useMediaUpload((url) => setText((t) => (t.trim() ? `${t.trim()}\n${url}` : url)));
  const urls = text
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <>
      {label}
      {urls.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {urls.map((u) => (
            // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary CMS URL
            <img key={u} src={u} alt="" className="h-20 w-32 rounded-lg border border-slate-200 object-cover" />
          ))}
        </div>
      )}
      <textarea
        id={id}
        name={field.name}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="https://… (one per line)"
        className="field font-mono text-[13px]"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="btn-secondary cursor-pointer">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload images
          <input
            type="file"
            multiple
            accept={imageTypes}
            className="sr-only"
            onChange={(e) => Array.from(e.target.files ?? []).forEach(upload)}
          />
        </label>
        {field.help && <span className="text-xs text-slate-500">{field.help}</span>}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </>
  );
}

export function DeleteContentButton({ typeKey, id, label }: { typeKey: string; id: string; label: string }) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();
  return armed ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-slate-600">Delete this {label} permanently?</span>
      <button type="button" disabled={pending} onClick={() => start(() => deleteContent(typeKey, id))} className="btn-danger">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Yes, delete
      </button>
      <button type="button" onClick={() => setArmed(false)} className="btn-secondary">
        Cancel
      </button>
    </div>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="btn-danger">
      <Trash2 className="size-4" /> Delete {label}
    </button>
  );
}
