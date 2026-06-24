import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth/require-user";
import { deleteNote, getNoteById, updateNote } from "@/lib/services/note-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { noteFormSchema } from "@/lib/validations/note-form";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const noteUpdatePayloadSchema = noteFormSchema.extend({
  removedAttachmentIds: z.array(z.string().uuid()).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const note = await getNoteById(id);
    return NextResponse.json({ note });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Not alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Geçersiz form verisi" },
        { status: 400 },
      );
    }

    const parsed = noteUpdatePayloadSchema.safeParse(JSON.parse(payloadRaw));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const images = getUploadedFiles(formData, "images");
    const { removedAttachmentIds, ...form } = parsed.data;

    const note = await updateNote(id, form, images, removedAttachmentIds ?? []);
    return NextResponse.json({ note });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Not güncellenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteNote(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Not silinemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
