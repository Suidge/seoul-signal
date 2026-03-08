# Seoul Signal

面向中文用户的 K-pop 全球巡演、场馆指南与 fandom 内容试运行站。

当前策略不是先做重后台，而是先用 `GitHub Pages` 跑出一个可持续维护的公开前台：

- 覆盖主流艺人页
- 维护一批真实可读的巡演卡片
- 做厚中文指南内容
- 用本地主机低频自动整理数据并推送发布

## 当前能力

- 巡演日历、活动详情、艺人页、指南页、社区精选页
- 浏览器本地收藏
- 结构化静态数据：`artists / events / guides / community / sources`
- 官方来源健康检查与最近更新时间展示
- GitHub Pages 自动发布
- 本地主机可每日运行的数据校验与发布脚本

## 技术栈

- `Next.js App Router`
- `TypeScript`
- `GitHub Pages`
- `JSON data files + local automation scripts`

## 目录说明

- [data/artists.json](/Users/neoshi/kpop-events/data/artists.json)
- [data/events.json](/Users/neoshi/kpop-events/data/events.json)
- [data/guides.json](/Users/neoshi/kpop-events/data/guides.json)
- [data/community.json](/Users/neoshi/kpop-events/data/community.json)
- [data/source-registry.json](/Users/neoshi/kpop-events/data/source-registry.json)
- [data/source-status.json](/Users/neoshi/kpop-events/data/source-status.json)
- [lib/site-data.ts](/Users/neoshi/kpop-events/lib/site-data.ts)
- [scripts/sync-source-health.mjs](/Users/neoshi/kpop-events/scripts/sync-source-health.mjs)
- [scripts/prepare-pages-data.mjs](/Users/neoshi/kpop-events/scripts/prepare-pages-data.mjs)
- [scripts/export-pages.mjs](/Users/neoshi/kpop-events/scripts/export-pages.mjs)
- [scripts/run-pages-refresh.sh](/Users/neoshi/kpop-events/scripts/run-pages-refresh.sh)
- [docs/github-pages-trial.md](/Users/neoshi/kpop-events/docs/github-pages-trial.md)

## 本地开发

```bash
pnpm install
pnpm dev
```

## 发布前校验

```bash
pnpm sync:sources
pnpm prepare:pages
pnpm typecheck
pnpm build
```

## GitHub Pages 发布

主仓库已配置工作流：

- [deploy-pages.yml](/Users/neoshi/kpop-events/.github/workflows/deploy-pages.yml)

推送到 `main` 后会自动：

1. 校验并整理静态数据
2. 构建 Next.js 静态站
3. 发布到 GitHub Pages

## 本地主机自动维护

如果你有一台 24 小时开机的本地主机，可以让它每天自动执行：

```bash
cd /Users/neoshi/kpop-events
pnpm refresh:pages
```

该脚本会：

1. 拉取主分支
2. 检查官方来源是否可达或受限
3. 校验并重写结构化数据
4. 本地构建站点
5. 如果有内容变化则自动提交并推送
6. 触发 GitHub Pages 自动发布

详细说明见：

- [docs/github-pages-trial.md](/Users/neoshi/kpop-events/docs/github-pages-trial.md)

## 关于动态版

仓库仍保留 Prisma 相关依赖和 schema，用于未来回到全栈部署时继续扩展账号、收藏同步、评论和社区功能；当前试运行版不启用这些服务端能力。
