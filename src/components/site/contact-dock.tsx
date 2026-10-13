import { MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/content";

/** Floating call / WhatsApp shortcuts, shown only for channels configured in Admin → Settings. */
export async function ContactDock() {
  const { company } = await getSettings();
  const phone = company.phone?.replace(/[^\d+]/g, "");
  const whatsapp = company.whatsapp?.replace(/\D/g, "");
  // Skip placeholder numbers such as "+00 000 000 0000".
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  const callable = phoneDigits.length >= 7 && /[1-9]/.test(phoneDigits);
  if (!whatsapp && !callable) return null;

  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-3 sm:right-6 sm:bottom-6">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="grid size-12 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition hover:scale-105"
        >
          <MessageCircle className="size-6" />
        </a>
      )}
      {callable && (
        <a
          href={`tel:${phone}`}
          aria-label="Call us"
          className="grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-900/20 transition hover:scale-105 sm:hidden"
        >
          <Phone className="size-5" />
        </a>
      )}
    </div>
  );
}
