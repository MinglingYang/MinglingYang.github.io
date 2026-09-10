# 使用这个模板制作个人学术网站

本教程将网站发布到 `https://你的用户名.github.io/`，不需要付费主机。

## 1. 创建仓库

1. 登录 GitHub 并打开这个模板仓库。
2. 点击 **Use this template → Create a new repository**。
3. 仓库名必须是 `你的 GitHub 用户名.github.io`。
4. 选择 **Public** 并创建仓库。

如果没有 **Use this template**，可以先 Fork，再到 **Settings → General → Repository name** 重命名。

## 2. 替换网站身份

编辑 `_config.yml`：

```yaml
title: "你的姓名"
description: "你的研究领域和职业简介"
url: "https://你的用户名.github.io"
baseurl: ""
repository: "你的用户名/你的用户名.github.io"

author:
  name: "你的姓名"
  avatar: "images/your-photo.jpg"
  bio: "你当前的身份"
  location: "城市、州或国家"
  employer: "你的学校或机构"
  email: "you@example.com"
  github: "你的 GitHub 用户名"
```

删除不想公开的字段。不要提交密码、API key、学生记录、未发表数据或私人联系方式。

## 3. 替换主页内容

主要内容位于 `_pages/about.md`。需要替换：

- 姓名、职位、个人介绍与研究兴趣；
- 教育、工作、荣誉、会议报告与技能；
- 邮箱、Scholar、GitHub、ResearchGate 和 CV 链接；
- 研究地图的地点和经纬度。

头像和学校标志放在 `images/`，公开 CV 放在 `files/`。更换 CV 后要同步修改所有旧文件名。

可以全局搜索 `Mingling`、`Mona`、`minglingyang` 和 `cNanG64AAAAJ`，确认没有遗留的示例身份。

## 4. 更新论文

编辑 `assets/data/publications.json`。每条记录可包含：

- 稳定的 `id` 和 Google Scholar `scholar_id`；
- 题目、作者、期刊、年份、DOI、PMID 或 URL；
- 缩略图和期刊封面；
- 主题标签、研究重点、摘要和展示顺序。

论文图片放在 `images/publications/`。网页会把这些内容与 Scholar 的最新元数据合并。

## 5. 更新研究地球

地点是 `_pages/about.md` 中 **Research Geography** 区域内的 `<article>` 元素。主要属性为：

```html
data-location="唯一 ID"
data-country="国家"
data-region="地区"
data-modules="project publication"
data-start="2024"
data-end="2026"
data-lat="34.02"
data-lon="-118.29"
```

经纬度使用十进制。论文链接要对应论文 ID，例如 `#publication-example`。

## 6. 同步中文翻译

英文页面是源文本，`assets/js/language-toggle.js` 中的 `zh` 对象将完整的英文字符串映射为中文。修改英文后，需要同步修改对应的翻译。没有映射的文本会保持英文。

如果只需要英文，可以删除 `_includes/masthead.html` 中的语言按钮，以及 `_includes/scripts.html` 中的 `language-toggle.js`。

## 7. 配置每周 Google Scholar 更新

1. 从 Scholar 主页网址 `scholar.google.com/citations?user=YOUR_ID` 找到 ID。
2. 打开 GitHub 仓库的 **Settings → Secrets and variables → Actions**。
3. 点击 **New repository secret**。
4. 名称填 `GOOGLE_SCHOLAR_ID`，值只填 Scholar ID。
5. 进入 **Actions**，必要时允许 workflows 运行。
6. 手动运行一次 **Update Google Scholar Publications** 进行验证。

定时任务每周一 08:00 UTC 运行，并把 JSON 数据发布到 `google-scholar-stats` 分支。

## 8. 可选：只让自己查看 Google Analytics

Analytics 后台默认不公开。访客可能向 Analytics 发送匿名访问事件，但不能打开你的统计后台。

1. 用你希望拥有报表的 Google 账号登录 [Google Analytics](https://analytics.google.com/)。
2. 创建 GA4 Property，再为 GitHub Pages 网址建立 **Web data stream**。
3. 复制格式为 `G-XXXXXXXXXX` 的 Measurement ID。
4. 填入 `_config.yml`：

   ```yaml
   google_analytics_id: "G-XXXXXXXXXX"
   ```

5. 发布网站并访问一次，然后在 **Reports → Realtime** 查看。

只有 **Admin → Property access management** 列出的账号能查看报表。不要添加其他人，就只有你自己可见。`google_analytics_id` 留空会完全关闭统计。

根据访客所在地区和适用法规，收集统计前可能还需要隐私说明或 Cookie 同意提示。

## 9. 本地预览

```bash
bundle install
bundle exec jekyll liveserve
```

打开 `http://127.0.0.1:4000`。交付前运行：

```bash
bundle exec jekyll build
```

## 10. 发布到 GitHub Pages

1. 将修改 commit 并 push 到 `main`。
2. 打开 **Settings → Pages**。
3. 在 **Build and deployment** 中选择 **Deploy from a branch**。
4. 选择 `main` 分支和 `/ (root)` 目录。
5. 保存并等待 Pages 发布完成。

网站将出现在 `https://你的用户名.github.io/`。首次发布可能需要几分钟。

## 交付前检查

- 姓名、邮箱、链接、Scholar ID 和文件路径都已换成你的信息。
- CV 只包含你愿意公开的内容。
- 仓库中没有密码、secret 或未发表数据。
- `_config.yml` 的 `url` 和仓库名正确。
- 本地生产构建成功。
- Scholar workflow 运行成功。
- 桌面端和移动端都能正常阅读。
- 中英文内容一致，或已删除不使用的语言。
- `LICENSE` 中的原始 MIT 署名仍然保留。
