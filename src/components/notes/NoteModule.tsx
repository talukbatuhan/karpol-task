"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { NoteCard } from "@/components/notes/NoteCard";
import { NoteForm } from "@/components/notes/NoteForm";
import { sharpInputClassName } from "@/components/form/SharpField";
import type { Note, NoteDetail } from "@/types/note";

function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function NoteModule() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedNoteDetail, setSelectedNoteDetail] =
    useState<NoteDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadNotes = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    setListError(null);

    try {
      const response = await fetch("/api/notlar", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "Notlar yüklenemedi");
        setNotes([]);
        return;
      }

      setNotes(data.notes ?? []);
    } catch {
      setListError("Notlar yüklenemedi");
      setNotes([]);
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const loadNoteDetail = useCallback(async (id: string) => {
    setIsDetailLoading(true);

    try {
      const response = await fetch(`/api/notlar/${id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedNoteDetail(data.note);
      } else {
        setSelectedNoteDetail(null);
      }
    } catch {
      setSelectedNoteDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId || isCreating) {
      setSelectedNoteDetail(null);
      return;
    }

    void loadNoteDetail(selectedId);
  }, [selectedId, isCreating, loadNoteDetail]);

  const filteredNotes = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());
    if (!normalizedSearch) return notes;

    return notes.filter((note) => {
      return (
        normalizeSearch(note.title).includes(normalizedSearch) ||
        normalizeSearch(note.content).includes(normalizedSearch)
      );
    });
  }, [notes, search]);

  const handleCreateNew = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  const handleSelect = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const handleSaved = async () => {
    await loadNotes({ silent: true });
    if (selectedId) {
      await loadNoteDetail(selectedId);
    }
    setIsCreating(false);
  };

  const handleDeleted = async () => {
    setSelectedId(null);
    setIsCreating(false);
    await loadNotes({ silent: true });
  };

  const showEditor = isCreating || selectedId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border border-black bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Notlarda ara..."
            className={sharpInputClassName}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCreateNew}
            className="border border-black bg-navy px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-navy-light"
          >
            + Yeni Not
          </button>
          {isRefreshing && (
            <span className="text-xs text-slate-500">Güncelleniyor...</span>
          )}
        </div>
      </div>

      {listError && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,420px)] xl:items-start">
        <div>
          {isInitialLoading ? (
            <p className="text-sm text-slate-500">Notlar yükleniyor...</p>
          ) : filteredNotes.length === 0 ? (
            <div className="border border-dashed border-black bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                {search.trim()
                  ? "Aramanıza uygun not bulunamadı."
                  : "Henüz not yok. İlk notunuzu oluşturun."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedId === note.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {showEditor ? (
          <div className="xl:sticky xl:top-6">
            {isDetailLoading && !isCreating ? (
              <div className="border border-black bg-white p-6">
                <p className="text-sm text-slate-500">Not yükleniyor...</p>
              </div>
            ) : (
              <NoteForm
                key={isCreating ? "new" : selectedId ?? "none"}
                note={isCreating ? null : selectedNoteDetail}
                onSaved={handleSaved}
                onCancel={() => {
                  setIsCreating(false);
                  setSelectedId(null);
                }}
                onDeleted={handleDeleted}
              />
            )}
          </div>
        ) : (
          <div className="hidden border border-dashed border-black bg-white p-8 text-center xl:flex xl:min-h-[280px] xl:flex-col xl:items-center xl:justify-center">
            <p className="text-sm font-medium uppercase tracking-wide text-charcoal">
              Not seçin
            </p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Listeden bir nota tıklayın veya yeni not oluşturun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
