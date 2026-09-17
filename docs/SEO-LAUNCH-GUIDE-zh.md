# 学术个人网站 SEO、发布与曝光增长指南

这套方案适用于使用本模板搭建个人网站的学生和研究人员。目标不是追求无关流量，而是让潜在导师、合作者、同行和希望搭建个人网站的读者更容易发现并理解你的工作。

## 1. 明确受众和转化目标

优先服务四类访客：

1. 寻找研究方向与合作者的学者；
2. 查看履历、论文和技能的导师或招聘者；
3. 搜索具体研究主题的学生和同行；
4. 搜索“学术个人网站模板”或“GitHub Pages 个人主页教程”的建站者。

首页的主要转化是查看论文、下载 CV 或访问 Scholar；GitHub 仓库的主要转化是打开在线示例、点击 **Use this template**、Star 或引用项目。

## 2. 技术 SEO 基线

发布前确认：

- **_config.yml** 中的 url、repository、姓名和描述均属于当前使用者；
- 每个可索引页面都有独立的 title 和 description；
- canonical 地址指向正式域名；
- **robots.txt** 允许抓取并指向 **sitemap.xml**；
- Open Graph 和 Twitter Card 使用 1200 × 630 的清晰封面；
- Person 和 WebSite 结构化数据中的姓名、职位、单位和个人链接正确；
- 图片具有描述性 alt 文本；
- 页面在手机与桌面端均可正常使用；
- 生产构建成功。

## 3. 接入 Google Search Console

1. 打开 [Google Search Console](https://search.google.com/search-console/)。
2. 添加网址前缀资源，例如 https://YOUR-USERNAME.github.io/。
3. 选择 HTML 标签验证，把标签中的验证码填入 **_config.yml** 的 google_site_verification 字段。
4. 发布后完成验证。
5. 在 **Sitemaps** 提交 sitemap.xml。
6. 使用 **URL inspection** 检查首页，并在重要更新后请求重新编入索引。

Search Console 用来查看搜索关键词、曝光、点击、排名和索引问题；GA4 用来查看用户进入网站后的浏览行为。两者用途不同，建议同时保留。

## 4. GitHub 仓库发现优化

- 使用能说明价值的仓库简介，并填写在线网站地址；
- 开启 GitHub Template；
- 添加准确 Topics，例如 academic-website、jekyll、github-pages、portfolio、research；
- README 首屏展示真实截图、在线 Demo 和 **Use this template**；
- 用中英文教程降低首次使用成本；
- 在 Release 中记录重要版本和新功能；
- 对用户问题使用 GitHub Issues，积累可被搜索的真实问答。

不要堆砌与项目无关的 Topics 或关键词。准确的标签更容易带来真正会使用模板的访客。

## 5. 可持续内容策略

建议围绕两个内容集群持续更新。

### 研究内容

- 论文发表后的通俗摘要；
- 研究方法或数据流程说明；
- 会议报告、海报和公开材料；
- PFAS、暴露组学、空气污染、生命历程流行病学等主题的学习笔记。

### 建站教学

- 如何用 GitHub Pages 免费搭建学术主页；
- 如何连接 Google Scholar 并每周更新；
- 如何设计双语学术网站；
- 如何展示跨地区研究项目；
- 如何配置 GA4 与 Search Console。

每篇内容只解决一个清晰问题，并自然链接到主页、论文、教程和 GitHub 模板。

## 6. 发布节奏

### 发布当天

- 检查网站、README、模板按钮和所有外部链接；
- 提交 sitemap 并请求索引；
- 创建一个带截图、功能清单和教程链接的 GitHub Release；
- 在 LinkedIn、学校或实验室渠道发布一次完整介绍。

### 前四周

- 第 1 周：发布“为什么以及如何制作这个网站”；
- 第 2 周：发布 Scholar 自动更新教程；
- 第 3 周：发布交互式研究地图设计说明；
- 第 4 周：整理常见问题并更新 README。

### 长期

- 每月至少发布一条有独立价值的研究或教程内容；
- 论文、会议和履历变化时同步更新网站；
- 每季度检查失效链接、Search Console 覆盖问题和最常被搜索的页面。

## 7. 分享文案模板

### 中文

> 我把自己的双语学术主页整理成了一个可复用的开源模板，支持 GitHub Pages、Google Scholar 每周更新、交互式研究地图和中英文切换。仓库附有从创建账号到部署上线的完整教程，欢迎试用、反馈或分享给需要搭建个人网站的同学。

### English

> I turned my bilingual academic website into an open-source template for students and researchers. It includes GitHub Pages deployment, weekly Google Scholar updates, an interactive research globe, bilingual content, and step-by-step setup guides. Feedback and contributions are welcome.

分享时同时提供：一张清晰截图、在线示例链接、GitHub 模板链接，以及一个具体使用场景。

## 8. 指标与复盘

每月记录：

| 漏斗阶段 | 指标 | 数据来源 |
| --- | --- | --- |
| 搜索发现 | impressions、clicks、平均排名、搜索词 | Search Console |
| 网站访问 | users、sessions、来源、国家、常看页面 | GA4 |
| 仓库访问 | views、unique visitors、referrers | GitHub Traffic |
| 使用意愿 | Stars、Forks、模板复用 | GitHub |
| 学术转化 | CV 点击、Scholar 点击、邮件联系 | GA4 事件与人工记录 |

不要只看总访问量。来自目标研究领域的访问、论文阅读、模板复用和真实联系通常比大量短暂停留更有价值。

## 9. 90 天目标建议

没有历史数据时，先用可控目标而不是承诺流量：

- 所有核心页面被 Google 正常索引；
- 获得 5 个以上相关站点或个人主页的自然链接；
- 发布 4–6 条可长期搜索的研究或建站内容；
- GitHub 仓库获得持续的独立访客、Star、Fork 或模板复用；
- 每月根据 Search Console 查询至少优化一次标题、描述或内容。

搜索曝光通常需要数周到数月积累。持续提供可引用、可复用、能解决具体问题的内容，比短期刷访问量更可靠。
