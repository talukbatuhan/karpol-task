import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import { getContaRecordById } from "@/lib/services/conta-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const { id } = await context.params;
    const record = await getContaRecordById(id);
    return NextResponse.json({ record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Conta kaydı alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
