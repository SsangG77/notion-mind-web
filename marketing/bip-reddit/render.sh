#!/bin/sh
# slides.html 의 7장을 out/slide-N.png (1080x1350) 로 저장
cd "$(dirname "$0")"
B=~/.claude/skills/gstack/browse/dist/browse
mkdir -p out
$B viewport 1200x1500 --scale 1 >/dev/null
$B goto "file://$PWD/slides.html" >/dev/null
$B wait --networkidle >/dev/null 2>&1
for i in 1 2 3 4 5 6 7; do $B screenshot --selector "#s$i" "$PWD/out/slide-$i.png" >/dev/null; done
ls out
