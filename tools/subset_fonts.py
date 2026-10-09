# 收集页面上用到的字 → 向 Google Fonts 要只含这些字的子集 → 存到 assets/fonts/site-*.woff2 → 写 css/fonts.css
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
FONTS = [  # (css family, google family, weight, style, file stem)
  ('Inter Tight', 'Inter Tight', 400, 'normal', 'intertight-400'),
  ('Inter Tight', 'Inter Tight', 500, 'normal', 'intertight-500'),
  ('Inter Tight', 'Inter Tight', 700, 'normal', 'intertight-700'),
  ('Inter Tight', 'Inter Tight', 800, 'normal', 'intertight-800'),
  ('Inter Tight', 'Inter Tight', 900, 'normal', 'intertight-900'),
  ('Instrument Serif', 'Instrument Serif', 400, 'normal', 'instrumentserif'),
  ('Instrument Serif', 'Instrument Serif', 400, 'italic', 'instrumentserif-italic'),
  ('Noto Sans SC', 'Noto Sans SC', 400, 'normal', 'notosanssc-400'),
  ('Noto Sans SC', 'Noto Sans SC', 500, 'normal', 'notosanssc-500'),
  ('Noto Serif SC', 'Noto Serif SC', 600, 'normal', 'notoserifsc-600'),
  ('Noto Serif SC', 'Noto Serif SC', 900, 'normal', 'notoserifsc-900'),
]
css = ['/* 自托管字体子集：只含页面上用到的字（由 Google Fonts 按字生成，重新生成方法见 README） */']
html = open(f'{R}/index.html', encoding='utf-8').read()
html = open(f'{R}/index.html', encoding='utf-8').read()
js = ''.join(open(f, encoding='utf-8').read() for f in glob.glob(f'{R}/js/*.js'))
def grab(*pats, src=html):
    return ''.join(''.join(re.findall(p, src, re.S)) for p in pats)
# 宋体只用在标题、作品名、名字这些地方，单独截一份更小的
serif900 = grab(r'class="sh-t">([^<]*)<', r'class="next-t">([^<]*)<', r'class="work-t">([^<]*)<', r'class="log-title">([^<]*)<', r'data-ch="[^"]*"><span>\d+</span>([^<]*)</a>') \
    + re.sub(r'<[^>]+>', '', grab(r'<blockquote.*?</blockquote>')) + grab(r"name:\s*'([^']*)'", src=js) + '夜昼《》「」·—'
serif600 = grab(r'<li class="tl-row[^"]*"[^>]*>.*?<b>([^<]*)</b>')
sans500 = grab(r'data-ch="[^"]*"><span>\d+</span>([^<]*)</a>', r'<dd>([^<]*)</dd>', r'class="row-v">([^<]*)<')
ONLY = {'notoserifsc-900': serif900, 'notoserifsc-600': serif600, 'notosanssc-500': sans500}
for fam, g, w, style, stem in FONTS:
    base = ONLY.get(stem)
    txt = ''.join(sorted(set(base + ''.join(chr(c) for c in range(33, 127)) if base is not None else chars) - set(' \n')))
    spec = f'{g}:ital,wght@{1 if style == "italic" else 0},{w}' if g != 'Instrument Serif' else f'{g}:ital@{1 if style == "italic" else 0}'
    q = urllib.parse.urlencode({'family': spec, 'text': txt, 'display': 'swap'})
    req = urllib.request.Request('https://fonts.googleapis.com/css2?' + q, headers={'User-Agent': UA})
    body = urllib.request.urlopen(req, timeout=60).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', body)
    assert len(urls) == 1, (fam, w, style, len(urls), body[:300])
    data = urllib.request.urlopen(urllib.request.Request(urls[0], headers={'User-Agent': UA}), timeout=60).read()
    out = f'{R}/assets/fonts/site-{stem}.woff2'
    open(out, 'wb').write(data)
    print(f'{stem:18s} {len(data)/1024:7.1f} KB')
    css.append(f"@font-face {{ font-family: '{fam}'; font-style: {style}; font-weight: {w}; font-display: swap; src: url('../assets/fonts/site-{stem}.woff2') format('woff2'); }}")
open(f'{R}/css/fonts.css', 'w', encoding='utf-8').write('\n'.join(css) + '\n')
