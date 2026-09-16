#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 MAKE STUDIO 社交媒体分享 Logo 图（沿用 favicon 造型）。
输出: assets/logo-share.png  (1200x630, 推特 / OG 推荐比例)
品牌统一写法：MAKE STUDIO
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (9, 9, 18)          # 深色底 #090912
LOGO_BG = (11, 11, 26)   # logo 圆角矩形底 #0b0b1a
CYAN = (34, 211, 238)    # #22d3ee
INDIGO = (129, 140, 248) # #818cf8
STROKE = (64, 64, 120)
FG = (238, 241, 250)     # #eef1fa
DIM = (160, 166, 200)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# 细网格纹理（科技感）
step = 40
for x in range(0, W, step):
    d.line([(x, 0), (x, H)], fill=(22, 22, 42), width=1)
for y in range(0, H, step):
    d.line([(0, y), (W, y)], fill=(22, 22, 42), width=1)

# ---- Logo 图标 ----
S = 200
CX = (W - S) // 2
CYICON = 128  # 图标中心 y
ly, ry = CYICON - S // 2, CYICON + S // 2
d.rounded_rectangle([CX, ly, CX + S, ry], radius=42, fill=LOGO_BG, outline=STROKE, width=3)
d.rounded_rectangle([CX + 8, ly + 8, CX + S - 8, ry - 8], radius=34,
                    fill=None, outline=CYAN, width=3)
tri = [(CX + 58, ly + 50), (CX + 58, ry - 50), (CX + 152, CYICON)]
d.polygon(tri, fill=CYAN)
d.rounded_rectangle([CX + 148, ly + 128, CX + 164, ly + 148], radius=6, fill=INDIGO)


def load(f, s):
    p = f"/usr/share/fonts/truetype/dejavu/{f}"
    try:
        return ImageFont.truetype(p, s)
    except Exception:
        return ImageFont.load_default()


# ---- 主标题：MAKE STUDIO ----
f_title = load("DejaVuSans-Bold.ttf", 112)
title = "MAKE STUDIO"
tw = d.textlength(title, font=f_title)
sy = CYICON + S // 2 + 64
d.text(((W - tw) / 2, sy), title, font=f_title, fill=FG)

# ---- 副标题（纯英文，避免中文字体缺失）----
f_sub = load("DejaVuSans.ttf", 36)
sub = "MUSIC · STUDIO"
sw = d.textlength(sub, font=f_sub)
d.text(((W - sw) / 2, sy + 122), sub, font=f_sub, fill=DIM)

# ---- 底部域名提示（可省）----
f_small = load("DejaVuSans.ttf", 26)
tag = "MAKESTUDIO"
tgw = d.textlength(tag, font=f_small)
d.text(((W - tgw) / 2, H - 62), tag, font=f_small,
       fill=(70, 74, 110))

out = "/workspace/assets/logo-share.png"
img.save(out, "PNG")
print("saved", out, img.size)