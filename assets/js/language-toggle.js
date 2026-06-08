(function () {
  var choices = Array.prototype.slice.call(document.querySelectorAll("[data-language-choice]"));
  if (!choices.length) return;

  var originalText = new WeakMap();
  var currentLanguage = "en";

  var zh = {
    "About Me": "关于我",
    "Research": "研究",
    "Geography": "研究地图",
    "News": "动态",
    "Publications": "论文发表",
    "Experience": "经历",
    "Education": "教育",
    "Awards": "荣誉",
    "Presentations": "会议报告",
    "Skills": "技能",
    "Mingling (Mona) Yang": "杨明玲 (Mona)",
    "Incoming USC Ph.D. Student in Epidemiology": "南加州大学流行病学博士新生",
    "Environmental Health Track, Keck School of Medicine": "凯克医学院环境健康方向",
    "CV": "简历",
    "Email": "邮箱",
    "Google Scholar": "Google Scholar",
    "ResearchGate": "ResearchGate",
    "Github": "GitHub",
    "Los Angeles, CA": "洛杉矶，加州",
    "USC Keck Schoolof Medicine": "南加州大学凯克医学院",
    "USC Keck School": "南加州大学凯克",
    "of Medicine": "医学院",
    "I am Mingling (Mona) Yang, an incoming Ph.D. student in Epidemiology on the Environmental Health Track at the Keck School of Medicine of the University of Southern California, beginning in Fall 2026.": "我是杨明玲 (Mona) Yang，将于 2026 年秋季进入南加州大学凯克医学院流行病学博士项目，方向为环境健康。",
    "My work sits at the intersection of environmental epidemiology, exposure science, biostatistics, and reproducible data systems. At Johns Hopkins, I have worked with Dr. William Checkley and Dr. Laura Nicolaou on multinational studies including the Household Air Pollution Intervention Network (HAPIN), the Global Excellence in COPD Outcomes (GECo) study, CHAP, and ambient air pollution monitoring projects in Nepal and Peru. Across these projects, I have built harmonized multi-country databases, calibrated low-cost PM2.5 sensors against reference-grade monitors, modeled respiratory and child health outcomes, and developed reproducible R/Python/SQL pipelines for large environmental health datasets.": "我的工作结合环境流行病学、暴露科学、生物统计和可复现数据系统。在约翰斯·霍普金斯大学，我与 William Checkley 博士和 Laura Nicolaou 博士合作，参与 HAPIN、GECo、CHAP 以及尼泊尔和秘鲁的环境空气污染监测项目。我在这些项目中构建多国家标准化数据库，校准低成本 PM2.5 传感器，建模呼吸和儿童健康结局，并为大型环境健康数据集开发可复现的 R、Python 和 SQL 流程。",
    "At USC, my doctoral direction will connect this background in air pollution, global respiratory health, and causal/statistical modeling with Dr. Vaia Lida Chatzi's environmental health research program on PFAS, endocrine-disrupting chemicals, exposomics, multi-omics, and metabolic health across the life course. I am especially interested in developing statistical and geospatial frameworks that link complex environmental mixtures to respiratory, metabolic, liver, and child health outcomes, with an emphasis on prevention and policy-relevant environmental health evidence.": "在南加州大学，我的博士研究将把空气污染、全球呼吸健康和因果/统计建模经验，与 Vaia Lida Chatzi 博士关于 PFAS、内分泌干扰物、暴露组学、多组学以及生命历程代谢健康的环境健康研究结合起来。我尤其希望发展统计和地理空间方法，研究复杂环境混合暴露与呼吸、代谢、肝脏和儿童健康结局之间的关系，并强调预防和政策相关证据。",
    "My publication profile is on": "我的论文发表主页见",
    "Research Interests": "研究兴趣",
    "Research Thrust": "研究主线",
    "My research connects environmental epidemiology, exposure science, and data science to understand how chemical and air pollution exposures shape health across vulnerable populations and across the life course.": "我的研究连接环境流行病学、暴露科学与数据科学，关注化学物质和空气污染暴露如何影响脆弱人群以及生命历程中的健康。",
    "Future Ph.D. Direction": "未来博士方向",
    "PFAS & Exposomics": "PFAS 与暴露组学",
    "Research Portfolio": "已有研究积累",
    "Air Pollution & Respiratory Health": "空气污染与呼吸健康",
    "Vulnerable Populations": "脆弱人群",
    "Maternal, Child & Adolescent Health": "孕产妇、儿童与青少年健康",
    "Methods & Infrastructure": "方法与数据基础设施",
    "Data Science & Statistics": "数据科学与统计",
    "PFAS, exposomics, and environmental mixtures": "PFAS、暴露组学与环境混合暴露",
    "Fall 2026 onward, I hope to develop this direction through USC doctoral training, with attention to PFAS, endocrine-disrupting chemicals, exposomics, multi-omics, metabolic health, liver disease, and life-course epidemiology.": "从 2026 年秋季开始，我希望在 USC 博士训练中发展这一方向，关注 PFAS、内分泌干扰物、暴露组学、多组学、代谢健康、肝脏疾病和生命历程流行病学。",
    "Air pollution and respiratory health": "空气污染与呼吸健康",
    "This direction reflects three years of applied work on household and ambient air pollution, PM2.5 exposure assessment, low-cost sensor calibration, COPD screening, chronic bronchitis, lung function, and global respiratory health.": "这一方向体现了我三年来围绕家庭和环境空气污染、PM2.5 暴露评估、低成本传感器校准、COPD 筛查、慢性支气管炎、肺功能和全球呼吸健康的应用研究。",
    "Maternal, child, and adolescent health": "孕产妇、儿童与青少年健康",
    "I am interested in how environmental exposures affect pregnancy, early childhood, adolescence, neurodevelopment, growth, cardiometabolic risk, and long-term health across sensitive developmental windows.": "我关注环境暴露如何影响妊娠、早期儿童、青少年、神经发育、生长、心代谢风险以及敏感发育窗口中的长期健康。",
    "Data science, statistics, and reproducible research": "数据科学、统计与可复现研究",
    "This methods direction brings together my undergraduate and graduate training, internship experience, teaching assistant work, and applied research practice in R, Python, SQL, causal inference, machine learning, GIS, longitudinal models, database harmonization, and reproducible pipelines.": "这一方法方向结合了我的本科和研究生训练、实习经历、助教工作，以及在 R、Python、SQL、因果推断、机器学习、GIS、纵向模型、数据库标准化和可复现流程中的应用研究实践。",
    "Research Geography": "研究地理分布",
    "All": "全部",
    "Projects": "项目",
    "Articles": "文章",
    "Presentations": "会议报告",
    "University of South Carolina": "南卡罗来纳大学",
    "Columbia, South Carolina": "哥伦比亚，南卡罗来纳",
    "B.S. in Statistics.": "统计学学士。",
    "Undergraduate training in statistics with a minor in Risk Management and Insurance, 2017 to 2020.": "2017 至 2020 年完成统计学本科训练，辅修风险管理与保险。",
    "Johns Hopkins University": "约翰斯·霍普金斯大学",
    "Baltimore, Maryland": "巴尔的摩，马里兰",
    "M.S.E. in Applied Mathematics and Statistics.": "应用数学与统计硕士。",
    "Graduate training through the Whiting School of Engineering, 2021 to 2023.": "2021 至 2023 年在 Whiting 工程学院完成研究生训练。",
    "University of Southern California": "南加州大学",
    "Los Angeles, California": "洛杉矶，加州",
    "Incoming Ph.D. student in Epidemiology.": "流行病学博士新生。",
    "Environmental Health Track at the Keck School of Medicine, beginning Fall 2026.": "凯克医学院环境健康方向，2026 年秋季开始。",
    "Latin America": "拉丁美洲",
    "Asia": "亚洲",
    "Africa": "非洲",
    "HAPIN, CHAP, GECo, and ambient PM2.5 projects.": "HAPIN、CHAP、GECo 与环境 PM2.5 项目。",
    "Puno field work and national Peru analyses on household air pollution, child growth, neurodevelopment, COPD screening, chronic bronchitis, clean fuel adoption, and exposure mapping.": "秘鲁 Puno 现场研究与全国分析，涵盖家庭空气污染、儿童生长、神经发育、COPD 筛查、慢性支气管炎、清洁燃料采纳和暴露制图。",
    "View presentation": "查看报告",
    "0-1 article": "0-1 篇文章",
    "2-3 articles": "2-3 篇文章",
    "4+ articles": "4 篇以上文章",
    "Loading Google Scholar updates...": "正在加载 Google Scholar 动态...",
    "Loading publications from Google Scholar...": "正在从 Google Scholar 加载论文...",
    "Research Experience": "研究经历",
    "Senior Research Data Analyst, Prof. William Checkley": "高级研究数据分析师，William Checkley 教授",
    "Research Assistant, Dr. Laura Nicolaou": "研究助理，Laura Nicolaou 博士",
    "Data Analyst, Prof. Kyle Steenland": "数据分析师，Kyle Steenland 教授",
    "Honors and Awards": "荣誉与奖项",
    "Technical Skills": "技术技能",
    "Programming and statistical computing:": "编程与统计计算：",
    "Statistical methods:": "统计方法：",
    "Geospatial and exposure science:": "地理空间与暴露科学：",
    "Research infrastructure:": "研究基础设施："
  };

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    return /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/.test(parent.tagName);
  }

  function preserveTranslate(value, lang) {
    var leading = value.match(/^\s*/)[0];
    var trailing = value.match(/\s*$/)[0];
    var core = value.trim().replace(/\s+/g, " ");
    if (!core) return value;
    if (lang === "en") return leading + core + trailing;
    return leading + (zh[core] || core) + trailing;
  }

  function translateAttributes(lang) {
    document.querySelectorAll("[aria-label]").forEach(function (element) {
      if (!element.hasAttribute("data-original-aria-label")) {
        element.setAttribute("data-original-aria-label", element.getAttribute("aria-label") || "");
      }
      var original = element.getAttribute("data-original-aria-label") || "";
      element.setAttribute("aria-label", lang === "zh" ? (zh[original] || original) : original);
    });
  }

  function translatePage(lang) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node = walker.nextNode();
    while (node) {
      if (!shouldSkip(node)) {
        if (!originalText.has(node)) {
          originalText.set(node, node.nodeValue);
        }
        node.nodeValue = preserveTranslate(originalText.get(node), lang);
      }
      node = walker.nextNode();
    }
    translateAttributes(lang);
  }

  function setLanguage(lang) {
    currentLanguage = lang;
    choices.forEach(function (choice) {
      choice.classList.toggle("is-active", choice.getAttribute("data-language-choice") === lang);
    });
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    translatePage(lang);
    try {
      window.localStorage.setItem("mingling-language", lang);
    } catch (error) {
      return;
    }
  }

  choices.forEach(function (choice) {
    choice.addEventListener("click", function (event) {
      event.preventDefault();
      setLanguage(choice.getAttribute("data-language-choice") || "en");
    });
  });

  var saved = "en";
  try {
    saved = window.localStorage.getItem("mingling-language") || "en";
  } catch (error) {
    saved = "en";
  }
  setLanguage(saved === "zh" ? "zh" : "en");

  var observer = new MutationObserver(function () {
    if (currentLanguage === "zh") {
      window.requestAnimationFrame(function () {
        if (currentLanguage === "zh") {
          translatePage("zh");
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
