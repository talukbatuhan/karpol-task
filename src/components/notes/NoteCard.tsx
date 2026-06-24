import { getNoteColorClassName, type Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function NoteCard({ note, isSelected, onSelect }: NoteCardProps) {
  const preview = note.content.trim() || "İçerik yok";

  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      className={`flex min-h-[180px] w-full flex-col border border-black text-left transition-shadow hover:shadow-[4px_4px_0_0_#0a1628] ${getNoteColorClassName(note.color)} ${
        isSelected ? "ring-2 ring-navy ring-offset-2" : ""
      }`}
    >
      {note.coverImageUrl && (
        <div className="border-b border-black bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.coverImageUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-wide text-charcoal">
          {note.title}
        </h3>

        <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 line-clamp-4">
          {preview}
        </p>

        <p className="mt-4 border-t border-black/10 pt-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {formatDate(note.updatedAt)}
          {typeof note.attachmentCount === "number" && note.attachmentCount > 0
            ? ` · ${note.attachmentCount} görsel`
            : ""}
        </p>
      </div>
    </button>
  );
}
