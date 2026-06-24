import type { Metadata } from "next";

import { NoteModule } from "@/components/notes/NoteModule";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = {
  title: "Karpol Notlar",
};

export default function NotlarPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <AppHeader title="Karpol Notlar" active="notlar" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <NoteModule />
      </main>
    </div>
  );
}
