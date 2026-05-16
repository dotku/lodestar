export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

type Section = { title: string; body: string };
type Anchor = { label: string; value: string; date: string; sourceHost: string };
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
    fr: {
      dla: "Obligations de la DLA (FY25)",
      jsdt: "OTA prototype DIU JSDT",
      palantir: "Accord Palantir / U.S. Army (plafond)",
      govini: "Govini Ark — BPA SCRIPTS (plafond)",
      goviniRound: "Govini — tour de croissance (>1 Md$ valorisation)",
      rune: "Rune Technologies — Série A",
      anduril: "Anduril — valorisation (mai 2026)",
      cmmc: "CMMC 2.0 Phase 1 — entrée en vigueur",
      jwcc: "JWCC — montants engagés à ce jour",
      tradewinds: "Tradewinds — montants attribués",
      cdao: "CDAO rattaché à l'USD(R&E)",
      bedrock: "Claude + Llama dans AWS GovCloud IL5",
    },
  };
  const L = labels[locale];
  return [
    { label: L.dla, value: "$55.4B", date: "FY2025", sourceHost: "dla.mil" },
    {
      label: L.jsdt,
      value: "ASI + Watchtower Labs",
      date: "Jan 2026",
      sourceHost: "diu.mil",
    },
    {
      label: L.palantir,
      value: "$10B / 10 yr",
      date: "Jul 2025",
      sourceHost: "army.mil",
    },
    {
      label: L.govini,
      value: "$919M / 10 yr",
      date: "Apr 2025",
      sourceHost: "gsa.gov",
    },
    {
      label: L.goviniRound,
      value: "$150M @ unicorn",
      date: "Oct 2025",
      sourceHost: "cnbc.com",
    },
    {
      label: L.rune,
      value: "$24M (a16z, Point72)",
      date: "Jul 2025",
      sourceHost: "businesswire.com",
    },
    {
      label: L.anduril,
      value: "$61B (Thrive + a16z)",
      date: "May 2026",
      sourceHost: "bloomberg.com",
    },
    {
      label: L.cmmc,
      value: "Effective",
      date: "Nov 10, 2025",
      sourceHost: "federalregister.gov",
    },
    {
      label: L.jwcc,
      value: "$3.9B+ task orders",
      date: "FY2025 cumul.",
      sourceHost: "disa.mil",
    },
    {
      label: L.tradewinds,
      value: "$3.26B+ awards",
      date: "Feb 2026",
      sourceHost: "tradewindai.com",
    },
    {
      label: L.cdao,
      value: "Memo signed",
      date: "Aug 14, 2025",
      sourceHost: "ai.mil",
    },
    {
      label: L.bedrock,
      value: "FedRAMP High + IL4/IL5",
      date: "May 2025",
      sourceHost: "aws.amazon.com",
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
  },
  fr: {
    metaTitle: "Lodestar — soutien logistique IA-natif pour le ministère américain de la Défense",
    metaDescription:
      "Lodestar est une thèse au stade concept pour une plateforme IA-native de logistique et de soutien, conçue pour les opérations du DoD en environnement contesté.",
    navTagline: "Soutien IA-natif pour opérations contestées",
    heroBadge: "Note de concept · stade investissement",
    heroTitle: "L'étoile polaire de la logistique de défense.",
    heroSubtitle:
      "Lodestar est une plateforme IA-native de soutien pour le ministère américain de la Défense — approvisionnement prédictif, planification en logistique contestée et aide à la décision qui se cumulent à tous les échelons.",
    heroPills: [
      { label: "Acheteur cible", value: "DoD / DLA / USTRANSCOM" },
      { label: "Stade", value: "Note de concept · pré-création" },
      { label: "Véhicule d'entrée", value: "OTA DIU · Tradewinds · SBIR III" },
    ],
    ctaPrimary: "Essayer la démo",
    ctaSecondary: "Lire la note",
    sectionLabels: {
      problem: "Le problème",
      market: "Repères de marché",
      approach: "Notre approche",
      whyNow: "Pourquoi maintenant",
      competition: "Paysage concurrentiel",
      compliance: "Posture de conformité",
      stage: "Où nous en sommes",
    },
    problem: {
      title: "La logistique du DoD repose encore sur des systèmes pensés pour la garnison, pas pour les opérations contestées.",
      body: "Le soutien dans l'environnement opérationnel moderne est un problème de données que la pile héritée ne sait pas résoudre. Les ERP ont été calibrés sur une demande stable ; les tableurs comblent les écarts ; les plateformes analytiques produisent des tableaux de bord plutôt que des décisions. Quand le combattant a besoin d'une recommandation de cours d'action en minutes, la réponse arrive en jours — si elle arrive.",
      bullets: [
        "Les horizons de prévision sont trop courts pour les fenêtres de logistique contestée.",
        "Les signaux de demande entre composantes (Army / Navy / Air Force / SOCOM / Marines) restent cloisonnés au niveau des données.",
        "Les pilotes de maintenance prédictive bloquent à l'intégration — trop de systèmes de référence, trop peu d'API.",
        "L'échange de données avec les partenaires de coalition, quand il existe, reste manuel.",
      ],
    },
    market: {
      title: "Le marché se crée en ce moment même.",
      body: "Le cycle 2024–2026 marque la bascule des pilotes IA du DoD vers l'achat à grande échelle de logiciels de soutien. Voici un instantané, fondé sur des sources publiques, des repères que nous suivons.",
      anchors: sharedAnchors("fr"),
      note:
        "Les valeurs « plafond » sont des montants maximaux et non des dépenses garanties. Chiffres issus des communiqués DoD publics, rapports GAO, dossiers GSA, dépôts SEC et presse industrielle de référence à mai 2026.",
    },
    approach: {
      title: "Une pile IA-native conçue spécifiquement pour le soutien.",
      body: "La thèse produit de Lodestar est tranchée. Nous ne sommes pas une plateforme de données générique avec un habillage défense — nous sommes un système de décision de soutien à partir du modèle de données.",
      pillars: [
        {
          name: "Modèles orientés décision",
          body: "Prévision, allocation et routage entraînés sur des jeux de variables spécifiques au soutien — taux de disponibilité, temps moyen entre pannes, capacité de transport — et non des séries temporelles génériques.",
        },
        {
          name: "Sorties exploitables",
          body: "Chaque sortie est une action recommandée avec confiance quantifiée et traçabilité auditable vers les données sous-jacentes — pensée pour l'approbation de commandement, pas seulement pour le tableau de bord.",
        },
        {
          name: "Coalition par conception",
          body: "Séparation de tenants, partitionnement ITAR/EAR et schéma d'étiquetage des données pensés dès le départ pour l'échange avec les alliés.",
        },
        {
          name: "Intégration ouverte",
          body: "Couche d'adaptateurs pour GCSS-Army, ERP/SAP, MILSTRIP, IUID et les principales plateformes logistiques commerciales — pas de remplacement intégral.",
        },
      ],
    },
    whyNow: {
      title: "Trois forces convergent en 2025–2026.",
      body: "",
      bullets: [
        "**Les véhicules d'achat ont mûri.** Les OTA prototype-vers-production du DIU (JSDT, jan. 2026) et le Tradewinds Solutions Marketplace (3,26 Md$ attribués) offrent une voie hors-FAR adaptée aux éditeurs IA-natifs.",
        "**Le cloud et les modèles fondation sont accrédités.** AWS GovCloud a atteint FedRAMP High + IL4/IL5 avec Claude et Llama (mai 2025) — le substrat d'exécution est désormais conforme.",
        "**Le signal acheteur est sans ambiguïté.** L'accord Palantir / Army de 10 Md$, le BPA SCRIPTS de Govini à 919 M$, et les attributions DIU JSDT démontrent ensemble que le DoD achète du logiciel de soutien IA-natif à l'échelle de la production.",
      ],
    },
    competition: {
      title: "Nous nous battons sur la qualité de décision, pas sur la plomberie de données.",
      body: "Le marché se partage entre intégrateurs à grande échelle et startups IA-natives au modèle de soutien plus précis. Notre position : modèles IA-natifs, discipline d'intégration de niveau intégrateur.",
      columns: ["Société", "Catégorie", "Différence avec Lodestar"],
      rows: [
        {
          name: "Palantir Foundry",
          bucket: "Plateforme historique",
          angle: "Solide ontologie de données et intégration ; la logistique n'est qu'un cas d'usage parmi d'autres. Lodestar est soutien-first.",
        },
        {
          name: "Govini Ark",
          bucket: "Scale-up IA-natif",
          angle: "Éclairage des risques chaîne d'appro et analytique DIB. Lodestar se concentre sur des décisions de soutien actionnables au niveau unité.",
        },
        {
          name: "Air Space Intelligence",
          bucket: "Startup IA-native",
          angle: "PRESCIENCE — cours d'action logistique multi-domaines. Lauréat JSDT. Recouvrement direct ; nous nous différencions sur le modèle coalition et la profondeur de maintenance prédictive.",
        },
        {
          name: "Watchtower Labs",
          bucket: "Seed IA-natif",
          angle: "Planification et simulation de soutien. Lauréat JSDT. Différenciation sur l'intégration en production et la trajectoire IL5.",
        },
        {
          name: "Rune Technologies",
          bucket: "IA-natif amorçage",
          angle: "TyrOS — logistique militaire prédictive en contesté. Différenciation sur tenants coalition et intégration à l'échelle DLA.",
        },
        {
          name: "Booz Allen / SAIC",
          bucket: "Intégrateurs",
          angle: "Couche de liaison pour DLA et USTRANSCOM. Lodestar est la couche produit qu'ils intégreraient.",
        },
      ],
    },
    compliance: {
      title: "Conçu pour franchir la grille d'accréditation côté acheteur.",
      body: "Le plan programme Lodestar est budgété sur la trajectoire d'accréditation explicite exigée par les acheteurs de soutien DoD.",
      rows: [
        { name: "FedRAMP Moderate", status: "Objectif année 1" },
        { name: "FedRAMP High → DoD IL4 / IL5", status: "Objectif année 2 via réciprocité AWS GovCloud" },
        { name: "CMMC 2.0 Niveau 2", status: "Auto-évaluation maintenant ; certification C3PAO avant le 10 nov. 2026 (Phase 2)" },
        { name: "Enregistrement ITAR / EAR", status: "Avant chiffre d'affaires" },
        { name: "SOC 2 Type II", status: "Année 1 — socle commercial" },
      ],
    },
    stage: {
      title: "Note de concept — pré-création, pré-équipe, pré-revenu.",
      body: "Lodestar est présenté ici comme une thèse uniquement. Pas de contrats signés, pas d'accréditations en main, pas de clients pilotes, pas d'équipe constituée. Cette page existe pour engager une conversation focalisée avec des opérateurs, des investisseurs et de futurs partenaires gouvernementaux.",
      bullets: [
        "Nous cherchons des échanges avec : combattants et opérateurs de soutien (Army, Navy, Air Force, Marines, SOCOM), anciens dirigeants DLA / USTRANSCOM, investisseurs defense-tech, primes contractors intéressés par un partenaire de soutien IA-natif.",
        "Nous ne cherchons pas : partenariats marketing, revendeurs SaaS génériques, projets sans rapport avec le soutien DoD.",
      ],
    },
    demoTitle: "Essayer Lodestar — scénarios illustratifs",
    demoSubtitle:
      "Choisissez un scénario. L'IA génère une réponse de style analyste à partir d'entrées synthétiques illustratives. Aucune donnée réelle ou classifiée n'est jamais utilisée.",
    demoScenarios: sharedScenarios,
    demoPlaceholder: "Sélectionnez un scénario ci-dessus pour commencer.",
    demoDisclaimer:
      "Sortie illustrative uniquement. Non classifiée, non connectée à des systèmes opérationnels, ne remplace pas le jugement d'un officier de soutien.",
    demoButton: "Générer l'analyse",
    demoClear: "Réinitialiser",
    demoError: "Le modèle n'a pas pu répondre. Veuillez réessayer.",
    demoUnavailable:
      "Démo indisponible : AI_GATEWAY_API_KEY n'est pas configurée. Voir le README.",
    contactTitle: "Nous contacter",
    contactBody:
      "Opérateurs, partenaires capital et collaborateurs gouvernementaux bienvenus. Note brève, s.v.p. — pas de pitch au premier message.",
    contactEmailLabel: "Courriel",
    conceptDisclaimer:
      "Lodestar est une note au stade concept. Aucune équipe, contrat, accréditation, client ou pilote n'est revendiqué ni sous-entendu. Tous les chiffres sont publics, datés et sourcés. Cette page n'est ni une sollicitation, ni une offre de titres, ni une mise sur le marché d'un produit réglementé.",
    footerNotice:
      "© Lodestar — thèse au stade concept. Hébergé sur lodestar.demo.sarl à fins de discussion. Tous les chiffres proviennent de sources publiques DoD, GSA, GAO, SEC et de la presse industrielle.",
    langLabel: "Langue",
  },
};

export function getDict(locale: string): Dict {
  return dictionaries[(locale as Locale) in dictionaries ? (locale as Locale) : defaultLocale];
}
