import { CmsPage, cmsPageMetadata } from "@/components/site/cms-page";
import { CtaBanner } from "@/components/site/ui";

export function generateMetadata() {
  return cmsPageMetadata("support");
}

export default function SupportPage() {
  return (
    <CmsPage slug="support">
      <CtaBanner title="Need help right now?" description="Existing clients can contact support directly. New to us? Ask about a maintenance and support plan." />
    </CmsPage>
  );
}
