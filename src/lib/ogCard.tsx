import { ImageResponse } from "next/og";

/**
 * 공유 카드 그림 — 주소를 슬랙, 레딧, 트위터에 붙일 때 뜨는 미리보기.
 *
 * 디자인 토큰(도트 배경, 입체 블록)을 그대로 따른다. 글꼴 파일을 받지 않으려고 영문만 쓴다
 * (한글은 기본 글꼴에 없어 네모로 깨진다) — 그래서 한국어 주소도 영문 카드를 쓴다.
 *
 * 홈과 글이 같은 그림이면 외부에 올릴 때 구별이 안 되므로, 글은 제목을 넣어 따로 만든다.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

export function ogCard({ title, subtitle }: { title: string; subtitle: string }) {
  // 긴 제목은 글자를 줄여 블록 밖으로 넘치지 않게 한다
  const titleSize = title.length > 34 ? 46 : title.length > 22 ? 56 : 68;
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
            maxWidth: 960,
            padding: "56px 72px",
            backgroundColor: "#FDFDFC",
            border: "3px solid #2E2C27",
            borderRadius: 14,
            boxShadow: "10px 10px 0 #2E2C27",
          }}
        >
          <div style={{ fontSize: titleSize, fontWeight: 700, color: "#37352F", lineHeight: 1.15 }}>
            {title}
          </div>
          <div style={{ fontSize: 32, color: "#73726E" }}>{subtitle}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
