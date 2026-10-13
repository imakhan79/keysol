"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Check, Copy, Loader2, Trash2, Upload } from "lucide-react";
import { uploadMedia } from "@/lib/media";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Item = { name: string; url: string; size: number; created_at: string; alt: string };

const FOLDER = "uploads";

export function MediaLibrary() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, start] = useTransition();

  const load = useCallback(async () => {
    const supabase = createBrowserSupabase();
    const { data, error: err } = await supabase.storage
      .from("media")
      .list(FOLDER, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (err) {
      setError(err.message);
      setItems([]);
      return;
    }
    // Alt text and metadata from the media table (empty until the migration runs).
    const { data: rows } = await supabase.from("media").select("url, alt_text");
    const alts = new Map((rows ?? []).map((r: { url: string; alt_text: string }) => [r.url, r.alt_text]));
    setItems(
      (data ?? [])
        .filter((f) => f.id)
        .map((f) => ({
          name: f.name,
          url: supabase.storage.from("media").getPublicUrl(`${FOLDER}/${f.name}`).data.publicUrl,
          size: (f.metadata as { size?: number } | null)?.size ?? 0,
          created_at: f.created_at ?? "",
          alt: "",
        }))
        .map((item) => ({ ...item, alt: alts.get(item.url) ?? "" })),
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch from Storage
    load();
  }, [load]);

  const upload = (files: FileList) =>
    start(async () => {
      setError("");
      const supabase = createBrowserSupabase();
      for (const file of Array.from(files)) {
        const { error: err } = await uploadMedia(supabase, file, FOLDER);
        if (err) setError(`${file.name}: ${err}`);
      }
      await load();
    });

  const remove = (item: Item) =>
    start(async () => {
      const supabase = createBrowserSupabase();
      const { error: err } = await supabase.storage.from("media").remove([`${FOLDER}/${item.name}`]);
      if (err) setError(err.message);
      else await supabase.from("media").delete().eq("url", item.url);
      await load();
    });

  const saveAlt = (item: Item, alt: string) =>
    start(async () => {
      if (alt === item.alt) return;
      const { error: err } = await createBrowserSupabase()
        .from("media")
        .upsert({ url: item.url, storage_path: `${FOLDER}/${item.name}`, file_name: item.name, alt_text: alt }, { onConflict: "url" });
      if (err) setError(`Alt text not saved: ${err.message}`);
      else setItems((list) => list?.map((i) => (i.url === item.url ? { ...i, alt } : i)) ?? null);
    });

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="space-y-6">
      <label className="card flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-10 text-center hover:border-brand-300 hover:bg-brand-50/40">
        {busy ? <Loader2 className="size-6 animate-spin text-brand-600" /> : <Upload className="size-6 text-brand-600" />}
        <span className="text-sm font-medium">Click to upload images</span>
        <span className="text-xs text-slate-500">PNG, JPG, WebP, GIF, AVIF or SVG</span>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
          className="sr-only"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {items === null ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No images uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <li key={item.name} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded media */}
              <img src={item.url} alt="" loading="lazy" className="aspect-square w-full bg-slate-100 object-cover" />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-slate-600" title={item.name}>
                  {item.name}
                </p>
                <input
                  aria-label={`Alt text for ${item.name}`}
                  defaultValue={item.alt}
                  placeholder="Alt text (for SEO & accessibility)"
                  onBlur={(e) => saveAlt(item, e.target.value.trim())}
                  className="field px-2 py-1 text-xs"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => copy(item.url)} className="btn-secondary flex-1 px-2 py-1.5 text-xs">
                    {copied === item.url ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied === item.url ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={busy}
                    className="btn-danger px-2 py-1.5"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
