# Build Your Academic Website with This Template

This guide turns the project into a personal site at `https://YOUR-USERNAME.github.io/`. No paid hosting is required.

## 1. Create your repository

1. Sign in to GitHub and open this template repository.
2. Select **Use this template** and then **Create a new repository**.
3. Name it exactly `YOUR-USERNAME.github.io`, replacing `YOUR-USERNAME` with your GitHub username.
4. Choose **Public** and create the repository.

If **Use this template** is unavailable, fork the repository and rename the fork under **Settings → General → Repository name**.

## 2. Replace the site identity

Edit `_config.yml`:

```yaml
title: "Your Name"
description: "Your research areas and professional description"
url: "https://YOUR-USERNAME.github.io"
baseurl: ""
repository: "YOUR-USERNAME/YOUR-USERNAME.github.io"

author:
  name: "Your Name"
  avatar: "images/your-photo.jpg"
  bio: "Your current role"
  location: "City, State or Country"
  employer: "Your Institution"
  email: "you@example.com"
  github: "YOUR-USERNAME"
```

Remove profile fields you do not want to publish. Never commit passwords, API keys, student records, unpublished research data, or private contact information.

## 3. Replace the homepage content

The main content is in `_pages/about.md`. Replace:

- name, title, biography, and research interests;
- education, employment, awards, presentations, and skills;
- email, Scholar, GitHub, ResearchGate, and CV links;
- map cards and their latitude/longitude values.

Put your profile image and institution logos in `images/`. Put your public CV in `files/`, then update every reference to the old filename.

To find remaining example identity details, search the repository for `Mingling`, `Mona`, `minglingyang`, and `cNanG64AAAAJ`.

## 4. Customize publications

Edit `assets/data/publications.json`. Each curated record may include:

- a stable `id`;
- Google Scholar `scholar_id`;
- title, authors, journal, year, DOI, PMID, or URL;
- thumbnail and journal cover paths;
- research tags, a short focus statement, and a summary;
- `featured_order` for display order.

Store public thumbnails in `images/publications/`. The browser merges this curated layer with current Scholar metadata.

## 5. Customize the research globe

Research and education locations are `<article>` elements inside the **Research Geography** section of `_pages/about.md`.

Important attributes include:

```html
data-location="unique-id"
data-country="Country name"
data-region="Region name"
data-modules="project publication"
data-start="2024"
data-end="2026"
data-lat="34.02"
data-lon="-118.29"
```

Use decimal latitude and longitude. Publication links should point to matching publication IDs such as `#publication-example`.

## 6. Update the Chinese translation

The English page is the source text. `assets/js/language-toggle.js` maps exact English strings to Chinese. Whenever visible English text changes, update its matching entry in the `zh` object. Text without a mapping remains English.

If you only need English, remove the language buttons from `_includes/masthead.html` and the `language-toggle.js` script from `_includes/scripts.html`.

## 7. Configure weekly Google Scholar updates

1. Find the Scholar ID in your profile URL: `scholar.google.com/citations?user=YOUR_ID`.
2. In GitHub, open **Settings → Secrets and variables → Actions**.
3. Select **New repository secret**.
4. Name it `GOOGLE_SCHOLAR_ID` and paste only the ID as its value.
5. Open **Actions** and enable workflows if GitHub asks.
6. Run **Update Google Scholar Publications** manually once to verify it.

The scheduled workflow runs every Monday at 08:00 UTC and publishes JSON files to the `google-scholar-stats` branch.

Google Scholar does not provide an official public profile API and may temporarily throttle GitHub-hosted requests. A failed run leaves the previously published branch data in place; wait and run the workflow manually later rather than increasing its frequency.

## 8. Optional private Google Analytics reporting

Analytics reports are private by default. Site visitors can send anonymous usage events, but they cannot open your Analytics dashboard.

1. Open [Google Analytics](https://analytics.google.com/) with the Google account that should own the reports.
2. Create a GA4 property and a **Web** data stream for your GitHub Pages URL.
3. Copy the Measurement ID, which looks like `G-XXXXXXXXXX`.
4. Paste it into `_config.yml`:

   ```yaml
   google_analytics_id: "G-XXXXXXXXXX"
   ```

5. Deploy the site, visit it, and check **Reports → Realtime**.

Only people listed under **Admin → Property access management** can view the reports. Do not add another person unless you want them to have access. Leave `google_analytics_id` blank to disable tracking completely.

Depending on your audience and jurisdiction, add an appropriate privacy notice or consent banner before collecting analytics.

## 9. Preview locally

Install Ruby and Bundler, then run:

```bash
bundle install
bundle exec jekyll liveserve
```

Open `http://127.0.0.1:4000`. For a production check, run:

```bash
bundle exec jekyll build
```

## 10. Publish with GitHub Pages

1. Commit and push your changes to `main`.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder.
5. Save and wait for the Pages deployment to finish.

Your site should appear at `https://YOUR-USERNAME.github.io/`. Check the Actions and Pages screens if the first deployment takes several minutes.

## Final privacy and delivery checklist

- All names, email addresses, links, Scholar IDs, and document paths belong to you.
- The CV contains only information you intend to publish.
- No secrets or unpublished data are committed.
- `_config.yml` uses your final `url` and repository name.
- Local production build succeeds.
- Scholar workflow completes successfully.
- Desktop and mobile layouts are readable.
- English and Chinese text are consistent, or the unused language is removed.
- Original MIT license attribution remains in `LICENSE`.
