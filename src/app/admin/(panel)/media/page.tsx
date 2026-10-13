import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth";
import { AdminHeader } from "../ui";
import { MediaLibrary } from "./media-library";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  await requireStaff("marketingContent");
  return (
    <>
      <AdminHeader title="Media" description="Images for pages, posts, portfolio and testimonials (max 10 MB each)" />
      <div className="p-4 sm:p-8">
        <MediaLibrary />
      </div>
    </>
  );
}
