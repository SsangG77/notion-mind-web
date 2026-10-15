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

if (problems.length) {
  console.error(`✗ 광고 자리 ${problems.length}건 이상\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("✓ 광고 자리는 AdBanner 한 곳에만 있음");
