import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { width, height } = size;
  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #ff00a6, #00ffd1)",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#000",
            textShadow: "8px 8px 0 #fff",
            padding: "16px 24px",
          }}
        >
          Datanyl
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 32,
            color: "#001a16",
            background: "rgba(255,255,255,0.8)",
            padding: "12px 18px",
            borderRadius: 12,
          }}
        >
          Tiny data tools. Big sanity.
        </div>
      </div>
    ),
    { ...size }
  );
}


