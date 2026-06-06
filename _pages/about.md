---
permalink: /
title: "Mingling (Mona) Yang"
excerpt: "Incoming Ph.D. student in Epidemiology at USC; environmental epidemiology, exposure science, PFAS/exposomics, and global respiratory health."
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

I am Mingling (Mona) Yang, an incoming Ph.D. student in Epidemiology on the Environmental Health Track at the Keck School of Medicine of the University of Southern California, beginning in Fall 2026.

My work sits at the intersection of environmental epidemiology, exposure science, biostatistics, and reproducible data systems. At Johns Hopkins, I have worked with Dr. William Checkley and Dr. Laura Nicolaou on multinational studies including the Household Air Pollution Intervention Network (HAPIN), the Global Excellence in COPD Outcomes (GECo) study, CHAP, and ambient air pollution monitoring projects in Nepal and Peru. Across these projects, I have built harmonized multi-country databases, calibrated low-cost PM2.5 sensors against reference-grade monitors, modeled respiratory and child health outcomes, and developed reproducible R/Python/SQL pipelines for large environmental health datasets.

At USC, my doctoral direction will connect this background in air pollution, global respiratory health, and causal/statistical modeling with Dr. Vaia Lida Chatzi's environmental health research program on PFAS, endocrine-disrupting chemicals, exposomics, multi-omics, and metabolic health across the life course. I am especially interested in developing statistical and geospatial frameworks that link complex environmental mixtures to respiratory, metabolic, liver, and child health outcomes, with an emphasis on prevention and policy-relevant environmental health evidence.

My publication profile is on <a href="https://scholar.google.com/citations?user=cNanG64AAAAJ">Google Scholar</a>
<a href="https://scholar.google.com/citations?user=cNanG64AAAAJ">
  <img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations" alt="Google Scholar citations">
</a>.
<span id="scholar-summary" class="scholar-summary" aria-live="polite"></span>

<span class='anchor' id='research-interests'></span>

## Research Interests

- **PFAS, chemical mixtures, and exposomics:** per- and polyfluoroalkyl substances, endocrine-disrupting chemicals, persistent organic pollutants, metabolic disruption, liver disease, and life-course environmental health.
- **Air pollution and exposure assessment:** household air pollution, ambient PM2.5, CO, low-cost sensor calibration, geostatistical exposure surfaces, and environmental monitoring in low- and middle-income countries.
- **Respiratory and child health:** COPD, chronic bronchitis, lung function, high-altitude hypoxia, early child growth, neurodevelopment, and cardiometabolic outcomes.
- **Methods:** causal inference, directed acyclic graphs, longitudinal mixed-effects models, Bayesian and multilevel modeling, functional data analysis, machine learning, geostatistics, GIS, and reproducible research infrastructure.

<span class='anchor' id='research-geography'></span>

## Research Geography

<div class="research-map-toolbar" aria-label="Research geography controls">
  <div class="research-map-toolbar__group" role="group" aria-label="Module filter">
    <button type="button" class="is-active" data-globe-module="all">All</button>
    <button type="button" data-globe-module="education">Education</button>
    <button type="button" data-globe-module="project">Projects</button>
    <button type="button" data-globe-module="publication">Articles</button>
  </div>
  <label>
    <span class="screen-reader-text">Map sort order</span>
    <select id="research-globe-sort">
      <option value="region">Region</option>
      <option value="count">Article count</option>
      <option value="recent">Recent</option>
      <option value="country">Country</option>
    </select>
  </label>
</div>

