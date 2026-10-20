# Startup Splash — DeepSeek Harness 启动动画

一个 Harness Web 界面插件：页面每次启动时先播放一段铺满整个视口的「Hyperdrive」启动序列，约 3 秒后爆闪淡出，把界面交还给应用。

## 效果

整屏都在动，不再是中间一小块：

1. **曲速隧道**：全屏 Canvas 上 300–420 条从中心向外加速的拖尾光线，越靠外越长越亮，最后 1 秒进入跃迁加速；叠加隧道环与环绕粒子。
2. **极光与光束**：三团巨大的蓝 / 紫 / 青色场在四角漂移，锥形光束缓慢旋转，`screen` 混合叠在星场上。
3. **镜头光斑**：一条横向变形宽银幕光带与一条纵向光柱，在标题后方扫过。
4. **巨型字标**：两行 `DEEPSEEK` / `HARNESS`（实心渐变 + 描边），带 RGB 错位故障闪烁与强投影。
5. **HUD**：四角取景框、上下分隔线、时间码、节点哈希、相位、版本号（v2.0.0）与左右纵向侧标。
6. **启动读数**：五个阶段文案 + 百分比 + 带刻度与发光头部的进度条。
7. **退场**：约 3.05 秒时白闪 + 三道冲击波 + 150 颗粒子爆散 + 画面放大，随后淡出卸载。

- 点击任意位置、点击「Click / Esc to skip」或按 `Esc` 可立即跳过。
- 跟随系统「减少动态效果」：动画缩短、星场静止、约 1.4 秒后淡出。
- 背景为固定的深空配色，**不随明暗主题变淡**，浅色界面下同样是黑底霓虹效果。
- 文案通过 Harness 语言服务提供英文与简体中文两套。

## 技术说明

- 只有**一个** Canvas，每帧画普通线段与圆点，没有 `shadowBlur`、逐粒子渐变或 3D 排序；
- CSS 层只做 `transform` / `opacity` 动画，交给合成器；
- 星场按视口面积自适应数量，窗口缩放时重建；
- 所有样式、`requestAnimationFrame` 与定时器由组件生命周期持有，卸载即清理；
- 版本号 `2.0.0` 同时出现在 HUD 左上角与侧标，便于确认实际加载的版本。

## 安装

在 DeepSeek Harness 中以**本地 bundle 目录**安装本包：

```text
<repo>/packages/startup-splash
```

安装后注册在 `shell.overlay`（框架级浮层，`order: 1000`），显示期间会暂时挡住应用交互，淡出后完全卸载。

## 文件

| 文件 | 作用 |
|---|---|
| `package.json` | 包清单：`dsh.bundle.patch`、`dsh.client`（`immediately: true`）、导出与图标 |
| `cordis.patch.yml` | Loader 行：插入 `startup-splash` 条目 |
| `index.js` | Host 半侧：仅提供加载行，无 Host 服务 |
| `client.js` | Client 半侧：`shell.overlay` 注册、Canvas 隧道、光效层与全部动画 |
| `locale/en.json`、`locale/zh.json` | 插件管理器显示标题/描述 |
| `icon.svg` | 插件图标 |

## 卸载

在设置 → 插件中禁用或移除 `Startup Splash` 即可。