import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  const { width, height } = size;
  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#00ffd1",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 900, color: "#000" }}>D</div>
      </div>
    ),
    { ...size }
  );
}


