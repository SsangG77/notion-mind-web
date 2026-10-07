import { ImageResponse } from "next/og";

// 공유 카드 이미지 — 디자인 토큰(도트 배경, 입체 블록)을 그대로 따른다.
// 글꼴 파일을 받지 않으려고 영문만 쓴다(한글은 기본 글꼴에 없음).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Notion-mind — graph view for your Notion workspace";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          backgroundImage: "radial-gradient(#E9E9E7 2px, transparent 2px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: "56px 72px",
            backgroundColor: "#FDFDFC",
            border: "3px solid #2E2C27",
            borderRadius: 14,
            boxShadow: "10px 10px 0 #2E2C27",
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 700, color: "#37352F" }}>Notion-mind</div>
          <div style={{ fontSize: 32, color: "#73726E" }}>
            Your Notion workspace as one connected graph
          </div>
        </div>
      </div>
    ),
    size,
  );
}
