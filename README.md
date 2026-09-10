# Mingling (Mona) Yang — Academic Homepage

[![Website](https://img.shields.io/badge/website-minglingyang.github.io-174a7c?style=flat-square)](https://minglingyang.github.io/)
[![Last commit](https://img.shields.io/github/last-commit/MinglingYang/MinglingYang.github.io?style=flat-square)](https://github.com/MinglingYang/MinglingYang.github.io/commits/main)
[![License: MIT](https://img.shields.io/badge/license-MIT-c9a646?style=flat-square)](LICENSE)
[![Google Scholar](https://img.shields.io/badge/Google-Scholar-4285F4?style=flat-square&logo=google-scholar&logoColor=white)](https://scholar.google.com/citations?user=cNanG64AAAAJ)

Personal academic website of **Mingling (Mona) Yang**, a Ph.D. student in Epidemiology on the Environmental Health Track at the Keck School of Medicine of the University of Southern California.

Live site: [https://minglingyang.github.io/](https://minglingyang.github.io/)

[Chinese documentation / 中文说明](docs/README-zh.md)

## Build your own academic website

This repository is both Mona's live website and a reusable teaching example. After the repository is marked as a GitHub template, select **Use this template**, create a repository named `YOUR-USERNAME.github.io`, and follow the guides below:

- [Complete English tutorial](docs/TUTORIAL.md)
- [完整中文教程](docs/TUTORIAL-zh.md)

The tutorials cover personalization, publications, the research globe, bilingual text, Google Scholar automation, optional private Google Analytics reporting, local preview, and GitHub Pages deployment.

## Research focus

- Environmental epidemiology and exposure science
- PFAS, exposomics, multi-omics, and environmental mixtures
- Air pollution and respiratory health
- Maternal, child, and adolescent health
- Biostatistics, geospatial analysis, and reproducible data science

## Site features

- Responsive, single-page academic portfolio with a full-screen landing panel
- English and Chinese display modes with locally saved language preference
- Interactive canvas globe connecting education, projects, publications, and presentations by place and year
- Publication cards merging live Google Scholar metadata with a curated local display layer
- Weekly citation, h-index, and publication metadata updates
- Research experience, education, awards, presentations, technical skills, CV, and profile links
- GitHub Pages deployment, canonical metadata, sitemap, and feed generation

## Project structure

| Path | Purpose |
| --- | --- |
| `_pages/about.md` | Main page content and research-location records |
| `_config.yml` | Site identity, canonical URL, profile links, and Jekyll settings |
| `_data/navigation.yml` | Top navigation items |
| `_layouts/`, `_includes/` | Page shell, navigation, sidebar, SEO, analytics, and scripts |
| `assets/css/main.scss` | Visual system and responsive component styles |
| `assets/js/research-globe.js` | Interactive research globe and filters |
| `assets/js/scholar-publications.js` | Scholar loading, merging, news, and publication rendering |
| `assets/js/language-toggle.js` | English/Chinese client-side translation |
| `assets/data/publications.json` | Curated publication text, links, tags, images, and order |
| `assets/data/world-countries.geojson` | Country geometry used by the globe |
| `google_scholar_crawler/` | Python crawler producing Scholar JSON data |
| `.github/workflows/google_scholar_crawler.yaml` | Weekly Scholar refresh workflow |
| `files/`, `images/` | CV and visual assets |

## Publication data flow

1. GitHub Actions runs `google_scholar_crawler/main.py` every Monday at 08:00 UTC.
2. Metrics and publication metadata are written to the `google-scholar-stats` branch.
3. The browser loads that branch through jsDelivr.
4. `assets/data/publications.json` enriches Scholar records with summaries, images, tags, links, and display order.
5. The merged records populate the publication section and research globe.

The workflow can also be run manually from the repository's **Actions** tab. It requires an Actions secret named `GOOGLE_SCHOLAR_ID`.

## Local development

```bash
bundle install
bundle exec jekyll liveserve
```

Open [http://127.0.0.1:4000](http://127.0.0.1:4000). `bash run_server.sh` starts the same live-reload server.

Production build:

```bash
bundle exec jekyll build
```

The generated `_site/` directory is ignored by Git.

## Updating content

- Update biography, experience, education, and map locations in `_pages/about.md`.
- Update profile identity and links in `_config.yml`.
- Maintain curated publication content in `assets/data/publications.json`.
- When replacing the CV in `files/`, update its filename in both `_config.yml` and `_pages/about.md`.

## Credits and license

Originally based on [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io), with work derived from [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) and [Academic Pages](https://github.com/academicpages/academicpages.github.io). This version includes substantial custom design, mapping, publication, and bilingual functionality.

Distributed under the [MIT License](LICENSE). Keep the original attribution when redistributing the template.
