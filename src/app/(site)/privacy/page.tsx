import { CmsPage, cmsPageMetadata } from "@/components/site/cms-page";

export function generateMetadata() {
  return cmsPageMetadata("privacy");
}

export default function PrivacyPage() {
  return <CmsPage slug="privacy" />;
}