<div class="research-globe" aria-label="Interactive globe showing education, projects, and published study locations">
  <svg class="research-globe__connectors" aria-hidden="true"></svg>
  <div class="research-globe__sites research-globe__sites--left" id="research-globe-left">
    <article data-location="education-south-carolina" data-country="United States" data-region="North America" data-modules="education" data-count="0" data-start="2017" data-end="2020" data-order="1" data-lat="34.00" data-lon="-81.03">
      <span>University of South Carolina</span>
      <em>Columbia, South Carolina</em>
      <strong>B.S. in Statistics.</strong>
      <p>Undergraduate training in statistics with a minor in Risk Management and Insurance, 2017 to 2020.</p>
    </article>
    <article data-location="education-johns-hopkins" data-country="United States" data-region="North America" data-modules="education" data-count="0" data-start="2021" data-end="2023" data-order="2" data-lat="39.33" data-lon="-76.62">
      <span>Johns Hopkins University</span>
      <em>Baltimore, Maryland</em>
      <strong>M.S.E. in Applied Mathematics and Statistics.</strong>
      <p>Graduate training through the Whiting School of Engineering, 2021 to 2023.</p>
    </article>
    <article data-location="education-usc" data-country="United States" data-region="North America" data-modules="education" data-count="0" data-start="2026" data-end="2031" data-order="3" data-lat="34.02" data-lon="-118.29">
      <span>University of Southern California</span>
      <em>Los Angeles, California</em>
      <strong>Incoming Ph.D. student in Epidemiology.</strong>
      <p>Environmental Health Track at the Keck School of Medicine, beginning Fall 2026.</p>
    </article>
    <article data-location="peru" data-country="Peru" data-region="Latin America" data-modules="project publication" data-count="4" data-start="2023" data-end="2026" data-lat="-9.19" data-lon="-75.02">
      <span>Peru</span>
      <em>Latin America</em>
      <strong>HAPIN, CHAP, GECo, and ambient PM2.5 projects.</strong>
      <p>Puno field work and national Peru analyses on household air pollution, child growth, neurodevelopment, COPD screening, chronic bronchitis, clean fuel adoption, and exposure mapping.</p>
    </article>
  </div>
  <div class="research-globe__stage">
    <canvas id="research-globe-canvas" width="900" height="620" role="img" aria-label="Published study locations across Peru, Nepal, Uganda, Guatemala, India, and Rwanda"></canvas>
    <div class="research-globe__zoom" aria-label="Map zoom controls">
      <button type="button" id="research-globe-zoom-in" aria-label="Zoom in">+</button>
      <button type="button" id="research-globe-zoom-out" aria-label="Zoom out">-</button>
    </div>
    <div class="research-globe__time-panel" aria-label="Time year control" tabindex="0">
      <span class="research-globe__time-kicker">Time</span>
      <output id="research-globe-year-label">2026</output>
      <input id="research-globe-year" type="hidden" min="2017" max="2026" value="2026">
      <div class="research-globe__year-wheel" role="listbox" aria-label="Filter map through year">
        <button type="button" role="option" data-globe-year="2026" aria-selected="true">2026</button>
        <button type="button" role="option" data-globe-year="2025">2025</button>
        <button type="button" role="option" data-globe-year="2024">2024</button>
        <button type="button" role="option" data-globe-year="2023">2023</button>
        <button type="button" role="option" data-globe-year="2022">2022</button>
        <button type="button" role="option" data-globe-year="2021">2021</button>
        <button type="button" role="option" data-globe-year="2020">2020</button>
        <button type="button" role="option" data-globe-year="2019">2019</button>
        <button type="button" role="option" data-globe-year="2018">2018</button>
        <button type="button" role="option" data-globe-year="2017">2017</button>
      </div>
    </div>
  </div>
  <div class="research-globe__sites research-globe__sites--right" id="research-globe-right">
    <article data-location="guatemala" data-country="Guatemala" data-region="Latin America" data-modules="project publication" data-count="1" data-start="2025" data-end="2025" data-lat="14.63" data-lon="-90.51">
      <span>Guatemala</span>
      <em>Latin America</em>
      <strong>HAPIN infant health analyses.</strong>
      <p>Household air pollution, biomass cooking exposure, LPG intervention, and severe pneumonia outcomes.</p>
    </article>
    <article data-location="nepal" data-country="Nepal" data-region="Asia" data-modules="project publication" data-count="3" data-start="2025" data-end="2026" data-lat="27.72" data-lon="85.32">
      <span>Nepal</span>
      <em>Asia</em>
      <strong>GECo and ambient PM2.5 projects.</strong>
      <p>COPD screening, chronic bronchitis, spirometry workflows, sensor calibration, and exposure mapping.</p>
    </article>
    <article data-location="uganda" data-country="Uganda" data-region="Africa" data-modules="project publication" data-count="3" data-start="2025" data-end="2026" data-lat="0.35" data-lon="32.58">
      <span>Uganda</span>
      <em>Africa</em>
      <strong>GECo chronic bronchitis outcomes.</strong>
      <p>Chronic bronchitis burden, risk factors, respiratory symptoms, quality of life, and clinical outcomes.</p>
    </article>
    <article data-location="india" data-country="India" data-region="Asia" data-modules="project publication" data-count="1" data-start="2025" data-end="2025" data-lat="20.59" data-lon="78.96">
      <span>India</span>
      <em>Asia</em>
      <strong>HAPIN household energy intervention.</strong>
      <p>Biomass cooking exposure, LPG intervention, infant health, and multi-country child health evidence.</p>
    </article>
    <article data-location="rwanda" data-country="Rwanda" data-region="Africa" data-modules="project publication" data-count="1" data-start="2025" data-end="2025" data-lat="-1.94" data-lon="30.06">
      <span>Rwanda</span>
      <em>Africa</em>
      <strong>HAPIN child health evidence.</strong>
      <p>Multi-country household air pollution analyses and severe pneumonia outcomes in infants.</p>
    </article>
  </div>
