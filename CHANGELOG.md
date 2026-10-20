# Changelog

本文件记录各插件的所有重要变更。格式基于
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

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
