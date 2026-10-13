"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  CircleHelp,
  Compass,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquareQuote,
  SearchCheck,
  Settings,
  Tags,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import { roleCan, type Permission, type StaffRole } from "@/lib/roles";
import { signOut } from "../actions";

type Item = { href: string; label: string; icon: typeof Inbox; permission?: Permission };

const groups: { title?: string; items: Item[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { title: "Sales", items: [{ href: "/admin/leads", label: "Leads", icon: Inbox, permission: "leads" }] },
  {
    title: "Content",
    items: [
      { href: "/admin/content/services", label: "Services", icon: Layers, permission: "marketingContent" },
      { href: "/admin/content/service-categories", label: "Service categories", icon: Tags, permission: "marketingContent" },
      { href: "/admin/content/solutions", label: "Solutions", icon: Compass, permission: "marketingContent" },
      { href: "/admin/content/industries", label: "Industries", icon: Building2, permission: "marketingContent" },
      { href: "/admin/content/portfolio", label: "Portfolio", icon: FolderKanban, permission: "marketingContent" },
      { href: "/admin/content/case-studies", label: "Case studies", icon: Trophy, permission: "marketingContent" },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "marketingContent" },
      { href: "/admin/content/blog", label: "Blog", icon: BookOpen, permission: "marketingContent" },
      { href: "/admin/content/blog-categories", label: "Blog categories", icon: Tags, permission: "marketingContent" },
      { href: "/admin/content/faqs", label: "FAQs", icon: CircleHelp, permission: "marketingContent" },
      { href: "/admin/content/pages", label: "Pages", icon: FileText, permission: "siteContent" },
      { href: "/admin/content/team", label: "Team profiles", icon: Users, permission: "siteContent" },
      { href: "/admin/media", label: "Media", icon: ImageIcon, permission: "marketingContent" },
      { href: "/admin/content/seo", label: "SEO settings", icon: SearchCheck, permission: "marketingContent" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/settings", label: "Site settings", icon: Settings, permission: "siteContent" },
      { href: "/admin/team", label: "Staff & roles", icon: UserCog, permission: "team" },
    ],
  },
];

export function AdminNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const visible = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.permission || roleCan(role, i.permission)) }))
    .filter((g) => g.items.length > 0);

  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:flex-1 lg:overflow-y-auto lg:pb-0">
      <ul className="flex gap-1 lg:flex-col lg:gap-0">
        {visible.map((group) => (
          <li key={group.title ?? "main"} className="flex gap-1 lg:block">
            {group.title && (
              <p className="mt-5 mb-1 hidden px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase lg:block">
                {group.title}
              </p>
            )}
            <ul className="flex gap-1 lg:flex-col lg:gap-0.5">
              {group.items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition hover:bg-white/5 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
                  >
                    <Icon className="size-4" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
        <li className="lg:hidden">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-white/5">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