</div>

<div class="research-map-legend" aria-label="Article count legend">
  <span><i class="research-map-legend__dot research-map-legend__dot--low"></i>0-1 article</span>
  <span><i class="research-map-legend__dot research-map-legend__dot--mid"></i>2-3 articles</span>
  <span><i class="research-map-legend__dot research-map-legend__dot--high"></i>4+ articles</span>
</div>

<span class='anchor' id='news'></span>

## News

<div id="scholar-news" class="auto-scholar-block" aria-live="polite">
  <p class="auto-note">Loading Google Scholar updates...</p>
</div>

<span class='anchor' id='publications'></span>

## Publications

<div id="scholar-publications" class="pub-grid" aria-live="polite">
  <p class="auto-note">Loading publications from Google Scholar...</p>
</div>

<span class='anchor' id='research-experience'></span>

## Research Experience

Johns Hopkins University School of Medicine

<div class="experience-role">
  <span>Senior Research Data Analyst, Prof. William Checkley</span>
  <span class="experience-role__date">Sep 2023 - Present</span>
</div>

- Serve as lead analyst across multinational environmental and respiratory health studies, harmonizing more than 100 million data points spanning exposure, clinical, questionnaire, biomarker, sensor, and social-network datasets.
- Build reproducible R/SQL/Python workflows and internal tools for data integration, quality control, calibration, visualization, and statistical reporting across study sites.
- Apply linear mixed models, Bayesian and multilevel models, causal DAGs, functional data analysis, geostatistics, random forests, and XGBoost to multi-level environmental health questions.
- Design and maintain REDCap systems linking household, individual, facility, and clinical forms; train collaborators on data quality workflows and reporting.

Selected JHU projects

- GECo - COPD and chronic bronchitis, Nepal, Peru, and Uganda: quantified COPD burden, chronic bronchitis risk factors, population attributable fractions, and SGRQ-based screening performance in large LMIC cohorts.
- HAPIN - child growth and neurodevelopment, Puno, Peru: evaluated PM2.5/CO exposure-response relationships for early child growth and Bayley-III neurodevelopmental outcomes using longitudinal and causal inference frameworks.
- CHAP - social networks and clean fuel adoption, Peru: analyzed how network structure, tie strength, and aspirational ties shape sustained LPG stove use in rural communities.
- Global Lung Health / Chiesi projects, Nepal and Peru: supported spirometry and oscillometry screening among brick-kiln workers through REDCap architecture, data quality control, and visualization workflows.
- Nocturnal hypoxia and cardiometabolic risk, Puno, Peru: applied functional principal component analysis to continuous SpO2 curves to identify hypoxia phenotypes and their cardiometabolic correlates.

Johns Hopkins Bloomberg School of Public Health

<div class="experience-role">
  <span>Research Assistant, Dr. Laura Nicolaou</span>
  <span class="experience-role__date">Dec 2023 - Present</span>
</div>

