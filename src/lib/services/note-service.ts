import { createAdminClient } from "@/lib/supabase/admin";
import type { NoteFormValues } from "@/lib/validations/note-form";
import type { Note, NoteAttachment, NoteColor, NoteDetail } from "@/types/note";

const STORAGE_BUCKET = "note-images";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  created_at: string;
  updated_at: string;
  note_attachments?: { id: string; file_name: string; file_path: string }[];
}

function mapNote(row: NoteRow): Note {
  const attachments = row.note_attachments ?? [];
  const cover = attachments[0];

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachmentCount: attachments.length,
    coverImageUrl: cover ? getPublicUrl(cover.file_path) : null,
  };
}

function getPublicUrl(filePath: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function uploadNoteImages(noteId: string, images: File[]): Promise<string[]> {
  if (images.length === 0) return [];

  const supabase = createAdminClient();
  const uploadedUrls: string[] = [];

  for (const image of images) {
    const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${noteId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Görsel yüklenemedi: ${uploadError.message}`);
    }

    uploadedUrls.push(getPublicUrl(filePath));

    const { error: attachmentError } = await supabase.from("note_attachments").insert({
      note_id: noteId,
      file_name: image.name,
      file_path: filePath,
      mime_type: image.type,
      file_size: image.size,
    });

    if (attachmentError) {
      throw new Error(`Görsel meta verisi kaydedilemedi: ${attachmentError.message}`);
    }
  }

  return uploadedUrls;
}

async function removeNoteAttachments(attachmentIds: string[]): Promise<void> {
  if (attachmentIds.length === 0) return;

  const supabase = createAdminClient();

  const { data: attachments, error } = await supabase
    .from("note_attachments")
    .select("id, file_path")
    .in("id", attachmentIds);

  if (error) {
    throw new Error(`Görseller okunamadı: ${error.message}`);
  }

  if (!attachments?.length) return;

  const filePaths = attachments.map((item) => item.file_path);
  await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);

  const { error: deleteError } = await supabase
    .from("note_attachments")
    .delete()
    .in(
      "id",
      attachments.map((item) => item.id),
    );

  if (deleteError) {
    throw new Error(`Görseller silinemedi: ${deleteError.message}`);
  }
}

export async function listNotes(): Promise<Note[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, title, content, color, created_at, updated_at, note_attachments(id, file_name, file_path)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Notlar okunamadı: ${error.message}`);
  }

  return (data as NoteRow[]).map(mapNote);
}

export async function getNoteById(id: string): Promise<NoteDetail> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, title, content, color, created_at, updated_at, note_attachments(id, file_name, file_path)",
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Not bulunamadı");
  }

  const row = data as NoteRow;
  const attachments: NoteAttachment[] =
    row.note_attachments?.map((item) => ({
      id: item.id,
      fileName: item.file_name,
      url: getPublicUrl(item.file_path),
    })) ?? [];

  return {
    ...mapNote(row),
    attachments,
  };
}

export async function createNote(
  form: NoteFormValues,
  images: File[] = [],
): Promise<NoteDetail> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: form.title,
      content: form.content,
      color: form.color,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Not oluşturulamadı");
  }

  await uploadNoteImages(data.id, images);
  return getNoteById(data.id);
}

export async function updateNote(
  id: string,
  form: NoteFormValues,
  images: File[] = [],
  removedAttachmentIds: string[] = [],
): Promise<NoteDetail> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("notes")
    .update({
      title: form.title,
      content: form.content,
      color: form.color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error?.message ?? "Not güncellenemedi");
  }

  await removeNoteAttachments(removedAttachmentIds);
  await uploadNoteImages(id, images);

  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: attachments } = await supabase
    .from("note_attachments")
    .select("file_path")
    .eq("note_id", id);

  if (attachments?.length) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(attachments.map((item) => item.file_path));
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    throw new Error(`Not silinemedi: ${error.message}`);
  }
}
