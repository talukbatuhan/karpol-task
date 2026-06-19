import { sharpInputClassName } from "@/components/form/SharpField";
import type { ContaRecord } from "@/types/conta";

interface ContaListPanelProps {
  records: ContaRecord[];
  selectedId: string | null;
  search: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR");
}

export function ContaListPanel({
  records,
  selectedId,
  search,
  isLoading,
  onSearchChange,
  onSelect,
  onCreateNew,
}: ContaListPanelProps) {
  return (
    <div className="flex h-full flex-col border border-black bg-white">
      <div className="border-b border-black px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
            Conta Listesi
          </h2>
          <button
            type="button"
            onClick={onCreateNew}
            className="border border-black bg-navy px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-navy-light"
          >
            + Yeni Conta
          </button>
        </div>
      </div>

      <div className="border-b border-black p-4">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Conta ID, firma veya marka ara..."
          className={sharpInputClassName}
        />
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">Kayıtlar yükleniyor...</p>
        ) : records.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            Kriterlere uygun conta kaydı bulunamadı.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-black bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Conta ID
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Firma
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:table-cell">
                  Marka
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:table-cell">
                  Uzunluk
                </th>
                <th className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 lg:table-cell">
                  Adet
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Renk
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onSelect(record.id)}
                  className={`cursor-pointer border-b border-slate-200 transition-colors hover:bg-slate-50 ${
                    selectedId === record.id ? "bg-slate-100" : ""
                  }`}
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-charcoal">{record.contaCode}</p>
                    <p className="mt-0.5 text-xs text-slate-500 md:hidden">
                      {record.firmaIsmi} · {formatDate(record.createdAt)}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{record.firmaIsmi}</td>
                  <td className="hidden px-3 py-3 text-slate-600 md:table-cell">
                    {record.marka}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                    {record.uzunluk}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-600 lg:table-cell">
                    {record.adet}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-slate-600">{record.renk}</span>
                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      {formatDate(record.createdAt)}
                      {typeof record.attachmentCount === "number" &&
                        record.attachmentCount > 0 &&
                        ` · ${record.attachmentCount} görsel`}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
