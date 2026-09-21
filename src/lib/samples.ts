import type { Item, SectionType } from "./types";

/**
 * Sample content per profession.
 *
 * `sections.ts` holds one sample per section type, and every one of them was
 * written for a software developer — so an accountant who picked their own
 * preset was handed "Senior Product Engineer at Northwind Labs" and a stack of
 * TypeScript tags. The preset already decides the template, palette and which
 * sections exist; this decides what is written inside them.
 *
 * Packs are keyed by family rather than by preset, because an accountant, a CA
 * and a financial analyst share a vocabulary. `OVERRIDES` handles the places
 * where one preset in a family genuinely differs. Anything a pack leaves out
 * falls back to the generic sample, which is the right answer for neutral
 * sections like FAQ or pricing.
 *
 * All of it is placeholder copy: plausible, specific enough to show what the
 * section is for, and meant to be replaced.
 */

/** A sample item, minus the id that `createSection` assigns. */
type SampleItem = Omit<Item, "id">;

/** What a pack may say about one section. */
export interface SectionSample {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  body?: string;
  items?: SampleItem[];
}

type Pack = Partial<Record<SectionType, SectionSample>>;

/** Skill group children, which carry their own ids once created. */
function group(title: string, skills: [string, number][]): SampleItem {
  return { title, items: skills.map(([name, level]) => ({ id: "", title: name, level })) };
}

/* ──────────────────────────── Finance ──────────────────────────── */

const FINANCE: Pack = {
  about: {
    body:
      "I am a finance professional who is happiest where the numbers meet the decision — closing the books " +
      "cleanly, then explaining what they mean to people who do not read ledgers for a living.\n\n" +
      "Eight years across audit, statutory reporting and FP&A, most of it with manufacturing and SaaS clients.",
    items: [
      { title: "Based in", description: "Mumbai, India", icon: "MapPin" },
      { title: "Focus", description: "Statutory reporting, tax and FP&A", icon: "Target" },
      { title: "Experience", description: "8 years in practice and industry", icon: "Briefcase" },
      { title: "Currently", description: "Open to full-time and advisory work", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Finance Manager",
        subtitle: "Meridian Industries",
        period: "2022 — Present",
        location: "Mumbai, India",
        description: "Own the monthly close, statutory reporting and the annual audit for a mid-cap manufacturer.",
        bullets: [
          "Closed the statutory audit three weeks early two years running",
          "Rebuilt the monthly MIS pack the board actually reads",
          "Cut the close from eleven working days to six",
        ],
        tags: ["IND-AS", "SAP FICO", "Power BI"],
      },
      {
        title: "Assistant Manager — Audit",
        subtitle: "Bhatia & Associates",
        period: "2019 — 2022",
        location: "Bengaluru, India",
        description: "Led statutory and internal audits for listed manufacturers and mid-cap SaaS clients.",
        bullets: [
          "Led the IND-AS transition for four mid-cap clients",
          "Flagged a revenue recognition error before filing, worth two crore",
        ],
        tags: ["Statutory audit", "Internal controls"],
      },
      {
        title: "Audit Associate",
        subtitle: "Kapoor Sharma LLP",
        period: "2017 — 2019",
        location: "Pune, India",
        description: "Ledger scrutiny, GST reconciliation and working papers across a mixed client portfolio.",
        bullets: ["Handled GST filings for 30+ clients through the first two years of the regime"],
        tags: ["GST", "Tally ERP"],
      },
    ],
  },
  skills: {
    items: [
      group("Reporting & compliance", [
        ["IND-AS / IFRS", 90],
        ["Statutory audit", 88],
        ["GST & TDS", 85],
        ["Transfer pricing", 70],
      ]),
      group("Systems", [
        ["SAP FICO", 82],
        ["Tally ERP", 90],
        ["Advanced Excel", 95],
        ["Power BI", 75],
      ]),
      group("Analysis", [
        ["Budgeting & forecasting", 85],
        ["Variance analysis", 88],
        ["Cash-flow modelling", 80],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "Chartered Accountant", subtitle: "ICAI", period: "2019" },
      { title: "Certified Internal Auditor (CIA)", subtitle: "IIA Global", period: "2022" },
      { title: "Diploma in Information Systems Audit (DISA)", subtitle: "ICAI", period: "2021" },
    ],
  },
  education: {
    items: [
      {
        title: "M.Com. Accounting & Finance",
        subtitle: "University of Mumbai",
        period: "2015 — 2017",
        description: "First class. Dissertation on audit quality in mid-cap listed companies.",
      },
      {
        title: "B.Com. (Honours)",
        subtitle: "Narsee Monjee College of Commerce",
        period: "2012 — 2015",
        description: "Gold medallist. Treasurer of the commerce society.",
      },
    ],
  },
  services: {
    items: [
      {
        title: "Statutory compliance",
        description: "Books, filings and the annual audit kept current and defensible.",
        icon: "FileCheck",
        value: "From 25,000/mo",
        bullets: ["Monthly close", "GST and TDS filings", "Audit liaison"],
      },
      {
        title: "Virtual CFO",
        description: "The finance function of a larger company, at the size you actually are.",
        icon: "LineChart",
        value: "From 60,000/mo",
        bullets: ["Board-ready MIS", "Budgeting and forecasting", "Cash-flow planning"],
        featured: true,
      },
      {
        title: "Tax advisory",
        description: "Planning ahead of the year end rather than explaining it afterwards.",
        icon: "Scale",
        value: "From 15,000",
        bullets: ["Direct and indirect tax", "Notice and assessment support", "Transfer pricing review"],
      },
    ],
  },
  stats: {
    items: [
      { value: "8", title: "Years in finance" },
      { value: "60+", title: "Audits completed" },
      { value: "5", title: "Entities consolidated" },
      { value: "6 days", title: "Monthly close" },
    ],
  },
  projects: {
    title: "Engagements",
    eyebrow: "Selected work",
    subtitle: "Pieces of work I am happy to talk through in detail.",
    items: [
      {
        title: "IND-AS transition",
        subtitle: "Listed auto-components manufacturer",
        description:
          "First-time IND-AS adoption for a mid-cap manufacturer, from gap analysis to the first compliant annual report.",
        tags: ["IND-AS", "Audit"],
      },
      {
        title: "Close acceleration",
        subtitle: "SaaS group, five entities",
        description:
          "Redesigned the group close: shared chart of accounts, automated intercompany elimination, eleven days down to six.",
        tags: ["Process", "SAP"],
      },
      {
        title: "GST health check",
        subtitle: "Retail chain, 40 outlets",
        description: "Reconciled three years of filings against books and recovered unclaimed input credit.",
        tags: ["GST", "Recovery"],
      },
    ],
  },
};

/* ──────────────────────────── Medicine ──────────────────────────── */

const MEDICAL: Pack = {
  about: {
    body:
      "I am a consultant physician with a busy outpatient practice and an interest in the unglamorous half of " +
      "medicine: follow-up, adherence and the conversations that decide whether a plan actually works.\n\n" +
      "Twelve years in practice, including four leading a district diabetes clinic.",
    items: [
      { title: "Based in", description: "Kochi, India", icon: "MapPin" },
      { title: "Focus", description: "Internal medicine & diabetology", icon: "Target" },
      { title: "Experience", description: "12 years in clinical practice", icon: "Briefcase" },
      { title: "Currently", description: "Accepting new patients", icon: "Zap" },
    ],
  },
  experience: {
    eyebrow: "Clinical appointments",
    items: [
      {
        title: "Consultant Physician",
        subtitle: "Amrita Institute of Medical Sciences",
        period: "2019 — Present",
        location: "Kochi, India",
        description: "Outpatient and inpatient internal medicine, with a dedicated diabetes clinic twice a week.",
        bullets: [
          "Built a nurse-led follow-up pathway that lifted six-month adherence from 54% to 78%",
          "Supervise four residents through their internal medicine rotation",
        ],
        tags: ["Internal medicine", "Diabetology"],
      },
      {
        title: "Registrar, General Medicine",
        subtitle: "St. Johns Medical College Hospital",
        period: "2015 — 2019",
        location: "Bengaluru, India",
        description: "Ward rounds, emergency admissions and the hospital antibiotic stewardship group.",
        bullets: ["Co-wrote the sepsis protocol still used in the emergency department"],
        tags: ["Emergency", "Stewardship"],
      },
    ],
  },
  education: {
    items: [
      {
        title: "MD, General Medicine",
        subtitle: "St. Johns Medical College",
        period: "2012 — 2015",
        location: "Bengaluru, India",
        description: "Thesis on glycaemic control in newly diagnosed type 2 diabetes.",
      },
      {
        title: "MBBS",
        subtitle: "Government Medical College",
        period: "2006 — 2012",
        location: "Thiruvananthapuram, India",
        description: "Distinction in pathology and medicine.",
      },
    ],
  },
  certifications: {
    items: [
      { title: "Medical Council registration", subtitle: "Kerala State Medical Council", period: "2012" },
      { title: "Advanced Cardiac Life Support (ACLS)", subtitle: "American Heart Association", period: "2023" },
      { title: "Fellowship in Diabetology", subtitle: "RSSDI", period: "2018" },
    ],
  },
  services: {
    eyebrow: "What I treat",
    items: [
      {
        title: "General consultation",
        description: "Diagnosis and management for adults across internal medicine.",
        icon: "Stethoscope",
        value: "30 minutes",
        bullets: ["Same-week appointments", "Written care plan", "Follow-up call included"],
      },
      {
        title: "Diabetes care",
        description: "Structured management of type 1 and type 2 diabetes, with the whole picture in view.",
        icon: "Activity",
        value: "45 minutes",
        bullets: ["Glycaemic review", "Foot and retina screening", "Diet and exercise planning"],
        featured: true,
      },
      {
        title: "Preventive health check",
        description: "An annual review that looks for the things worth catching early.",
        icon: "HeartPulse",
        value: "60 minutes",
        bullets: ["Bloodwork review", "Cardiovascular risk score", "Vaccination schedule"],
      },
    ],
  },
  skills: {
    items: [
      group("Clinical", [
        ["Internal medicine", 92],
        ["Diabetology", 88],
        ["Emergency care", 80],
        ["Preventive medicine", 85],
      ]),
      group("Procedures", [
        ["Central line insertion", 78],
        ["Lumbar puncture", 75],
        ["Point-of-care ultrasound", 70],
      ]),
    ],
  },
  stats: {
    items: [
      { value: "12", title: "Years in practice" },
      { value: "9,000+", title: "Consultations" },
      { value: "78%", title: "Six-month adherence" },
      { value: "4", title: "Residents supervised" },
    ],
  },
  languages: {
    items: [
      { title: "English", subtitle: "Fluent", level: 95 },
      { title: "Malayalam", subtitle: "Native", level: 100 },
      { title: "Hindi", subtitle: "Conversational", level: 70 },
    ],
  },
};

const NURSING: Pack = {
  about: {
    body:
      "I am a registered nurse who has spent most of a decade in critical care, where the difference between a " +
      "good shift and a bad one is usually noticing something twenty minutes earlier.\n\n"
      + "Nine years across ICU and emergency, including three as a charge nurse.",
    items: [
      { title: "Based in", description: "Pune, India", icon: "MapPin" },
      { title: "Focus", description: "Critical care & emergency nursing", icon: "Target" },
      { title: "Experience", description: "9 years, 3 as charge nurse", icon: "Briefcase" },
      { title: "Currently", description: "Open to ICU and travel contracts", icon: "Zap" },
    ],
  },
  experience: {
    eyebrow: "Where I have worked",
    items: [
      {
        title: "Charge Nurse, Medical ICU",
        subtitle: "Ruby Hall Clinic",
        period: "2021 — Present",
        location: "Pune, India",
        description: "Run a 14-bed medical ICU shift, coordinating admissions, staffing and family communication.",
        bullets: [
          "Cut central-line infections to zero across eighteen months on the bundle audit",
          "Precept two new graduate nurses through their first ICU rotation each year",
        ],
        tags: ["Critical care", "Ventilator management"],
      },
      {
        title: "Staff Nurse, Emergency Department",
        subtitle: "Sahyadri Hospitals",
        period: "2016 — 2021",
        location: "Pune, India",
        description: "Triage, resuscitation and stabilisation in a high-volume emergency department.",
        bullets: ["Triaged 40+ patients a shift through the two busiest years the department has had"],
        tags: ["Triage", "ACLS"],
      },
    ],
  },
  certifications: {
    items: [
      { title: "Registered Nurse", subtitle: "Indian Nursing Council", period: "2016" },
      { title: "Basic & Advanced Cardiac Life Support", subtitle: "American Heart Association", period: "2024" },
      { title: "Critical Care Nursing Certificate", subtitle: "INC", period: "2020" },
    ],
  },
  education: {
    items: [
      {
        title: "B.Sc. Nursing",
        subtitle: "Symbiosis College of Nursing",
        period: "2012 — 2016",
        location: "Pune, India",
        description: "First class. Clinical project on early warning scores in general wards.",
      },
    ],
  },
  skills: {
    items: [
      group("Critical care", [
        ["Ventilator management", 90],
        ["Haemodynamic monitoring", 85],
        ["Titrated vasopressors", 82],
        ["Post-operative care", 88],
      ]),
      group("Emergency", [
        ["Triage", 92],
        ["ACLS / BLS", 95],
        ["Trauma stabilisation", 80],
      ]),
      group("Team", [
        ["Preceptorship", 85],
        ["Family communication", 90],
        ["Shift coordination", 88],
      ]),
    ],
  },
  languages: {
    items: [
      { title: "English", subtitle: "Fluent", level: 90 },
      { title: "Marathi", subtitle: "Native", level: 100 },
      { title: "Hindi", subtitle: "Fluent", level: 92 },
    ],
  },
};

/* ──────────────────────────── Law ──────────────────────────── */

const LEGAL: Pack = {
  about: {
    body:
      "I am a litigator with a commercial practice — contract disputes, arbitration and the occasional writ " +
      "petition — and a preference for settling well over winning slowly.\n\n" +
      "Ten years at the bar, four of them running my own chambers.",
    items: [
      { title: "Based in", description: "New Delhi, India", icon: "MapPin" },
      { title: "Practice", description: "Commercial litigation & arbitration", icon: "Target" },
      { title: "Experience", description: "10 years at the bar", icon: "Briefcase" },
      { title: "Currently", description: "Accepting briefs and retainers", icon: "Zap" },
    ],
  },
  experience: {
    eyebrow: "Practice",
    items: [
      {
        title: "Principal Advocate",
        subtitle: "Chambers of R. Menon",
        period: "2021 — Present",
        location: "New Delhi, India",
        description: "Independent practice before the High Court and in domestic commercial arbitration.",
        bullets: [
          "Argued 60+ commercial matters before the High Court",
          "Recovered substantial sums for suppliers in a construction arbitration",
        ],
        tags: ["Litigation", "Arbitration"],
      },
      {
        title: "Senior Associate",
        subtitle: "Trilegal",
        period: "2017 — 2021",
        location: "Mumbai, India",
        description: "Dispute resolution team, acting for infrastructure and manufacturing clients.",
        bullets: ["Second chair on a three-year arbitration that settled on the eve of the final hearing"],
        tags: ["Dispute resolution"],
      },
    ],
  },
  education: {
    items: [
      {
        title: "LL.M. Commercial Law",
        subtitle: "National Law School of India University",
        period: "2015 — 2016",
        location: "Bengaluru, India",
        description: "Dissertation on interim relief in institutional arbitration.",
      },
      {
        title: "B.A. LL.B. (Hons.)",
        subtitle: "NALSAR University of Law",
        period: "2010 — 2015",
        location: "Hyderabad, India",
        description: "Gold medal in constitutional law. Editor of the student law review.",
      },
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Commercial litigation",
        description: "Contract, recovery and shareholder disputes, from notice to judgment.",
        icon: "Scale",
        value: "Brief fee on request",
        bullets: ["Case assessment", "Pleadings and arguments", "Execution and recovery"],
      },
      {
        title: "Arbitration",
        description: "Domestic and institutional arbitration, as counsel or arbitrator.",
        icon: "Gavel",
        value: "Per sitting",
        bullets: ["Interim relief", "Full hearings", "Award enforcement"],
        featured: true,
      },
      {
        title: "Advisory retainer",
        description: "A lawyer on call for the questions that arise before they become disputes.",
        icon: "FileText",
        value: "Monthly",
        bullets: ["Contract review", "Notice replies", "Compliance opinions"],
      },
    ],
  },
  awards: {
    items: [
      { title: "Forty under 40 — Dispute Resolution", subtitle: "Legal Era", period: "2024" },
      { title: "Best Young Advocate", subtitle: "Delhi Bar Association", period: "2021" },
    ],
  },
};

