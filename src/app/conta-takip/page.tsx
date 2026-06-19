import { ContaModule } from "@/components/conta/ContaModule";
import { AppHeader } from "@/components/layout/AppHeader";

export default function ContaTakipPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <AppHeader title="Conta Takip" active="conta-takip" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <ContaModule />
      </main>
    </div>
  );
}
