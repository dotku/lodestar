export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

type Section = { title: string; body: string };
type Anchor = {
  label: string;
  value: string;
  date: string;
  sourceHost: string;
  sourceUrl: string;
};
type Scenario = { id: string; title: string; prompt: string };
type Pill = { label: string; value: string };

type Dict = {
  metaTitle: string;
  metaDescription: string;
  navTagline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPills: Pill[];
  ctaPrimary: string;
  ctaSecondary: string;
  sectionLabels: Record<
    | "problem"
    | "market"
    | "approach"
    | "whyNow"
    | "competition"
    | "compliance"
    | "stage",
    string
  >;
  problem: Section & { bullets: string[] };
  market: Section & { anchors: Anchor[]; note: string };
  approach: Section & { pillars: { name: string; body: string }[] };
  whyNow: Section & { bullets: string[] };
  competition: {
    title: string;
    body: string;
    columns: [string, string, string];
    rows: { name: string; bucket: string; angle: string }[];
  };
  compliance: Section & { rows: { name: string; status: string }[] };
  stage: Section & { bullets: string[] };
  demoTitle: string;
  demoSubtitle: string;
  demoScenarios: Scenario[];
  demoPlaceholder: string;
  demoDisclaimer: string;
  demoButton: string;
  demoClear: string;
  demoError: string;
  demoUnavailable: string;
  contactTitle: string;
  contactBody: string;
  contactEmailLabel: string;
  conceptDisclaimer: string;
  footerNotice: string;
  langLabel: string;
  marketSeeAll: string;
  marketPageTitle: string;
  marketPageSubtitle: string;
  marketBackHome: string;
  marketTableSource: string;
};

const sharedScenarios: Scenario[] = [
  {
    id: "f35-30day",
    title: "F-35 spares 30-day demand forecast",
    prompt:
      "Forecast 30-day demand for F-35A spare parts at three notional CONUS bases (Hill AFB, Luke AFB, Eglin AFB). Use illustrative readiness and sortie-rate assumptions. Highlight which line-replaceable units are likely to constrain readiness, and recommend pre-positioning moves. Stay illustrative — this is a demo, not classified or live data.",
  },
  {
    id: "bradley-surge",
    title: "Bradley fleet engine demand surge",
    prompt:
      "A notional armored brigade combat team is preparing for a 90-day deployment. Anticipate engine, transmission, and track-system spare demand for the Bradley fighting vehicle. Compare against typical garrison consumption rates. Identify a top-five risk list of long-lead items and suggest mitigation. Illustrative only.",
  },
  {
    id: "indopacom-fuel",
    title: "INDOPACOM fuel resupply under contested logistics",
    prompt:
      "Plan JP-8 / F-24 fuel resupply across a notional dispersed island posture in the Western Pacific over 14 days. Assume one MSC fueler is unavailable. Trade tanker airlift vs. surface lift, factor weather risk, and recommend a tiered posture. Stay at unclassified, illustrative level.",
  },
];