/* ──────────────────────────── Academia ──────────────────────────── */

const ACADEMIA: Pack = {
  about: {
    body:
      "I study how cities move — transport networks, the data they throw off, and the policy choices that data " +
      "quietly makes for us.\n\n" +
      "Assistant Professor of Urban Systems, with a lab of four doctoral students and a long collaboration with " +
      "two municipal transport authorities.",
    items: [
      { title: "Based in", description: "Delft, Netherlands", icon: "MapPin" },
      { title: "Field", description: "Urban systems & transport modelling", icon: "Target" },
      { title: "Publications", description: "28 peer-reviewed papers", icon: "Briefcase" },
      { title: "Currently", description: "Recruiting one PhD student", icon: "Zap" },
    ],
  },
  experience: {
    eyebrow: "Appointments",
    items: [
      {
        title: "Assistant Professor",
        subtitle: "TU Delft, Faculty of Civil Engineering",
        period: "2021 — Present",
        location: "Delft, Netherlands",
        description: "Lead the Urban Mobility Lab; teach transport modelling at masters level.",
        bullets: [
          "Principal investigator on a four-year national mobility grant",
          "Supervise four doctoral and eleven masters students",
        ],
        tags: ["Teaching", "Grants", "Supervision"],
      },
      {
        title: "Postdoctoral Researcher",
        subtitle: "ETH Zurich, Institute for Transport Planning",
        period: "2018 — 2021",
        location: "Zurich, Switzerland",
        description: "Agent-based simulation of demand-responsive transit in mid-sized cities.",
        bullets: ["Built the open simulation toolkit now used by three other groups"],
        tags: ["Simulation", "Open source"],
      },
    ],
  },
  education: {
    items: [
      {
        title: "Ph.D. Transport Engineering",
        subtitle: "University of Cambridge",
        period: "2014 — 2018",
        description: "Thesis on equity effects of demand-responsive transit.",
      },
      {
        title: "M.Sc. Civil Engineering",
        subtitle: "Indian Institute of Technology Bombay",
        period: "2012 — 2014",
        description: "Institute silver medal.",
      },
    ],
  },
  publications: {
    items: [
      {
        title: "Equity effects of demand-responsive transit in mid-sized cities",
        subtitle: "Transportation Research Part A",
        period: "2024",
        description: "With Okafor, D. and Lindqvist, M. Cited 74 times.",
        url: "https://example.org/paper",
        urlLabel: "DOI",
      },
      {
        title: "Open simulation toolkits and reproducibility in transport research",
        subtitle: "Journal of Transport Geography",
        period: "2023",
        description: "Position paper on shared benchmarks for agent-based models.",
      },
      {
        title: "Who waits? Distributional outcomes of on-demand bus pilots",
        subtitle: "Transport Policy",
        period: "2022",
        description: "Analysis of four European pilots over three years.",
      },
    ],
  },
  awards: {
    items: [
      { title: "National Mobility Grant", subtitle: "Dutch Research Council", period: "2022" },
      { title: "Best Paper Award", subtitle: "hEART Symposium", period: "2021" },
      { title: "Outstanding Teaching Award", subtitle: "TU Delft", period: "2023" },
    ],
  },
  languages: {
    items: [
      { title: "English", subtitle: "Fluent", level: 95 },
      { title: "Dutch", subtitle: "Working proficiency", level: 65 },
      { title: "Hindi", subtitle: "Native", level: 100 },
    ],
  },
};

