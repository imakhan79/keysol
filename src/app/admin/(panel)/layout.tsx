import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { getStaff } from "@/lib/auth";
import { roleLabels } from "@/lib/roles";
import { signOut } from "../actions";
import { AdminNav } from "./nav";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-ink text-slate-300 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-white">
            <BrandMark light className="h-6" />
            Admin
          </Link>
          <Link href="/" target="_blank" className="text-slate-400 hover:text-white" aria-label="Open website">
            <ExternalLink className="size-4" />
          </Link>
        </div>
        <Suspense fallback={<div className="flex-1" />}>
          <StaffNav />
        </Suspense>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

async function StaffNav() {
  const staff = await getStaff();
  if (!staff) return null;
  return (
    <>
      <AdminNav role={staff.role} />
      <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
        <p className="truncate text-sm text-white">{staff.email}</p>
        <p className="text-xs text-slate-500">{roleLabels[staff.role]}</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </>
  );
}
