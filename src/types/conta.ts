import type { z } from "zod";

import type { contaFormSchema } from "@/lib/validations/conta-form";

export type ContaFormValues = z.infer<typeof contaFormSchema>;

export interface ContaRecord {
  id: string;
  contaCode: string;
  firmaIsmi: string;
  marka: string;
  uzunluk: string;
  adet: number;
  renk: string;
  createdAt: string;
  updatedAt: string;
  attachmentCount?: number;
}

export interface ContaRecordDetail extends ContaRecord {
  imageUrls: string[];
}

export function mapFormToContaRecord(
  values: ContaFormValues,
  contaCode: string,
): Omit<ContaRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    contaCode,
    firmaIsmi: values.firmaIsmi,
    marka: values.marka,
    uzunluk: values.uzunluk,
    adet: values.adet,
    renk: values.renk,
  };
}