/* ──────────────────────────── Teaching ──────────────────────────── */

const TEACHING: Pack = {
  about: {
    body:
      "I teach secondary mathematics, and I tutor the students who have decided they are bad at it. They are " +
      "usually not bad at it — they are missing one idea from three years ago.\n\n" +
      "Eleven years in the classroom, six of them as head of department.",
    items: [
      { title: "Based in", description: "Chennai, India", icon: "MapPin" },
      { title: "Teaches", description: "Mathematics, grades 8-12", icon: "Target" },
      { title: "Experience", description: "11 years, CBSE and IB", icon: "Briefcase" },
      { title: "Currently", description: "Taking evening tuition students", icon: "Zap" },
    ],
  },
  experience: {
    eyebrow: "Where I have taught",
    items: [
      {
        title: "Head of Mathematics",
        subtitle: "Chettinad Vidyashram",
        period: "2019 — Present",
        location: "Chennai, India",
        description: "Lead a department of nine and teach senior mathematics.",
        bullets: [
          "Board averages up eleven points across four years",
          "Rewrote the grade 9 scheme of work around problem solving rather than drill",
        ],
        tags: ["CBSE", "Curriculum design"],
      },
      {
        title: "Mathematics Teacher",
        subtitle: "The International School",
        period: "2013 — 2019",
        location: "Bengaluru, India",
        description: "IB Diploma mathematics, standard and higher level.",
        bullets: ["Took the first higher level cohort through to an average of 6.2"],
        tags: ["IB Diploma"],
      },
    ],
  },
  education: {
    items: [
      {
        title: "M.Sc. Mathematics",
        subtitle: "University of Madras",
        period: "2011 — 2013",
        description: "Specialised in number theory.",
      },
      {
        title: "B.Ed.",
        subtitle: "Tamil Nadu Teachers Education University",
        period: "2010 — 2011",
        description: "Distinction in pedagogy of mathematics.",
      },
    ],
  },
  services: {
    eyebrow: "Tuition",
    items: [
      {
        title: "One-to-one tuition",
        description: "Weekly sessions built around what a student is actually stuck on.",
        icon: "User",
        value: "From 900 per hour",
        bullets: ["Diagnostic first session", "Weekly practice set", "Monthly parent update"],
        featured: true,
      },
      {
        title: "Small group",
        description: "Three or four students at the same level, which keeps the pace honest.",
        icon: "Users",
        value: "From 500 per hour",
        bullets: ["Groups of 3-4", "Shared problem sets", "Fortnightly tests"],
      },
      {
        title: "Board exam intensive",
        description: "Six weeks of past papers, timing practice and the topics that carry the marks.",
        icon: "Target",
        value: "12,000 for the course",
        bullets: ["Six weekly sessions", "Full mock papers", "Marked with feedback"],
      },
    ],
  },
  stats: {
    items: [
      { value: "11", title: "Years teaching" },
      { value: "600+", title: "Students taught" },
      { value: "+11", title: "Board average, points" },
      { value: "9", title: "Teachers led" },
    ],
  },
};

/* ──────────────────────────── Design ──────────────────────────── */

const DESIGN: Pack = {
  about: {
    body:
      "I design product interfaces and the systems that keep them coherent once more than one team is touching " +
      "them.\n\n" +
      "Nine years in-house and agency side, most recently building the design system behind a fintech used in " +
      "four markets.",
    items: [
      { title: "Based in", description: "Lisbon, Portugal", icon: "MapPin" },
      { title: "Focus", description: "Product design & design systems", icon: "Target" },
      { title: "Experience", description: "9 years, agency and in-house", icon: "Briefcase" },
      { title: "Currently", description: "Taking new projects", icon: "Zap" },
    ],
  },
  projects: {
    eyebrow: "Selected work",
    subtitle: "Case studies I am happy to walk you through.",
    items: [
      {
        title: "Meridian",
        subtitle: "Banking app redesign",
        description:
          "Rebuilt the account and payments flows around what people actually came to do. Support tickets about transfers fell by a third.",
        tags: ["Product design", "Research", "Figma"],
        urlLabel: "Case study",
        featured: true,
      },
      {
        title: "Kerb",
        subtitle: "Design system",
        description:
          "A token-driven system adopted by four product teams, with a contribution model that kept it from rotting.",
        tags: ["Design systems", "Tokens"],
        urlLabel: "Read more",
      },
      {
        title: "Salt & Sons",
        subtitle: "Brand and identity",
        description: "Naming, identity and a small illustration language for a coastal food brand.",
        tags: ["Brand", "Illustration"],
        urlLabel: "View",
      },
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Product design",
        description: "End-to-end design for a feature or a product, from research to handoff.",
        icon: "Layers",
        value: "From 6,000",
        bullets: ["Discovery and research", "Flows and prototypes", "Developer handoff"],
        featured: true,
      },
      {
        title: "Design system",
        description: "A component library your engineers will actually adopt, with the governance to match.",
        icon: "Component",
        value: "From 12,000",
        bullets: ["Audit and tokens", "Component library", "Contribution guidelines"],
      },
      {
        title: "Design review",
        description: "A fresh pair of eyes on what you have, with written recommendations.",
        icon: "Eye",
        value: "From 1,500",
        bullets: ["Heuristic review", "Prioritised findings", "Walkthrough session"],
      },
    ],
  },
  gallery: {
    eyebrow: "Visual work",
    subtitle: "Screens, systems and the occasional experiment.",
  },
  stats: {
    items: [
      { value: "9", title: "Years designing" },
      { value: "40+", title: "Products shipped" },
      { value: "4", title: "Teams on the system" },
      { value: "-33%", title: "Support tickets" },
    ],
  },
};

/* ──────────────────────────── Architecture ──────────────────────────── */

const ARCHITECTURE: Pack = {
  about: {
    body:
      "I am an architect working mostly on housing and adaptive reuse — buildings that already exist and deserve " +
      "a second life more than they deserve demolition.\n\n" +
      "Twelve years in practice, four running my own studio.",
    items: [
      { title: "Based in", description: "Ahmedabad, India", icon: "MapPin" },
      { title: "Focus", description: "Housing & adaptive reuse", icon: "Target" },
      { title: "Experience", description: "12 years, licensed", icon: "Briefcase" },
      { title: "Currently", description: "Open to commissions", icon: "Zap" },
    ],
  },
  projects: {
    eyebrow: "Selected projects",
    subtitle: "Built work and competition entries.",
    items: [
      {
        title: "Courtyard House",
        subtitle: "Private residence, 340 sqm",
        description:
          "A load-bearing brick house organised around a shaded courtyard that does most of the cooling on its own.",
        tags: ["Residential", "Passive design"],
        period: "2024",
        featured: true,
      },
      {
        title: "Mill Quarter",
        subtitle: "Adaptive reuse, 4,200 sqm",
        description: "Converted a disused textile mill into workshops, a canteen and eleven studio units.",
        tags: ["Adaptive reuse", "Mixed use"],
        period: "2022",
      },
      {
        title: "Riverside Housing",
        subtitle: "Competition, second place",
        description: "Ninety affordable units arranged as four low-rise blocks around a shared water garden.",
        tags: ["Housing", "Competition"],
        period: "2021",
      },
    ],
  },
  services: {
    eyebrow: "How I work",
    items: [
      {
        title: "Full architectural services",
        description: "Concept through completion, including approvals and site supervision.",
        icon: "Building2",
        value: "Percentage of cost",
        bullets: ["Concept and design development", "Drawings and approvals", "Site supervision"],
        featured: true,
      },
      {
        title: "Feasibility & concept",
        description: "What the site will take, before anyone commits to a budget.",
        icon: "Compass",
        value: "Fixed fee",
        bullets: ["Site study", "Massing options", "Indicative costing"],
      },
      {
        title: "Interiors",
        description: "Interior design for completed shells, new or existing.",
        icon: "Sofa",
        value: "On request",
        bullets: ["Layouts and joinery", "Material palette", "Vendor coordination"],
      },
    ],
  },
  awards: {
    items: [
      { title: "Adaptive Reuse Award", subtitle: "Indian Institute of Architects", period: "2023" },
      { title: "Second place, Riverside Housing", subtitle: "State Housing Board", period: "2021" },
    ],
  },
  gallery: {
    eyebrow: "Drawings and photographs",
    subtitle: "Plans, models and finished buildings.",
  },
};