- Lead ambient air pollution projects using four years of monitoring-network and E-Sampler data in Nepal and Peru.
- Develop cross-regional calibration models for co-located PurpleAir low-cost PM2.5 sensors against MetOne E-Sampler reference monitors using kriging, random forest, and XGBoost.
- Generate hourly PM2.5 exposure maps integrating meteorological covariates to study seasonal variation and urban-rural disparities in LMIC settings.

Rollins School of Public Health, Emory University

<div class="experience-role">
  <span>Data Analyst, Prof. Kyle Steenland</span>
  <span class="experience-role__date">Jan 2025 - Present</span>
</div>

- Conduct HAPIN data management and socioeconomic index construction using Multiple Correspondence Analysis across Guatemala, India, Peru, and Rwanda.
- Reproduce and validate analytic workflows in R Markdown and contribute to manuscript development for household air pollution and child health analyses.

<span class='anchor' id='education'></span>

## Education

- *Beginning Fall 2026*, **University of Southern California** - Ph.D. in Epidemiology, Environmental Health Track, Keck School of Medicine.
- *2021 - 2023*, **Johns Hopkins University** - M.S.E. in Applied Mathematics and Statistics, Whiting School of Engineering.
- *2017 - 2020*, **University of South Carolina** - B.S. in Statistics; minor in Risk Management and Insurance.

<span class='anchor' id='honors-awards'></span>

## Honors and Awards

- *2026 - 2031*, Multi-Year Funding Offer, University of Southern California.
- *2021 - 2023*, Departmental Tuition Fellowship, Johns Hopkins University.
- *2019 - 2020*, University of South Carolina Undergraduate Nonresident Scholarship.
- *2019 - 2020*, University of South Carolina Academic Achievement Scholarship.
- *2017 - 2020*, Dean's Honor List / President's Honor List, University of South Carolina.

<span class='anchor' id='presentations'></span>

## Presentations

- **Yang M**, Robertson NM, Sharma AK, Chandyo RK, Shrestha L, Das SK, Kirenga B, Alupo P, Gianella GE, Siddharthan T, Pollard SL, Quaderi S, Rykiel N, Flores-Flores O, Hurst JR, Wise RA, Checkley W. *Screening for Chronic Obstructive Pulmonary Disease (COPD) Using the St. George's Respiratory Questionnaire*. American Thoracic Society International Conference, San Francisco, CA, May 18, 2025. [AJRCCM abstract](https://doi.org/10.1164/ajrccm.2025.211.Abstracts.A1247).
- Robertson N, **Yang M**, et al. *Chronic Bronchitis Prevalence, Risk Factors, and Outcomes in a Multinational Cohort*. European Respiratory Society Congress, Amsterdam, Netherlands, Oct 1, 2025. [ERS abstract](https://doi.org/10.1183/13993003.congress-2025.PA463).
- Wells M, **Yang M**, Nicolaou L, Williams K, Checkley W. *Dry Eye Symptoms and Household Air Pollution: Findings from the HAPIN Trial in Peru*. Women in Ophthalmology Summer Symposium, Amelia Island, FL, Aug 12, 2025.
- Emetu S, **Yang M**, Nicolaou L, Kephart J, Fandino-del-Rio M, Williams K, Steenland NK, Koehler K, Checkley W. *Cooking with Liquefied Petroleum Gas versus Biomass on Lung Function in Adult Peruvian Women*. Accepted for CHEST Annual Meeting, Phoenix, AZ, Oct 18-21, 2026.

<span class='anchor' id='technical-skills'></span>

## Technical Skills

- **Programming and statistical computing:** R, Python, MATLAB, SAS, SQL, Java, R Markdown, LaTeX, Git, AWS, REDCap, Tableau.
- **Statistical methods:** causal inference, DAGs, mixed-effects models, Bayesian hierarchical models, functional data analysis, machine learning, random forest, XGBoost, simulation, and sensitivity analysis.
- **Geospatial and exposure science:** ArcGIS, `sf`, `terra`, `raster`, kriging, spatial interpolation, exposure surface generation, PurpleAir sensor co-location, MetOne E-Sampler calibration, and LMIC monitoring-network quality control.
- **Research infrastructure:** reproducible pipelines, codebooks, automated reporting, manuscript supplements, data harmonization, REDCap database design, and collaborative analysis workflows.
