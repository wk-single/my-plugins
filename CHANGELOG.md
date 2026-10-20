# Changelog

本文件记录各插件的所有重要变更。格式基于
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [startup-splash 2.1.1] - 2026-10-20

### Fixed

- 桌面端不消费 `webServer.tapIndex`：改为通过 `webserver/index-inject` 的启动注入绘制预启动层，`dsh-app://` 页面与浏览器 index 都会生效。
- 预启动层与 React splash 的标记、样式相互独立，避免作用域冲突。

### Changed

- 版本号更新为 2.1.1（HUD 与预启动层同步显示）。

## [startup-splash 2.1.0] - 2026-10-20

### Added

- 预启动层：Host 半侧通过 `webServer.tapIndex` 把同一套深空画面注入 `index.html`，窗口第一帧就是启动动画，不再先闪白色「Loading plugins...」。
- 预启动层记录起始时间，客户端 splash 接班后沿用同一条时间线（百分比、阶段、画布进度连续），并跳过入场动画。
- 预启动层在真实 splash 挂载后自动移除，另有 15 秒安全兜底。

### Changed

- `index.js` 从空 `apply` 变为注册 index tap。
- 版本号更新为 2.1.0（HUD 与预启动层同步显示）。

## [startup-splash 2.0.0] - 2026-10-20

### Added

- 全新「Hyperdrive」启动序列：约 300–420 条曲速拖尾、隧道环、退场粒子爆发与多重冲击波。
- 巨型两行字标（DEEPSEEK / HARNESS），带 RGB 错位故障闪烁、横向与纵向镜头光斑。
- HUD 扩展：时间码、节点哈希、相位、版本号（v2.0.0）、四角取景框与纵向侧标。
- 进度条增加平台段与刻度，启动阶段扩展为 5 段文案。

### Changed

- 背景改为与主题无关的固定深空配色，浅色主题下不再被冲淡。
- 退场改为先爆闪 + 冲击波、再延迟淡出，卸载前保留完整打击感。
- HUD 与侧标显示版本号，便于确认当前实际加载的版本。
- 字标改为纯 CSS 入场与故障闪烁，移除逐字乱码定时器。

### Removed

- 对 `--dsw-alias-*` 主题变量的依赖与对应的明暗主题适配。

## [startup-splash 1.3.0] - 2026-10-20

### Changed

- 重做为全屏“超空间启动”序列：曲速星场、极光色场、旋转光束、全屏扩散环与 HUD 边框。
- 中心改为能量核心、乱码解码字标与实时启动读数。
- 渲染改为单一 Canvas 线段绘制 + CSS 合成动画，移除大开销滤镜。

### Removed

- 3D 低多边形鲸鱼徽记及其逐面光照、深度排序与 `drop-shadow` 滤镜，修复卡顿。

## [startup-splash 1.2.0] - 2026-10-19

### Added

- 低多边形 3D 鲸鱼徽记、粒子汇聚、声呐环、HUD 边框与退场爆闪。

## [startup-splash 1.1.0] - 2026-10-19

### Added

- 全屏粒子场、陀螺仪光环、乱码解码字标、启动读数与进度条。

## [startup-splash 1.0.0] - 2026-10-19

### Added

- 首个版本：全屏启动动画，注册于 `shell.overlay`，支持点击/`Esc` 跳过、明暗主题与中英文案。