/* ──────────────────────────── Photography ──────────────────────────── */

const PHOTO: Pack = {
  about: {
    body:
      "I photograph weddings and the occasional editorial commission. I work quietly, in available light, and I " +
      "would rather wait for a moment than arrange one.\n\n" +
      "Seven years shooting, roughly thirty weddings a year.",
    items: [
      { title: "Based in", description: "Goa, India", icon: "MapPin" },
      { title: "Shoots", description: "Weddings & editorial", icon: "Target" },
      { title: "Experience", description: "7 years, 200+ weddings", icon: "Briefcase" },
      { title: "Currently", description: "Booking next season", icon: "Zap" },
    ],
  },
  services: {
    eyebrow: "What I offer",
    items: [
      {
        title: "Wedding coverage",
        description: "One or more days, photographed as it happens rather than staged.",
        icon: "Camera",
        value: "From 90,000",
        bullets: ["Full-day coverage", "400+ edited images", "Online gallery"],
        featured: true,
      },
      {
        title: "Portrait session",
        description: "An hour outdoors, for couples, families or a single good portrait.",
        icon: "User",
        value: "From 12,000",
        bullets: ["60-90 minutes", "30 edited images", "Print release"],
      },
      {
        title: "Editorial & brand",
        description: "Shoots for magazines, hotels and small brands that need their own pictures.",
        icon: "Newspaper",
        value: "Day rate",
        bullets: ["Half or full day", "Licensed usage", "Retouching included"],
      },
    ],
  },
  gallery: {
    eyebrow: "Portfolio",
    subtitle: "A small selection. The full galleries are password protected.",
  },
  pricing: {
    subtitle: "Collections for full-day wedding coverage.",
    items: [
      {
        title: "Half day",
        value: "60,000",
        description: "Ceremony only, up to five hours.",
        bullets: ["5 hours", "250 edited images", "Online gallery"],
        url: "#contact",
        urlLabel: "Enquire",
      },
      {
        title: "Full day",
        value: "90,000",
        description: "The whole day, from getting ready to the last dance.",
        bullets: ["10 hours", "400+ edited images", "Online gallery", "Printed album"],
        url: "#contact",
        urlLabel: "Enquire",
        featured: true,
      },
      {
        title: "Multi-day",
        value: "From 150,000",
        description: "Two or three days of functions, with a second photographer.",
        bullets: ["Two photographers", "All functions", "Album and prints", "Travel included"],
        url: "#contact",
        urlLabel: "Enquire",
      },
    ],
  },
};

/* ──────────────────────────── Writing ──────────────────────────── */

const WRITING: Pack = {
  about: {
    body:
      "I write long-form reporting on labour, technology and the places where the two collide. Most of my work " +
      "starts with a document nobody meant to publish.\n\n" +
      "Ten years reporting, six of them freelance.",
    items: [
      { title: "Based in", description: "Berlin, Germany", icon: "MapPin" },
      { title: "Beat", description: "Labour, technology and cities", icon: "Target" },
      { title: "Experience", description: "10 years reporting", icon: "Briefcase" },
      { title: "Currently", description: "Open to commissions", icon: "Zap" },
    ],
  },
  publications: {
    title: "Published work",
    eyebrow: "Selected articles",
    items: [
      {
        title: "The warehouse that never closes",
        subtitle: "The Guardian",
        period: "2024",
        description: "Six months inside the shift-scheduling software that runs a logistics hub.",
        urlLabel: "Read",
      },
      {
        title: "Who owns the night shift?",
        subtitle: "Rest of World",
        period: "2023",
        description: "How outsourced moderation work moved east, and what it pays.",
        urlLabel: "Read",
      },
      {
        title: "A city that forgot its water",
        subtitle: "Longreads",
        period: "2022",
        description: "Drought, municipal debt and the politics of a pipeline.",
        urlLabel: "Read",
      },
    ],
  },
  awards: {
    items: [
      { title: "European Press Prize, shortlist", subtitle: "Investigative Reporting", period: "2024" },
      { title: "Fetisov Journalism Award", subtitle: "Outstanding Contribution", period: "2022" },
    ],
  },
  blog: {
    title: "Notes",
    eyebrow: "Working notes",
    subtitle: "Shorter pieces, reading and things that did not become articles.",
    items: [
      {
        title: "How I file a records request that gets answered",
        period: "March 2026",
        description: "A short guide to freedom-of-information requests that come back with documents attached.",
        urlLabel: "Read",
      },
      {
        title: "Notes on interviewing people who are frightened",
        period: "January 2026",
        description: "What I have learned about sourcing from people with something to lose.",
        urlLabel: "Read",
      },
    ],
  },
  clients: {
    title: "Published in",
    items: [
      { title: "The Guardian" },
      { title: "Rest of World" },
      { title: "Longreads" },
      { title: "Die Zeit" },
      { title: "Wired" },
    ],
  },
};

/* ──────────────────────────── Consulting ──────────────────────────── */

const CONSULTING: Pack = {
  about: {
    body:
      "I help operators fix the things that are expensive and boring: pricing, retention, and the handover points " +
      "where work goes to die.\n\n" +
      "Fourteen years, half of it in industry and half advising the people still in it.",
    items: [
      { title: "Based in", description: "Singapore", icon: "MapPin" },
      { title: "Focus", description: "Pricing, retention and operations", icon: "Target" },
      { title: "Experience", description: "14 years, 60+ engagements", icon: "Briefcase" },
      { title: "Currently", description: "Booking from next quarter", icon: "Zap" },
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Diagnostic",
        description: "Two weeks to find out what is actually wrong, with evidence rather than opinion.",
        icon: "Search",
        value: "From 9,000",
        bullets: ["Data review", "Stakeholder interviews", "Written findings"],
      },
      {
        title: "Engagement",
        description: "A defined piece of work with a decision at the end of it.",
        icon: "Target",
        value: "From 35,000",
        bullets: ["Six to twelve weeks", "Weekly steering", "Implementation plan"],
        featured: true,
      },
      {
        title: "Advisory retainer",
        description: "Ongoing counsel for a leadership team that mostly needs a sounding board.",
        icon: "MessageSquare",
        value: "From 6,000/mo",
        bullets: ["Monthly sessions", "On-call between", "Quarterly review"],
      },
    ],
  },
  stats: {
    items: [
      { value: "14", title: "Years advising" },
      { value: "60+", title: "Engagements" },
      { value: "9", title: "Industries" },
      { value: "4x", title: "Median fee return" },
    ],
  },
  experience: {
    items: [
      {
        title: "Principal",
        subtitle: "Verso Advisory",
        period: "2018 — Present",
        location: "Singapore",
        description: "Independent practice advising subscription businesses across South-East Asia.",
        bullets: [
          "Repriced a subscription portfolio and lifted gross margin nine points",
          "Cut onboarding time for a 400-person operation from six weeks to nine days",
        ],
        tags: ["Pricing", "Operations"],
      },
      {
        title: "Director of Operations",
        subtitle: "Harbour Logistics",
        period: "2013 — 2018",
        location: "Kuala Lumpur, Malaysia",
        description: "Ran the operations function through a doubling of volume.",
        bullets: ["Held cost per shipment flat while volume doubled"],
        tags: ["Logistics", "Process"],
      },
    ],
  },
};

/* ──────────────────────────── Product ──────────────────────────── */

