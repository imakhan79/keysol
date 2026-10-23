import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { CtaBanner, DetailSkeleton, PageHero } from "@/components/site/ui";
import { getIndustry, getSlugs } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getSlugs("industries");
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const industry = await getIndustry((await params).slug);
  if (!industry) return { title: "Industry not found" };
  return pageMetadata({
    title: industry.seo_title || `${industry.name} technology solutions`,
    description: industry.seo_description || industry.summary,
    path: `/industries/${industry.slug}`,
  });
}

export default function IndustryPage(props: PageProps<"/industries/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <IndustryDetail params={props.params} />
    </Suspense>
  );
}

async function IndustryDetail({ params }: Pick<PageProps<"/industries/[slug]">, "params">) {
  const industry = await getIndustry((await params).slug);
  if (!industry) notFound();

  return (
    <>
      <PageHero
        eyebrow="Industry"
        title={industry.name}
        description={industry.summary}
        crumbs={[
          { href: "/industries", label: "Industries" },
          { href: `/industries/${industry.slug}`, label: industry.name },
        ]}
      >
        <div className="mt-8">
          <Link href="/quote" className="btn-primary">
            Discuss your project
          </Link>
        </div>
      </PageHero>
      <div className="container-page max-w-3xl py-16">
        <Markdown>{industry.body}</Markdown>
      </div>
      <CtaBanner />
    </>
  );
}
