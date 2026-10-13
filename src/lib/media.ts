import type { SupabaseClient } from "@supabase/supabase-js";

/** Uploads an image to the public media bucket and records it in the media library table. */
export async function uploadMedia(supabase: SupabaseClient, file: File, folder = "uploads") {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "image";
  const path = `${folder}/${Date.now()}-${base}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) return { error: error.message, url: "" };
  const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  // Best effort: the file is usable even if the library row can't be written (e.g. table not migrated yet).
  await supabase.from("media").insert({ url, storage_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size });
  return { error: "", url };
}