const PRODUCT: Pack = {
  about: {
    body:
      "I run product for developer tools, which mostly means saying no carefully and writing things down until " +
      "everyone means the same thing by the same word.\n\n" +
      "Eight years in product, before that four as an engineer.",
    items: [
      { title: "Based in", description: "Amsterdam, Netherlands", icon: "MapPin" },
      { title: "Focus", description: "Developer tools & platform", icon: "Target" },
      { title: "Experience", description: "8 years in product", icon: "Briefcase" },
      { title: "Currently", description: "Open to senior PM roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Senior Product Manager",
        subtitle: "Northwind Cloud",
        period: "2022 — Present",
        location: "Amsterdam, Netherlands",
        description: "Own the developer platform: APIs, SDKs and the self-serve onboarding funnel.",
        bullets: [
          "Took self-serve activation from 22% to 41% in three quarters",
          "Shipped the v2 API with a migration that kept 98% of customers on support-free upgrades",
        ],
        tags: ["Platform", "Growth", "APIs"],
      },
      {
        title: "Product Manager",
        subtitle: "Cobalt Systems",
        period: "2019 — 2022",
        location: "Berlin, Germany",
        description: "Ran the analytics product from first customer to eight figures of ARR.",
        bullets: ["Defined the pricing model still in use", "Built the first customer advisory board"],
        tags: ["Analytics", "Pricing"],
      },
    ],
  },
  projects: {
    title: "Product work",
    eyebrow: "Selected launches",
    items: [
      {
        title: "Self-serve onboarding",
        subtitle: "Activation from 22% to 41%",
        description: "Rebuilt signup around one working request rather than a configuration wizard.",
        tags: ["Growth", "Onboarding"],
      },
      {
        title: "v2 Platform API",
        subtitle: "Migration without the pain",
        description: "Versioned API with a compatibility layer and codemods, so upgrades did not need support.",
        tags: ["API", "Migration"],
      },
    ],
  },
  skills: {
    items: [
      group("Product", [
        ["Discovery & research", 88],
        ["Roadmapping", 90],
        ["Pricing & packaging", 82],
        ["Experimentation", 85],
      ]),
      group("Working with engineering", [
        ["Technical specs", 90],
        ["API design review", 78],
        ["SQL & analytics", 80],
      ]),
    ],
  },
  stats: {
    items: [
      { value: "8", title: "Years in product" },
      { value: "41%", title: "Self-serve activation" },
      { value: "3", title: "Products from zero" },
      { value: "12", title: "Engineers supported" },
    ],
  },
};

/* ──────────────────────────── Operations ──────────────────────────── */

