import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ABsource Biologics — DVS dairy starter cultures made in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph card: dark ab-tank field, headline, logo bottom-left.
 * Uses system fonts rather than fetching a font file, so it renders without a
 * network round trip at the edge.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0B3B3C",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7FA9A9",
          }}
        >
          India&apos;s first DVS culture manufacturer · Est. 2014
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            color: "#FBFAF7",
            maxWidth: "900px",
          }}
        >
          India&apos;s dairy shouldn&apos;t have to import its bacteria.
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <div style={{ display: "flex", fontSize: 34, color: "#FBFAF7", fontWeight: 600 }}>
            ABsource
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#7FA9A9",
            }}
          >
            Biologics
          </div>
        </div>
      </div>
    ),
    size
  );
}
