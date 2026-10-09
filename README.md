# MAKE STUDIO // 工作室

MAKE STUDIO 音乐工作室官方网站。纯 HTML + CSS + JS，零框架、零构建，GitHub Pages 直接托管。

当前版本：**v5.0.0**（录像带）

## 风格：一盘录像带

整个官网是一盘工作室的录像带，和《谎话》MV、发布倒数页是同一个世界：黑底、冷蓝、只有一点红。

- **取景框**：四个角固定在屏幕上；左上 `● REC MAKE STUDIO TAPE 00`（章节号跟着翻页变）；左下走带状态，往下翻得快是 `▶▶ FF`、往上翻是 `◀◀ REW`、翻到底是 `■ STOP`；右下时间码跟着滚动位置走
- **开场**：每次打开先闪一下录像机蓝屏 `PLAY ▶`（同一次浏览只放一次）
- **首页**：雨夜玻璃上的失焦光斑 + 斜雨（canvas，12 帧/秒抽帧，划走就暂停）；`MAKE STUDIO` 偶尔跟踪错位；右下角摄像机日期戳就是实时时钟
- **下一盘带**：首页底部《谎话》MV 倒数条，点进发布倒数页；2026-10-17 00:00（香港时间）后自动变成 `OUT NOW`
- **01 宣言**：每行像 MV 里的证词一样从过曝发虚显影出来，首字母 M A K E 是红的
- **02 作品**：每首歌 / MV 是一盘带子，鼠标移上去有一道跟踪噪声扫过；歌在底部小卡座里放，MV 在 B 站弹窗里放（CRT 开机效果）
- **03 历程**：剪辑软件式时间线，标记按真实日期摆放，红色播放头停在今天
- **04 器材**：证物标签 EXHIBIT A / B / C
- **05 成员**：片尾字幕
- **06 联系**：带子背面的"拾到请寄回"标签，点一行复制
- **07 留言**：答录机（Waline 免登录留言板），打字时亮 `● REC`
- **NIGHT / DAY**：摄像机模式切换（白天是褪色、过曝的暖白），记在 `localStorage`
- **减少动态效果**：系统开了的话，所有动画、开场蓝屏、雨都停
- **更新日志 / 成就**：录像机蓝色屏幕菜单；彩蛋全部保留（收信终端、版本号入侵、Konami、潜伏、时间旅人、署名之后）

## 作品

| 曲目 | 类型 | 时长 | 播放方式 |
| --- | --- | --- | --- |
| 灰烬 | SINGLE | 02:17 | 站内小卡座（本地 mp3，网易云流兜底） |
| 枷锁 | SINGLE | 03:09 | 站内小卡座（本地 mp3，网易云流兜底） |
| 无解 | MV | 03:11 | 站内 B 站弹窗 |
| FLY | MV | 01:34 | 站内 B 站弹窗 |

## 快速开始

```bash
# 克隆后进入目录，起一个本地静态服务（推荐）
python -m http.server 8765
# 访问 http://localhost:8765
```

直接双击 `index.html` 也能打开，但评论区与部分第三方资源在 `file://` 协议下会受限，推荐使用本地服务器。

## 目录结构