const OPS: Pack = {
  about: {
    body:
      "I run operations for businesses that have outgrown the spreadsheet stage — supply, fulfilment and the " +
      "reporting that tells you which of the two is lying.\n\n" +
      "Ten years across manufacturing and e-commerce.",
    items: [
      { title: "Based in", description: "Gurugram, India", icon: "MapPin" },
      { title: "Focus", description: "Supply chain & fulfilment", icon: "Target" },
      { title: "Experience", description: "10 years in operations", icon: "Briefcase" },
      { title: "Currently", description: "Open to senior operations roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Head of Operations",
        subtitle: "Kettle & Co",
        period: "2021 — Present",
        location: "Gurugram, India",
        description: "Own supply, warehousing and last-mile for a direct-to-consumer brand across three warehouses.",
        bullets: [
          "Took on-time delivery from 82% to 96% without adding headcount",
          "Cut stockouts by half with a reorder model built on actual lead times",
        ],
        tags: ["Supply chain", "Fulfilment", "SQL"],
      },
      {
        title: "Operations Manager",
        subtitle: "Meridian Industries",
        period: "2016 — 2021",
        location: "Pune, India",
        description: "Plant operations for a two-shift components line.",
        bullets: ["Reduced changeover time 40% through SMED", "Led the ISO 9001 recertification"],
        tags: ["Lean", "ISO 9001"],
      },
    ],
  },
  skills: {
    items: [
      group("Operations", [
        ["Demand planning", 88],
        ["Inventory management", 90],
        ["Vendor negotiation", 85],
        ["Lean / Six Sigma", 80],
      ]),
      group("Systems", [
        ["SAP MM", 82],
        ["Advanced Excel", 95],
        ["SQL", 70],
        ["Power BI", 78],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "Six Sigma Green Belt", subtitle: "ASQ", period: "2020" },
      { title: "Certified Supply Chain Professional (CSCP)", subtitle: "ASCM", period: "2022" },
      { title: "ISO 9001 Lead Auditor", subtitle: "BSI", period: "2019" },
    ],
  },
  education: {
    items: [
      {
        title: "MBA, Operations",
        subtitle: "Symbiosis Institute of Business Management",
        period: "2014 — 2016",
        description: "Specialisation in supply chain management.",
      },
      {
        title: "B.E. Mechanical Engineering",
        subtitle: "Savitribai Phule Pune University",
        period: "2010 — 2014",
      },
    ],
  },
  projects: {
    title: "Initiatives",
    eyebrow: "Selected work",
    items: [
      {
        title: "Reorder model",
        subtitle: "Stockouts halved",
        description: "Replaced fixed reorder points with a lead-time model built from two years of receipts.",
        tags: ["Planning", "Excel"],
      },
      {
        title: "Warehouse consolidation",
        subtitle: "Five sites to three",
        description: "Consolidated regional warehouses while improving delivery times in every zone.",
        tags: ["Network design"],
      },
    ],
  },
  stats: {
    items: [
      { value: "96%", title: "On-time delivery" },
      { value: "-40%", title: "Changeover time" },
      { value: "3", title: "Warehouses run" },
      { value: "10", title: "Years in operations" },
    ],
  },
};

/* ──────────────────────────── Student ──────────────────────────── */

const STUDENT: Pack = {
  about: {
    body:
      "Final-year computer science student, more interested in the systems side than the framework of the month. " +
      "Looking for a graduate role or an internship where I will be reviewed properly.\n\n" +
      "Two internships so far, and a handful of projects I actually finished.",
    items: [
      { title: "Based in", description: "Hyderabad, India", icon: "MapPin" },
      { title: "Studying", description: "B.Tech Computer Science, final year", icon: "Target" },
      { title: "Graduating", description: "May 2027", icon: "Briefcase" },
      { title: "Currently", description: "Looking for a graduate role", icon: "Zap" },
    ],
  },
  education: {
    items: [
      {
        title: "B.Tech. Computer Science",
        subtitle: "International Institute of Information Technology",
        period: "2023 — 2027",
        location: "Hyderabad, India",
        description: "CGPA 8.7. Coursework in operating systems, databases and distributed systems.",
      },
      {
        title: "Higher Secondary, Science",
        subtitle: "Kendriya Vidyalaya",
        period: "2021 — 2023",
        description: "94.2%. School topper in mathematics.",
      },
    ],
  },
  projects: {
    eyebrow: "Things I have built",
    subtitle: "Coursework, hackathons and weekends.",
    items: [
      {
        title: "Mesh",
        subtitle: "Distributed key-value store",
        description:
          "A Raft-backed key-value store written from the paper, with a test harness that kills nodes at random.",
        tags: ["Go", "Raft", "Systems"],
        urlLabel: "GitHub",
        featured: true,
      },
      {
        title: "Attendance, but honest",
        subtitle: "Campus hackathon winner",
        description: "Bluetooth proximity attendance that is hard to spoof, built in 36 hours with two friends.",
        tags: ["Android", "Kotlin"],
        urlLabel: "GitHub",
      },
      {
        title: "Course planner",
        subtitle: "Used by 400 students",
        description: "Scrapes the course catalogue and builds conflict-free timetables for the next semester.",
        tags: ["Python", "React"],
        urlLabel: "Try it",
      },
    ],
  },
  skills: {
    items: [
      group("Languages", [
        ["Python", 85],
        ["Go", 70],
        ["C++", 75],
        ["JavaScript", 72],
      ]),
      group("Coursework", [
        ["Data structures & algorithms", 88],
        ["Operating systems", 80],
        ["Databases", 78],
        ["Computer networks", 72],
      ]),
      group("Tools", [
        ["Git", 85],
        ["Linux", 80],
        ["Docker", 65],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "AWS Certified Cloud Practitioner", subtitle: "Amazon Web Services", period: "2025" },
      { title: "Machine Learning Specialisation", subtitle: "DeepLearning.AI", period: "2024" },
    ],
  },
  languages: {
    items: [
      { title: "English", subtitle: "Fluent", level: 90 },
      { title: "Telugu", subtitle: "Native", level: 100 },
      { title: "Hindi", subtitle: "Conversational", level: 70 },
    ],
  },
};

/* ──────────────────────────── Marketing ──────────────────────────── */

const MARKETING: Pack = {
  about: {
    body:
      "I run growth marketing for consumer brands — the unglamorous compounding kind, where the win is a channel " +
      "that still works in month nine.\n\n" +
      "Nine years across agency and in-house.",
    items: [
      { title: "Based in", description: "Bengaluru, India", icon: "MapPin" },
      { title: "Focus", description: "Performance & lifecycle marketing", icon: "Target" },
      { title: "Experience", description: "9 years, agency and in-house", icon: "Briefcase" },
      { title: "Currently", description: "Taking on two clients", icon: "Zap" },
    ],
  },
  projects: {
    title: "Campaigns",
    eyebrow: "Selected work",
    subtitle: "Campaigns with numbers attached.",
    items: [
      {
        title: "Kettle & Co launch",
        subtitle: "Direct-to-consumer, first year",
        description:
          "Took a kitchenware brand from zero to a five-figure monthly run rate on paid social and lifecycle email.",
        tags: ["Paid social", "Lifecycle", "Creative"],
        featured: true,
      },
      {
        title: "Retention overhaul",
        subtitle: "Subscription box",
        description: "Rebuilt onboarding emails and win-back flows; month-three retention up fourteen points.",
        tags: ["Email", "Retention"],
      },
      {
        title: "Brand refresh",
        subtitle: "Regional bank",
        description: "Repositioned a 40-year-old bank for customers who had never walked into a branch.",
        tags: ["Brand", "Research"],
      },
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Growth audit",
        description: "Where the money is going and which of it is working.",
        icon: "Search",
        value: "From 1,800",
        bullets: ["Channel and funnel review", "Creative teardown", "Prioritised plan"],
      },
      {
        title: "Fractional growth lead",
        description: "A senior marketer for two days a week, without the hire.",
        icon: "Rocket",
        value: "From 4,500/mo",
        bullets: ["Strategy and budget", "Agency management", "Weekly reporting"],
        featured: true,
      },
      {
        title: "Lifecycle build",
        description: "Email and retention flows from scratch, written and wired up.",
        icon: "Mail",
        value: "From 3,000",
        bullets: ["Flow mapping", "Copy and design", "Testing plan"],
      },
    ],
  },
  stats: {
    items: [
      { value: "9", title: "Years in marketing" },
      { value: "3.4x", title: "Median return on ad spend" },
      { value: "+14pts", title: "Retention lift" },
      { value: "30+", title: "Brands worked with" },
    ],
  },
};

/* ──────────────────────────── Sales ──────────────────────────── */

const SALES: Pack = {
  about: {
    body:
      "I sell enterprise software to operations teams, which means long cycles, many stakeholders and a lot of " +
      "reading between the lines of a procurement process.\n\n" +
      "Eleven years in sales, seven of them enterprise.",
    items: [
      { title: "Based in", description: "Dubai, UAE", icon: "MapPin" },
      { title: "Sells", description: "Enterprise SaaS to operations", icon: "Target" },
      { title: "Experience", description: "11 years, 7 enterprise", icon: "Briefcase" },
      { title: "Currently", description: "Open to AE and sales lead roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Enterprise Account Executive",
        subtitle: "Northwind Cloud",
        period: "2021 — Present",
        location: "Dubai, UAE",
        description: "Own new business across the Gulf for a supply-chain platform.",
        bullets: [
          "142% of quota across three consecutive years",
          "Closed the largest deal in the region to date, a seven-figure multi-year contract",
          "Built the partner channel that now sources a third of pipeline",
        ],
        tags: ["Enterprise", "MEDDIC", "Salesforce"],
      },
      {
        title: "Account Executive",
        subtitle: "Cobalt Systems",
        period: "2017 — 2021",
        location: "Bengaluru, India",
        description: "Mid-market new business across India and South-East Asia.",
        bullets: ["Grew territory revenue 3x in four years", "Ramped four new reps to quota"],
        tags: ["Mid-market", "Outbound"],
      },
    ],
  },
  skills: {
    items: [
      group("Selling", [
        ["Enterprise new business", 92],
        ["MEDDIC qualification", 88],
        ["Negotiation & procurement", 85],
        ["Channel partnerships", 78],
      ]),
      group("Tools", [
        ["Salesforce", 90],
        ["Outreach", 82],
        ["Gong", 75],
      ]),
    ],
  },
  stats: {
    items: [
      { value: "142%", title: "Of quota, 3 years" },
      { value: "7 fig", title: "Largest deal" },
      { value: "11", title: "Years selling" },
      { value: "4", title: "Reps ramped" },
    ],
  },
};

/* ──────────────────────────── Music ──────────────────────────── */

const MUSIC: Pack = {
  about: {
    body:
      "I play and produce — mostly guitar, increasingly a laptop. I score for film when the brief is interesting " +
      "and play live when the room is right.\n\n" +
      "Three records out, one on the way.",
    items: [
      { title: "Based in", description: "Mumbai, India", icon: "MapPin" },
      { title: "Plays", description: "Guitar, production, film scoring", icon: "Target" },
      { title: "Releases", description: "3 albums, 14 singles", icon: "Briefcase" },
      { title: "Currently", description: "Booking live dates", icon: "Zap" },
    ],
  },
  gallery: {
    eyebrow: "Live and in the studio",
    subtitle: "Photographs from shows and sessions.",
  },
  blog: {
    title: "Notes",
    eyebrow: "From the studio",
    subtitle: "Writing about records, gear and what did not work.",
    items: [
      {
        title: "Recording the second record in one room",
        period: "February 2026",
        description: "What changes when everyone plays at once and nobody gets a punch-in.",
        urlLabel: "Read",
      },
      {
        title: "On writing to picture",
        period: "November 2025",
        description: "Scoring a short film taught me more about arrangement than a decade of songs.",
        urlLabel: "Read",
      },
    ],
  },
  services: {
    eyebrow: "Work with me",
    items: [
      {
        title: "Session guitar",
        description: "Parts written and recorded for your track, delivered as stems.",
        icon: "Music",
        value: "From 8,000 per track",
        bullets: ["Two revisions", "Stems and DI", "48-hour turnaround"],
      },
      {
        title: "Production",
        description: "From demo to finished master, with arrangement along the way.",
        icon: "SlidersHorizontal",
        value: "From 40,000 per track",
        bullets: ["Arrangement", "Recording and mixing", "Mastering included"],
        featured: true,
      },
      {
        title: "Film & ad scoring",
        description: "Original score for shorts, features and commercial work.",
        icon: "Film",
        value: "On request",
        bullets: ["Spotting session", "Cue-by-cue delivery", "Full buyout available"],
      },
    ],
  },
};

/* ──────────────────────────── Culinary ──────────────────────────── */

const CULINARY: Pack = {
  about: {
    body:
      "I cook coastal food from the south-west — a lot of fish, a lot of coconut, and whatever the market had that " +
      "morning.\n\n" +
      "Fifteen years in kitchens, the last four running my own.",
    items: [
      { title: "Based in", description: "Kochi, India", icon: "MapPin" },
      { title: "Cooks", description: "Coastal South Indian", icon: "Target" },
      { title: "Experience", description: "15 years, 4 as head chef", icon: "Briefcase" },
      { title: "Currently", description: "Taking private bookings", icon: "Zap" },
    ],
  },
  gallery: {
    eyebrow: "From the pass",
    subtitle: "Dishes, menus and the occasional market.",
  },
  services: {
    eyebrow: "What I offer",
    items: [
      {
        title: "Private dining",
        description: "A set menu cooked in your kitchen, for six to twelve people.",
        icon: "UtensilsCrossed",
        value: "From 2,500 per head",
        bullets: ["Menu designed with you", "Shopping and prep", "Service and clean-up"],
        featured: true,
      },
      {
        title: "Menu consulting",
        description: "Menu design and kitchen process for restaurants that have lost the thread.",
        icon: "ClipboardList",
        value: "From 60,000",
        bullets: ["Menu engineering", "Costing and yields", "Staff training"],
      },
      {
        title: "Cooking classes",
        description: "Hands-on sessions for small groups, from fish butchery to a full thali.",
        icon: "ChefHat",
        value: "From 3,500 per person",
        bullets: ["Groups up to 8", "All ingredients", "Recipes to take home"],
      },
    ],
  },
  experience: {
    items: [
      {
        title: "Head Chef & Owner",
        subtitle: "Kadal",
        period: "2022 — Present",
        location: "Kochi, India",
        description: "Thirty covers, one menu, changed with the catch.",
        bullets: ["Named in the regional top ten within eighteen months", "Run a kitchen brigade of nine"],
        tags: ["Coastal", "Seasonal"],
      },
      {
        title: "Sous Chef",
        subtitle: "The Malabar House",
        period: "2016 — 2022",
        location: "Kochi, India",
        description: "Second in a fine-dining kitchen serving 90 covers a night.",
        bullets: ["Rewrote the tasting menu twice a year", "Trained six commis chefs"],
        tags: ["Fine dining"],
      },
    ],
  },
};

/* ──────────────────────────── Freelance ──────────────────────────── */

const FREELANCE: Pack = {
  about: {
    body:
      "I am a freelancer who takes on defined pieces of work and finishes them. Mostly web builds and the systems " +
      "around them, for founders who do not want an agency.\n\n" +
      "Six years independent, forty-odd projects.",
    items: [
      { title: "Based in", description: "Remote, IST hours", icon: "MapPin" },
      { title: "Does", description: "Web builds and automation", icon: "Target" },
      { title: "Experience", description: "6 years freelance", icon: "Briefcase" },
      { title: "Currently", description: "Two slots free this quarter", icon: "Zap" },
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Website build",
        description: "A site that loads fast, reads well and you can update yourself.",
        icon: "Globe",
        value: "From 2,500",
        bullets: ["Design and build", "CMS setup", "Two weeks of support"],
        featured: true,
      },
      {
        title: "Automation",
        description: "The manual process that eats a day a week, turned into something that runs itself.",
        icon: "Workflow",
        value: "From 1,200",
        bullets: ["Process mapping", "Build and test", "Handover documentation"],
      },
      {
        title: "Ongoing retainer",
        description: "Reserved capacity each month for whatever comes up.",
        icon: "CalendarCheck",
        value: "From 1,800/mo",
        bullets: ["Rolling backlog", "Same-week turnaround", "Monthly review"],
      },
    ],
  },
  projects: {
    eyebrow: "Recent work",
    items: [
      {
        title: "Kettle & Co",
        subtitle: "Storefront rebuild",
        description: "Rebuilt a slow storefront; checkout completion up nineteen percent on mobile.",
        tags: ["Next.js", "Shopify"],
      },
      {
        title: "Quote engine",
        subtitle: "Insurance broker",
        description: "Replaced a spreadsheet quoting process with a web tool the whole team uses.",
        tags: ["Automation", "Airtable"],
      },
    ],
  },
};

