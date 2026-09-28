#!/bin/sh
# 레딧 게시글, 댓글을 요소 단위로 2배 캡쳐해 img/shots/*.png 와 img/shots.js(키트용 내장본)를 만든다.
# 헤드리스는 레딧이 차단하므로 headed 로 실행 (창이 잠깐 뜸).
cd "$(dirname "$0")"
b() { "$HOME/.claude/skills/gstack/browse/dist/browse" --headed "$@"; }
O="$PWD/img/shots"; mkdir -p "$O"

b header "Accept-Language:en-US,en;q=0.9" >/dev/null
b viewport 820x1400 >/dev/null

# 다른 사람 닉네임, 아바타 블러 + 광고 제거 + 게시글 본문 숨김(제목, 이미지, 업보트만 남김)
PREP="(()=>{document.querySelectorAll('shreddit-ad-post, shreddit-comments-page-ad').forEach(e=>e.remove());
document.querySelectorAll('shreddit-comment a[href*=\"/user/\"]').forEach(a=>{if(!a.href.toLowerCase().includes('/user/snoo-50463'))a.style.filter='blur(7px)'});
document.querySelectorAll('shreddit-post [slot=text-body]').forEach(e=>e.style.display='none');return 1})()"

open_post() { b goto "$1" >/dev/null; b wait --networkidle >/dev/null 2>&1; b js "$PREP" >/dev/null; }
# 대댓글 숨김 (해당 댓글만 단독 캡쳐)
solo() { b js "document.querySelectorAll('shreddit-comment[thingid=$1] shreddit-comment').forEach(x=>x.style.display='none'); 1" >/dev/null; }
# 핵심 문장 형광펜 (문구는 그대로, 배경색만)
hl() {
  b js "(()=>{const w=document.createTreeWalker(document.querySelector('$1'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const i=n.data.indexOf(\"$2\");if(i<0)continue;const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+\"$2\".length);const m=document.createElement('span');m.style.cssText='background:linear-gradient(transparent 50%,rgba(35,131,226,.30) 50%)';r.surroundContents(m);return 'ok'}return 'miss: $2'})()"
}
# 요소 영역을 CDP 로 2배 캡쳐 (headed 에선 viewport --scale 미지원). 호버해야 업보트 줄이 렌더됨
shot() {
  b js "document.querySelector('$1').scrollIntoView({block:'center'}); 1" >/dev/null
  b hover "$1" >/dev/null; b hover "shreddit-post" >/dev/null; sleep 1
  R=$(b js "(()=>{const r=document.querySelector('$1').getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y+scrollY,width:r.width,height:r.height,scale:2})})()")
  b cdp Page.captureScreenshot "{\"format\":\"png\",\"captureBeyondViewport\":true,\"clip\":$R}" \
    | python3 -c "import sys,json,base64;t=sys.stdin.read();open('$O/$2.png','wb').write(base64.b64decode(json.loads(t[t.index('{'):t.rindex('}')+1])['data']))" && echo "$2"
}

open_post "https://www.reddit.com/r/Notion/comments/1vrm0oz/notion_graph_view_as_an_ios_app_would_you/"
shot shreddit-post iphone-post
solo t1_p4f37q4; hl "shreddit-comment[thingid=t1_p4f37q4]" "visually too cluttered"; shot "shreddit-comment[thingid=t1_p4f37q4]" iphone-c-cluttered
solo t1_p4ejfu7; hl "shreddit-comment[thingid=t1_p4ejfu7]" "only on desktop"; shot "shreddit-comment[thingid=t1_p4ejfu7]" iphone-c-desktop
solo t1_p4ff0uf; hl "shreddit-comment[thingid=t1_p4ff0uf]" "cluttered really fast"; shot "shreddit-comment[thingid=t1_p4ff0uf]" iphone-c-mobile

open_post "https://www.reddit.com/r/Notion/comments/1vuco03/notion_graph_view_on_ipad_tap_a_node_read_it_next/"
shot shreddit-post ipad-post
hl "shreddit-comment[thingid=t1_p55zce7]" "I don\\u0027t have an iPad"
hl "shreddit-comment[thingid=t1_p55zce7]" "pin and sort pages"
hl "shreddit-comment[thingid=t1_p5dbapu]" "I decided to make it a web version"
shot "shreddit-comment[thingid=t1_p55zce7]" ipad-c-browser

b stop >/dev/null 2>&1

# 키트는 file:// 로 열리므로 이미지를 JS 에 내장 (로컬 이미지는 PNG 변환 시 fetch 불가)
python3 - "$O" <<'EOF'
import sys, os, base64, json
d = sys.argv[1]
USED = {'iphone-post', 'iphone-c-cluttered', 'iphone-c-desktop', 'iphone-c-mobile', 'ipad-post', 'ipad-c-browser'}
shots = {f[:-4]: 'data:image/png;base64,' + base64.b64encode(open(os.path.join(d, f), 'rb').read()).decode()
         for f in sorted(os.listdir(d)) if f[:-4] in USED}
open(os.path.join(d, '..', 'shots.js'), 'w').write('window.SHOTS = ' + json.dumps(shots) + ';\n')
print('shots.js:', ', '.join(shots))
EOF