```
.
├── index.html                        # 页面结构
├── css/
│   ├── fonts.css                     # 自托管字体子集（tools/subset_fonts.py 生成）
│   ├── base.css                      # 配色、取景框、扫描线、出现动画、章节标题
│   ├── sections.css                  # 导航、首页、各章节
│   └── ui.css                        # 复制提示、播放卡座、视频弹窗、更新日志 / 成就菜单、收信终端
├── js/
│   ├── site.js                       # 开场、NIGHT/DAY、日期戳、走带（时间码 / FF / REW / STOP）、出现动画、复制、下一盘带、时间线
│   ├── rain.js                       # 首页雨夜背景
│   ├── player.js                     # 站内音乐卡座 + B 站视频弹窗
│   ├── achievements.js               # 成就（存档键名沿用旧版）
│   ├── changelog.js                  # 更新日志 + 版本号入侵彩蛋
│   ├── mail.js                       # 隐藏收信终端
│   └── comments.js                   # Waline 留言板
├── html/
│   └── render.html / render.js       # 《谎话》MV 发布倒数页：倒数到 2026-10-17 00:00（香港时间），到点闪回一次 MV 后显示 Stand by.（?demo 试看）
├── api/
│   └── signal.js                     # 邮件回信函数（Vercel Function + Resend，可选）
├── tools/
│   ├── subset_fonts.py               # 重新生成字体子集：改了页面文字后运行 python3 tools/subset_fonts.py
│   └── stego.py                      # 图像 LSB 隐写工具（Python，可选）
├── assets/
│   ├── fonts/tape-*.woff2            # 首页字体子集（Anton / Space Mono / Silkscreen / 思源黑体 / 思源宋体）
│   ├── fonts/render-*.woff2          # 发布倒数页字体子集
│   ├── cover-huijin.jpg / cover-jiasuo.jpg / cover-wujie.jpg / cover-fly.jpg   # 作品封面
│   ├── huijin.mp3 / jiasuo.mp3       # 歌曲音频
│   ├── countdown-beat.mp3            # 发布倒数页背景音乐（Web Audio 无缝循环）
│   ├── logo-share.png                # 分享卡片图（1200×630，录像带风格）
│   ├── arg-teaser.jpg
│   └── render/fb-N.jpg               # 发布倒数页的 MV 闪回画面（6 张，960×540）
```

旧版（v4 及以前，单文件 + 粒子背景）可以在 git 历史里找到，网站上不再保留备份文件。

## 技术栈

- 原生 HTML / CSS / JavaScript，无任何框架与构建步骤
- 音频：HTML5 Audio，本地 mp3 优先，网易云外链流兜底；倒计时页改用 Web Audio（无缝循环 + Cache API 缓存）
- 字体：本地自托管 `woff2` 子集（只含页面上用到的字，由 `tools/subset_fonts.py` 从 Google Fonts 生成；字体零外链）
- 视频：B 站播放器 iframe（[player.bilibili.com/player.html](https://player.bilibili.com/player.html)）
- 评论区：[Waline](https://waline.js.org)（后端部署于 Vercel）

## 彩蛋

站点内置多处彩蛋，可公开说明的如下，其余（含隐藏彩蛋）的触发方式不予公开：

| 彩蛋 | 触发方式 | 重置方法 |
| --- | --- | --- |
| 版本详情入侵警告 | 打开更新日志弹窗 2 秒后 | `localStorage.removeItem('make-studio-hack')` |

## 成就

页脚「成就」入口可查看成就总览与进度（录像机蓝色屏幕菜单）；发现任意彩蛋都会在左上角弹出屏幕菜单式的解锁提示。

| 成就 | 解锁条件 |
| --- | --- |
| 从头到尾 | 听完整站每一首歌 |
| 明暗之间 | 切换 NIGHT / DAY 10 次 |
| ???（隐藏） | ??? |

除上表外，站点还有若干隐藏成就与活动相关成就，解锁前以 `???` 代名、解锁方法不公开；解锁后即显示真实名称与说明。全部进度（含完成数、解锁状态与时间）保存于 `localStorage.make-studio-achievements`；如需重置，执行：

```js
localStorage.removeItem('make-studio-achievements')
```

## 常见问题

- **音乐加载失败**：默认播放 `assets/` 下的本地 mp3，只要文件随仓库部署就不会失效；仅在本地文件缺失时才尝试网易云外链（有签名时效）。如需换歌，替换 `js/player.js` 中 `PLAYLIST` 数组的 `srcs` 即可。
- **评论打不开**：评论区后端部署于 Vercel，国内网络环境偶尔超时，属服务端可达性问题。
- **切歌有短暂中止请求**：控制台出现的 `ERR_ABORTED` 是音频流切换的正常现象，不影响播放。

## 许可

项目尚未指定开源协议，源码仅供学习交流使用。作品（音乐 / 视频）版权归 MAKE STUDIO 所有。