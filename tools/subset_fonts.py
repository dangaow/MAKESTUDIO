# 收集页面上用到的字 → 向 Google Fonts 要只含这些字的子集 → 存到 assets/fonts/tape-*.woff2 → 写 css/fonts.css
import re, urllib.parse, urllib.request, os, glob, sys
import pathlib
R = str(pathlib.Path(__file__).resolve().parent.parent)   # 仓库根目录；用法：python3 tools/subset_fonts.py
src = open(f'{R}/index.html', encoding='utf-8').read() + ''.join(open(f, encoding='utf-8').read() for f in glob.glob(f'{R}/js/*.js'))
src = re.sub(r'<[^>]+>', ' ', src)
chars = set(src)
chars |= set(''.join(chr(c) for c in range(32, 127)))
chars |= set('，。、；：？！「」『』《》（）—…·￥¥→←↓↑★✓✕◆●■□△▲▼▶◀') | set('昵称邮箱网址登录提交评论按正序倒热度条回复取消预览表情图片上传说说你想听的加载更多没有了匿名游客管理员')
chars = ''.join(sorted(c for c in chars if c.isprintable() and c not in '\n\r\t'))
print(len(chars), 'chars')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
FONTS = [  # (css family, google family, weight, file stem)
  ('Anton', 'Anton', 400, 'anton'),
  ('Space Mono', 'Space Mono', 400, 'spacemono-400'),
  ('Space Mono', 'Space Mono', 700, 'spacemono-700'),
  ('Silkscreen', 'Silkscreen', 400, 'silkscreen-400'),
  ('Silkscreen', 'Silkscreen', 700, 'silkscreen-700'),
  ('Noto Sans SC', 'Noto Sans SC', 400, 'notosanssc-400'),
  ('Noto Sans SC', 'Noto Sans SC', 900, 'notosanssc-900'),
  ('Noto Serif SC', 'Noto Serif SC', 900, 'notoserifsc-900'),
]
css = ['/* 自托管字体子集：只含页面上用到的字（由 Google Fonts 按字生成，重新生成方法见 README） */']
html = open(f'{R}/index.html', encoding='utf-8').read()
serif = re.sub(r'<[^>]+>', '', ''.join(re.findall(r'<blockquote.*?</blockquote>', html, re.S))) + '「」'
ONLY = {'notoserifsc-900': serif}
for fam, g, w, stem in FONTS:
    txt = ''.join(sorted(set(ONLY.get(stem, chars)) - set(' \n')))
    q = urllib.parse.urlencode({'family': f'{g}:wght@{w}', 'text': txt, 'display': 'swap'})
    req = urllib.request.Request('https://fonts.googleapis.com/css2?' + q, headers={'User-Agent': UA})
    body = urllib.request.urlopen(req, timeout=60).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', body)
    assert len(urls) == 1, (fam, w, len(urls), body[:300])
    data = urllib.request.urlopen(urllib.request.Request(urls[0], headers={'User-Agent': UA}), timeout=60).read()
    out = f'{R}/assets/fonts/tape-{stem}.woff2'
    open(out, 'wb').write(data)
    print(f'{stem:18s} {len(data)/1024:7.1f} KB')
    css.append(f"@font-face {{ font-family: '{fam}'; font-style: normal; font-weight: {w}; font-display: swap; src: url('../assets/fonts/tape-{stem}.woff2') format('woff2'); }}")
open(f'{R}/css/fonts.css', 'w', encoding='utf-8').write('\n'.join(css) + '\n')
