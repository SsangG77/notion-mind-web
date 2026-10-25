// 광고 자리가 AdBanner 한 곳에만 있는지 검사한다.
// 자리마다 따로 심어 두면 AdSense 승인 뒤 광고 단위를 갈아끼울 때 빠뜨리는 자리가 생긴다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const OWNER = "src/components/AdBanner.tsx";

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}

// 화면을 덮는 창에는 광고를 넣지 않는다 — 구글: "don't place content ads on interstitial pages"
// (https://support.google.com/adsense/answer/23921). 광고 제거를 권하는 창에 광고를 띄우는 것도 앞뒤가 안 맞는다
const NO_ADS = ["PaywallModal"];

const problems = [];
for (const file of walk(SRC)) {
  if (file === OWNER) continue;
  const src = readFileSync(file, "utf8");
  // 광고 자리를 직접 그린 흔적
  if (/data-testid="ad_banner/.test(src)) {
    problems.push(`${file} 가 광고 자리를 직접 그린다 — AdBanner 를 쓸 것`);
  }
  if (NO_ADS.some((n) => file.includes(n)) && /AdBanner/.test(src)) {
    problems.push(`${file} 은 화면을 덮는 창이라 광고를 넣으면 안 된다(구글 interstitial 규정)`);
  }
  // 실제 광고 단위를 직접 심은 흔적
  if (/class(Name)?="adsbygoogle"|data-ad-slot/.test(src)) {
    problems.push(`${file} 에 광고 단위가 직접 박혀 있다 — AdBanner 안에만 둘 것`);
  }
}

// 승인 전에는 광고 자리를 아예 그리지 않는다 — 빈 "광고 자리" 상자는 구글이 금지하는
// "아직 미완성 상태인 화면"으로 읽힌다(publisherpolicies/answer/11112688).
// 심사에 필요한 건 코드 스니펫·ads.txt·메타 태그 중 하나뿐이고, 승인 전에는 광고가 게재되지 않는다
// (adsense/answer/7584263).
const owner = readFileSync(OWNER, "utf8");
if (!/if \(!AD_SLOTS\[variant\]\) return null/.test(owner)) {
  problems.push(`${OWNER} 에 slot 미발급 시 null 반환 가드가 없다 — 승인 전 빈 광고 상자가 노출된다`);
}

if (problems.length) {
  console.error(`✗ 광고 자리 ${problems.length}건 이상\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("✓ 광고 자리는 AdBanner 한 곳에만 있음");
