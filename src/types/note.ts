export const NOTE_COLOR_OPTIONS = [
  { value: "white", label: "Beyaz", className: "bg-white" },
  { value: "slate", label: "Gri", className: "bg-slate-100" },
  { value: "navy", label: "Lacivert", className: "bg-slate-200 text-navy" },
  { value: "amber", label: "Sarı", className: "bg-amber-50" },
  { value: "rose", label: "Pembe", className: "bg-rose-50" },
  { value: "mint", label: "Yeşil", className: "bg-emerald-50" },
  { value: "sky", label: "Mavi", className: "bg-sky-50" },
  { value: "orange", label: "Turuncu", className: "bg-orange-50" },
] as const;

export type NoteColor = (typeof NOTE_COLOR_OPTIONS)[number]["value"];

export interface NoteAttachment {
  id: string;
  fileName: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
  attachmentCount?: number;
  coverImageUrl?: string | null;
}

export interface NoteDetail extends Note {
  attachments: NoteAttachment[];
}

export function getNoteColorClassName(color: NoteColor): string {
  return (
    NOTE_COLOR_OPTIONS.find((option) => option.value === color)?.className ??
    "bg-white"
  );
}
