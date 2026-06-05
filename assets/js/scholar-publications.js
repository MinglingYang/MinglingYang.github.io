(function () {
  function normalizeTitle(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
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

  function renderTags(tags) {
    return (tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
  }

  function renderPublicationCard(pub) {
    var url = publicationUrl(pub);
    var title = pub.short_title || pub.title;
    var citation = typeof pub.citations === "number" ? pub.citations : null;
    var citationHtml = citation !== null
      ? "<span class=\"pub-card__metric\">" + citation + " citations</span>"
      : "";
    var focusHtml = pub.focus
      ? "    <p class=\"pub-card__focus\">" + escapeHtml(pub.focus) + "</p>"
      : "";
    var linkOpen = url ? "<a href=\"" + escapeHtml(url) + "\">" : "";
    var linkClose = url ? "</a>" : "";
    return [
      "<article class=\"pub-card\">",
      "  <div class=\"pub-card__image-wrap\">",
      "    <img class=\"pub-card__image\" src=\"" + escapeHtml(pub.image || "images/publications/scholar-update.svg") + "\" alt=\"Representative visual for " + escapeHtml(title) + "\" loading=\"lazy\">",
      "  </div>",
      "  <div class=\"pub-card__body\">",
      "    <div class=\"pub-card__meta\">",
      "      <span>" + escapeHtml(pub.year || "In progress") + "</span>",
      "      <span>" + escapeHtml(pub.venue || "Publication") + "</span>",
      citationHtml,
      "    </div>",
      "    <h3>" + linkOpen + escapeHtml(title) + linkClose + "</h3>",
      "    <p class=\"pub-card__authors\">" + escapeHtml(pub.authors || "") + "</p>",
      focusHtml,
      "    <div class=\"pub-card__tags\">" + renderTags(pub.tags) + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function renderNews(displayData, publications, scholarData) {
    var target = document.getElementById("scholar-news");
    if (!target) return;
    var pinned = (displayData.pinnedNews || []).map(function (item) {
      return "<li><strong>" + escapeHtml(item.date) + ":</strong> " + escapeHtml(item.text) + "</li>";
    });
    var scholarNews = publications
      .filter(function (pub) { return !pub.manual_only && pub.year; })
      .slice()
      .sort(function (a, b) {
        if (Number(b.year || 0) !== Number(a.year || 0)) return Number(b.year || 0) - Number(a.year || 0);
        return Number(b.citations || 0) - Number(a.citations || 0);
      })
      .slice(0, 4)
      .map(function (pub) {
        var title = pub.short_title || pub.title;
        var citation = typeof pub.citations === "number" ? " Scholar citations: " + pub.citations + "." : "";
        return "<li><strong>" + escapeHtml(pub.year) + ":</strong> " + escapeHtml(title) + "." + escapeHtml(citation) + "</li>";
      });
    var updated = scholarData && scholarData.updated
      ? "<p class=\"auto-note\">Publication metadata synced from Google Scholar. Last Scholar crawler update: " + escapeHtml(scholarData.updated) + ".</p>"
      : "<p class=\"auto-note\">Showing curated publication data. Google Scholar metadata will appear here when the crawler data is reachable.</p>";
    target.innerHTML = updated + "<ul>" + pinned.concat(scholarNews).join("") + "</ul>";
  }

  function renderPublications(publications) {
    var target = document.getElementById("scholar-publications");
    if (!target) return;
    target.innerHTML = publications.map(renderPublicationCard).join("");
  }

  function renderScholarSummary(scholarData) {
    var target = document.getElementById("scholar-summary");
    if (!target || !scholarData) return;
    target.innerHTML = [
      "<span><strong>" + escapeHtml(scholarData.citedby || 0) + "</strong> citations</span>",
      "<span><strong>" + escapeHtml(scholarData.hindex || 0) + "</strong> h-index</span>",
      "<span><strong>" + escapeHtml(Object.keys(scholarData.publications || {}).length) + "</strong> Scholar items</span>"
    ].join("");
  }

  function initScholarPublications() {
    var displayUrl = "assets/data/publications.json";
    var baseUrl = scholarBaseUrl();
    var scholarUrl = baseUrl ? baseUrl + "google-scholar-stats/gs_data.json" : null;
    Promise.all([
      fetchJson(displayUrl),
      scholarUrl ? fetchJson(scholarUrl).catch(function () { return null; }) : Promise.resolve(null)
    ]).then(function (values) {
      var displayData = values[0];
      var scholarData = values[1];
      var publications = mergePublications(displayData, scholarData);
      renderScholarSummary(scholarData);
      renderNews(displayData, publications, scholarData);
      renderPublications(publications);
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
