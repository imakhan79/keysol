import { Plus } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import type { Faq } from "@/lib/types";

/** Accessible accordion (native <details>) with FAQPage structured data. */
export function FaqList({ faqs, structuredData = true }: { faqs: Faq[]; structuredData?: boolean }) {
  if (faqs.length === 0) return null;
  return (
    <>
      {structuredData && <FaqJsonLd faqs={faqs} />}
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((faq) => (
          <details key={faq.id} className="group px-5 py-4 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
              {faq.question}
              <Plus className="size-5 shrink-0 text-brand-600 transition group-open:rotate-45" aria-hidden="true" />
            </summary>
            <Markdown className="mt-3 text-[15px] prose-p:my-2">{faq.answer}</Markdown>
          </details>
        ))}
      </div>
    </>
  );
}

export function FaqJsonLd({ faqs }: { faqs: Faq[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          // Markdown links reduced to their text for the plain-text answer
          acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") },
        })),
      }}
    />
  );
}
