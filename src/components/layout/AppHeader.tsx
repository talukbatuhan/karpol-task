import Link from "next/link";

import { AuthActions } from "@/components/layout/AuthActions";

type AppNavKey = "is-takip" | "firmalar" | "conta-takip" | "notlar";

interface AppHeaderProps {
  title: string;
  active: AppNavKey;
}

const NAV_ITEMS: { key: AppNavKey; href: string; label: string }[] = [
  { key: "is-takip", href: "/", label: "İş Takip" },
  { key: "firmalar", href: "/firmalar", label: "Firmalar" },
  { key: "conta-takip", href: "/conta-takip", label: "Conta Takip" },
  { key: "notlar", href: "/notlar", label: "Notlar" },
];

export function AppHeader({ title, active }: AppHeaderProps) {
  return (
    <header className="border-b border-black bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Karpol
            </p>
            <h1 className="mt-1 text-xl font-semibold uppercase tracking-wide text-charcoal md:text-2xl">
              {title}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <AuthActions />
            <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`border px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                  active === item.key
                    ? "border-black bg-navy text-white"
                    : "border-black bg-white text-charcoal hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
