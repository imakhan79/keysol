import { CmsPage, cmsPageMetadata } from "@/components/site/cms-page";

export function generateMetadata() {
  return cmsPageMetadata("terms");
}

export default function TermsPage() {
  return <CmsPage slug="terms" />;
}
