/**
 * Knowledge base for the guided builder.
 *
 * This is a curated lookup, not a language model: given a role family it offers
 * the skills, tools and achievement phrasings that actually recur in that field,
 * and the user picks from them. Everything it produces is editable afterwards,
 * and nothing is invented about the person — only offered for them to confirm.
 */

export interface ChoiceGroup {
  label: string;
  /** Shown as multi-select chips. */
  options: string[];
}

export interface RoleKnowledge {
  id: string;
  label: string;
  /** Preset used for the generated document's look and section set. */
  presetId: string;
  /** Job titles offered for the headline, roughly by seniority. */
  titles: string[];
  skillGroups: ChoiceGroup[];
  strengths: string[];
  /** Achievement phrasings; `{n}` is replaced with whatever the user types. */
  achievements: string[];
  /** Opening sentence for the summary. `{years}` and `{title}` are filled in. */
  summary: string;
}

const COMMON_STRENGTHS = [
  "Clear written communication",
  "Mentoring and coaching",
  "Stakeholder management",
  "Prioritising under pressure",
  "Cross-functional collaboration",
  "Process improvement",
  "Attention to detail",
  "Working independently",
];

export const ROLES: RoleKnowledge[] = [
  {
    id: "developer",
    label: "Software Development",
    presetId: "developer",
    titles: ["Junior Developer", "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Engineering Lead"],
    skillGroups: [
      {
        label: "Languages",
        options: ["JavaScript", "TypeScript", "Python", "Java", "Go", "C#", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "SQL"],
      },
      {
        label: "Frameworks",
        options: ["React", "Next.js", "Vue", "Angular", "Node.js", "Django", "FastAPI", "Spring Boot", ".NET", "Rails", "React Native", "Flutter"],
      },
      {
        label: "Data & infrastructure",
        options: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "GraphQL"],
      },
      { label: "Practice", options: ["System design", "Code review", "Testing & TDD", "Performance tuning", "Accessibility", "Security", "Agile / Scrum", "Technical writing"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Cut page load time from {n} by rebuilding the rendering pipeline",
      "Shipped the {n} feature used by every customer on the platform",
      "Reduced infrastructure cost by {n} through query and caching work",
      "Brought test coverage from {n}, cutting production incidents",
      "Led the migration from {n} with no customer-facing downtime",
      "Mentored {n} engineers through promotion",
    ],
    summary:
      "{title} with {years} building and shipping production software end to end.",
  },
  {
    id: "designer",
    label: "Design",
    presetId: "designer",
    titles: ["Junior Designer", "Product Designer", "Senior Product Designer", "Design Lead", "Head of Design"],
    skillGroups: [
      { label: "Tools", options: ["Figma", "Sketch", "Adobe XD", "Illustrator", "Photoshop", "After Effects", "Framer", "Webflow", "Blender", "Procreate"] },
      { label: "Craft", options: ["Design systems", "Interaction design", "Prototyping", "Visual design", "Branding", "Typography", "Illustration", "Motion design", "Design tokens"] },
      { label: "Research", options: ["User interviews", "Usability testing", "Journey mapping", "A/B testing", "Accessibility (WCAG)", "Workshop facilitation", "Service design"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Built the design system now used by {n} product teams",
      "Raised task completion from {n} after a usability rework",
      "Cut design-to-development handoff time by {n}",
      "Redesigned the onboarding flow, lifting activation {n}",
      "Ran {n} rounds of user research to shape the roadmap",
    ],
    summary: "{title} with {years} across product, brand and design systems.",
  },
  {
    id: "accountant",
    label: "Accounting & Finance",
    presetId: "accountant",
    titles: ["Junior Accountant", "Accountant", "Senior Accountant", "Finance Manager", "Financial Controller"],
    skillGroups: [
      { label: "Systems", options: ["SAP", "Oracle NetSuite", "QuickBooks", "Xero", "Tally", "Zoho Books", "Sage", "Microsoft Dynamics", "Advanced Excel", "Power BI"] },
      {
        label: "Domains",
        options: ["Financial reporting", "Month-end close", "Statutory audit", "Internal audit", "Accounts payable", "Accounts receivable", "Payroll", "Budgeting & forecasting", "Cash-flow management", "Fixed assets", "Reconciliations", "Cost accounting"],
      },
      {
        label: "Compliance",
        options: ["IFRS", "US GAAP", "Ind AS", "GST / VAT", "Direct tax", "Transfer pricing", "SOX controls", "Anti-money laundering", "Companies Act filings"],
      },
    ],
    strengths: [...COMMON_STRENGTHS, "Working to statutory deadlines", "Handling confidential information"],
    achievements: [
      "Cut the month-end close from {n}",
      "Recovered {n} through a receivables clean-up",
      "Led the statutory audit for an entity with {n} turnover, with no material findings",
      "Automated reconciliations, saving {n} of manual work each month",
      "Implemented {n} across the finance team",
    ],
    summary: "{title} with {years} across reporting, compliance and close.",
  },
  {
    id: "ca",
    label: "Chartered Accountancy / Audit",
    presetId: "ca",
    titles: ["Article Assistant", "Chartered Accountant", "Audit Manager", "Senior Manager", "Partner"],
    skillGroups: [
      { label: "Practice areas", options: ["Statutory audit", "Internal audit", "Tax advisory", "Direct taxation", "Indirect taxation / GST", "Transfer pricing", "Due diligence", "Valuation", "Insolvency", "Forensic audit", "Company secretarial"] },
      { label: "Standards", options: ["Ind AS", "IFRS", "US GAAP", "SA (Standards on Auditing)", "ICDS", "Companies Act 2013", "FEMA", "SEBI regulations"] },
      { label: "Systems", options: ["SAP", "Tally", "Oracle", "CaseWare", "IDEA", "Advanced Excel", "Power BI", "Computax", "Winman"] },
    ],
    strengths: [...COMMON_STRENGTHS, "Client relationship management", "Managing engagement teams"],
    achievements: [
      "Led statutory audits for {n} listed and unlisted clients",
      "Identified {n} in tax savings through a restructuring review",
      "Managed an engagement team of {n} across concurrent audits",
      "Delivered a due diligence on a {n} transaction",
      "Cleared all three levels of the CA examination in {n}",
    ],
    summary: "{title} with {years} in audit, tax and advisory.",
  },
  {
    id: "marketer",
    label: "Marketing",
    presetId: "marketer",
    titles: ["Marketing Executive", "Marketing Manager", "Growth Marketer", "Head of Marketing", "CMO"],
    skillGroups: [
      { label: "Channels", options: ["SEO", "Paid search", "Paid social", "Email marketing", "Content marketing", "Lifecycle marketing", "Affiliate", "Events", "PR", "Influencer"] },
      { label: "Tools", options: ["Google Analytics", "Google Ads", "Meta Ads", "HubSpot", "Marketo", "Klaviyo", "Mailchimp", "Salesforce", "Segment", "Ahrefs", "Semrush", "Looker"] },
      { label: "Practice", options: ["Positioning", "Campaign planning", "Copywriting", "Conversion optimisation", "Marketing analytics", "Budget ownership", "Brand strategy"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Grew organic traffic {n} in twelve months",
      "Cut cost per acquisition from {n}",
      "Ran a {n} annual media budget across paid channels",
      "Launched {n} campaigns that beat pipeline targets",
      "Lifted email revenue {n} through lifecycle automation",
    ],
    summary: "{title} with {years} running acquisition and brand across channels.",
  },
  {
    id: "datascientist",
    label: "Data & Analytics",
    presetId: "datascientist",
    titles: ["Data Analyst", "Data Scientist", "Senior Data Scientist", "ML Engineer", "Head of Data"],
    skillGroups: [
      { label: "Languages", options: ["Python", "R", "SQL", "Scala", "Julia"] },
      { label: "Libraries", options: ["pandas", "NumPy", "scikit-learn", "PyTorch", "TensorFlow", "XGBoost", "spaCy", "Hugging Face", "dbt", "Spark"] },
      { label: "Platforms", options: ["Snowflake", "BigQuery", "Databricks", "Redshift", "Airflow", "Tableau", "Power BI", "Looker", "MLflow", "AWS SageMaker"] },
      { label: "Methods", options: ["A/B testing", "Causal inference", "Forecasting", "NLP", "Computer vision", "Recommender systems", "Feature engineering", "Model monitoring"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Built a model that improved {n} over the previous baseline",
      "Cut reporting turnaround from {n} by rebuilding the data pipeline",
      "Ran {n} experiments that changed product direction",
      "Reduced churn {n} with an early-warning model",
      "Owned a warehouse serving {n} internal users",
    ],
    summary: "{title} with {years} turning messy data into decisions people act on.",
  },
  {
    id: "pm",
    label: "Product Management",
    presetId: "pm",
    titles: ["Associate Product Manager", "Product Manager", "Senior Product Manager", "Group Product Manager", "Director of Product"],
    skillGroups: [
      { label: "Craft", options: ["Discovery", "Roadmapping", "Prioritisation", "User research", "Pricing", "Go-to-market", "Experimentation", "Technical writing", "Stakeholder alignment"] },
      { label: "Tools", options: ["Jira", "Linear", "Figma", "Amplitude", "Mixpanel", "Looker", "Notion", "Productboard", "SQL"] },
      { label: "Domains", options: ["B2B SaaS", "Marketplace", "Fintech", "Healthcare", "E-commerce", "Developer tools", "Mobile", "Platform / API"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Took {n} from discovery to general availability",
      "Grew activation {n} through onboarding changes",
      "Ran a roadmap for {n} engineers across two squads",
      "Cut support volume {n} by fixing the underlying workflow",
      "Repriced the product, lifting ARPU {n}",
    ],
    summary: "{title} with {years} shipping products people keep using.",
  },
  {
    id: "doctor",
    label: "Healthcare & Medicine",
    presetId: "doctor",
    titles: ["Resident", "Medical Officer", "Specialist Registrar", "Consultant", "Head of Department"],
    skillGroups: [
      { label: "Clinical", options: ["Patient assessment", "Emergency care", "Critical care", "Surgical assistance", "Diagnostics", "Care planning", "Infection control", "Palliative care", "Paediatrics", "Chronic disease management"] },
      { label: "Systems", options: ["Epic", "Cerner", "Meditech", "NHS systems", "Electronic prescribing", "PACS", "Clinical audit", "Telemedicine"] },
      { label: "Professional", options: ["Teaching and supervision", "Clinical governance", "Research", "Guideline development", "Multidisciplinary teamwork", "Safeguarding"] },
    ],
    strengths: [...COMMON_STRENGTHS, "Calm in emergencies", "Patient communication"],
    achievements: [
      "Managed a caseload of {n} patients",
      "Led a clinical audit that changed {n}",
      "Supervised {n} junior doctors and medical students",
      "Reduced average length of stay by {n} on the ward",
      "Presented {n} at national conference",
    ],
    summary: "{title} with {years} of clinical practice.",
  },
  {
    id: "teacher",
    label: "Teaching & Training",
    presetId: "teacher",
    titles: ["Teaching Assistant", "Teacher", "Senior Teacher", "Head of Department", "Learning Designer"],
    skillGroups: [
      { label: "Practice", options: ["Curriculum design", "Lesson planning", "Differentiated instruction", "Assessment design", "Classroom management", "Pastoral care", "Special educational needs", "Parent engagement"] },
      { label: "Subjects", options: ["Mathematics", "Science", "English", "Computing", "History", "Economics", "Languages", "Art", "Physical education"] },
      { label: "Tools", options: ["Google Classroom", "Microsoft Teams", "Moodle", "Canvas", "Seesaw", "Kahoot", "Articulate 360"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Raised average attainment by {n} across the cohort",
      "Designed a curriculum now taught to {n} students",
      "Mentored {n} early-career teachers",
      "Ran an intervention that improved attendance {n}",
    ],
    summary: "{title} with {years} in the classroom.",
  },
  {
    id: "sales",
    label: "Sales & Business Development",
    presetId: "sales",
    titles: ["Sales Development Rep", "Account Executive", "Senior Account Executive", "Sales Manager", "VP Sales"],
    skillGroups: [
      { label: "Motion", options: ["Outbound prospecting", "Inbound qualification", "Enterprise sales", "SMB / mid-market", "Channel & partnerships", "Renewals", "Upsell & cross-sell", "Contract negotiation"] },
      { label: "Method", options: ["MEDDIC", "Challenger", "SPIN", "Solution selling", "Value selling", "Account planning", "Forecasting"] },
      { label: "Tools", options: ["Salesforce", "HubSpot", "Outreach", "Salesloft", "Gong", "ZoomInfo", "LinkedIn Sales Navigator", "Apollo"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Closed {n} in new annual recurring revenue",
      "Hit {n} of quota across consecutive years",
      "Grew the territory pipeline {n}",
      "Landed {n} as a first-in-industry logo",
      "Shortened the average sales cycle by {n}",
    ],
    summary: "{title} with {years} carrying and beating a number.",
  },
  {
    id: "student",
    label: "Student / Early career",
    presetId: "student",
    titles: ["Undergraduate Student", "Postgraduate Student", "Intern", "Graduate Trainee"],
    skillGroups: [
      { label: "Technical", options: ["Python", "Java", "C++", "JavaScript", "SQL", "Excel", "MATLAB", "Git", "Figma", "AutoCAD"] },
      { label: "Coursework", options: ["Data structures", "Algorithms", "Statistics", "Machine learning", "Databases", "Operating systems", "Economics", "Accounting", "Marketing"] },
      { label: "Activities", options: ["Hackathons", "Student society leadership", "Research assistant", "Peer tutoring", "Volunteering", "Sports team", "Debate", "Open-source contributions"] },
    ],
    strengths: ["Fast learner", "Curiosity", "Teamwork", "Time management", "Written communication", "Initiative"],
    achievements: [
      "Graduated with {n}",
      "Built {n} as a personal project",
      "Placed {n} in an inter-college competition",
      "Completed a {n} internship",
    ],
    summary: "{title} looking for a first role, building things in the meantime.",
  },
  {
    id: "other",
    label: "Something else",
    presetId: "consultant",
    titles: ["Specialist", "Coordinator", "Manager", "Senior Manager", "Director"],
    skillGroups: [
      { label: "Core", options: ["Project management", "Budget ownership", "Reporting", "Vendor management", "Process design", "Training", "Quality assurance", "Compliance", "Customer service"] },
      { label: "Tools", options: ["Microsoft Excel", "Microsoft Project", "Asana", "Trello", "Jira", "Notion", "Salesforce", "SAP", "Power BI", "Tableau"] },
    ],
    strengths: COMMON_STRENGTHS,
    achievements: [
      "Delivered {n} ahead of schedule",
      "Saved {n} through a process redesign",
      "Managed a team of {n}",
      "Improved customer satisfaction {n}",
    ],
    summary: "{title} with {years} of experience.",
  },
];

export const ROLES_BY_ID = new Map(ROLES.map((r) => [r.id, r]));

export function getRole(id: string): RoleKnowledge {
  return ROLES_BY_ID.get(id) ?? ROLES[ROLES.length - 1];
}

export const EXPERIENCE_BANDS = [
  { value: "0", label: "Just starting", years: "" },
  { value: "1", label: "1–2 years", years: "a couple of years" },
  { value: "3", label: "3–5 years", years: "over three years" },
  { value: "6", label: "6–9 years", years: "more than six years" },
  { value: "10", label: "10+ years", years: "over a decade" },
];

/** Build the summary sentence from the answers collected so far. */
export function buildSummary(
  role: RoleKnowledge,
  answers: { title: string; band: string; skills: string[]; strengths: string[] },
): string {
  const band = EXPERIENCE_BANDS.find((b) => b.value === answers.band);
  const opening = role.summary
    .replace("{title}", answers.title || role.titles[1] || role.label)
    .replace("{years}", band?.years || "experience");

  const sentences = [opening.replace(/\s+with\s+experience\b/, "")];
  if (answers.skills.length > 0) {
    sentences.push(`Day to day I work with ${listPhrase(answers.skills.slice(0, 5))}.`);
  }
  if (answers.strengths.length > 0) {
    sentences.push(`Colleagues tend to mention ${listPhrase(answers.strengths.slice(0, 2)).toLowerCase()}.`);
  }
  return sentences.join(" ");
}

function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
