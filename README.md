# MAKE STUDIO // 工作室

MAKE STUDIO 音乐工作室官方网站。一个单文件、零框架、零构建的轻量站点，纯 HTML + CSS + JS 实现，打开即用。

当前版本：**v4.0.0**

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
- **成就系统**：发现彩蛋即可解锁太空机台风格成就，含隐藏成就（以 `???` 代名），完成数与进度保存在 `localStorage`
- **解密终端**：页脚 `terminal.` 入口进入 MS-DOS 风格终端，输入 `decode` 进入 LSB 隐写解码页（`lsb.html`）
- **LSB 隐写解码**：纯浏览器本地解码，上传图片即可从像素最低位抽出隐藏信息，数据不上传
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
├── index.html                        # 主站点（全部样式与逻辑内置）
├── index.backup.html                 # 删除 CRT 彩蛋/成就前的备份，供回滚参考
├── make-studio-decrypt-backup.html   # 历史活动解密版本备份
├── lsb.html                          # LSB 隐写解码页（MS-DOS 风格）
├── final.html                        # 终局解密页（MS-DOS 风格）
├── signal.html                       # 预留节点页（当前未开放）
├── api/
│   └── signal.js                     # 邮件回信函数（Vercel Function + Resend，可选）
├── tools/
│   └── stego.py                      # 图像 LSB 隐写工具（Python，可选）
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

站点内置多处彩蛋，可公开说明的如下，其余（含隐藏彩蛋）的触发方式不予公开：

| 彩蛋 | 触发方式 | 重置方法 |
| --- | --- | --- |
| 版本详情入侵警告 | 打开更新日志弹窗 2 秒后 | `localStorage.removeItem('make-studio-hack')` |

## 成就

页脚 `ACHIEVEMENTS` 入口可查看成就总览与进度；发现任意彩蛋都会弹出终端风格解锁提示（渐隐渐显）。

| 成就 | 解锁条件 |
| --- | --- |
| 从头到尾 | 听完整站每一首歌 |
| 明暗之间 | 切换主题 10 次 |
| ???（隐藏） | ??? |

除上表外，站点还有若干隐藏成就与活动相关成就，解锁前以 `???` 代名、解锁方法不公开；解锁后即显示真实名称与说明。全部进度（含完成数、解锁状态与时间）保存于 `localStorage.make-studio-achievements`；如需重置，执行：

```js
localStorage.removeItem('make-studio-achievements')
```

## 常见问题

- **音乐加载失败**：默认播放 `assets/` 下的本地 mp3，只要文件随仓库部署就不会失效；仅在本地文件缺失时才尝试网易云外链（有签名时效）。如需换歌，替换 `index.html` 中 `PLAYLIST` 数组的 `srcs` 即可。
- **评论打不开**：评论区后端部署于 Vercel，国内网络环境偶尔超时，属服务端可达性问题。
- **切歌有短暂中止请求**：控制台出现的 `ERR_ABORTED` 是音频流切换的正常现象，不影响播放。

## 许可

项目尚未指定开源协议，源码仅供学习交流使用。作品（音乐 / 视频）版权归 MAKE STUDIO 所有。