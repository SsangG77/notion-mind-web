// 공개 주소마다 검색 노출에 필요한 태그가 다 있는지 검사한다.
// 완료 판정은 사람이 만든 목록이 아니라 이 명령의 0건으로 한다.
// 사용법: node scripts/check-seo.mjs [기준주소]  (기본 http://localhost:3000)
const BASE = process.argv[2] ?? "http://localhost:3000";
const PATHS = ["/", "/guide", "/faq", "/pricing", "/terms", "/privacy", "/refund"];
const LANGS = ["en", "ko"];
const urlFor = (lang, p) => (lang === "en" ? p : p === "/" ? "/ko" : `/ko${p}`);

const problems = [];
const pick = (html, re) => (html.match(re) ?? [])[1];

for (const lang of LANGS) {
  for (const p of PATHS) {
    const path = urlFor(lang, p);
    const res = await fetch(BASE + path, { headers: { "user-agent": "seo-check" } });
    if (!res.ok) { problems.push(`${path} → HTTP ${res.status}`); continue; }
    const html = await res.text();
    const title = pick(html, /<title>([^<]*)<\/title>/);
    const desc = pick(html, /<meta name="description" content="([^"]*)"/);
    const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
    const hreflangs = [...html.matchAll(/hreflang="([^"]*)"/gi)].map((m) => m[1]);
    const htmlLang = pick(html, /<html lang="([a-z-]*)"/);

    if (!title || title === "Notion-mind") problems.push(`${path} → title 이 비었거나 브랜드명뿐: ${title ?? "없음"}`);
    if (!desc) problems.push(`${path} → description 없음`);
    if (!canonical) problems.push(`${path} → canonical 없음`);
    else if (!canonical.endsWith(path) && !(path === "/" && canonical.replace(/\/$/, "").endsWith(".com")))
      problems.push(`${path} → canonical 이 자기 자신이 아님: ${canonical}`);
    for (const need of ["en", "ko", "x-default"])
      if (!hreflangs.includes(need)) problems.push(`${path} → hreflang ${need} 없음`);
    if (htmlLang !== lang) problems.push(`${path} → html lang 이 ${htmlLang}, 기대값 ${lang}`);
    if (!/property="og:title"/.test(html)) problems.push(`${path} → og:title 없음`);
  }
}

// 색인되면 안 되는 주소
for (const path of ["/graph", "/ko/graph", "/dev", "/ko/dev"]) {
  const res = await fetch(BASE + path, { redirect: "manual", headers: { "user-agent": "seo-check" } });
  const html = res.status < 400 ? await res.text() : "";
  if (html && !/noindex/.test(html) && res.status === 200)
    problems.push(`${path} → 200 인데 noindex 가 없음`);
}

const robots = await fetch(`${BASE}/robots.txt`);
if (!robots.ok) problems.push(`/robots.txt → HTTP ${robots.status}`);
else {
  const txt = await robots.text();
  if (!/^Sitemap:\s*https?:\/\/\S+sitemap\.xml/im.test(txt))
    problems.push("robots.txt 에 전체 주소로 된 Sitemap 줄이 없음");
}

const sm = await fetch(`${BASE}/sitemap.xml`);
if (!sm.ok) problems.push(`/sitemap.xml → HTTP ${sm.status}`);
else {
  const xml = await sm.text();
  const count = (xml.match(/<loc>/g) ?? []).length;
  const expected = PATHS.length * LANGS.length;
  if (count !== expected) problems.push(`sitemap 주소 ${count}개, 기대값 ${expected}개`);
  if (/<changefreq>|<priority>/.test(xml)) problems.push("sitemap 에 구글이 무시하는 changefreq/priority 가 있음");
}

if (problems.length) {
  console.error(`✗ 검색 노출 결함 ${problems.length}건\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`✓ 공개 주소 ${PATHS.length * LANGS.length}개 모두 title, description, canonical, hreflang, og 갖춤`);
