"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

export type NavGroup = { label: string; href?: string; items?: { href: string; label: string }[] };

export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-slate-200 bg-white px-4 py-4"
        >
          <ul className="divide-y divide-slate-100">
            <li>
              <Link href="/" onClick={close} className="block px-2 py-3 text-base font-medium text-slate-800">
                Home
              </Link>
            </li>
            {groups.map((group) =>
              group.items ? (
                <li key={group.label}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-3 text-base font-medium text-slate-800">
                      {group.label}
                      <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <ul className="pb-3">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="block rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={group.label}>
                  <Link href={group.href!} onClick={close} className="block px-2 py-3 text-base font-medium text-slate-800">
                    {group.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <Link href="/quote" onClick={close} className="btn-primary mt-6 w-full">
            Request a quote
          </Link>
        </nav>
      )}
    </div>
  );
}
