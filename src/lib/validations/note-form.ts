import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { NOTE_COLOR_OPTIONS, type NoteColor } from "@/types/note";

const noteColorValues = NOTE_COLOR_OPTIONS.map((option) => option.value) as [
  NoteColor,
  ...NoteColor[],
];

export const noteFormSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  content: z.string(),
  color: z.enum(noteColorValues),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const noteFormResolver = zodResolver(noteFormSchema);
