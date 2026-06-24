import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { createNote, listNotes } from "@/lib/services/note-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { noteFormSchema } from "@/lib/validations/note-form";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const notes = await listNotes();
    return NextResponse.json({ notes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Notlar alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (typeof payloadRaw !== "string") {
      return NextResponse.json(
        { error: "Geçersiz form verisi" },
        { status: 400 },
      );
    }

    const parsed = noteFormSchema.safeParse(JSON.parse(payloadRaw));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const images = getUploadedFiles(formData, "images");
    const note = await createNote(parsed.data, images);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Not oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
