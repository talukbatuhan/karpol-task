import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  listContaRecords,
  saveContaRecord,
} from "@/lib/services/conta-service";
import { getUploadedFiles } from "@/lib/utils/form-data";
import { contaFormSchema } from "@/lib/validations/conta-form";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const records = await listContaRecords();
    return NextResponse.json({ records });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kayıtları alınamadı";
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

    const parsed = contaFormSchema.safeParse(JSON.parse(payloadRaw));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasyon hatası", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const images = getUploadedFiles(formData, "images");

    const result = await saveContaRecord({
      form: parsed.data,
      images,
    });

    return NextResponse.json({
      success: true,
      contaCode: result.contaCode,
      id: result.id,
      imageUrls: result.imageUrls,
      sheetsSynced: result.sheetsSynced,
      sheetsWarning: result.sheetsSynced
        ? undefined
        : result.sheetsError ??
          "Google E-Tablolar senkronu yapılandırılmamış veya başarısız oldu.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıt sırasında hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
