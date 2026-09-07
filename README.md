# MAKE STUDIO // 工作室

MAKE STUDIO 音乐工作室官方网站。一个单文件、零框架、零构建的轻量站点，纯 HTML + CSS + JS 实现，打开即用。

当前版本：**v3.5.0**

## 特性

- **双主题**：深色（默认）/ 浅色一键切换，首次访问跟随系统偏好，选择记忆在 `localStorage`
- **动态背景**：粒子画布 + 极光光斑 + 网格 + 暗角，滚动与主题切换全程平滑
- **站内音乐播放**：底部迷你播放条，本地 mp3 播放《灰烬》《枷锁》（网易云流作兜底）；
  支持进度条拖动、上一首/下一首、单曲循环、专辑封面旋转、加载失败兜底跳转
- **站内视频播放**：内嵌 B 站播放器弹窗，站内观看《无解》《FLY》MV，支持全屏与键盘关闭
- **更新日志**：页脚版本号进入 CHANGELOG 终端风格弹窗
- **粉丝社区**：QQ 粉丝群入口 + Waline 免登录留言板
- **响应式**：桌面 / 移动端均有独立适配，触摸设备进度条滑动优化
- **移动端体验**：汉堡抽屉导航，移动端自动跳过粒子连线以降低 CPU 开销
- **工业质感**：金属纹理 + 噪点 / 拉丝层 + LED 状态灯，统一卡片式模块语言
- **历程时间线**：工作室大事记时间线区块（TIMELINE）
- **设备器材**：宿主 / 麦克风 / 监听设备清单区块（STUDIO GEAR）
- **隐藏来信**：连点左上角 LOGO 5 次，唤起 MS-DOS 终端，通过 Formspree 直接给工作室发私信（开源自带开机自检动画与音效）
- **成就系统**：发现彩蛋即可解锁太空机台风格成就，含隐藏成就（以 `???` 代名），完成数与进度保存在 `localStorage`
- **无障碍**：播放器 / 弹窗带 ARIA 标注，支持 Escape 与焦点管理

## 作品

| 曲目 | 类型 | 时长 | 播放方式 |
| --- | --- | --- | --- |
| 灰烬 | SINGLE | 02:17 | 站内播放条（网易云流） |
| 枷锁 | SINGLE | 03:09 | 站内播放条（网易云流） |
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
├── index.html                        # 主站点（全部样式与逻辑内置，含 ARG 终局层）
├── index.backup.html                 # 删除 CRT 彩蛋/成就前的备份，供回滚参考
├── signal.html                       # ARG 第 0 号节点（噪点图 → 频率 + 邮箱）
├── make-studio-decrypt-backup.html   # 历史活动解密版本备份
├── api/
│   └── signal.js                     # ARG 第二幕：邮件自动回信（Vercel Function + Resend）
├── tools/
│   └── stego.py                      # ARG 第三幕：图像 LSB 隐写工具（Python）
├── assets/
│   ├── cover-huijin.jpg              # 《灰烬》封面
│   ├── cover-jiasuo.jpg              # 《枷锁》封面
│   ├── huijin.mp3                    # 《灰烬》音频
│   └── jiasuo.mp3                    # 《枷锁》音频
└── README.md
```

## 技术栈

- 原生 HTML / CSS / JavaScript，无任何框架与构建步骤
- 音频：HTML5 Audio，本地 mp3 优先，网易云外链流兜底
- 视频：B 站播放器 iframe（[player.bilibili.com/player.html](https://player.bilibili.com/player.html)）
- 评论区：[Waline](https://waline.js.org)（后端部署于 Vercel）

## 彩蛋

站点内置多处彩蛋，明面上两处可随时触发，其余隐藏彩蛋的触发方式不予公开（解锁后对应的隐藏成就才会揭晓）：

| 彩蛋 | 触发方式 | 重置方法 |
| --- | --- | --- |
| 版本详情入侵警告 | 打开更新日志弹窗 2 秒后 | `localStorage.removeItem('make-studio-hack')` |
| 隐藏来信（MS-DOS 终端） | 连续点击左上角 LOGO 5 次 | 无需重置，随时触发 |

## 成就

页脚 `ACHIEVEMENTS` 入口可查看成就总览与进度；发现任意彩蛋都会弹出终端风格解锁提示（渐隐渐显）。

| 成就 | 解锁条件 |
| --- | --- |
| 老机器的秘密 | 发现隐藏的收信终端（连点 LOGO 5 次） |
| 系统入侵 | 在更新日志里窥见被拦截的信号 |
| 从头到尾 | 听完整站每一首歌 |
| 明暗之间 | 切换主题 10 次 |
| 信号接收者 | 从一片噪声里读出那串频率（ARG 节点） |
| 电波猎手 | 向电台发信并等到了回音（ARG 节点） |
| ???（隐藏） | ??? |
| ???（隐藏） | ??? |
| ???（隐藏） | ??? |
| ???（隐藏） | ??? |
| ???（隐藏） | ??? |
| ???（隐藏） | ??? |

隐藏成就共 6 个，解锁前以 `???` 代名、解锁方法不公开；解锁后即显示真实名称与说明。全部进度（含完成数、解锁状态与时间）保存于 `localStorage.make-studio-achievements`；如需重置，执行：

```js
localStorage.removeItem('make-studio-achievements')
```

## ARG · 「第五首歌」全链路骨架

围绕"第五首歌"这条隐藏叙事线的跨平台替代现实游戏（MVP 骨架）。整条链路已打通，但结局（开歌）默认锁定，需要你在发歌时手动开启。

### 节点链路

| 节点 | 平台/载体 | 玩家动作 | 产出的线索 | 对应成就 |
| --- | --- | --- | --- | --- |
| 0 | 官网更新日志 | 打开 CHANGELOG，读一段十六进制 | 解码得 `/signal` | 系统入侵 |
| 1 | `signal.html` | 分离噪点图红色通道 | `88.7 MHz` + 邮箱 `noise@make-studio.example` | 信号接收者 |
| 2 | 邮件 | 给电台邮箱发任意主题信件 | 自动回信指向社交媒体隐写图 | 电波猎手 |
| 3 | 微博 / B站动态 | 下载图片，抽 LSB 隐藏文本 | 得到坐标/密文 | 隐写术士（隐藏） |
| 4 | 官网 `#final` 终局 | 输入沿途拼出的密钥 | 解锁第五首歌 | 终局之声（隐藏） |

