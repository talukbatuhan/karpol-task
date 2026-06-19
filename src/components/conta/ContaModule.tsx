"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ContaDetailCard } from "@/components/conta/ContaDetailCard";
import { ContaForm } from "@/components/conta/ContaForm";
import { ContaListPanel } from "@/components/conta/ContaListPanel";
import type { ContaRecord } from "@/types/conta";

function normalizeSearch(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ContaModule() {
  const [records, setRecords] = useState<ContaRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await fetch("/api/conta");
      const data = await response.json();

      if (!response.ok) {
        setListError(data.error ?? "Conta kayıtları yüklenemedi");
        setRecords([]);
        return;
      }

      setRecords(data.records ?? []);
    } catch {
      setListError("Conta kayıtları yüklenemedi");
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeSearch(search.trim());

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((record) => {
      return (
        normalizeSearch(record.contaCode).includes(normalizedSearch) ||
        normalizeSearch(record.firmaIsmi).includes(normalizedSearch) ||
        normalizeSearch(record.marka).includes(normalizedSearch) ||
        normalizeSearch(record.renk).includes(normalizedSearch)
      );
    });
  }, [records, search]);

  const handleSelect = (id: string) => {
    setIsCreating(false);
    setSelectedId(id);
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  const handleSaved = async (payload: { id: string; contaCode: string }) => {
    await loadRecords();
    setSelectedId(payload.id);
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {listError && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,2fr)_minmax(360px,3fr)] lg:items-start">
        <ContaListPanel
          records={filteredRecords}
          selectedId={selectedId}
          search={search}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onCreateNew={handleCreateNew}
        />

        <div className="min-w-0">
          {isCreating ? (
            <ContaForm onSaved={handleSaved} onCancel={() => setIsCreating(false)} />
          ) : (
            <ContaDetailCard recordId={selectedId} />
          )}
        </div>
      </div>
    </div>
  );
}