const sharedAnchors = (locale: Locale): Anchor[] => {
  const labels: Record<Locale, Record<string, string>> = {
    en: {
      dla: "DLA obligations (FY25)",
      jsdt: "DIU JSDT prototype OTAs",
      palantir: "Palantir Army Enterprise Agreement (ceiling)",
      govini: "Govini Ark SCRIPTS BPA (ceiling)",
      goviniRound: "Govini growth round (>$1B valuation)",
      rune: "Rune Technologies Series A",
      anduril: "Anduril valuation (May 2026)",
      cmmc: "CMMC 2.0 Phase 1 effective",
      jwcc: "JWCC obligated to date",
      tradewinds: "Tradewinds awards facilitated",
      cdao: "CDAO realigned under USD(R&E)",
      bedrock: "Claude + Llama in AWS GovCloud IL5",
    },
    ja: {
      dla: "DLA 義務支出(FY25)",
      jsdt: "DIU JSDT プロトタイプ OTA",
      palantir: "Palantir 米陸軍 Enterprise Agreement(上限)",
      govini: "Govini Ark — GSA SCRIPTS BPA(上限)",
      goviniRound: "Govini グロース調達(評価額 10 億ドル超)",
      rune: "Rune Technologies シリーズ A",
      anduril: "Anduril 評価額(2026 年 5 月)",
      cmmc: "CMMC 2.0 フェーズ 1 発効",
      jwcc: "JWCC 発注済み累計",
      tradewinds: "Tradewinds 取扱額累計",
      cdao: "CDAO が USD(R&E) 配下に統合",
      bedrock: "AWS GovCloud IL5 上の Claude + Llama",
    },
  };
  const L = labels[locale];
  return [
    {
      label: L.dla,
      value: "$55.4B",
      date: "FY2025",
      sourceHost: "dla.mil",
      sourceUrl:
        "https://www.dla.mil/Portals/104/Documents/J8Finance/DLA%20FY25%20WCF%20AFR.pdf",
    },
    {
      label: L.jsdt,
      value: "ASI + Watchtower Labs",
      date: "Jan 2026",
      sourceHost: "diu.mil",
      sourceUrl:
        "https://www.diu.mil/latest/two-contracts-awarded-to-modernize-decision-making-for-dows-joint-logistics",
    },
    {
      label: L.palantir,
      value: "$10B / 10 yr",
      date: "Jul 2025",
      sourceHost: "army.mil",
      sourceUrl:
        "https://www.army.mil/article/287506/u_s_army_awards_enterprise_service_agreement_to_enhance_military_readiness_and_drive_operational_efficiency",
    },
    {
      label: L.govini,
      value: "$919M / 10 yr",
      date: "Apr 2025",
      sourceHost: "prnewswire.com",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/govini-selected-for-919-million-supply-chain-risk-illumination-contract-vehicle-from-general-services-administration-302422014.html",
    },
    {
      label: L.goviniRound,
      value: "$150M @ unicorn",
      date: "Oct 2025",
      sourceHost: "cnbc.com",
      sourceUrl:
        "https://www.cnbc.com/2025/10/10/defense-tech-govini-palantir-revenue.html",
    },
    {
      label: L.rune,
      value: "$24M (a16z, Point72)",
      date: "Jul 2025",
      sourceHost: "businesswire.com",
      sourceUrl:
        "https://www.businesswire.com/news/home/20250721838717/en/Rune-Technologies-Closes-$24M-Series-A-to-Deploy-AI-Enabled-Software-for-Military-Logistics",
    },
    {
      label: L.anduril,
      value: "$61B (Thrive + a16z)",
      date: "May 2026",
      sourceHost: "bloomberg.com",
      sourceUrl:
        "https://www.bloomberg.com/news/articles/2026-05-13/anduril-valued-at-61-billion-in-round-led-by-thrive-andreessen",
    },
    {
      label: L.cmmc,
      value: "Effective",
      date: "Nov 10, 2025",
      sourceHost: "wiley.law",
      sourceUrl:
        "https://www.wiley.law/alert-additional-analysis-on-dods-final-rule-for-the-cybersecurity-maturity-model-certification-program",
    },
    {
      label: L.jwcc,
      value: "$3.9B+ task orders",
      date: "FY2025 cumul.",
      sourceHost: "meritalk.com",
      sourceUrl:
        "https://www.meritalk.com/articles/disa-reports-growth-in-jwcc-cloud-orders/",
    },
    {
      label: L.tradewinds,
      value: "$3.26B+ awards",
      date: "Feb 2026",
      sourceHost: "tradewindai.com",
      sourceUrl: "https://www.tradewindai.com/tw-marketplace",
    },
    {
      label: L.cdao,
      value: "Memo signed",
      date: "Aug 14, 2025",
      sourceHost: "ai.mil",
      sourceUrl:
        "https://www.ai.mil/Latest/News-Press/PR-View/Article/4281147/cdao-re-alignment-to-usdre-accelerates-ai-transformation-at-dod/",
    },
    {
      label: L.bedrock,
      value: "FedRAMP High + IL4/IL5",
      date: "May 2025",
      sourceHost: "aws.amazon.com",
      sourceUrl:
        "https://aws.amazon.com/blogs/publicsector/accelerating-government-innovation-amazon-bedrock-models-get-fedramp-high-and-dod-il-4-5-approval-in-aws-govcloud-us/",
    },
  ];
};