### 怎么启用结局（发歌前必做）

打开 `index.html`，找到 `ARG 终局` 脚本里的 `CFG` 配置：

```js
var CFG = {
  open: false,      // 改成 true 立即开放（或下面二选一）
  openAt: 0,        // 或填到期毫秒时间戳，到期自动开放
  answerHash: '…',  // 替换成真实密钥的 SHA-256（明文别写进源码）
  unlockKey: 'make-studio-arg-final'
};
```

- 未开启时，进入 `#final` 显示「STANDBY · 请等待更新」。
- 开启后可输入密钥，命中 `answerHash` 即解锁并把 `arg_final` 成就点亮。
- `answerHash` 的生成方式：`echo -n '你的密钥明文' | sha256sum`（答案固定即可，先别写进源码）。

### 怎么接邮件自动回信

1. 在 Resend 验证真实域名，把 `noise@...` 配到发信/收信地址，并把 Inbound Webhook 指向 `/api/signal.js`。
2. 设置环境变量 `RESEND_API_KEY`、`SIGNAL_WEBHOOK_SECRET`、`ARG_SOCIAL_URL`、`ARG_SOCIAL_HINT`。
3. 生产环境务必改掉 `api/signal.js` 里的占位邮箱 `make-studio.example` 与签名校验占位（见文件内 TODO）。

### 怎么生成隐写图

```bash
# 把坐标藏进一张普通 PNG（发布到社交媒体）
python tools/stego.py embed 原图.png 隐写图.png -m "N31_14_15_E121_28_30"

# 玩家侧抽出隐藏文本
python tools/stego.py extract 隐写图.png
```

载体内必须是无损 PNG，JPEG 会破坏 LSB。提示只给"光里有余音"，其余不下发，保持硬核。

## 常见问题

- **音乐加载失败**：默认播放 `assets/` 下的本地 mp3，只要文件随仓库部署就不会失效；仅在本地文件缺失时才尝试网易云外链（有签名时效）。如需换歌，替换 `index.html` 中 `PLAYLIST` 数组的 `srcs` 即可。
- **评论打不开**：评论区后端部署于 Vercel，国内网络环境偶尔超时，属服务端可达性问题。
- **切歌有短暂中止请求**：控制台出现的 `ERR_ABORTED` 是音频流切换的正常现象，不影响播放。

## 许可

项目尚未指定开源协议，源码仅供学习交流使用。作品（音乐 / 视频）版权归 MAKE STUDIO 所有。