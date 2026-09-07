#!/usr/bin/env python3
"""
ARG 第三幕 · 图像隐写（LSB）工具
================================
叙事上对应成就「隐写术士」：把一段坐标/密文藏进一张"普通"图片的最低有效位，
玩家用本脚本（或自写工具）抽出隐藏文本。

用法：
  嵌入一段文本到图片（生成发布到社交媒体的隐写图）：
    python tools/stego.py embed <输入图> <输出图> -m "N31_14_15_E121_28_30"

  从图片中抽出隐藏文本（玩家侧）：
    python tools/stego.py extract <隐写图>

依赖：pip install pillow

说明：
  - 仅支持无损格式作为载体（PNG），JPEG 有损压缩会破坏 LSB。
  - 消息以 MAGIC 头 + 4 字节大端长度 + UTF-8 正文写入。
  - 硬核度：玩家需要自己想到"读最低有效位"，必要时在社交动态里只给一句
    「光里有余音」作提示，其余完全不下发。
"""

import argparse
import struct
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("缺少依赖 Pillow，请先执行：pip install pillow")

MAGIC = b"MSSTEG"  # 隐写标记头：Make Studio Steganography


def _to_bits(data: bytes) -> list:
    bits = []
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits


def embed(in_path: str, out_path: str, message: str) -> None:
    payload = MAGIC + struct.pack(">I", len(message.encode("utf-8"))) + message.encode("utf-8")
    bits = _to_bits(payload)

    img = Image.open(in_path).convert("RGB")
    w, h = img.size
    capacity = w * h * 3
    if len(bits) > capacity:
        raise ValueError(f"消息过长：需要 {len(bits)} 位，图片仅能承载 {capacity} 位")

    pixels = img.load()
    idx = 0
    done = False
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if idx < len(bits):
                r = (r & 0xFE) | bits[idx]; idx += 1
            if idx < len(bits):
                g = (g & 0xFE) | bits[idx]; idx += 1
            if idx < len(bits):
                b = (b & 0xFE) | bits[idx]; idx += 1
            pixels[x, y] = (r, g, b)
            if idx >= len(bits):
                done = True
                break
        if done:
            break

    img.save(out_path)
    print(f"OK：已写入 {len(bits)} 位 -> {out_path}")


def _read_bits(pixels, w, h, count):
    bits = []
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            bits.append(r & 1)
            bits.append(g & 1)
            bits.append(b & 1)
            if len(bits) >= count:
                return bits
    return bits


def _bits_to_bytes(bits: list, n: int) -> bytes:
    out = bytearray()
    for i in range(0, n * 8, 8):
        byte = 0
        for j in range(8):
            byte = (byte << 1) | bits[i + j]
        out.append(byte)
    return bytes(out)


def extract(in_path: str) -> None:
    img = Image.open(in_path).convert("RGB")
    w, h = img.size

    # 先读头部（MAGIC + 4 字节长度）确定正文长度
    head_len = len(MAGIC) + 4
    head_bits = _read_bits(img.load(), w, h, head_len * 8)
    head = _bits_to_bytes(head_bits, head_len)

    if head[: len(MAGIC)] != MAGIC:
        raise ValueError("未找到隐写标记（MSSTEG），这张图可能没有藏内容")

    length = struct.unpack(">I", head[len(MAGIC):])[0]
    body_len = len(MAGIC) + 4 + length
    body_bits = _read_bits(img.load(), w, h, body_len * 8)
    body = _bits_to_bytes(body_bits, body_len)

    print(body[len(MAGIC) + 4:].decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="MAKE STUDIO ARG 图像 LSB 隐写工具")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_embed = sub.add_parser("embed", help="把文本藏进图片")
    p_embed.add_argument("in_path")
    p_embed.add_argument("out_path")
    p_embed.add_argument("-m", "--message", required=True, help="要隐藏的文本")

    p_extract = sub.add_parser("extract", help="从图片抽出隐藏文本")
    p_extract.add_argument("in_path")

    args = parser.parse_args()

    if args.cmd == "embed":
        embed(args.in_path, args.out_path, args.message)
    elif args.cmd == "extract":
        extract(args.in_path)


if __name__ == "__main__":
    main()