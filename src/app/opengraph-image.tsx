import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/content";

export const alt = "Company overview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share image for every page that doesn't set its own.
export default async function OpengraphImage() {
  const { company } = await getSettings();
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
          background: "linear-gradient(135deg, #0b1220 0%, #1b36a3 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3366ff, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {company.name.slice(0, 1)}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{company.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>{company.tagline}</div>
          <div style={{ fontSize: 28, color: "#bdd3ff" }}>
            Communication · Software · E-commerce · Marketing · Hosting
          </div>
        </div>
      </div>
    ),
    size,
  );
}