/* ──────────────────────────── Data ──────────────────────────── */

const DATA: Pack = {
  about: {
    body:
      "I work on forecasting and causal questions — the ones where a dashboard cannot tell you whether the thing " +
      "you did caused the thing that happened.\n\n" +
      "Seven years, split between a research group and industry.",
    items: [
      { title: "Based in", description: "Bengaluru, India", icon: "MapPin" },
      { title: "Focus", description: "Forecasting & causal inference", icon: "Target" },
      { title: "Experience", description: "7 years, research and industry", icon: "Briefcase" },
      { title: "Currently", description: "Open to senior DS roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Senior Data Scientist",
        subtitle: "Northwind Retail",
        period: "2022 — Present",
        location: "Bengaluru, India",
        description: "Demand forecasting and pricing experiments across 900 stores.",
        bullets: [
          "Cut forecast error 23% against the incumbent model",
          "Built the experiment platform now used for every pricing change",
        ],
        tags: ["Python", "PyTorch", "dbt"],
      },
      {
        title: "Data Scientist",
        subtitle: "Cobalt Health",
        period: "2019 — 2022",
        location: "Remote",
        description: "Risk models for a chronic care programme, with clinicians in the loop.",
        bullets: ["Readmission model deployed across four hospitals"],
        tags: ["scikit-learn", "SQL"],
      },
    ],
  },
  skills: {
    items: [
      group("Modelling", [
        ["Forecasting", 90],
        ["Causal inference", 85],
        ["Deep learning", 78],
        ["Experiment design", 88],
      ]),
      group("Engineering", [
        ["Python", 92],
        ["SQL", 90],
        ["dbt / Airflow", 80],
        ["Spark", 70],
      ]),
      group("Communication", [
        ["Stakeholder reporting", 88],
        ["Visualisation", 85],
      ]),
    ],
  },
  projects: {
    eyebrow: "Selected work",
    items: [
      {
        title: "Demand forecasting",
        subtitle: "900 stores, daily horizon",
        description: "Hierarchical forecasting with holiday and weather features; 23% lower error than baseline.",
        tags: ["Forecasting", "PyTorch"],
        featured: true,
      },
      {
        title: "Experiment platform",
        subtitle: "Pricing tests without the guesswork",
        description: "Switchback design and analysis library that any analyst can run without a statistician.",
        tags: ["Causal", "Python"],
      },
    ],
  },
  publications: {
    items: [
      {
        title: "Hierarchical forecasting under sparse demand",
        subtitle: "International Journal of Forecasting",
        period: "2024",
        description: "With Rao, S. Reconciliation methods for long-tail retail categories.",
      },
      {
        title: "Switchback experiments in physical retail",
        subtitle: "KDD Applied Data Science Track",
        period: "2023",
      },
    ],
  },
  education: {
    items: [
      {
        title: "M.S. Statistics",
        subtitle: "Indian Statistical Institute",
        period: "2016 — 2018",
        description: "Dissertation on time-series reconciliation.",
      },
      {
        title: "B.Sc. Mathematics",
        subtitle: "St. Stephens College",
        period: "2013 — 2016",
      },
    ],
  },
};

/* ──────────────────────────── Security ──────────────────────────── */

