(function () {
  var METRICS_REFRESH_MS = 5 * 60 * 1000;
  var PUBLICATION_REFRESH_MS = 24 * 60 * 60 * 1000;
  var MAX_FILTER_TAGS = 15;
  var publicationRefreshTimer = null;
  var metricsRefreshTimer = null;

  function normalizeTitle(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function scholarBaseUrl() {
    var useCdn = window.SITE_CONFIG && window.SITE_CONFIG.googleScholarStatsUseCdn;
    var repository = window.SITE_CONFIG && window.SITE_CONFIG.repository;
    if (!repository) return null;
    if (useCdn) return "https://cdn.jsdelivr.net/gh/" + repository + "@";
    return "https://raw.githubusercontent.com/" + repository + "/";
  }

  function scholarJsonUrl(filename, cacheBust) {
    var baseUrl = scholarBaseUrl();
    if (!baseUrl) return null;
    var url = baseUrl + "google-scholar-stats/" + filename;
    if (cacheBust) url += (url.indexOf("?") === -1 ? "?" : "&") + "v=" + Date.now();
    return url;
  }

  function assetVersion() {
    return window.MINGLING_ASSET_VERSION || "20260608";
  }

  function versionedAssetUrl(url) {
    if (!url || /^(https?:|data:|#)/i.test(url)) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "v=" + encodeURIComponent(assetVersion());
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Unable to load " + url);
      return response.json();
    });
  }

  function doiUrl(doi) {
    return doi ? "https://doi.org/" + doi : "";
  }

  function publicationUrl(pub) {
    if (pub.url) return pub.url;
    if (pub.doi) return doiUrl(pub.doi);
    if (pub.pmid) return "https://pubmed.ncbi.nlm.nih.gov/" + pub.pmid + "/";
    if (pub.citedby_url) return pub.citedby_url;
    return "";
  }

  var tagRules = [
    { label: "Household air pollution", patterns: [/household air pollution/i, /biomass cooking/i, /clean cooking/i, /lpg/i], score: 8 },
    { label: "Air pollution", patterns: [/air pollution/i, /pm2\.?5/i, /ambient/i, /pollution/i], score: 7 },
    { label: "Respiratory health", patterns: [/respiratory/i, /pneumonia/i, /lung function/i, /spirometry/i], score: 7 },
    { label: "COPD screening", patterns: [/copd/i, /st george/i, /sgrq/i, /screening/i], score: 8 },
    { label: "Chronic bronchitis", patterns: [/chronic bronchitis/i], score: 8 },
    { label: "Child health", patterns: [/child/i, /children/i, /infant/i, /preschool/i, /growth/i, /neurodevelopment/i], score: 7 },
    { label: "Maternal health", patterns: [/maternal/i, /women/i, /pregnan/i], score: 5 },
    { label: "Exposure assessment", patterns: [/exposure/i, /sensor/i, /calibration/i, /monitoring/i], score: 6 },
    { label: "Life course", patterns: [/birth/i, /life course/i, /longitudinal/i, /trajector/i], score: 5 },
    { label: "LMIC cohorts", patterns: [/lmic/i, /low-and middle-income/i, /resource-limited/i, /multi-country/i, /multinational/i], score: 7 },
    { label: "HAPIN", patterns: [/hapin/i], score: 7 },
    { label: "GECo", patterns: [/geco/i, /global excellence in copd/i], score: 7 },
    { label: "Peru", patterns: [/peru/i, /puno/i], score: 4 },
    { label: "Nepal", patterns: [/nepal/i, /bhaktapur/i, /kathmandu/i], score: 4 },
    { label: "Uganda", patterns: [/uganda/i, /kampala/i], score: 4 },
    { label: "Guatemala", patterns: [/guatemala/i], score: 4 },
    { label: "India", patterns: [/\bindia\b/i], score: 4 },
    { label: "Rwanda", patterns: [/rwanda/i], score: 4 },
    { label: "Data science", patterns: [/machine learning/i, /random forest/i, /xgboost/i, /model/i, /algorithm/i], score: 5 },
    { label: "Reproducible research", patterns: [/r markdown/i, /reproduc/i, /workflow/i, /database/i], score: 5 },
    { label: "PFAS", patterns: [/pfas/i], score: 6 },
    { label: "Exposomics", patterns: [/exposomic/i, /multi-omics/i, /omics/i], score: 6 }
  ];

  function publicationSearchText(pub) {
    return [
      pub.title,
      pub.short_title,
      pub.summary,
      pub.focus,
      pub.venue,
      pub.authors,
      (pub.tags || []).join(" ")
    ].join(" ");
  }

  function derivedTagObjects(pub) {
    var byKey = {};
    function add(label, score) {
      var key = tagKey(label);
      if (!key) return;
      if (!byKey[key]) byKey[key] = { key: key, label: label, score: 0 };
      byKey[key].score += score || 1;
    }
    (pub.tags || []).forEach(function (tag) {
      add(tag, 6);
    });
    var text = publicationSearchText(pub);
    tagRules.forEach(function (rule) {
      if (rule.patterns.some(function (pattern) { return pattern.test(text); })) {
        add(rule.label, rule.score);
      }
    });
    if (pub.source === "scholar-auto") add("Google Scholar", 2);
    return Object.keys(byKey).map(function (key) { return byKey[key]; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.label.localeCompare(b.label);
      });
  }

  function derivedTags(pub) {
    return derivedTagObjects(pub).map(function (tag) { return tag.label; });
  }

  function publicationId(pub) {
    if (pub.id) return pub.id;
    return "publication-" + slugify(pub.short_title || pub.title || pub.scholar_id || "item");
  }

  function mergePublications(displayData, scholarData) {
    var curated = displayData.publications || [];
    var scholarItems = [];
    var scholarById = {};
    var scholarByTitle = {};

    if (scholarData && scholarData.publications) {
      Object.keys(scholarData.publications).forEach(function (key) {
        var item = scholarData.publications[key];
        var bib = item.bib || {};
        var merged = {
          scholar_id: item.author_pub_id || key,
          title: bib.title || "",
          year: Number(bib.pub_year || 0),
          citations: Number(item.num_citations || 0),
          citedby_url: item.citedby_url || ""
        };
        scholarItems.push(merged);
        scholarById[merged.scholar_id] = merged;
        scholarByTitle[normalizeTitle(merged.title)] = merged;
      });
    }

    var usedIds = {};
    var mergedCurated = curated.map(function (pub) {
      var scholar = null;
      if (pub.scholar_id && scholarById[pub.scholar_id]) {
        scholar = scholarById[pub.scholar_id];
      } else {
        scholar = scholarByTitle[normalizeTitle(pub.title)];
      }
      if (scholar && scholar.scholar_id) usedIds[scholar.scholar_id] = true;
      return Object.assign({}, scholar || {}, pub, {
        title: pub.title || (scholar && scholar.title) || "",
        year: Number(pub.year || (scholar && scholar.year) || 0),
        citations: scholar ? scholar.citations : pub.citations,
        citedby_url: scholar ? scholar.citedby_url : pub.citedby_url,
        source: scholar ? "scholar-curated" : "curated"
      });
    });

    var unknownScholar = scholarItems
      .filter(function (item) { return !usedIds[item.scholar_id]; })
      .map(function (item) {
        return Object.assign({}, item, {
          short_title: item.title,
          venue: "Google Scholar",
          image: displayData.fallbackImage,
          tags: ["Google Scholar", "Auto-synced"],
          focus: "",
          source: "scholar-auto"
        });
      });

    return mergedCurated.concat(unknownScholar).sort(function (a, b) {
      var orderA = Number(a.featured_order || 999);
      var orderB = Number(b.featured_order || 999);
      if (orderA !== orderB) return orderA - orderB;
      if (Number(b.year || 0) !== Number(a.year || 0)) return Number(b.year || 0) - Number(a.year || 0);
      return Number(b.citations || 0) - Number(a.citations || 0);
    });
  }

  function renderTags(tags, allowedKeys) {
    return (tags || []).filter(function (tag) {
      return !allowedKeys || allowedKeys[tagKey(tag)];
    }).map(function (tag) {
      return "<button type=\"button\" class=\"pub-card__tag\" data-publication-tag=\"" + escapeHtml(tagKey(tag)) + "\">" + escapeHtml(tag) + "</button>";
    }).join("");
  }

  function tagKey(value) {
    return slugify(value);
  }

  function publicationTagKeys(pub) {
    return derivedTags(pub).map(tagKey).filter(Boolean);
  }

  function renderAuthors(authors) {
    return escapeHtml(authors || "").replace(/\b(Yang M|Mingling Yang)\b/g, "<strong class=\"pub-card__author-me\">$1</strong>");
  }

  function renderPublicationCard(pub, allowedTagKeys) {
    var url = publicationUrl(pub);
    var title = pub.short_title || pub.title;
    var id = publicationId(pub);
    var citation = typeof pub.citations === "number" ? pub.citations : null;
    var citationHtml = citation !== null
      ? "<span class=\"pub-card__metric\">" + citation + " citations</span>"
      : "";
    var summary = pub.summary || pub.focus;
    var focusHtml = summary
      ? "    <p class=\"pub-card__summary\">" + escapeHtml(summary) + "</p>"
      : "";
    var linkOpen = url ? "<a href=\"" + escapeHtml(url) + "\">" : "";
    var linkClose = url ? "</a>" : "";
    return [
      "<article class=\"pub-card\" id=\"" + escapeHtml(id) + "\" data-publication-tags=\"" + escapeHtml(publicationTagKeys(pub).join("|")) + "\">",
      "  <div class=\"pub-card__image-wrap\">",
      "    <img class=\"pub-card__image\" src=\"" + escapeHtml(versionedAssetUrl(pub.image || "images/publications/scholar-update.svg")) + "\" alt=\"Representative visual for " + escapeHtml(title) + "\" loading=\"lazy\">",
      "  </div>",
      "  <div class=\"pub-card__body\">",
      "    <div class=\"pub-card__meta\">",
      "      <span>" + escapeHtml(pub.year || "In progress") + "</span>",
      "      <span>" + escapeHtml(pub.venue || "Publication") + "</span>",
      citationHtml,
      "    </div>",
      "    <h3>" + linkOpen + escapeHtml(title) + linkClose + "</h3>",
      "    <p class=\"pub-card__authors\">" + renderAuthors(pub.authors) + "</p>",
      focusHtml,
      "    <div class=\"pub-card__tags\">" + renderTags(derivedTags(pub), allowedTagKeys) + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function scrollToHashTarget(hash) {
    var id = String(hash || "").replace(/^#/, "");
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    window.scrollTo({
      top: Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 96),
      behavior: "smooth"
    });
  }

  function newsDateFromItem(item) {
    var raw = item.news_date || item.date_iso || "";
    if (raw) {
      var parsed = new Date(raw + (/^\d{4}-\d{2}-\d{2}$/.test(raw) ? "T00:00:00" : ""));
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (item.year) {
      var currentYear = new Date().getFullYear();
      if (Number(item.year) === currentYear) return new Date(currentYear, 0, 1);
    }
    return null;
  }

  function isRecentNewsDate(date) {
    if (!date) return false;
    var now = new Date();
    var cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 6);
    return date >= cutoff && date <= now;
  }

  function newsDateLabel(date) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }

  function renderNews(displayData, publications, scholarData) {
    var target = document.getElementById("scholar-news");
    if (!target) return;
    var pinned = (displayData.pinnedNews || []).map(function (item) {
      var date = newsDateFromItem(item);
      return { date: date, html: "<li><strong>" + escapeHtml(item.date) + ":</strong> " + escapeHtml(item.text) + "</li>" };
    }).filter(function (item) {
      return isRecentNewsDate(item.date);
    });
    var scholarNews = publications
      .filter(function (pub) { return !pub.manual_only && pub.year; })
      .slice()
      .sort(function (a, b) {
        var dateA = newsDateFromItem(a);
        var dateB = newsDateFromItem(b);
        if (dateA && dateB && dateA.getTime() !== dateB.getTime()) return dateB - dateA;
        if (dateB && !dateA) return 1;
        if (dateA && !dateB) return -1;
        if (Number(b.year || 0) !== Number(a.year || 0)) return Number(b.year || 0) - Number(a.year || 0);
        return Number(b.citations || 0) - Number(a.citations || 0);
      })
      .map(function (pub) {
        var date = newsDateFromItem(pub);
        var title = pub.short_title || pub.title;
        var citation = typeof pub.citations === "number" ? " Scholar citations: " + pub.citations + "." : "";
        return {
          date: date,
          html: "<li><strong>" + escapeHtml(newsDateLabel(date) || pub.year) + ":</strong> " + escapeHtml(title) + "." + escapeHtml(citation) + "</li>"
        };
      })
      .filter(function (item) {
        return isRecentNewsDate(item.date);
      });
    var items = pinned.concat(scholarNews).slice(0, 6).map(function (item) {
      return item.html;
    });
    var updated = "<p class=\"auto-note\">Showing updates from the last 6 months.</p>";
    target.innerHTML = items.length
      ? updated + "<ul>" + items.join("") + "</ul>"
      : updated + "<p class=\"auto-note\">No public updates in this window yet.</p>";
  }

  function countPublicationTags(publications) {
    var byKey = {};
    publications.forEach(function (pub) {
      var citationWeight = Math.min(Number(pub.citations || 0), 30) / 30;
      var recencyWeight = Math.max(0, Number(pub.year || 0) - 2023) * .18;
      derivedTagObjects(pub).forEach(function (tag) {
        var key = tag.key;
        if (!key) return;
        if (!byKey[key]) byKey[key] = { key: key, label: tag.label, count: 0, score: 0 };
        byKey[key].count += 1;
        byKey[key].score += tag.score + citationWeight + recencyWeight;
      });
    });
    return Object.keys(byKey).map(function (key) {
      return byKey[key];
    }).sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
  }

  function renderPublicationFilters(publications) {
    var tags = countPublicationTags(publications).slice(0, MAX_FILTER_TAGS);
    if (!tags.length) return "";
    return [
      "<div class=\"publication-filter\" id=\"publication-filter\" aria-label=\"Publication tag filters\">",
      "  <button type=\"button\" class=\"publication-filter__chip is-active\" data-publication-filter=\"__all\">All (" + publications.length + ")</button>",
      tags.map(function (tag) {
        return "  <button type=\"button\" class=\"publication-filter__chip\" data-publication-filter=\"" + escapeHtml(tag.key) + "\">" + escapeHtml(tag.label) + " <span>" + tag.count + "</span></button>";
      }).join(""),
      "</div>"
    ].join("");
  }

  function applyPublicationFilters(container, activeTags) {
    var cards = Array.prototype.slice.call(container.querySelectorAll(".pub-card"));
    var activeKeys = Object.keys(activeTags).filter(function (key) { return activeTags[key]; });
    var hasFilters = activeKeys.length > 0;
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardTags = String(card.getAttribute("data-publication-tags") || "").split("|").filter(Boolean);
      var show = !hasFilters || activeKeys.some(function (key) {
        return cardTags.indexOf(key) !== -1;
      });
      card.classList.toggle("is-hidden-by-filter", !show);
      if (show) visibleCount += 1;
      Array.prototype.slice.call(card.querySelectorAll("[data-publication-tag]")).forEach(function (tagButton) {
        var key = tagButton.getAttribute("data-publication-tag");
        tagButton.classList.toggle("is-selected", !!activeTags[key]);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-publication-filter]")).forEach(function (button) {
      var key = button.getAttribute("data-publication-filter");
      button.classList.toggle("is-active", key === "__all" ? !hasFilters : !!activeTags[key]);
    });

    var empty = document.getElementById("publication-filter-empty");
    if (empty) empty.hidden = visibleCount !== 0;
  }

  function bindPublicationFilters(target) {
    var activeTags = {};
    target.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-publication-filter], [data-publication-tag]");
      if (!trigger) return;
      var filterKey = trigger.getAttribute("data-publication-filter");
      var tagKeyValue = trigger.getAttribute("data-publication-tag");
      if (filterKey === "__all") {
        activeTags = {};
      } else {
        var key = filterKey || tagKeyValue;
        if (!key) return;
        activeTags[key] = !activeTags[key];
        if (!activeTags[key]) delete activeTags[key];
      }
      applyPublicationFilters(target, activeTags);
    });
    applyPublicationFilters(target, activeTags);
  }

  function renderPublications(publications) {
    var target = document.getElementById("scholar-publications");
    if (!target) return;
    var allowedTagKeys = {};
    countPublicationTags(publications).slice(0, MAX_FILTER_TAGS).forEach(function (tag) {
      allowedTagKeys[tag.key] = true;
    });
    target.innerHTML = [
      renderPublicationFilters(publications),
      publications.map(function (pub) { return renderPublicationCard(pub, allowedTagKeys); }).join(""),
      "<p class=\"publication-filter__empty\" id=\"publication-filter-empty\" hidden>No publications match the selected tags.</p>"
    ].join("");
    bindPublicationFilters(target);
    if (window.location.hash && document.getElementById(window.location.hash.slice(1))) {
      window.setTimeout(function () {
        scrollToHashTarget(window.location.hash);
      }, 60);
    }
  }

  function renderScholarSummary(scholarData) {
    var target = document.getElementById("scholar-summary");
    if (!target || !scholarData) return;
    var scholarItems = scholarData.publications_count || scholarData.publication_count || Object.keys(scholarData.publications || {}).length;
    target.innerHTML = [
      "<a class=\"scholar-matrix__cell scholar-matrix__cell--profile\" href=\"https://scholar.google.com/citations?user=cNanG64AAAAJ\">",
      "  <strong>Google Scholar</strong><span>Publication profile</span>",
      "</a>",
      "<span class=\"scholar-matrix__cell\"><strong>" + escapeHtml(scholarData.citedby || 0) + "</strong><em>citations</em></span>",
      "<span class=\"scholar-matrix__cell\"><strong>" + escapeHtml(scholarData.hindex || 0) + "</strong><em>h-index</em></span>",
      "<span class=\"scholar-matrix__cell\"><strong>" + escapeHtml(scholarItems) + "</strong><em>Scholar items</em></span>"
    ].join("");
  }

  function publicationCountries(pub) {
    var text = publicationSearchText(pub);
    var countries = [];
    function add(country) {
      if (countries.indexOf(country) === -1) countries.push(country);
    }
    if (/peru|puno|lima/i.test(text)) add("Peru");
    if (/nepal|bhaktapur|kathmandu/i.test(text)) add("Nepal");
    if (/uganda|kampala/i.test(text)) add("Uganda");
    if (/guatemala/i.test(text)) add("Guatemala");
    if (/\bindia\b/i.test(text)) add("India");
    if (/rwanda/i.test(text)) add("Rwanda");
    if (/geco|global excellence in copd|copd|chronic bronchitis|sgrq|st george/i.test(text)) {
      add("Peru");
      add("Nepal");
      add("Uganda");
    }
    if (/hapin|household air pollution|biomass cooking|lpg|severe pneumonia/i.test(text)) {
      add("Guatemala");
      add("India");
      add("Peru");
      add("Rwanda");
    }
    return countries;
  }

  function publishGlobeData(publications) {
    var globePublications = publications.map(function (pub) {
      return Object.assign({}, pub, {
        id: publicationId(pub),
        display_title: pub.short_title || pub.title,
        countries: publicationCountries(pub),
        tag_keys: publicationTagKeys(pub)
      });
    });
    window.MINGLING_SCHOLAR_PUBLICATIONS = globePublications;
    if (window.MinglingResearchGlobe && window.MinglingResearchGlobe.syncPublications) {
      window.MinglingResearchGlobe.syncPublications(globePublications);
    }
    window.dispatchEvent(new CustomEvent("scholar-publications-updated", {
      detail: { publications: globePublications }
    }));
  }

  function loadMetrics(cacheBust) {
    var metricsUrl = scholarJsonUrl("gs_metrics.json", cacheBust);
    var fallbackUrl = scholarJsonUrl("gs_data.json", cacheBust);
    if (!metricsUrl && !fallbackUrl) return Promise.resolve(null);
    return fetchJson(metricsUrl).catch(function () {
      return fallbackUrl ? fetchJson(fallbackUrl).catch(function () { return null; }) : null;
    }).then(function (metrics) {
      if (metrics) renderScholarSummary(metrics);
      return metrics;
    });
  }

  function loadPublicationBundle(cacheBust) {
    var displayUrl = versionedAssetUrl("assets/data/publications.json");
    var scholarUrl = scholarJsonUrl("gs_data.json", cacheBust);
    return Promise.all([
      fetchJson(displayUrl),
      scholarUrl ? fetchJson(scholarUrl).catch(function () { return null; }) : Promise.resolve(null)
    ]).then(function (values) {
      var displayData = values[0];
      var scholarData = values[1];
      var publications = mergePublications(displayData, scholarData);
      renderNews(displayData, publications, scholarData);
      renderPublications(publications);
      publishGlobeData(publications);
      return { displayData: displayData, scholarData: scholarData, publications: publications };
    });
  }

  function initScholarPublications() {
    Promise.all([
      loadMetrics(false),
      loadPublicationBundle(false)
    ]).then(function () {
      if (metricsRefreshTimer) window.clearInterval(metricsRefreshTimer);
      if (publicationRefreshTimer) window.clearInterval(publicationRefreshTimer);
      metricsRefreshTimer = window.setInterval(function () {
        loadMetrics(true);
      }, METRICS_REFRESH_MS);
      publicationRefreshTimer = window.setInterval(function () {
        loadPublicationBundle(true).catch(function () {});
      }, PUBLICATION_REFRESH_MS);
    }).catch(function () {
      var news = document.getElementById("scholar-news");
      var pubs = document.getElementById("scholar-publications");
      if (news) news.innerHTML = "<p class=\"auto-note\">Publication data is temporarily unavailable.</p>";
      if (pubs) pubs.innerHTML = "<p class=\"auto-note\">Publication data is temporarily unavailable.</p>";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScholarPublications);
  } else {
    initScholarPublications();
  }
})();
