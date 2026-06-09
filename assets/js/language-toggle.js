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
    "Mingling (Mona) Yang": "杨明灵 (Mona)",
    "Incoming Ph.D. Student in Epidemiology": "流行病学博士新生",
    "Environmental Epidemiology · Exposure Science · Biostatistics": "环境流行病学 · 暴露科学 · 生物统计",
    "CV": "简历",
    "Email": "邮箱",
    "Google Scholar": "Google Scholar",
    "ResearchGate": "ResearchGate",
    "GitHub": "GitHub",
    "Github": "GitHub",
    "Los Angeles, CA": "洛杉矶，加州",
    "USC Keck Schoolof Medicine": "南加州大学凯克医学院",
    "USC Keck School": "南加州大学凯克",
    "of Medicine": "医学院",
    "I am Mingling (Mona) Yang, an incoming Ph.D. student in Epidemiology on the Environmental Health Track at the Keck School of Medicine of the University of Southern California, beginning in Fall 2026.": "我是杨明灵 (Mona) Yang，将于 2026 年秋季进入南加州大学凯克医学院流行病学博士项目，方向为环境健康。",
    "I am Mingling (Mona) Yang, an incoming Ph.D. student in Epidemiology at USC Keck School of Medicine. My research connects environmental epidemiology, exposure science, and data systems to study how air pollution and chemical exposures shape respiratory, metabolic, and child health.": "我是杨明灵 (Mona) Yang，即将进入南加州大学凯克医学院流行病学博士项目。我的研究连接环境流行病学、暴露科学和数据系统，关注空气污染与化学暴露如何影响呼吸、代谢和儿童健康。",
    "Hi, I’m Mona Yang. Welcome to my personal website.": "你好，我是 Mona Yang。欢迎来到我的个人网站。",
    "Hi, I’m Mona Yang. Welcome to my personal website. I am an incoming PhD student in Epidemiology at the Keck School of Medicine at the University of Southern California. My commitment to environmental epidemiology began during my undergraduate studies at the University of South Carolina. Through participating in local flood relief efforts and witnessing the profound impact of the COVID-19 pandemic firsthand, I came to understand how structural inequalities can intensify environmental health risks.": "你好，我是 Mona Yang。欢迎来到我的个人网站。我即将进入南加州大学凯克医学院攻读流行病学博士。我的环境流行病学志向始于南卡罗来纳大学本科阶段。通过参与当地洪灾救援，并亲身见证 COVID-19 疫情的深远影响，我逐渐理解结构性不平等如何加剧环境健康风险。",
    "I am an incoming PhD student in Epidemiology at the Keck School of Medicine at the University of Southern California. My commitment to environmental epidemiology began during my undergraduate studies at the University of South Carolina. Through participating in local flood relief efforts and witnessing the profound impact of the COVID-19 pandemic firsthand, I came to understand how structural inequalities can intensify environmental health risks.": "我即将进入南加州大学凯克医学院攻读流行病学博士。我的环境流行病学志向始于南卡罗来纳大学本科阶段。通过参与当地洪灾救援，并亲身见证 COVID-19 疫情的深远影响，我逐渐理解结构性不平等如何加剧环境健康风险。",
    "These experiences motivated me to build a strong quantitative foundation through rigorous training in mathematics and statistics during my undergraduate and graduate studies. Later, during my three years as a biostatistician at Johns Hopkins University, I gained a deeper appreciation for how epidemiologic frameworks can translate complex exposure data into preventive strategies and public health policy.": "这些经历推动我在本科和研究生阶段通过严格的数学与统计训练建立扎实的定量基础。之后，在约翰斯·霍普金斯大学担任生物统计师的三年中，我更深刻地理解了流行病学框架如何将复杂暴露数据转化为预防策略和公共卫生政策。",
    "As I begin my PhD in Epidemiology at USC under the mentorship of Dr. Vaia Lida Chatzi, I hope to broaden my research in environmental health, with a focus on PFAS, exposomics, multi-omics, and life-course approaches to environmental epidemiology.": "在 Vaia Lida Chatzi 博士指导下开启 USC 流行病学博士训练后，我希望拓展环境健康研究，重点关注 PFAS、暴露组学、多组学以及生命历程环境流行病学方法。",
    "At Johns Hopkins, I have worked across HAPIN, GECo, CHAP, and ambient PM2.5 projects in Nepal, Peru, Uganda, Guatemala, India, and Rwanda. My doctoral work will build from this global air pollution portfolio toward PFAS, exposomics, multi-omics, and life-course environmental health with Dr. Vaia Lida Chatzi.": "在约翰斯·霍普金斯大学，我参与了尼泊尔、秘鲁、乌干达、危地马拉、印度和卢旺达的 HAPIN、GECo、CHAP 以及环境 PM2.5 项目。我的博士研究将从全球空气污染研究积累出发，与 Vaia Lida Chatzi 博士一起拓展到 PFAS、暴露组学、多组学和生命历程环境健康。",
    "My work sits at the intersection of environmental epidemiology, exposure science, biostatistics, and reproducible data systems. At Johns Hopkins, I have worked with Dr. William Checkley and Dr. Laura Nicolaou on multinational studies including the Household Air Pollution Intervention Network (HAPIN), the Global Excellence in COPD Outcomes (GECo) study, CHAP, and ambient air pollution monitoring projects in Nepal and Peru. Across these projects, I have built harmonized multi-country databases, calibrated low-cost PM2.5 sensors against reference-grade monitors, modeled respiratory and child health outcomes, and developed reproducible R/Python/SQL pipelines for large environmental health datasets.": "我的工作结合环境流行病学、暴露科学、生物统计和可复现数据系统。在约翰斯·霍普金斯大学，我与 William Checkley 博士和 Laura Nicolaou 博士合作，参与 HAPIN、GECo、CHAP 以及尼泊尔和秘鲁的环境空气污染监测项目。我在这些项目中构建多国家标准化数据库，校准低成本 PM2.5 传感器，建模呼吸和儿童健康结局，并为大型环境健康数据集开发可复现的 R、Python 和 SQL 流程。",
    "At USC, my doctoral direction will connect this background in air pollution, global respiratory health, and causal/statistical modeling with Dr. Vaia Lida Chatzi's environmental health research program on PFAS, endocrine-disrupting chemicals, exposomics, multi-omics, and metabolic health across the life course. I am especially interested in developing statistical and geospatial frameworks that link complex environmental mixtures to respiratory, metabolic, liver, and child health outcomes, with an emphasis on prevention and policy-relevant environmental health evidence.": "在南加州大学，我的博士研究将把空气污染、全球呼吸健康和因果/统计建模经验，与 Vaia Lida Chatzi 博士关于 PFAS、内分泌干扰物、暴露组学、多组学以及生命历程代谢健康的环境健康研究结合起来。我尤其希望发展统计和地理空间方法，研究复杂环境混合暴露与呼吸、代谢、肝脏和儿童健康结局之间的关系，并强调预防和政策相关证据。",
    "At USC, my doctoral direction will connect this background in air pollution, global respiratory health, and causal/statistical modeling with Dr. Vaia Lida Chatzi’s environmental health research program on PFAS, endocrine-disrupting chemicals, exposomics, multi-omics, and metabolic health across the life course. I am especially interested in developing statistical and geospatial frameworks that link complex environmental mixtures to respiratory, metabolic, liver, and child health outcomes, with an emphasis on prevention and policy-relevant environmental health evidence.": "在南加州大学，我的博士研究将把空气污染、全球呼吸健康和因果/统计建模经验，与 Vaia Lida Chatzi 博士关于 PFAS、内分泌干扰物、暴露组学、多组学以及生命历程代谢健康的环境健康研究结合起来。我尤其希望发展统计和地理空间方法，研究复杂环境混合暴露与呼吸、代谢、肝脏和儿童健康结局之间的关系，并强调预防和政策相关证据。",
    "My publication profile is on": "我的论文发表主页见",
    "Publication profile": "论文主页",
    "Loading": "加载中",
    "citations": "引用",
    "h-index": "h 指数",
    "Scholar items": "Scholar 条目",
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
    "Article count legend": "文章数量图例",
    "Publication tag filters": "论文标签筛选",
    "No publications match the selected tags.": "没有论文匹配当前选择的标签。",
    "All (7)": "全部 (7)",
    "Chronic bronchitis": "慢性支气管炎",
    "COPD screening": "COPD 筛查",
    "LPG intervention": "LPG 干预",
    "Risk factors": "风险因素",
    "SGRQ": "SGRQ",
    "ATS poster": "ATS 海报",
    "Bayley-III": "Bayley-III",
    "Biomass cooking": "生物质烹饪",
    "Child growth": "儿童生长",
    "Clinical outcomes": "临床结局",
    "GECo cohorts": "GECo 队列",
    "Household air pollution": "家庭空气污染",
    "Infant health": "婴儿健康",
    "Linear trajectories": "线性轨迹",
    "LMIC cohorts": "中低收入国家队列",
    "Neurodevelopment": "神经发育",
    "Oral talk": "口头报告",
    "PEF": "PEF",
    "PM2.5 exposure": "PM2.5 暴露",
    "Puno, Peru": "秘鲁 Puno",
    "Resource-limited settings": "资源有限地区",
    "Severe pneumonia": "重症肺炎",
    "Spirometry": "肺功能测定",
    "0-1 article": "0-1 篇文章",
    "2-3 articles": "2-3 篇文章",
    "4+ articles": "4 篇以上文章",
    "Showing updates from the last 6 months.": "仅显示最近 6 个月的动态。",
    "No public updates in this window yet.": "这个时间窗口内暂无公开动态。",
    "Publication metadata synced from Google Scholar. Last Scholar crawler update:": "论文元数据已从 Google Scholar 同步。Scholar 爬虫最近更新时间：",
    "Publication metadata synced from Google Scholar. Last Scholar crawler update: 2026-06-05 11:28:15.417423.": "论文元数据已从 Google Scholar 同步。Scholar 爬虫最近更新时间：2026-06-05 11:28:15.417423。",
    "Showing curated publication data. Google Scholar metadata will appear here when the crawler data is reachable.": "正在显示整理后的论文数据。当 Google Scholar 元数据可访问时，会自动显示在这里。",
    "Fall 2026: I will begin Ph.D. training in Epidemiology, Environmental Health Track, at the Keck School of Medicine of USC.": "2026 年秋季：我将在南加州大学凯克医学院环境健康方向开始流行病学博士训练。",
    "Fall 2026:": "2026 年秋季：",
    "Scholar citations:": "Scholar 引用：",
    "I will begin Ph.D. training in Epidemiology, Environmental Health Track, at the Keck School of Medicine of USC.": "我将在南加州大学凯克医学院环境健康方向开始流行病学博士训练。",
    "Long-term clean-fuel intervention and child growth trajectories. Scholar citations: 2.": "长期清洁燃料干预与儿童生长轨迹。Scholar 引用：2。",
    "Chronic bronchitis risk and outcomes in LMIC cohorts. Scholar citations: 1.": "中低收入国家队列中的慢性支气管炎风险与结局。Scholar 引用：1。",
    "COPD screening with the St. George's Respiratory Questionnaire. Scholar citations: 6.": "使用 St. George's Respiratory Questionnaire 进行 COPD 筛查。Scholar 引用：6。",
    "Cooking fuel exposure and preschool neurodevelopment. Scholar citations: 4.": "烹饪燃料暴露与学龄前儿童神经发育。Scholar 引用：4。",
    "2026: Long-term clean-fuel intervention and child growth trajectories. Scholar citations: 2.": "2026：长期清洁燃料干预与儿童生长轨迹。Scholar 引用：2。",
    "2026: Chronic bronchitis risk and outcomes in LMIC cohorts. Scholar citations: 1.": "2026：中低收入国家队列中的慢性支气管炎风险与结局。Scholar 引用：1。",
    "2025: COPD screening with the St. George's Respiratory Questionnaire. Scholar citations: 6.": "2025：使用 St. George's Respiratory Questionnaire 进行 COPD 筛查。Scholar 引用：6。",
    "2025: Cooking fuel exposure and preschool neurodevelopment. Scholar citations: 4.": "2025：烹饪燃料暴露与学龄前儿童神经发育。Scholar 引用：4。",
    "Long-term clean-fuel intervention and child growth trajectories": "长期清洁燃料干预与儿童生长轨迹",
    "Chronic bronchitis risk and outcomes in LMIC cohorts": "中低收入国家队列中的慢性支气管炎风险与结局",
    "COPD screening with the St. George's Respiratory Questionnaire": "使用 St. George's Respiratory Questionnaire 进行 COPD 筛查",
    "Cooking fuel exposure and preschool neurodevelopment": "烹饪燃料暴露与学龄前儿童神经发育",
    "Household air pollution and severe pneumonia in infants": "家庭空气污染与婴儿重症肺炎",
    "Chronic bronchitis risk factors and outcomes": "慢性支气管炎风险因素与结局",
    "COPD screening with SGRQ": "使用 SGRQ 进行 COPD 筛查",
    "The ERS Congress Abstract": "ERS 大会摘要",
    "The ATS International Conference Abstract and Poster": "ATS 国际会议摘要与海报",
    "A key gap was whether clean cooking interventions could affect child growth beyond infancy. Using longitudinal HAPIN follow-up in Puno, Peru, this study modeled preschool height trajectories and extended clean-fuel evidence from exposure reduction to child growth outcomes.": "关键研究空白是清洁烹饪干预是否会影响婴儿期之后的儿童生长。本研究使用秘鲁 Puno 的 HAPIN 纵向随访数据建模学龄前身高轨迹，将清洁燃料证据从暴露降低拓展到儿童生长结局。",
    "Chronic bronchitis is understudied in LMIC cohorts despite its clinical burden. This GECo analysis pooled harmonized multi-country data to evaluate prevalence, risk factors, lung function, and outcomes, supporting more targeted chronic respiratory disease prevention.": "尽管慢性支气管炎具有临床负担，它在中低收入国家队列中仍研究不足。本项 GECo 分析整合多国家标准化数据，评估患病率、风险因素、肺功能和结局，为更有针对性的慢性呼吸疾病预防提供证据。",
    "COPD case-finding is difficult where spirometry access is limited. This study tested SGRQ-based screening against spirometry-defined COPD across LMIC cohorts and identified a practical pathway for prioritizing confirmatory testing.": "在肺功能测定资源有限的地区，COPD 病例发现较为困难。本研究在中低收入国家队列中将基于 SGRQ 的筛查与肺功能定义的 COPD 进行比较，提出了优先安排确证性检测的实用路径。",
    "Evidence linking household air pollution interventions to preschool neurodevelopment remains limited. This HAPIN follow-up in Puno, Peru combined intervention and exposure-response analyses with Bayley-III testing to connect clean cooking exposure with child development outcomes.": "家庭空气污染干预与学龄前神经发育之间的证据仍然有限。本项秘鲁 Puno 的 HAPIN 随访研究结合干预分析、暴露反应分析和 Bayley-III 测试，将清洁烹饪暴露与儿童发育结局联系起来。",
    "The contribution of biomass cooking to severe infant pneumonia is difficult to quantify in real-world settings. This HAPIN analysis used intervention and exposure data to link household air pollution with clinically important infant respiratory illness.": "在真实世界情境中，生物质烹饪对婴儿重症肺炎的贡献难以量化。本项 HAPIN 分析使用干预和暴露数据，将家庭空气污染与具有临床意义的婴儿呼吸系统疾病联系起来。",
    "Before the full journal analysis, multinational LMIC evidence on chronic bronchitis was limited. This ERS Congress abstract used harmonized GECo data to present early patterns in risk factors, symptoms, lung function, and outcomes.": "在完整期刊论文发表前，关于中低收入国家慢性支气管炎的多国证据仍然有限。本 ERS 大会摘要使用标准化 GECo 数据，呈现风险因素、症状、肺功能和结局的早期模式。",
    "Affordable COPD screening remains a major implementation gap in resource-limited settings. This ATS abstract and poster evaluated SGRQ with supporting clinical measures to identify scalable case-finding workflows for LMIC cohorts.": "在资源有限地区，低成本 COPD 筛查仍是重要实施缺口。本 ATS 摘要与海报评估 SGRQ 及辅助临床指标，用于识别适合中低收入国家队列的可扩展病例发现流程。",
    "A key gap was whether household energy interventions could produce benefits that persist beyond infancy into preschool growth. This study followed children in Puno, Peru after LPG or biomass cooking exposure and modeled longitudinal height trajectories across early childhood. The analysis links long-term clean cooking exposure with patterns in linear growth and identifies subgroups where intervention timing and household context may matter. The findings extend HAPIN evidence from exposure reduction toward child growth outcomes relevant for policy.": "一个关键研究空白是家庭能源干预带来的健康收益是否能从婴儿期延续到学龄前儿童生长。本研究随访秘鲁 Puno 地区接受 LPG 或生物质烹饪暴露的儿童，并建模早期儿童阶段的纵向身高轨迹。分析将长期清洁烹饪暴露与线性生长模式联系起来，并识别干预时机和家庭背景可能更重要的亚组。研究结果将 HAPIN 的证据从降低暴露拓展到与政策相关的儿童生长结局。",
    "Chronic bronchitis is understudied in low- and middle-income countries, where risk factors and downstream clinical burden may differ from high-income settings. This multi-country GECo cohort analysis estimated prevalence and evaluated demographic, environmental, respiratory, lung function, and clinical outcome patterns. By pooling harmonized data across LMIC sites, the study clarifies which exposures and symptoms are most strongly associated with chronic bronchitis. The results support more targeted prevention and symptom recognition in global COPD and chronic respiratory disease programs.": "慢性支气管炎在中低收入国家研究不足，而这些地区的风险因素和后续临床负担可能不同于高收入国家。本项多国家 GECo 队列分析估计患病率，并评估人口学、环境、呼吸、肺功能和临床结局模式。通过整合多个中低收入国家研究点的标准化数据，本研究明确了哪些暴露和症状与慢性支气管炎关联最强。研究结果支持全球 COPD 和慢性呼吸疾病项目中更有针对性的预防与症状识别。",
    "Spirometry is often unavailable in resource-limited settings, leaving a gap in practical COPD case-finding. This study evaluated whether the St. George's Respiratory Questionnaire, with simple clinical information such as peak expiratory flow, could screen population-based cohorts for COPD. The analysis compared questionnaire-based strategies against spirometry-defined disease across multiple LMIC sites. It identifies a lower-cost screening pathway that can help prioritize confirmatory testing where respiratory diagnostic capacity is limited.": "在资源有限地区，肺功能测定往往难以获得，这使实际 COPD 病例发现存在缺口。本研究评估 St. George's Respiratory Questionnaire 结合峰值呼气流量等简单临床信息，是否可用于人群队列中的 COPD 筛查。分析在多个中低收入国家研究点比较了问卷筛查策略与肺功能定义疾病之间的表现。结果提出了一条成本更低的筛查路径，可在呼吸诊断能力有限的地区帮助优先安排确证性检测。",
    "Evidence was limited on whether clean cooking interventions and measured PM2.5 exposure relate to preschool neurodevelopment after early-life household air pollution exposure. This study followed HAPIN children in Puno, Peru and assessed cognitive, language, and motor outcomes using standardized developmental testing. It combined intervention assignment and exposure-response analyses to evaluate how cooking fuel and pollution levels mapped onto Bayley-III outcomes. The findings connect household energy interventions with child development endpoints beyond respiratory health.": "关于早期家庭空气污染暴露后，清洁烹饪干预和实测 PM2.5 暴露是否影响学龄前神经发育，既有证据仍然有限。本研究随访秘鲁 Puno 的 HAPIN 儿童，并使用标准化发育测试评估认知、语言和运动结局。研究结合干预分组和暴露反应分析，评估烹饪燃料及污染水平如何对应 Bayley-III 结局。结果将家庭能源干预与呼吸健康之外的儿童发育终点联系起来。",
    "Severe infant pneumonia remains a major concern, but the exposure threshold and real-world contribution of household biomass cooking are difficult to quantify. This HAPIN analysis examined infant pneumonia outcomes in relation to household air pollution from biomass cooking and cleaner cooking conditions. It used intervention and exposure data across trial settings to connect cooking practices with clinically important respiratory illness. The results strengthen evidence that reducing household air pollution can support infant respiratory health.": "婴儿重症肺炎仍是重要公共卫生问题，但家庭生物质烹饪的暴露阈值和真实世界贡献难以量化。本项 HAPIN 分析研究生物质烹饪产生的家庭空气污染及清洁烹饪条件与婴儿肺炎结局之间的关系。研究利用多个试验环境中的干预和暴露数据，将烹饪实践与临床重要的呼吸系统疾病联系起来。结果进一步支持降低家庭空气污染有助于婴儿呼吸健康。",
    "Multinational evidence on chronic bronchitis risk factors and outcomes in LMIC cohorts was limited before the full journal analysis. This ERS Congress abstract presented early GECo findings on risk factors, respiratory symptoms, lung function, and outcome burden across participating countries. The work used harmonized cohort data to identify population-level patterns that warranted deeper clinical analysis. It helped frame chronic bronchitis as a measurable and consequential phenotype in global respiratory health research.": "在完整期刊论文发表前，关于中低收入国家队列中慢性支气管炎风险因素与结局的多国证据仍然有限。该 ERS 大会摘要展示了 GECo 对参与国家中风险因素、呼吸症状、肺功能和结局负担的早期发现。研究使用标准化队列数据识别值得进一步临床分析的人群层面模式。它帮助将慢性支气管炎界定为全球呼吸健康研究中可测量且具有后果意义的表型。",
    "citations": "引用",
    "citation": "引用",
    "h-index": "h 指数",
    "Scholar items": "Scholar 条目",
    "Loading Google Scholar updates...": "正在加载 Google Scholar 动态...",
    "Loading publications from Google Scholar...": "正在从 Google Scholar 加载论文...",
    "Research/ Work Experience": "研究/工作经历",
    "Johns Hopkins University School of Medicine": "约翰斯·霍普金斯大学医学院",
    "Senior Research Data Analyst, Prof. William Checkley": "高级研究数据分析师，William Checkley 教授",
    "Research Assistant, Dr. Laura Nicolaou": "研究助理，Laura Nicolaou 博士",
    "Johns Hopkins Bloomberg School of Public Health": "约翰斯·霍普金斯大学彭博公共卫生学院",
    "Rollins School of Public Health, Emory University": "埃默里大学罗林斯公共卫生学院",
    "Data Analyst, Prof. Kyle Steenland": "数据分析师，Kyle Steenland 教授",
    "Sep 2023 - May 2026": "2023 年 9 月至 2026 年 5 月",
    "Dec 2023 - May 2026": "2023 年 12 月至 2026 年 5 月",
    "Jan 2025 - May 2026": "2025 年 1 月至 2026 年 5 月",
    "May 2020 - Aug 2021": "2020 年 5 月至 2021 年 8 月",
    "Jan 2021 - May 2021": "2021 年 1 月至 2021 年 5 月",
    "Jan 2022 - Dec 2022": "2022 年 1 月至 2022 年 12 月",
    "Serve as lead analyst across multinational environmental and respiratory health studies, harmonizing more than 100 million data points spanning exposure, clinical, questionnaire, biomarker, sensor, and social-network datasets.": "在多国环境与呼吸健康研究中担任主要分析师，整合超过一亿个数据点，涵盖暴露、临床、问卷、生物标志物、传感器和社会网络数据。",
    "Build reproducible R/SQL/Python workflows and internal tools for data integration, quality control, calibration, visualization, and statistical reporting across study sites.": "构建可复现的 R、SQL 和 Python 工作流及内部工具，用于多研究点的数据整合、质量控制、校准、可视化和统计报告。",
    "Apply linear mixed models, Bayesian and multilevel models, causal DAGs, functional data analysis, geostatistics, random forests, and XGBoost to multi-level environmental health questions.": "将线性混合模型、贝叶斯和多层模型、因果 DAG、函数型数据分析、地统计、随机森林和 XGBoost 应用于多层级环境健康问题。",
    "Design and maintain REDCap systems linking household, individual, facility, and clinical forms; train collaborators on data quality workflows and reporting.": "设计并维护连接家庭、个人、机构和临床表格的 REDCap 系统，并培训合作者进行数据质量工作流和报告。",
    "Selected JHU projects": "JHU 代表项目",
    "GECo - COPD and chronic bronchitis, Nepal, Peru, and Uganda: quantified COPD burden, chronic bronchitis risk factors, population attributable fractions, and SGRQ-based screening performance in large LMIC cohorts.": "GECo 项目，尼泊尔、秘鲁和乌干达的 COPD 与慢性支气管炎：在大型中低收入国家队列中量化 COPD 负担、慢性支气管炎风险因素、人群归因比例和基于 SGRQ 的筛查表现。",
    "HAPIN - child growth and neurodevelopment, Puno, Peru: evaluated PM2.5/CO exposure-response relationships for early child growth and Bayley-III neurodevelopmental outcomes using longitudinal and causal inference frameworks.": "HAPIN 项目，秘鲁 Puno 的儿童生长与神经发育：使用纵向和因果推断框架评估 PM2.5/CO 暴露反应关系与早期儿童生长及 Bayley-III 神经发育结局。",
    "CHAP - social networks and clean fuel adoption, Peru: analyzed how network structure, tie strength, and aspirational ties shape sustained LPG stove use in rural communities.": "CHAP 项目，秘鲁社会网络与清洁燃料采纳：分析网络结构、关系强度和愿景型关系如何影响农村社区持续使用 LPG 炉具。",
    "Global Lung Health / Chiesi projects, Nepal and Peru: supported spirometry and oscillometry screening among brick-kiln workers through REDCap architecture, data quality control, and visualization workflows.": "Global Lung Health / Chiesi 项目，尼泊尔和秘鲁：通过 REDCap 架构、数据质量控制和可视化工作流支持砖窑工人的肺功能和振荡法筛查。",
    "Lead ambient air pollution projects using four years of monitoring-network and E-Sampler data in Nepal and Peru.": "负责尼泊尔和秘鲁的环境空气污染项目，使用四年的监测网络和 E-Sampler 数据。",
    "Develop cross-regional calibration models for co-located PurpleAir low-cost PM2.5 sensors against MetOne E-Sampler reference monitors using kriging, random forest, and XGBoost.": "使用克里金、随机森林和 XGBoost，为与 MetOne E-Sampler 参考监测仪共址的 PurpleAir 低成本 PM2.5 传感器开发跨区域校准模型。",
    "Generate hourly PM2.5 exposure maps integrating meteorological covariates to study seasonal variation and urban-rural disparities in LMIC settings.": "整合气象协变量生成小时级 PM2.5 暴露地图，用于研究中低收入国家情境下的季节变化和城乡差异。",
    "Conduct HAPIN data management and socioeconomic index construction using Multiple Correspondence Analysis across Guatemala, India, Peru, and Rwanda.": "开展 HAPIN 数据管理，并使用多重对应分析构建危地马拉、印度、秘鲁和卢旺达的社会经济指数。",
    "Reproduce and validate analytic workflows in R Markdown and contribute to manuscript development for household air pollution and child health analyses.": "在 R Markdown 中复现并验证分析工作流，并参与家庭空气污染与儿童健康分析的论文写作。",
    "Research and professional experience timeline": "研究与工作经历时间线",
    "Data Analyst @ Rollins School of Public Health, Emory University": "数据分析师 @ 埃默里大学罗林斯公共卫生学院",
    "Collaborator: Kyle Steenland, Professor of Environmental Health & Epidemiology": "合作者：Kyle Steenland，环境健康与流行病学教授",
    "HAPIN Trial: Guatemala, India, Peru, Rwanda": "HAPIN 试验：危地马拉、印度、秘鲁、卢旺达",
    "Led data management, visualization, and socioeconomic index construction using Multiple Correspondence Analysis across four country sites.": "负责四个国家研究点的数据管理、可视化，并使用多重对应分析构建社会经济指数。",
    "Replicated analyses in R Markdown and cross-validated results with original SAS outputs.": "使用 R Markdown 复现分析，并与原始 SAS 输出进行交叉验证。",
    "Prepared manuscript materials and contributed to peer-review responses for household air pollution and infant health analyses.": "准备论文材料，并参与家庭空气污染与婴儿健康分析的同行评审回复。",
    "Output:": "产出：",
    "Outputs:": "产出：",
    "Contributed to “Exposures to Household Pollution From Biomass Cooking and Severe Pneumonia in Infants,” JAMA Network Open, 2025.": "参与论文 “Exposures to Household Pollution From Biomass Cooking and Severe Pneumonia in Infants”，发表于 JAMA Network Open，2025。",
    "Research Assistant @ Johns Hopkins Bloomberg School of Public Health": "研究助理 @ 约翰斯·霍普金斯大学彭博公共卫生学院",
    "Advisor: Laura Nicolaou, Professor of Environmental Health & Engineering": "导师：Laura Nicolaou，环境健康与工程教授",
    "Alliance for a Healthier World: ambient air pollution in Nepal and Peru": "Alliance for a Healthier World：尼泊尔与秘鲁环境空气污染项目",
    "Led ambient air pollution projects using four years of monitoring network and E-Sampler data, covering about 75 million records.": "负责环境空气污染项目，使用四年的监测网络和 E-Sampler 数据，覆盖约 7500 万条记录。",
    "Developed cross-regional calibration models for PurpleAir PM2.5 sensors against MetOne E-Sampler monitors using kriging, random forest, and XGBoost.": "使用克里金、随机森林和 XGBoost，开发 PurpleAir PM2.5 传感器相对 MetOne E-Sampler 参考监测仪的跨区域校准模型。",
    "Built dynamic spatiotemporal models with meteorological covariates to generate hourly PM2.5 maps and study seasonal and urban-rural disparities.": "结合气象协变量构建动态时空模型，生成小时级 PM2.5 地图，并研究季节变化与城乡差异。",
    "Manuscript in preparation on high-resolution PM2.5 mapping for Bhaktapur, Nepal.": "正在准备关于尼泊尔 Bhaktapur 高分辨率 PM2.5 制图的论文。",
    "HAPIN longitudinal study of early child growth, Puno, Peru": "HAPIN 早期儿童生长纵向研究，秘鲁 Puno",
    "Developed a DAG-based causal framework for PM2.5, CO, and early childhood growth outcomes.": "为 PM2.5、CO 与早期儿童生长结局建立基于 DAG 的因果框架。",
    "Modeled height-for-age trajectories using longitudinal mixed-effects models in a three-year follow-up trial cohort.": "在三年随访试验队列中，使用纵向混合效应模型建模年龄别身高轨迹。",
    "Co-author, The Lancet Regional Health - Americas, 2026.": "共同作者，The Lancet Regional Health - Americas，2026。",
    "Senior Research Data Analyst @ Johns Hopkins University School of Medicine": "高级研究数据分析师 @ 约翰斯·霍普金斯大学医学院",
    "Advisor: William Checkley, Professor of Medicine, Epidemiology & Biostatistics": "导师：William Checkley，医学、流行病学与生物统计学教授",
    "CHAP social network study, Peru": "CHAP 社会网络研究，秘鲁",
    "Led the CHAP Social Network Project and developed harmonized behavioral, household, exposure, and relational databases.": "负责 CHAP 社会网络项目，并开发标准化的行为、家庭、暴露和关系数据库。",
    "Studied how network structure, tie strength, and aspirational ties shape sustained LPG stove use in rural communities.": "研究网络结构、关系强度和愿景型关系如何影响农村社区持续使用 LPG 炉具。",
    "Manuscript in preparation on social networks and clean fuel use behaviours in rural Peru.": "正在准备关于秘鲁农村社会网络与清洁燃料使用行为的论文。",
    "GECo chronic bronchitis and COPD outcomes, Nepal, Peru, Uganda": "GECo 慢性支气管炎与 COPD 结局，尼泊尔、秘鲁、乌干达",
    "Modeled COPD and chronic bronchitis risk factors in diverse LMIC populations using harmonized survey and spirometry data.": "使用标准化问卷和肺功能数据，在多样化中低收入国家人群中建模 COPD 与慢性支气管炎风险因素。",
    "Applied logistic regression, random forest, cross-validation, sensitivity testing, and population attributable fraction workflows.": "应用逻辑回归、随机森林、交叉验证、敏感性检验和人群归因比例工作流。",
    "Co-author in European Respiratory Journal and American Journal of Respiratory and Critical Care Medicine, plus ERS and ATS presentations.": "European Respiratory Journal 与 American Journal of Respiratory and Critical Care Medicine 共同作者，并参与 ERS 和 ATS 会议展示。",
    "HAPIN neurodevelopment and eye-health substudies, Puno, Peru": "HAPIN 神经发育与眼健康子研究，秘鲁 Puno",
    "Linked prenatal and postnatal PM2.5 and CO exposure with Bayley-III cognitive, motor, and language scores.": "将产前和产后 PM2.5 与 CO 暴露同 Bayley-III 认知、运动和语言评分联系起来。",
    "Integrated ophthalmologic exams, nutrition biomarkers, and environmental exposure records for ocular disease mapping.": "整合眼科检查、营养生物标志物和环境暴露记录，用于眼部疾病制图。",
    "Co-author in Environmental Health Perspectives, 2025, and poster presentation at Global Ophthalmology Summit 2025.": "Environmental Health Perspectives 共同作者，2025，并在 Global Ophthalmology Summit 2025 做海报展示。",
    "Data Scientist @ Qiangyuan Sporting Goods Co.": "数据科学家 @ 强源体育用品公司",
    "Zhuhai, China": "中国珠海",
    "Research Assistant @ Shandong University, Shandong Big Data Research Association": "研究助理 @ 山东大学，山东省大数据研究会",
    "Full-time, Prof. Yufeng Shi: Statistics & Finance, Jinan, China": "全职，导师：史宇峰教授，统计与金融方向，中国济南",
    "Mapped production workflows, improved data integrity, and built Python and R validation scripts for manufacturing datasets.": "梳理生产流程，提升数据完整性，并为制造业数据集构建 Python 和 R 验证脚本。",
    "Applied forecasting and machine learning models to inventory dynamics, reducing excess inventory and storage costs by about 20%.": "将预测与机器学习模型应用于库存动态分析，使过量库存和仓储成本降低约 20%。",
    "Designed SQL databases integrating procurement, production, and sales data into a centralized analytics platform.": "设计 SQL 数据库，将采购、生产和销售数据整合进集中式分析平台。",
    "Teaching Assistant @ Johns Hopkins University": "助教 @ 约翰斯·霍普金斯大学",
    "Department of Applied Mathematics and Statistics": "应用数学与统计系",
    "Supported Introduction to Data Science through labs, assignments, project grading, and Python-based statistical learning support.": "通过实验课、作业设计、项目评分和 Python 统计学习支持，协助 Introduction to Data Science 课程。",
    "Taught Computing for Applied Mathematics sessions covering Python programming, numerical methods, and data manipulation.": "讲授 Computing for Applied Mathematics 课程内容，涵盖 Python 编程、数值方法和数据处理。",
    "Held office hours, designed quizzes, graded weekly assignments, and provided detailed feedback on code correctness and style.": "组织 office hours，设计测验，批改每周作业，并就代码正确性和风格提供详细反馈。",
    "Honors and Awards": "荣誉与奖项",
    "Beginning Fall 2026": "2026 年秋季开始",
    "- Ph.D. in Epidemiology, Environmental Health Track, Keck School of Medicine.": "- 流行病学博士，环境健康方向，凯克医学院。",
    "- M.S.E. in Applied Mathematics and Statistics, Whiting School of Engineering.": "- 应用数学与统计硕士，Whiting 工程学院。",
    "- B.S. in Statistics; minor in Risk Management and Insurance.": "- 统计学学士，辅修风险管理与保险。",
    "Ph.D. in Epidemiology, Environmental Health Track, Keck School of Medicine.": "流行病学博士，环境健康方向，凯克医学院。",
    "M.S.E. in Applied Mathematics and Statistics, Whiting School of Engineering.": "应用数学与统计硕士，Whiting 工程学院。",
    "B.S. in Statistics; minor in Risk Management and Insurance.": "统计学学士，辅修风险管理与保险。",
    ", Multi-Year Funding Offer, University of Southern California.": "，南加州大学多年资助录取。",
    ", Departmental Tuition Fellowship, Johns Hopkins University.": "，约翰斯·霍普金斯大学院系学费奖学金。",
    ", University of South Carolina Undergraduate Nonresident Scholarship.": "，南卡罗来纳大学本科非本州学生奖学金。",
    ", University of South Carolina Academic Achievement Scholarship.": "，南卡罗来纳大学学业成就奖学金。",
    ", Dean's Honor List / President's Honor List, University of South Carolina.": "，南卡罗来纳大学院长荣誉名单 / 校长荣誉名单。",
    ", Dean’s Honor List / President’s Honor List, University of South Carolina.": "，南卡罗来纳大学院长荣誉名单 / 校长荣誉名单。",
    "Multi-Year Funding Offer, University of Southern California.": "南加州大学多年资助录取。",
    "Departmental Tuition Fellowship, Johns Hopkins University.": "约翰斯·霍普金斯大学院系学费奖学金。",
    "University of South Carolina Undergraduate Nonresident Scholarship.": "南卡罗来纳大学本科非本州学生奖学金。",
    "University of South Carolina Academic Achievement Scholarship.": "南卡罗来纳大学学业成就奖学金。",
    "Dean's Honor List / President's Honor List, University of South Carolina.": "南卡罗来纳大学院长荣誉名单 / 校长荣誉名单。",
    "American Thoracic Society International Conference, San Francisco, CA, May 18, 2025.": "美国胸科学会国际会议，旧金山，加州，2025 年 5 月 18 日。",
    "European Respiratory Society Congress, Amsterdam, Netherlands, Oct 1, 2025.": "欧洲呼吸学会大会，阿姆斯特丹，荷兰，2025 年 10 月 1 日。",
    "Women in Ophthalmology Summer Symposium, Amelia Island, FL, Aug 12, 2025.": "Women in Ophthalmology 夏季研讨会，Amelia Island，佛罗里达，2025 年 8 月 12 日。",
    "Accepted for CHEST Annual Meeting, Phoenix, AZ, Oct 18 to 21, 2026.": "已被 CHEST 年会接收，凤凰城，亚利桑那，2026 年 10 月 18 至 21 日。",
    ". American Thoracic Society International Conference, San Francisco, CA, May 18, 2025.": "。美国胸科学会国际会议，旧金山，加州，2025 年 5 月 18 日。",
    ". European Respiratory Society Congress, Amsterdam, Netherlands, Oct 1, 2025.": "。欧洲呼吸学会大会，阿姆斯特丹，荷兰，2025 年 10 月 1 日。",
    ". Women in Ophthalmology Summer Symposium, Amelia Island, FL, Aug 12, 2025.": "。Women in Ophthalmology 夏季研讨会，Amelia Island，佛罗里达，2025 年 8 月 12 日。",
    ". Accepted for CHEST Annual Meeting, Phoenix, AZ, Oct 18 to 21, 2026.": "。已被 CHEST 年会接收，凤凰城，亚利桑那，2026 年 10 月 18 至 21 日。",
    "AJRCCM abstract": "AJRCCM 摘要",
    "ERS abstract": "ERS 摘要",
    "Technical Skills": "技术技能",
    "Programming and statistical computing:": "编程与统计计算：",
    "Statistical methods:": "统计方法：",
    "Geospatial and exposure science:": "地理空间与暴露科学：",
    "Research infrastructure:": "研究基础设施：",
    "causal inference, DAGs, mixed-effects models, Bayesian hierarchical models, functional data analysis, machine learning, random forest, XGBoost, simulation, and sensitivity analysis.": "因果推断、DAG、混合效应模型、贝叶斯层级模型、函数型数据分析、机器学习、随机森林、XGBoost、模拟和敏感性分析。",
    "ArcGIS, `sf`, `terra`, `raster`, kriging, spatial interpolation, exposure surface generation, PurpleAir sensor co-location, MetOne E-Sampler calibration, and LMIC monitoring-network quality control.": "ArcGIS、`sf`、`terra`、`raster`、克里金、空间插值、暴露表面生成、PurpleAir 传感器共址、MetOne E-Sampler 校准和中低收入国家监测网络质量控制。",
    "ArcGIS,": "ArcGIS、",
    "kriging, spatial interpolation, exposure surface generation, PurpleAir sensor co-location, MetOne E-Sampler calibration, and LMIC monitoring-network quality control.": "克里金、空间插值、暴露表面生成、PurpleAir 传感器共址、MetOne E-Sampler 校准和中低收入国家监测网络质量控制。",
    "spatial interpolation, exposure surface generation, PurpleAir sensor co-location, MetOne E-Sampler calibration, and LMIC monitoring-network quality control.": "空间插值、暴露表面生成、PurpleAir 传感器共址、MetOne E-Sampler 校准和中低收入国家监测网络质量控制。",
    "reproducible pipelines, codebooks, automated reporting, manuscript supplements, data harmonization, REDCap database design, and collaborative analysis workflows.": "可复现流程、代码本、自动化报告、论文补充材料、数据标准化、REDCap 数据库设计和协作分析工作流。",
    "Screening for Chronic Obstructive Pulmonary Disease (COPD) Using the St. George's Respiratory Questionnaire": "使用 St. George's Respiratory Questionnaire 筛查慢性阻塞性肺疾病 (COPD)",
    "Chronic Bronchitis Prevalence, Risk Factors, and Outcomes in a Multinational Cohort": "多国队列中慢性支气管炎患病率、风险因素与结局",
    "Dry Eye Symptoms and Household Air Pollution: Findings from the HAPIN Trial in Peru": "干眼症状与家庭空气污染：秘鲁 HAPIN 试验发现",
    "Cooking with Liquefied Petroleum Gas versus Biomass on Lung Function in Adult Peruvian Women": "液化石油气与生物质烹饪对秘鲁成年女性肺功能的影响"
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
    if (zh[core]) return leading + zh[core] + trailing;
    var countedTag = core.match(/^(.+?)\s+(\d+)$/);
    if (countedTag && zh[countedTag[1]]) {
      return leading + zh[countedTag[1]] + " " + countedTag[2] + trailing;
    }
    var citationCount = core.match(/^(\d+)\s+citations?$/i);
    if (citationCount) {
      return leading + citationCount[1] + " 次引用" + trailing;
    }
    var scholarItems = core.match(/^(\d+)\s+Scholar items$/i);
    if (scholarItems) {
      return leading + scholarItems[1] + " 个 Scholar 条目" + trailing;
    }
    var hIndex = core.match(/^(\d+)\s+h-index$/i);
    if (hIndex) {
      return leading + hIndex[1] + " h 指数" + trailing;
    }
    return leading + core + trailing;
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