const SECURITY: Pack = {
  about: {
    body:
      "I break into things with permission and write up how I did it. Mostly web and cloud, occasionally the " +
      "building itself.\n\n" +
      "Eight years in offensive security, four of them leading engagements.",
    items: [
      { title: "Based in", description: "Remote, CET hours", icon: "MapPin" },
      { title: "Focus", description: "Web, cloud and red team", icon: "Target" },
      { title: "Experience", description: "8 years, 200+ engagements", icon: "Briefcase" },
      { title: "Currently", description: "Booking from next month", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Lead Penetration Tester",
        subtitle: "Ironwood Security",
        period: "2021 — Present",
        location: "Remote",
        description: "Lead web and cloud engagements for financial services clients, and write the reports.",
        bullets: [
          "Found an authentication bypass in a payments platform before it reached production",
          "Built the internal tooling that cut report writing time in half",
        ],
        tags: ["Burp Suite", "AWS", "Python"],
      },
      {
        title: "Security Engineer",
        subtitle: "Cobalt Systems",
        period: "2018 — 2021",
        location: "Berlin, Germany",
        description: "Application security review and secure development training for engineering teams.",
        bullets: ["Ran the bug bounty programme through its first two years"],
        tags: ["AppSec", "Threat modelling"],
      },
    ],
  },
  skills: {
    items: [
      group("Offensive", [
        ["Web application testing", 92],
        ["Cloud security review", 85],
        ["Red teaming", 78],
        ["Social engineering", 70],
      ]),
      group("Tooling", [
        ["Burp Suite", 92],
        ["Python tooling", 88],
        ["Metasploit", 75],
        ["Nuclei", 80],
      ]),
      group("Defensive", [
        ["Threat modelling", 85],
        ["Secure code review", 82],
        ["Detection engineering", 68],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "Offensive Security Certified Professional (OSCP)", subtitle: "OffSec", period: "2020" },
      { title: "Burp Suite Certified Practitioner", subtitle: "PortSwigger", period: "2023" },
      { title: "AWS Certified Security — Specialty", subtitle: "Amazon Web Services", period: "2022" },
    ],
  },
  projects: {
    title: "Research",
    eyebrow: "Public work",
    subtitle: "Disclosures, tooling and write-ups.",
    items: [
      {
        title: "CVE-2025-00000",
        subtitle: "Authentication bypass, payments SDK",
        description: "Coordinated disclosure of a token validation flaw affecting a widely used payments SDK.",
        tags: ["Disclosure", "Web"],
        featured: true,
      },
      {
        title: "recon-kit",
        subtitle: "Open-source tooling",
        description: "Asset discovery pipeline that turns a domain into a reviewed attack surface in minutes.",
        tags: ["Python", "Open source"],
        urlLabel: "GitHub",
      },
    ],
  },
};

/* ──────────────────────────── Civil engineering ──────────────────────────── */

const CIVIL: Pack = {
  about: {
    body:
      "I am a structural engineer working on bridges and mid-rise buildings, with a soft spot for retrofits — the " +
      "problems where you cannot start again.\n\n" +
      "Thirteen years, chartered since 2018.",
    items: [
      { title: "Based in", description: "Chennai, India", icon: "MapPin" },
      { title: "Focus", description: "Structures & seismic retrofit", icon: "Target" },
      { title: "Experience", description: "13 years, chartered", icon: "Briefcase" },
      { title: "Currently", description: "Open to consulting work", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Senior Structural Engineer",
        subtitle: "Aravind Consulting Engineers",
        period: "2019 — Present",
        location: "Chennai, India",
        description: "Lead structural design for bridges and mid-rise commercial buildings.",
        bullets: [
          "Designed a 120m cable-stayed footbridge delivered under budget",
          "Led seismic retrofit of a 1970s hospital block while it stayed in use",
        ],
        tags: ["ETABS", "STAAD.Pro", "IS 1893"],
      },
      {
        title: "Structural Engineer",
        subtitle: "Meridian Infrastructure",
        period: "2013 — 2019",
        location: "Hyderabad, India",
        description: "Design and site support across highway and industrial projects.",
        bullets: ["Site engineer on a 6km elevated corridor through to handover"],
        tags: ["Highways", "Site supervision"],
      },
    ],
  },
  projects: {
    eyebrow: "Selected projects",
    items: [
      {
        title: "Kollidam footbridge",
        subtitle: "120m cable-stayed span",
        description: "Structural design and construction support for a pedestrian crossing over a tidal river.",
        tags: ["Bridge", "Steel"],
        period: "2023",
        featured: true,
      },
      {
        title: "Hospital seismic retrofit",
        subtitle: "1970s reinforced concrete block",
        description: "Jacketing and bracing scheme staged so the wards never closed.",
        tags: ["Retrofit", "Seismic"],
        period: "2021",
      },
    ],
  },
  skills: {
    items: [
      group("Design", [
        ["Reinforced concrete", 92],
        ["Structural steel", 88],
        ["Seismic design", 85],
        ["Foundation design", 80],
      ]),
      group("Software", [
        ["ETABS", 90],
        ["STAAD.Pro", 88],
        ["AutoCAD", 85],
        ["Revit", 70],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "Chartered Engineer", subtitle: "Institution of Engineers (India)", period: "2018" },
      { title: "Licensed Structural Engineer", subtitle: "Chennai Metropolitan Development Authority", period: "2019" },
    ],
  },
  education: {
    items: [
      {
        title: "M.Tech. Structural Engineering",
        subtitle: "Indian Institute of Technology Madras",
        period: "2011 — 2013",
        description: "Thesis on retrofit of soft-storey reinforced concrete frames.",
      },
      {
        title: "B.E. Civil Engineering",
        subtitle: "College of Engineering, Guindy",
        period: "2007 — 2011",
      },
    ],
  },
};

/* ──────────────────────────── People & HR ──────────────────────────── */

const HR: Pack = {
  about: {
    body:
      "I build people functions for companies between fifty and five hundred — hiring that is fair and fast, and " +
      "policies people can actually find.\n\n" +
      "Ten years in HR, four leading the function.",
    items: [
      { title: "Based in", description: "Bengaluru, India", icon: "MapPin" },
      { title: "Focus", description: "Talent, performance and policy", icon: "Target" },
      { title: "Experience", description: "10 years, 4 as HR lead", icon: "Briefcase" },
      { title: "Currently", description: "Open to HR leadership roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Head of People",
        subtitle: "Cobalt Systems",
        period: "2021 — Present",
        location: "Bengaluru, India",
        description: "Own hiring, performance and policy through growth from 90 to 320 people.",
        bullets: [
          "Cut time to hire from 54 days to 28 without lowering the bar",
          "Rebuilt performance reviews around calibrated evidence rather than recency",
          "Voluntary attrition down from 22% to 11%",
        ],
        tags: ["Talent", "Performance", "Policy"],
      },
      {
        title: "HR Business Partner",
        subtitle: "Meridian Industries",
        period: "2016 — 2021",
        location: "Pune, India",
        description: "Partnered two business units through restructuring and a factory relocation.",
        bullets: ["Handled 60+ employee relations cases", "Ran the relocation consultation end to end"],
        tags: ["Employee relations", "Change"],
      },
    ],
  },
  skills: {
    items: [
      group("People", [
        ["Talent acquisition", 90],
        ["Performance management", 88],
        ["Employee relations", 85],
        ["Compensation & benefits", 78],
      ]),
      group("Systems", [
        ["Workday", 80],
        ["Greenhouse", 85],
        ["People analytics", 75],
      ]),
    ],
  },
  services: {
    eyebrow: "How I can help",
    items: [
      {
        title: "Hiring setup",
        description: "Structured interviews, scorecards and a process candidates do not resent.",
        icon: "UserPlus",
        value: "From 2,500",
        bullets: ["Role scorecards", "Interview training", "Offer process"],
        featured: true,
      },
      {
        title: "Performance & progression",
        description: "Levels, reviews and pay bands that hold up when someone asks why.",
        icon: "TrendingUp",
        value: "From 4,000",
        bullets: ["Career framework", "Review cycle design", "Manager training"],
      },
      {
        title: "Policy & compliance",
        description: "The handbook, written so people read it.",
        icon: "FileText",
        value: "From 1,800",
        bullets: ["Handbook and policies", "Statutory compliance", "Manager guidance"],
      },
    ],
  },
  education: {
    items: [
      {
        title: "MBA, Human Resources",
        subtitle: "XLRI Jamshedpur",
        period: "2014 — 2016",
      },
      {
        title: "B.A. Psychology",
        subtitle: "Christ University",
        period: "2011 — 2014",
      },
    ],
  },
  stats: {
    items: [
      { value: "28 days", title: "Time to hire" },
      { value: "320", title: "People supported" },
      { value: "11%", title: "Voluntary attrition" },
      { value: "10", title: "Years in HR" },
    ],
  },
};

/* ──────────────── Where one preset in a family differs ──────────────── */

/** A CA qualifies differently, and leads with the practice rather than the ledger. */
const CA_OVERRIDE: Pack = {
  about: {
    body:
      "I am a practising Chartered Accountant. Most of my work is statutory audit, direct tax and the advisory " +
      "that keeps a growing business out of trouble with either.\n\n" +
      "Qualified in 2019, in practice since.",
    items: [
      { title: "Based in", description: "Mumbai, India", icon: "MapPin" },
      { title: "Practice", description: "Audit, direct tax and advisory", icon: "Target" },
      { title: "Member since", description: "ICAI, 2019", icon: "Briefcase" },
      { title: "Currently", description: "Accepting new clients", icon: "Zap" },
    ],
  },
  certifications: {
    title: "Qualifications",
    items: [
      { title: "Chartered Accountant", subtitle: "ICAI — All India Rank 27", period: "2019" },
      { title: "Diploma in Information Systems Audit (DISA)", subtitle: "ICAI", period: "2021" },
      { title: "Certificate Course on GST", subtitle: "ICAI", period: "2020" },
      { title: "Forensic Accounting & Fraud Detection", subtitle: "ICAI", period: "2023" },
    ],
  },
  education: {
    items: [
      {
        title: "Chartered Accountancy",
        subtitle: "The Institute of Chartered Accountants of India",
        period: "2015 — 2019",
        description: "All India Rank 27 in the final examination.",
      },
      {
        title: "B.Com. (Honours)",
        subtitle: "Narsee Monjee College of Commerce",
        period: "2012 — 2015",
        description: "Gold medallist.",
      },
    ],
  },
};

/** An analyst models the future; an accountant reports the past. */
const ANALYST_OVERRIDE: Pack = {
  about: {
    body:
      "I cover consumer and industrials — building the models, arguing with the assumptions and writing the note " +
      "that has to survive a fund manager reading it on a phone.\n\n" +
      "Seven years in equity research and corporate FP&A.",
    items: [
      { title: "Based in", description: "Mumbai, India", icon: "MapPin" },
      { title: "Covers", description: "Consumer & industrials", icon: "Target" },
      { title: "Experience", description: "7 years, research and FP&A", icon: "Briefcase" },
      { title: "Currently", description: "Open to buy-side roles", icon: "Zap" },
    ],
  },
  experience: {
    items: [
      {
        title: "Senior Equity Research Analyst",
        subtitle: "Harbour Capital",
        period: "2021 — Present",
        location: "Mumbai, India",
        description: "Cover eighteen consumer and industrial names, from the model to the published note.",
        bullets: [
          "Ranked top quartile for earnings accuracy three years running",
          "Called the margin reset in packaged foods two quarters before consensus",
        ],
        tags: ["Valuation", "Modelling", "Bloomberg"],
      },
      {
        title: "FP&A Manager",
        subtitle: "Meridian Industries",
        period: "2018 — 2021",
        location: "Pune, India",
        description: "Owned the annual plan, the rolling forecast and the monthly variance story for the board.",
        bullets: ["Cut forecast variance from 9% to 3%", "Built the driver-based model still in use"],
        tags: ["FP&A", "Forecasting"],
      },
    ],
  },
  skills: {
    items: [
      group("Analysis", [
        ["Financial modelling", 95],
        ["Valuation (DCF, comps)", 92],
        ["Forecasting", 88],
        ["Scenario analysis", 85],
      ]),
      group("Tools", [
        ["Advanced Excel / VBA", 95],
        ["Bloomberg Terminal", 85],
        ["Power BI", 80],
        ["Python (pandas)", 70],
      ]),
    ],
  },
  certifications: {
    items: [
      { title: "CFA Charterholder", subtitle: "CFA Institute", period: "2022" },
      { title: "Financial Risk Manager (FRM)", subtitle: "GARP", period: "2020" },
    ],
  },
  projects: {
    title: "Research",
    eyebrow: "Selected notes",
    items: [
      {
        title: "Packaged foods: the margin reset",
        subtitle: "Initiation, 42 pages",
        description: "Argued input costs would normalise two quarters ahead of consensus. They did.",
        tags: ["Consumer", "Initiation"],
        featured: true,
      },
      {
        title: "Capex cycle in industrials",
        subtitle: "Thematic note",
        description: "Bottom-up capex model across 30 companies, mapped against order book disclosures.",
        tags: ["Industrials", "Thematic"],
      },
    ],
  },
  stats: {
    items: [
      { value: "18", title: "Names covered" },
      { value: "Top 25%", title: "Earnings accuracy" },
      { value: "3%", title: "Forecast variance" },
      { value: "7", title: "Years in markets" },
    ],
  },
};

/* ──────────────────────────── Lookup ──────────────────────────── */

/**
 * Which pack each preset draws on.
 *
 * `developer` and `blank` are absent on purpose: the generic samples in
 * `sections.ts` were written for a developer, so they already fit.
 */
const FAMILY: Record<string, Pack> = {
  accountant: FINANCE,
  ca: FINANCE,
  "financial-analyst": FINANCE,
  doctor: MEDICAL,
  nurse: NURSING,
  lawyer: LEGAL,
  academic: ACADEMIA,
  teacher: TEACHING,
  designer: DESIGN,
  architect: ARCHITECTURE,
  photographer: PHOTO,
  writer: WRITING,
  consultant: CONSULTING,
  pm: PRODUCT,
  operations: OPS,
  student: STUDENT,
  marketer: MARKETING,
  sales: SALES,
  musician: MUSIC,
  chef: CULINARY,
  freelancer: FREELANCE,
  datascientist: DATA,
  hacker: SECURITY,
  "civil-engineer": CIVIL,
  hr: HR,
};

/** Presets that differ from their family in a few sections. */
const OVERRIDES: Record<string, Pack> = {
  ca: CA_OVERRIDE,
  "financial-analyst": ANALYST_OVERRIDE,
};

/**
 * The sample copy for one section of one profession, or null to use the generic
 * one from `sections.ts`.
 */
export function sampleFor(presetId: string, type: SectionType): SectionSample | null {
  return OVERRIDES[presetId]?.[type] ?? FAMILY[presetId]?.[type] ?? null;
}