export const dictionaries: Record<Locale, Dict> = {
  en: {
    metaTitle: "Lodestar — AI-native sustainment for the U.S. Department of Defense",
    metaDescription:
      "Lodestar is a concept-stage thesis for an AI-native logistics and sustainment platform built for contested-environment DoD operations.",
    navTagline: "AI-native sustainment for contested operations",
    heroBadge: "Concept brief · investment stage",
    heroTitle: "The North Star for defense logistics.",
    heroSubtitle:
      "Lodestar is an AI-native sustainment platform built for the U.S. Department of Defense — predictive supply, contested-logistics planning, and decision support that compounds across every echelon.",
    heroPills: [
      { label: "Target buyer", value: "DoD / DLA / USTRANSCOM" },
      { label: "Stage", value: "Concept brief · pre-formation" },
      { label: "Entry vehicle", value: "DIU OTA · Tradewinds · SBIR III" },
    ],
    ctaPrimary: "Try the demo",
    ctaSecondary: "Read the brief",
    sectionLabels: {
      problem: "The problem",
      market: "Market anchors",
      approach: "Our approach",
      whyNow: "Why now",
      competition: "Competitive landscape",
      compliance: "Compliance posture",
      stage: "Where we are",
    },
    problem: {
      title: "DoD logistics still runs on systems built for garrison, not contested ops.",
      body: "Sustainment in the modern operating environment is a data problem the legacy stack cannot solve. ERPs were tuned for steady-state demand; spreadsheets bridge the gaps; analytic platforms surface dashboards rather than decisions. When the warfighter needs a courses-of-action recommendation in minutes, the answer arrives in days — if at all.",
      bullets: [
        "Forecasting horizons are too short for contested-logistics windows.",
        "Cross-component demand signals (Army / Navy / Air Force / SOCOM / Marines) remain siloed at the data layer.",
        "Predictive maintenance pilots stall at the integration step — too many systems of record, too few APIs.",
        "Coalition partner data exchange is manual when it exists at all.",
      ],
    },
    market: {
      title: "The market is being created right now.",
      body: "The 2024–2026 cycle marks the inflection from DoD AI pilots to production-scale procurement of sustainment software. Below is a fact-anchored snapshot of the public anchors we benchmark against.",
      anchors: sharedAnchors("en"),
      note:
        "Ceiling values are not-to-exceed and not guaranteed spend. Figures sourced from public DoD press releases, GAO reports, GSA records, SEC filings and reputable industry press as of May 2026.",
    },
    approach: {
      title: "An AI-native stack purpose-built for sustainment.",
      body: "Lodestar's product thesis is opinionated. We are not a generic data platform with a defense skin — we are a sustainment-decision system from the data model up.",
      pillars: [
        {
          name: "Decision-first models",
          body: "Forecasting, allocation, and routing models trained on sustainment-specific feature sets — readiness rates, mean time between failure, lift availability — not generic time-series.",
        },
        {
          name: "Action-grade outputs",
          body: "Every output is a recommended action with quantified confidence and an auditable trace back to the underlying data — built for command approval, not just dashboards.",
        },
        {
          name: "Coalition-by-design",
          body: "Tenant separation, ITAR / EAR partitioning, and data-tagging schema engineered for allied data exchange from day one.",
        },
        {
          name: "Open integration",
          body: "Adapter layer for GCSS-Army, ERP/SAP, MILSTRIP, IUID, and major commercial logistics platforms — not a rip-and-replace.",
        },
      ],
    },
    whyNow: {
      title: "Three forces converge in 2025–2026.",
      body: "",
      bullets: [
        "**Procurement vehicles matured.** DIU prototype-to-production OTAs (JSDT, Jan 2026) and the Tradewinds Solutions Marketplace ($3.26B awards facilitated) provide a non-FAR path that fits AI-native vendors.",
        "**Cloud + foundation models are accredited.** AWS GovCloud reached FedRAMP High + IL4/IL5 with Claude and Llama foundation models (May 2025) — the runtime substrate is now compliant.",
        "**Buyer signal is unambiguous.** Palantir's $10B Army EA, Govini's $919M SCRIPTS BPA, and the DIU JSDT awards collectively demonstrate that DoD is buying AI-native sustainment software at production scale.",
      ],
    },
    competition: {
      title: "We compete on decision quality, not data plumbing.",
      body: "The market splits between scaled integrators with platform reach and AI-native startups with sharper sustainment models. Our position: AI-native models, integrator-grade integration discipline.",
      columns: ["Company", "Bucket", "How they differ from Lodestar"],
      rows: [
        {
          name: "Palantir Foundry",
          bucket: "Incumbent platform",
          angle: "Strong data ontology and integration; logistics is one use case among many. Lodestar is sustainment-first.",
        },
        {
          name: "Govini Ark",
          bucket: "AI-native scale-up",
          angle: "Supply-chain risk illumination and DIB analytics. Lodestar focuses on action-grade unit-level sustainment decisions.",
        },
        {
          name: "Air Space Intelligence",
          bucket: "AI-native startup",
          angle: "PRESCIENCE — multi-domain logistics COA. JSDT awardee. Direct overlap; we differentiate on coalition data model and predictive maintenance depth.",
        },
        {
          name: "Watchtower Labs",
          bucket: "AI-native seed",
          angle: "Sustainment planning and simulation. JSDT awardee. Differentiate on production-grade integration and IL5 path.",
        },
        {
          name: "Rune Technologies",
          bucket: "AI-native early stage",
          angle: "TyrOS predictive military logistics in contested ops. Differentiate on coalition tenancy and DLA-scale integration.",
        },
        {
          name: "Booz Allen / SAIC",
          bucket: "Integrators",
          angle: "Glue layer for DLA and USTRANSCOM. Lodestar is the product layer they would integrate to deliver.",
        },
      ],
    },
    compliance: {
      title: "Built to clear the buyer-side accreditation gate.",
      body: "The Lodestar program plan budgets against the explicit accreditation path required by DoD sustainment buyers.",
      rows: [
        { name: "FedRAMP Moderate", status: "Year 1 target" },
        { name: "FedRAMP High → DoD IL4 / IL5", status: "Year 2 target via AWS GovCloud reciprocity" },
        { name: "CMMC 2.0 Level 2", status: "Self-assessment now; C3PAO certification before Nov 10, 2026 (Phase 2)" },
        { name: "ITAR / EAR registration", status: "Pre-revenue" },
        { name: "SOC 2 Type II", status: "Year 1 — commercial baseline" },
      ],
    },
    stage: {
      title: "Concept brief — pre-formation, pre-team, pre-revenue.",
      body: "Lodestar is presented here as a thesis only. There are no signed contracts, no accreditations in hand, no pilot customers, and no formed team. This page exists to invite a focused conversation with operators, capital, and prospective government partners.",
      bullets: [
        "We are seeking conversations with: warfighters and sustainment operators (Army, Navy, Air Force, Marine Corps, SOCOM), former DLA / USTRANSCOM leadership, defense-tech investors, and prime contractors interested in an AI-native sustainment partner.",
        "We are not seeking: marketing partnerships, generic SaaS resellers, or projects unrelated to DoD sustainment.",
      ],
    },
    demoTitle: "Try Lodestar — illustrative scenarios",
    demoSubtitle:
      "Pick a scenario. The AI generates an analyst-style response on synthetic, illustrative inputs. No live or classified data is ever used.",
    demoScenarios: sharedScenarios,
    demoPlaceholder: "Select a scenario above to begin.",
    demoDisclaimer:
      "Illustrative output only. Not classified, not connected to live systems, not a substitute for sustainment-officer judgment.",
    demoButton: "Generate analysis",
    demoClear: "Reset",
    demoError: "The model could not respond. Please try again.",
    demoUnavailable:
      "Demo unavailable: AI_GATEWAY_API_KEY is not configured. See README.",
    contactTitle: "Get in touch",
    contactBody:
      "Operators, capital partners, and prospective government collaborators welcome. Brief notes please — no pitches in the first message.",
    contactEmailLabel: "Email",
    conceptDisclaimer:
      "Lodestar is a concept-stage brief. No team, contracts, accreditations, customers, or pilots have been claimed or implied. All figures are public, dated, and sourced. This page is not a solicitation, an offer of securities, or marketing of a regulated product.",
    footerNotice:
      "© Lodestar — concept-stage thesis. Hosted on lodestar.demo.sarl for discussion purposes. All figures sourced from public DoD, GSA, GAO, SEC and industry press.",
    langLabel: "Language",
    marketSeeAll: "See all 12 anchors with sources →",
    marketPageTitle: "Market anchors",
    marketPageSubtitle:
      "Every figure carries a publicly verifiable source. Ceilings are not-to-exceed; obligated dollars are noted where they differ.",
    marketBackHome: "← Back to brief",
    marketTableSource: "Source",
  },
  ja: {
    metaTitle: "Lodestar — 米国防総省向け AI ネイティブ持続作戦プラットフォーム",
    metaDescription:
      "Lodestar は、競合環境下の米 DoD オペレーションを想定した AI ネイティブな物流・持続作戦プラットフォームのコンセプト段階のテーゼです。",
    navTagline: "競合環境下の持続作戦のための AI ネイティブ基盤",
    heroBadge: "コンセプトブリーフ · 投資ステージ",
    heroTitle: "競合環境下の持続作戦に、AI ネイティブな羅針盤を。",
    heroSubtitle:
      "Lodestar は米国防総省向けの AI ネイティブな持続作戦プラットフォームです。予測補給、競合物流計画、意思決定支援を全階梯で複利的に積み上げます。",
    heroPills: [
      { label: "想定購買者", value: "DoD / DLA / USTRANSCOM" },
      { label: "ステージ", value: "コンセプトブリーフ · 創業前" },
      { label: "参入経路", value: "DIU OTA · Tradewinds · SBIR III" },
    ],
    ctaPrimary: "デモを試す",
    ctaSecondary: "ブリーフを読む",
    sectionLabels: {
      problem: "課題",
      market: "市場アンカー",
      approach: "アプローチ",
      whyNow: "なぜ今なのか",
      competition: "競合状況",
      compliance: "コンプライアンス姿勢",
      stage: "現在地",
    },
    problem: {
      title: "DoD の物流は今も「駐屯地用」設計のままで、競合下の作戦には噛み合わない。",
      body: "現代の作戦環境における持続作戦は、レガシースタックが解けないデータ問題です。ERP は定常需要向けにチューニングされ、その隙間をスプレッドシートが埋め、分析プラットフォームは意思決定ではなくダッシュボードしか吐き出さない。前線指揮官が COA 推奨を「分単位」で必要としても、答えは「日単位」でしか来ない —— 届けば、の話です。",
      bullets: [
        "予測ホライズンが競合下の物流ウィンドウに対して短すぎる。",
        "陸・海・空・SOCOM・海兵隊にまたがる需要シグナルがデータ層でサイロ化している。",
        "予測保全のパイロットは統合段階で頓挫する —— 記録系の数が多すぎ、API が少なすぎる。",
        "同盟国とのデータ交換は、存在するとしてもほとんど手作業である。",
      ],
    },
    market: {
      title: "市場は今まさに立ち上がっている。",
      body: "2024–2026 のサイクルは、DoD AI が「パイロット」から「持続作戦ソフトウェアの量産調達」へと相転移したタイミングです。以下は、私たちがベンチマークしている公開ソースに基づくスナップショットです。",
      anchors: sharedAnchors("ja"),
      note:
        "「上限」値は契約最大額であって、確定支出ではありません。数値は 2026 年 5 月時点の DoD 公式リリース、GAO 報告、GSA 記録、SEC 開示、業界主要メディアからの引用です。",
    },
    approach: {
      title: "持続作戦のためだけに設計された、AI ネイティブなスタック。",
      body: "Lodestar のプロダクトテーゼは明確です。私たちは「防衛皮を被った汎用データプラットフォーム」ではありません —— データモデルから組み上げる、持続作戦の意思決定システムです。",
      pillars: [
        {
          name: "意思決定ファーストのモデル",
          body: "汎用時系列ではなく、持続作戦固有の特徴量(稼働率・MTBF・輸送容量など)で学習された予測・配分・経路モデル。",
        },
        {
          name: "実行可能なアウトプット",
          body: "すべての出力は、定量化された信頼度と原データへの監査可能なトレースを伴う「推奨アクション」。ダッシュボードではなく、指揮承認のための設計。",
        },
        {
          name: "同盟国前提の設計",
          body: "テナント分離、ITAR / EAR パーティショニング、データタグスキーマを、初日から同盟国データ交換を前提に設計。",
        },
        {
          name: "オープン統合",
          body: "GCSS-Army、ERP/SAP、MILSTRIP、IUID、主要商用物流プラットフォーム向けアダプタ層 —— 既存系を置き換えるのではなく載せる設計。",
        },
      ],
    },
    whyNow: {
      title: "2025–2026 に三つの力が収束している。",
      body: "",
      bullets: [
        "**調達ビークルが成熟した。** DIU のプロトタイプ→量産 OTA(JSDT, 2026 年 1 月)と Tradewinds Solutions Marketplace(32.6 億ドル超の取扱)が、AI ネイティブベンダーに適した非 FAR ルートを提供している。",
        "**クラウドと基盤モデルが認定済み。** AWS GovCloud は FedRAMP High + IL4/IL5 で Claude と Llama を運用可能(2025 年 5 月) —— 実行基盤は既にコンプライアント。",
        "**購買シグナルは明確。** Palantir-陸軍 100 億ドル EA、Govini SCRIPTS BPA 9.19 億ドル、DIU JSDT 授注 —— これらは集合的に、DoD が AI ネイティブ持続作戦ソフトを量産規模で買っていることを示している。",
      ],
    },
    competition: {
      title: "私たちは「データ配管」ではなく「意思決定の質」で戦う。",
      body: "市場は、規模を持つインテグレーターと、より精緻な持続作戦モデルを持つ AI ネイティブスタートアップに分かれます。Lodestar のポジション: AI ネイティブのモデル、インテグレーター水準の統合規律。",
      columns: ["企業", "カテゴリ", "Lodestar との差異"],
      rows: [
        {
          name: "Palantir Foundry",
          bucket: "既存プラットフォーム",
          angle: "強力なデータオントロジーと統合 ; ロジは多数ユースケースの一つ。Lodestar は持続作戦ファースト。",
        },
        {
          name: "Govini Ark",
          bucket: "AI ネイティブ scale-up",
          angle: "サプライチェーンリスクの可視化と DIB アナリティクス。Lodestar はユニットレベルの実行可能な持続作戦意思決定に集中。",
        },
        {
          name: "Air Space Intelligence",
          bucket: "AI ネイティブ startup",
          angle: "PRESCIENCE — マルチドメイン物流 COA。JSDT 受賞。直接競合 ; 同盟国データモデルと予測保全の深さで差別化。",
        },
        {
          name: "Watchtower Labs",
          bucket: "AI ネイティブ seed",
          angle: "持続作戦計画とシミュレーション。JSDT 受賞。本番統合品質と IL5 への到達で差別化。",
        },
        {
          name: "Rune Technologies",
          bucket: "AI ネイティブ early",
          angle: "TyrOS — 競合下の軍事物流予測。同盟国テナンシーと DLA 規模統合で差別化。",
        },
        {
          name: "Booz Allen / SAIC",
          bucket: "インテグレーター",
          angle: "DLA / USTRANSCOM のグルーレイヤー。Lodestar は彼らが統合する「プロダクトレイヤー」側。",
        },
      ],
    },
    compliance: {
      title: "購買側の認定ゲートをくぐるための設計。",
      body: "Lodestar のプログラム計画は、DoD 持続作戦の購買側が要求する明示的な認定パスに沿って予算化されています。",
      rows: [
        { name: "FedRAMP Moderate", status: "1 年目目標" },
        { name: "FedRAMP High → DoD IL4 / IL5", status: "2 年目目標(AWS GovCloud reciprocity 経由)" },
        { name: "CMMC 2.0 レベル 2", status: "現在は自己評価 ; 2026 年 11 月 10 日まで C3PAO 認証(フェーズ 2)" },
        { name: "ITAR / EAR 登録", status: "売上計上前" },
        { name: "SOC 2 Type II", status: "1 年目 — 商用ベースライン" },
      ],
    },
    stage: {
      title: "コンセプトブリーフ —— 創業前、チーム前、売上前。",
      body: "Lodestar はテーゼとしてのみ提示されています。締結済み契約なし、取得済み認定なし、パイロット顧客なし、構成済みチームなし。本ページは、オペレーター、資本、将来の政府パートナーとの焦点を絞った対話を招くために存在します。",
      bullets: [
        "対話を歓迎する相手: 戦闘員と持続作戦オペレーター(陸 / 海 / 空 / 海兵 / SOCOM)、DLA / USTRANSCOM 元職、defense-tech 投資家、AI ネイティブ持続作戦パートナーに関心のある prime コントラクター。",
        "求めていないもの: マーケティングパートナーシップ、汎用 SaaS リセラー、DoD 持続作戦と無関係な案件。",
      ],
    },
    demoTitle: "Lodestar を試す — 例示シナリオ",
    demoSubtitle:
      "シナリオを選んでください。AI が合成された例示入力からアナリスト風の応答を生成します。実データや機密データは一切使用していません。",
    demoScenarios: sharedScenarios,
    demoPlaceholder: "上のシナリオから一つ選んで開始してください。",
    demoDisclaimer:
      "例示出力のみ。機密ではなく、本番系にも接続されておらず、持続作戦担当官の判断の代替にはなりません。",
    demoButton: "分析を生成",
    demoClear: "リセット",
    demoError: "モデルが応答できませんでした。再度お試しください。",
    demoUnavailable:
      "デモ利用不可: AI_GATEWAY_API_KEY が設定されていません。README を参照してください。",
    contactTitle: "お問い合わせ",
    contactBody:
      "オペレーター、資本パートナー、政府関係の方を歓迎します。最初のメッセージはピッチではなく、簡潔なご紹介でお願いします。",
    contactEmailLabel: "メール",
    conceptDisclaimer:
      "Lodestar はコンセプト段階のブリーフです。チーム、契約、認定、顧客、パイロットの存在は一切主張しておらず、ほのめかしてもいません。すべての数値は公開・日付付き・出典付きです。本ページは勧誘、有価証券の募集、規制対象商品のマーケティングのいずれでもありません。",
    footerNotice:
      "© Lodestar — コンセプト段階のテーゼ。議論目的で lodestar.demo.sarl 上にホスティング。全数値は DoD、GSA、GAO、SEC、業界主要メディアの公開ソースに基づきます。",
    langLabel: "言語",
    marketSeeAll: "12 件のアンカーを全て出典付きで見る →",
    marketPageTitle: "市場アンカー",
    marketPageSubtitle:
      "全ての数値は公開・検証可能な出典付きです。「上限」は契約最大額 ; 確定支出と異なる場合はその旨を明示しています。",
    marketBackHome: "← ブリーフへ戻る",
    marketTableSource: "出典",
  },
};

export function getDict(locale: string): Dict {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : defaultLocale];
}
