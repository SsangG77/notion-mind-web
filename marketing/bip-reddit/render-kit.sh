#!/bin/sh
# kit.html 의 슬라이드를 헤드리스 크롬으로 PNG 로 만들어 out/kit/*.png 와 img/rendered.js(키트 내장본)를 갱신한다.
# 슬라이드 문구나 img/shots 캡쳐를 바꾼 뒤 실행.
cd "$(dirname "$0")"
B="$HOME/.claude/skills/gstack/browse/dist/browse"
mkdir -p out/kit
$B viewport 1300x900 >/dev/null
$B goto "file://$PWD/kit.html" >/dev/null
$B wait --networkidle >/dev/null 2>&1
for n in $($B js "[...document.querySelectorAll('.slide')].map(s => s.dataset.name).join(' ')"); do
  # rendered.js 가 없는 상태의 render() 로 새로 그림 (브라우저 저장소의 교체 이미지는 무시되도록 기본값 사용)
  $B js "render(document.querySelector('[data-name=$n]'))" --out "$PWD/out/kit/$n.png" >/dev/null && echo "$n"
done
$B stop >/dev/null 2>&1
python3 - <<'PY'
import base64, glob, json, os
shots = {os.path.basename(f)[:-4]: 'data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
         for f in sorted(glob.glob('out/kit/*.png'))}
open('img/rendered.js', 'w').write('window.RENDERED = ' + json.dumps(shots) + ';\n')
print('rendered.js:', len(shots), 'slides')
PY
