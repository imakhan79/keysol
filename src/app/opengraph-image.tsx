import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSettings } from "@/lib/content";

export const alt = "Company overview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share image for every page that doesn't set its own.
export default async function OpengraphImage() {
  const [{ company }, mark] = await Promise.all([getSettings(), readFile(join(process.cwd(), "public/logo-mark.svg"))]);
  const markSrc = `data:image/svg+xml;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a1d31 0%, #105088 70%, #2f8fb0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", padding: "10px 14px", borderRadius: 16, background: "white" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>, not next/image */}
            <img src={markSrc} width={78} height={30} alt="" />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{company.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>{company.tagline}</div>
          <div style={{ fontSize: 28, color: "#a9e3de" }}>
            Communication · Software · E-commerce · Marketing · Hosting
          </div>
        </div>
      </div>
    ),
    size,
  );
}
