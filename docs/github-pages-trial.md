# GitHub Pages Trial Mode

## 目标

- 公开前台继续使用 `GitHub Pages`
- 本地主机负责低频数据整理和自动推送
- 尽量减少人工干预

## 当前发布模式

- `main` 分支是公开站点源码
- 推送到 `main` 会触发 GitHub Pages 发布
- 结构化内容都在 `data/` 目录中维护

## 数据维护流程

### 1. 整理数据

所有站点内容优先维护在这些文件：

- `data/artists.json`
- `data/events.json`
- `data/guides.json`
- `data/community.json`
- `data/source-registry.json`

### 2. 探测来源状态

运行：

```bash
pnpm sync:sources
```

这个脚本会：

- 对已登记的官方艺人页、票务页、场馆页做低频探测
- 记录 `status / etag / last-modified / finalUrl / checkedAt`
- 输出到 `data/source-status.json`
- 将 `401/403` 这类受限站点标记为 `restricted`，而不是直接判定来源失效

### 3. 自动校验

运行：

```bash
pnpm prepare:pages
```

这个脚本会：

- 检查 slug 是否重复
- 检查 URL 是否是合法的 `http/https`
- 检查活动来源是否已经登记进来源表
- 对艺人、活动、指南做排序
- 更新 `data/site-meta.json` 的生成时间、统计信息和来源健康摘要

### 4. 自动推送发布

运行：

```bash
pnpm refresh:pages
```

这个脚本会：

- `git pull --ff-only origin main`
- 安装依赖
- 执行 `sync:sources`
- 执行 `prepare:pages`
- 本地 `pnpm build`
- 如果有内容变化则自动提交并推送到 `main`

## 建议的本地主机定时任务

每天一次已经足够：

```cron
17 6 * * * cd /Users/neoshi/kpop-events && /bin/bash -lc 'pnpm refresh:pages >> /Users/neoshi/kpop-events/.logs/pages-refresh.log 2>&1'
```

建议额外准备：

- Git 凭证免交互
- `.logs/` 目录
- 失败通知方式，例如邮件或 Telegram

## 适合自动做的事

- 来源探测
- 数据格式校验
- 静态文件排序和生成时间更新
- 自动构建
- 自动推送并触发 Pages 发布

## 仍建议人工把关的事

- 新活动是否真的来自官方或可信主办方
- 票务链接是否应该公开展示
- 场馆经验类指南是否存在明显误导
- 艺人覆盖优先级是否需要调整

## 试运行阶段的边界

当前模式适合：

- 少量真实用户访问
- 内容站点式试运行
- 本地收藏
- 社区精选和投稿入口

当前模式不适合：

- 真实登录系统
- 评论发帖写入
- 跨设备同步收藏
- 高实时性数据流
