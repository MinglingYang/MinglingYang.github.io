# Mingling (Mona) Yang 学术主页

[![个人网站](https://img.shields.io/badge/website-minglingyang.github.io-174a7c?style=flat-square)](https://minglingyang.github.io/)
[![最近提交](https://img.shields.io/github/last-commit/MinglingYang/MinglingYang.github.io?style=flat-square)](https://github.com/MinglingYang/MinglingYang.github.io/commits/main)
[![MIT License](https://img.shields.io/badge/license-MIT-c9a646?style=flat-square)](../LICENSE)
[![Google Scholar](https://img.shields.io/badge/Google-Scholar-4285F4?style=flat-square&logo=google-scholar&logoColor=white)](https://scholar.google.com/citations?user=cNanG64AAAAJ)

这是 **Mingling (Mona) Yang** 的个人学术网站。Mona 现为南加州大学凯克医学院环境健康方向流行病学博士生。

网站：[https://minglingyang.github.io/](https://minglingyang.github.io/)

[英文说明](../README.md)

## 用它制作你的个人网站

这个仓库既是 Mona 正在使用的学术主页，也是可以复用的教学模板。仓库开启 GitHub Template 功能后，点击 **Use this template**，建立名为 `你的用户名.github.io` 的仓库，然后按教程操作：

- [完整中文教程](TUTORIAL-zh.md)
- [Complete English tutorial](TUTORIAL.md)

教程包含个人信息替换、论文与研究地图、双语文本、Google Scholar 自动更新、仅管理员可见的 Google Analytics、本地预览和 GitHub Pages 发布。

## 研究方向

- 环境流行病学与暴露科学
- PFAS、暴露组学、多组学与环境混合暴露
- 空气污染与呼吸健康
- 孕产妇、儿童与青少年健康
- 生物统计、地理空间分析与可复现数据科学

## 主要功能

- 响应式单页学术档案和全屏首页
- 中英文切换及语言偏好保存
- 按地点和年份联系教育、项目、论文与报告的交互式地球
- Google Scholar 元数据与本地精选内容合并生成论文卡片
- 每周自动更新引用数、h-index 和论文元数据
- 研究经历、教育、荣誉、会议报告、技术能力、CV 和个人链接
- GitHub Pages、canonical 元数据、sitemap 和 feed

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `_pages/about.md` | 主页内容和研究地点 |
| `_config.yml` | 网站身份、正式网址、个人链接和 Jekyll 配置 |
| `_data/navigation.yml` | 顶部导航 |
| `_layouts/`, `_includes/` | 页面框架、侧栏、SEO、分析和脚本 |
| `assets/css/main.scss` | 视觉系统和响应式样式 |
| `assets/js/research-globe.js` | 交互式研究地球 |
| `assets/js/scholar-publications.js` | Scholar 数据加载、合并与论文渲染 |
| `assets/js/language-toggle.js` | 前端中英文翻译 |
| `assets/data/publications.json` | 论文摘要、链接、标签、图片与排序 |
| `assets/data/world-countries.geojson` | 地球使用的国家边界 |
| `google_scholar_crawler/` | 生成 Scholar JSON 的 Python 爬虫 |
| `.github/workflows/google_scholar_crawler.yaml` | 每周 Scholar 更新 |
| `files/`, `images/` | CV 与视觉素材 |

## Scholar 数据流程

1. GitHub Actions 每周一 08:00 UTC 运行 `google_scholar_crawler/main.py`。
2. 引用指标和论文元数据写入 `google-scholar-stats` 分支。
3. 浏览器通过 jsDelivr 读取该分支。
4. `assets/data/publications.json` 补充摘要、图片、标签、链接和展示顺序。
5. 合并后的数据同时供论文区块和研究地球使用。

工作流也可从仓库 **Actions** 页面手动运行，需要名为 `GOOGLE_SCHOLAR_ID` 的 Actions secret。

## 本地开发

```bash
bundle install
bundle exec jekyll liveserve
```

访问 [http://127.0.0.1:4000](http://127.0.0.1:4000)。`bash run_server.sh` 也会启动同样的实时重载服务。

生产构建：

```bash
bundle exec jekyll build
```

`_site/` 是已忽略的本地构建输出。

## 致谢与许可证

本网站最初基于 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io)，并参考了 [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) 和 [Academic Pages](https://github.com/academicpages/academicpages.github.io)。当前版本已加入大量定制的视觉、地图、论文和双语功能。

国家与一级行政区边界数据来自 [Natural Earth](https://www.naturalearthdata.com/)，属于公共领域数据。

项目使用 [MIT License](../LICENSE)。
