import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Material } from "@/lib/types";

const BUCKET = "materials";

export async function listMaterials(supabase: SupabaseClient): Promise<Material[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Material[];
}

export type CreateMaterialInput = {
  title: string;
  description?: string;
  file: File;
  uploaded_by: string;
};

// Uploads the binary to private Storage and records its metadata. `admin` must
// be a service-role client (bypasses Storage RLS).
export async function createMaterial(admin: SupabaseClient, input: CreateMaterialInput) {
  const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${randomBytes(8).toString("hex")}-${safeName}`;

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(key, buffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) throw new Error(upErr.message);

  const { data, error } = await admin
    .from("materials")
    .insert({
      title: input.title,
      description: input.description || null,
      file_path: key,
      file_name: input.file.name,
      mime_type: input.file.type || null,
      size_bytes: input.file.size,
      uploaded_by: input.uploaded_by,
    })
    .select("*")
    .single();
  if (error) {
    // Roll back the orphaned object if the row insert fails.
    await admin.storage.from(BUCKET).remove([key]);
    throw new Error(error.message);
  }
  return data as Material;
}

export async function deleteMaterial(admin: SupabaseClient, id: string) {
  const { data: row } = await admin
    .from("materials")
    .select("file_path")
    .eq("id", id)
    .maybeSingle();
  if (row?.file_path) {
    await admin.storage.from(BUCKET).remove([row.file_path as string]);
  }
  const { error } = await admin.from("materials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { id };
}

// Short-lived signed URL for downloading a private object. `download` forces
// the original filename via the Content-Disposition header.
export async function signedDownloadUrl(admin: SupabaseClient, id: string) {
  const { data: row, error } = await admin
    .from("materials")
    .select("file_path, file_name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;

  const { data, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(row.file_path as string, 60, { download: row.file_name as string });
  if (signErr) throw new Error(signErr.message);
  return data?.signedUrl ?? null;
}
