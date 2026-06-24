"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormSection } from "@/components/form/FormSection";
import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { SharpImageUploadZone } from "@/components/form/SharpImageUploadZone";
import {
  noteFormResolver,
  type NoteFormValues,
} from "@/lib/validations/note-form";
import {
  revokeAttachments,
  type WorkOrderAttachment,
} from "@/types/attachment";
import {
  getNoteColorClassName,
  NOTE_COLOR_OPTIONS,
  type NoteAttachment,
  type NoteColor,
  type NoteDetail,
} from "@/types/note";

interface NoteFormProps {
  note?: NoteDetail | null;
  onSaved: () => void;
  onCancel?: () => void;
  onDeleted?: () => void;
}

function getDefaultValues(note?: NoteDetail | null): NoteFormValues {
  return {
    title: note?.title ?? "",
    content: note?.content ?? "",
    color: note?.color ?? "white",
  };
}

interface NotePreviewProps {
  title: string;
  content: string;
  color: NoteColor;
  imageUrl?: string | null;
}

function NotePreview({ title, content, color, imageUrl }: NotePreviewProps) {
  const previewTitle = title.trim() || "Başlıksız not";
  const previewContent =
    content.trim() || "Not içeriğiniz burada görünecek...";

  return (
    <div
      className={`flex min-h-[160px] flex-col border border-black p-4 shadow-[4px_4px_0_0_#0a1628] ${getNoteColorClassName(color)}`}
    >
      {imageUrl && (
        <div className="mb-3 border border-black bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Not görseli önizlemesi"
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <h3 className="line-clamp-2 text-sm font-semibold uppercase tracking-wide text-charcoal">
        {previewTitle}
      </h3>
      <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 line-clamp-5">
        {previewContent}
      </p>
      <p className="mt-4 border-t border-black/10 pt-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        Önizleme
      </p>
    </div>
  );
}

function ExistingAttachmentList({
  attachments,
  removedIds,
  onToggleRemove,
}: {
  attachments: NoteAttachment[];
  removedIds: string[];
  onToggleRemove: (id: string) => void;
}) {
  const visible = attachments.filter((item) => !removedIds.includes(item.id));

  if (visible.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {visible.map((attachment) => (
        <li
          key={attachment.id}
          className="group relative border border-black bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className="aspect-square w-full object-cover"
          />
          <div className="border-t border-black bg-slate-50 px-2 py-1">
            <p className="truncate text-[10px] text-charcoal">
              {attachment.fileName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleRemove(attachment.id)}
            className="absolute right-1 top-1 border border-black bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-700 opacity-0 transition-opacity group-hover:opacity-100"
          >
            Kaldır
          </button>
        </li>
      ))}
    </ul>
  );
}

export function NoteForm({ note, onSaved, onCancel, onDeleted }: NoteFormProps) {
  const isEditing = !!note;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: noteFormResolver,
    defaultValues: getDefaultValues(note),
  });

  const title = watch("title");
  const content = watch("content");
  const selectedColor = watch("color");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>(
    [],
  );

  const previewImageUrl = useMemo(() => {
    const firstNew = attachments[0]?.previewUrl;
    if (firstNew) return firstNew;

    const kept = note?.attachments.filter(
      (item) => !removedAttachmentIds.includes(item.id),
    );
    return kept?.[0]?.url ?? null;
  }, [attachments, note?.attachments, removedAttachmentIds]);

  const toggleRemoveAttachment = (id: string) => {
    setRemovedAttachmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onSubmit = async (data: NoteFormValues) => {
    setSubmitError(null);

    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify(
        isEditing ? { ...data, removedAttachmentIds } : data,
      ),
    );
    attachments.forEach((attachment) => {
      formData.append("images", attachment.file);
    });

    try {
      const url = isEditing ? `/api/notlar/${note.id}` : "/api/notlar";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error ?? "Kayıt başarısız");
        return;
      }

      revokeAttachments(attachments);
      setAttachments([]);
      setRemovedAttachmentIds([]);

      if (!isEditing) {
        reset(getDefaultValues());
      }

      onSaved();
    } catch {
      setSubmitError("Sunucuya bağlanılamadı.");
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    const confirmed = window.confirm(
      `"${note.title}" notunu silmek istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/notlar/${note.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      window.alert(result.error ?? "Not silinemedi");
      return;
    }

    onDeleted?.();
  };

  return (
    <div className="border border-black bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-black px-4 py-4 md:px-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
            {isEditing ? "Düzenleme" : "Yeni kayıt"}
          </p>
          <h2 className="mt-1 text-sm font-semibold uppercase tracking-widest text-charcoal">
            {isEditing ? "Notu Düzenle" : "Yeni Not"}
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 border border-black bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-charcoal hover:bg-slate-100"
          >
            İptal
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-5" noValidate>
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-charcoal">
              Kart Önizlemesi
            </p>
            <NotePreview
              title={title}
              content={content}
              color={selectedColor}
              imageUrl={previewImageUrl}
            />
          </div>

          <div className="space-y-4 border-t border-black pt-5">
            <SharpField
              label="Başlık"
              htmlFor="noteTitle"
              error={errors.title?.message}
              required
            >
              <input
                id="noteTitle"
                type="text"
                placeholder="örn. Toplantı notları"
                className={sharpInputClassName}
                {...register("title")}
              />
            </SharpField>

            <SharpField
              label="İçerik"
              htmlFor="noteContent"
              error={errors.content?.message}
            >
              <textarea
                id="noteContent"
                rows={6}
                placeholder="Notunuzu yazın..."
                className={`${sharpInputClassName} min-h-[140px] resize-y`}
                {...register("content")}
              />
            </SharpField>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Kart Rengi
              </span>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLOR_OPTIONS.map((option) => {
                  const isActive = selectedColor === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setValue("color", option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={`flex items-center gap-2 border px-3 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                        isActive
                          ? "border-navy bg-navy text-white"
                          : "border-black bg-white text-charcoal hover:bg-slate-50"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 border border-black ${option.className}`}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register("color")} />
            </div>

            <FormSection title="Görseller" layout="stack">
              {isEditing && (note?.attachments.length ?? 0) > 0 && (
                <ExistingAttachmentList
                  attachments={note!.attachments}
                  removedIds={removedAttachmentIds}
                  onToggleRemove={toggleRemoveAttachment}
                />
              )}

              <SharpImageUploadZone
                id="noteGorselleri"
                label="Not Görselleri"
                hint="Birden fazla görsel ekleyebilirsiniz"
                category="product"
                attachments={attachments}
                onChange={setAttachments}
              />
            </FormSection>
          </div>
        </div>

        <div className="mt-5 border-t border-black pt-4">
          {submitError && (
            <p
              className="mb-4 border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : isEditing
                  ? "Güncelle"
                  : "Kaydet"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="border border-red-700 bg-white px-4 py-3 text-sm font-medium uppercase tracking-wide text-red-700 hover:bg-red-50"
              >
                Sil
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
