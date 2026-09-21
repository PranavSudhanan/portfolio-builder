import type { Item, Section, SectionDefinition, SectionType } from "./types";
import { sampleFor } from "./samples";
import { slugify, uid, uniqueSlug } from "./utils";

/** Build an item without repeating the id boilerplate at every call site. */
function item(data: Omit<Item, "id">): Item {
  return { id: uid("it"), ...data };
}

/**
 * The section registry.
 *
 * Each entry declares everything the builder needs to edit a section type and
 * everything the renderer needs to draw it: the layout variants on offer, which
 * item fields are meaningful, and a sample factory used when the section is
 * added so the canvas is never empty.
 */
export const SECTION_DEFS: SectionDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    description: "The opening statement — name, headline and primary call to action.",
    icon: "Sparkles",
    group: "core",
    singleton: true,
    itemLabel: "Action",
    itemFields: ["title", "url", "icon"],
    hasBody: false,
    hasColumns: false,
    variants: [
      { value: "centered", label: "Centered" },
      { value: "split", label: "Split with photo" },
      { value: "minimal", label: "Minimal" },
      { value: "fullscreen", label: "Full screen" },
      { value: "card", label: "Profile card" },
      { value: "cover", label: "Cover image" },
    ],
    options: [
      { key: "showAvatar", label: "Show avatar", type: "toggle" },
      { key: "showAvailability", label: "Show availability badge", type: "toggle" },
      { key: "showSocials", label: "Show social links", type: "toggle" },
      { key: "showScrollHint", label: "Show scroll hint", type: "toggle" },
      {
        key: "typewriter",
        label: "Animate the headline",
        type: "toggle",
        help: "Types the headline out on load.",
      },
    ],
    sample: () => ({
      type: "hero",
      title: "Home",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "split",
      options: {
        showAvatar: true,
        showAvailability: true,
        showSocials: true,
        showScrollHint: true,
        typewriter: false,
      },
      items: [
        item({ title: "Get in touch", url: "#contact", icon: "Mail" }),
        item({ title: "View work", url: "#projects", icon: "ArrowRight" }),
      ],
    }),
  },

  {
    type: "about",
    label: "About",
    description: "Your story in prose, with optional highlights alongside.",
    icon: "User",
    group: "core",
    itemLabel: "Highlight",
    itemFields: ["title", "description", "icon"],
    hasBody: true,
    hasColumns: true,
    variants: [
      { value: "prose", label: "Plain prose" },
      { value: "split", label: "Text + highlights" },
      { value: "withImage", label: "Text + image" },
      { value: "cards", label: "Highlight cards" },
      { value: "quote", label: "Pull quote" },
    ],
    options: [
      { key: "dropCap", label: "Drop cap on first letter", type: "toggle" },
      { key: "showResume", label: "Show résumé button", type: "toggle" },
    ],
    sample: () => ({
      type: "about",
      title: "About",
      eyebrow: "Who I am",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "split",
      columns: 2,
      body:
        "I am a multidisciplinary professional who cares about craft, clarity and shipping work that holds up. " +
        "Over the last several years I have worked across teams and time zones, translating messy problems into " +
        "things people actually want to use.\n\n" +
        "Outside of work you will find me reading, running, and collecting far too many half-finished side projects.",
      options: { dropCap: false, showResume: true },
      items: [
        item({ title: "Based in", description: "Bengaluru, India", icon: "MapPin" }),
        item({ title: "Focus", description: "Product engineering & design systems", icon: "Target" }),
        item({ title: "Experience", description: "6+ years across startups and enterprise", icon: "Briefcase" }),
        item({ title: "Currently", description: "Open to freelance and full-time roles", icon: "Zap" }),
      ],
    }),
  },

  {
    type: "experience",
    label: "Experience",
    description: "Roles, companies and what you achieved in each.",
    icon: "Briefcase",
    group: "career",
    itemLabel: "Role",
    itemFields: ["title", "subtitle", "period", "location", "description", "bullets", "tags", "url", "image"],
    hasBody: false,
    hasColumns: false,
    variants: [
      { value: "timeline", label: "Timeline" },
      { value: "list", label: "Simple list" },
      { value: "cards", label: "Cards" },
      { value: "compact", label: "Compact résumé" },
      { value: "alternating", label: "Alternating sides" },
    ],
    options: [
      { key: "showLogos", label: "Show company logos", type: "toggle" },
      { key: "showBullets", label: "Show achievement bullets", type: "toggle" },
    ],
    sample: () => ({
      type: "experience",
      title: "Experience",
      eyebrow: "Where I have worked",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "timeline",
      options: { showLogos: true, showBullets: true },
      items: [
        item({
          title: "Senior Product Engineer",
          subtitle: "Northwind Labs",
          period: "2023 — Present",
          location: "Remote",
          description: "Lead engineer on the customer-facing platform used by 40,000 businesses.",
          bullets: [
            "Cut median page load from 3.1s to 0.8s by rebuilding the rendering pipeline",
            "Designed the component library now used by four product teams",
            "Mentored three engineers from junior to mid level",
          ],
          tags: ["TypeScript", "React", "PostgreSQL"],
        }),
        item({
          title: "Product Engineer",
          subtitle: "Cobalt Systems",
          period: "2020 — 2023",
          location: "Bengaluru, India",
          description: "Built and shipped the analytics suite from first commit to general availability.",
          bullets: [
            "Shipped the reporting engine that became the top-requested feature",
            "Owned the migration from a monolith to service boundaries",
          ],
          tags: ["Python", "FastAPI", "AWS"],
        }),
        item({
          title: "Junior Developer",
          subtitle: "Bright Fox Studio",
          period: "2018 — 2020",
          location: "Pune, India",
          description: "Client work across web apps, internal tools and marketing sites.",
          bullets: ["Delivered 20+ client projects on time and on budget"],
          tags: ["JavaScript", "Django"],
        }),
      ],
    }),
  },

  {
    type: "education",
    label: "Education",
    description: "Degrees, schools and academic achievements.",
    icon: "GraduationCap",
    group: "career",
    itemLabel: "Qualification",
    itemFields: ["title", "subtitle", "period", "location", "description", "tags", "url", "image"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "timeline", label: "Timeline" },
      { value: "list", label: "Simple list" },
      { value: "cards", label: "Cards" },
      { value: "compact", label: "Compact" },
    ],
    options: [{ key: "showLogos", label: "Show institution logos", type: "toggle" }],
    sample: () => ({
      type: "education",
      title: "Education",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "list",
      columns: 2,
      options: { showLogos: false },
      items: [
        item({
          title: "M.Sc. Computer Science",
          subtitle: "University of Edinburgh",
          period: "2016 — 2018",
          description: "Distinction. Thesis on distributed consensus under partial failure.",
        }),
        item({
          title: "B.Tech. Information Technology",
          subtitle: "VIT University",
          period: "2012 — 2016",
          description: "First class with honours. President of the computing society.",
        }),
      ],
    }),
  },

  {
    type: "projects",
    label: "Projects",
    description: "Selected work with images, tags and links.",
    icon: "FolderGit2",
    group: "work",
    itemLabel: "Project",
    itemFields: ["title", "subtitle", "description", "image", "tags", "url", "urlLabel", "period", "featured"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "grid", label: "Image grid" },
      { value: "list", label: "Detailed list" },
      { value: "showcase", label: "Large showcase" },
      { value: "minimal", label: "Text only" },
      { value: "carousel", label: "Horizontal scroll" },
    ],
    options: [
      { key: "showTags", label: "Show tags", type: "toggle" },
      { key: "showImages", label: "Show images", type: "toggle" },
      { key: "hoverZoom", label: "Zoom image on hover", type: "toggle" },
    ],
    sample: () => ({
      type: "projects",
      title: "Projects",
      eyebrow: "Selected work",
      subtitle: "A few things I have built that I am happy to talk about.",
      enabled: true,
      inNav: true,
      variant: "grid",
      columns: 2,
      options: { showTags: true, showImages: true, hoverZoom: true },
      items: [
        item({
          title: "Atlas",
          subtitle: "Open-source analytics",
          description:
            "A self-hosted product analytics tool with a query builder that non-engineers can actually use. 2.4k stars.",
          tags: ["TypeScript", "ClickHouse", "Next.js"],
          url: "https://example.com/atlas",
          urlLabel: "View project",
          featured: true,
        }),
        item({
          title: "Fieldnote",
          subtitle: "Mobile research app",
          description:
            "Offline-first note taking for field researchers, syncing to a shared workspace when signal returns.",
          tags: ["React Native", "SQLite"],
          url: "https://example.com/fieldnote",
          urlLabel: "Case study",
        }),
        item({
          title: "Tempo",
          subtitle: "Scheduling engine",
          description:
            "Constraint solver that builds shift rotas for hospitals while respecting rest rules and preferences.",
          tags: ["Python", "OR-Tools"],
          url: "https://example.com/tempo",
          urlLabel: "Read more",
        }),
        item({
          title: "Paperweight",
          subtitle: "Reading companion",
          description: "A browser extension that turns long articles into a paced, distraction-free reading session.",
          tags: ["JavaScript", "Chrome API"],
          url: "https://example.com/paperweight",
          urlLabel: "Try it",
        }),
      ],
    }),
  },

  {
    type: "skills",
    label: "Skills",
    description: "What you are good at, grouped or rated.",
    icon: "Wrench",
    group: "work",
    itemLabel: "Skill",
    itemFields: ["title", "subtitle", "level", "icon", "tags"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "tags", label: "Tag cloud" },
      { value: "bars", label: "Progress bars" },
      { value: "grouped", label: "Grouped lists" },
      { value: "cards", label: "Cards" },
      { value: "rings", label: "Percentage rings" },
      { value: "marquee", label: "Scrolling marquee" },
    ],
    options: [
      { key: "showLevels", label: "Show proficiency levels", type: "toggle" },
      { key: "showIcons", label: "Show icons", type: "toggle" },
    ],
    sample: () => ({
      type: "skills",
      title: "Skills",
      eyebrow: "What I work with",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "grouped",
      columns: 3,
      options: { showLevels: true, showIcons: true },
      items: [
        item({
          title: "Languages",
          items: [
            item({ title: "TypeScript", level: 92 }),
            item({ title: "Python", level: 88 }),
            item({ title: "Go", level: 65 }),
            item({ title: "SQL", level: 85 }),
          ],
        }),
        item({
          title: "Frameworks",
          items: [
            item({ title: "React & Next.js", level: 94 }),
            item({ title: "FastAPI", level: 87 }),
            item({ title: "Django", level: 78 }),
          ],
        }),
        item({
          title: "Practice",
          items: [
            item({ title: "System design", level: 82 }),
            item({ title: "Design systems", level: 80 }),
            item({ title: "Team mentoring", level: 75 }),
          ],
        }),
      ],
    }),
  },

  {
    type: "services",
    label: "Services",
    description: "What you offer to clients, with optional pricing.",
    icon: "HandHeart",
    group: "commerce",
    itemLabel: "Service",
    itemFields: ["title", "description", "icon", "value", "bullets", "url", "urlLabel", "featured"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "cards", label: "Cards" },
      { value: "list", label: "Numbered list" },
      { value: "icons", label: "Icon grid" },
      { value: "detailed", label: "Detailed rows" },
    ],
    options: [
      { key: "showPrice", label: "Show price", type: "toggle" },
      { key: "showBullets", label: "Show included items", type: "toggle" },
    ],
    sample: () => ({
      type: "services",
      title: "Services",
      eyebrow: "How I can help",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "cards",
      columns: 3,
      options: { showPrice: true, showBullets: true },
      items: [
        item({
          title: "Consulting",
          description: "Short engagements to unblock a decision or review an architecture.",
          icon: "Compass",
          value: "From $200/hr",
          bullets: ["Architecture review", "Written recommendations", "Follow-up session"],
        }),
        item({
          title: "Build",
          description: "End-to-end delivery of a product or feature, from scoping to launch.",
          icon: "Hammer",
          value: "From $8,000",
          bullets: ["Discovery workshop", "Design and build", "30 days of support"],
          featured: true,
        }),
        item({
          title: "Training",
          description: "Hands-on workshops for your team, tailored to your stack.",
          icon: "Presentation",
          value: "From $2,500",
          bullets: ["Half or full day", "Custom curriculum", "Recorded for later"],
        }),
      ],
    }),
  },

  {
    type: "gallery",
    label: "Gallery",
    description: "A visual grid — photos, shots, artwork or screenshots.",
    icon: "Images",
    group: "work",
    itemLabel: "Image",
    itemFields: ["image", "title", "description", "url", "tags"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "masonry", label: "Masonry" },
      { value: "grid", label: "Even grid" },
      { value: "strip", label: "Horizontal strip" },
      { value: "fullbleed", label: "Full bleed stack" },
    ],
    options: [
      { key: "showCaptions", label: "Show captions", type: "toggle" },
      { key: "rounded", label: "Rounded corners", type: "toggle" },
      { key: "grayscale", label: "Greyscale until hover", type: "toggle" },
    ],
    sample: () => ({
      type: "gallery",
      title: "Gallery",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "masonry",
      columns: 3,
      options: { showCaptions: true, rounded: true, grayscale: false },
      items: [
        item({ title: "Morning harbour", description: "Lisbon, 2024" }),
        item({ title: "Studio light", description: "Editorial series" }),
        item({ title: "Long exposure", description: "Reykjavík, 2023" }),
        item({ title: "Portrait no. 12", description: "35mm film" }),
        item({ title: "Concrete forms", description: "Architecture study" }),
        item({ title: "Blue hour", description: "Tokyo, 2024" }),
      ],
    }),
  },

  {
    type: "testimonials",
    label: "Testimonials",
    description: "What clients and colleagues say about working with you.",
    icon: "Quote",
    group: "social",
    itemLabel: "Quote",
    itemFields: ["description", "title", "subtitle", "image", "url"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "cards", label: "Cards" },
      { value: "featured", label: "One at a time" },
      { value: "wall", label: "Masonry wall" },
      { value: "minimal", label: "Quiet quotes" },
    ],
    options: [
      { key: "showAvatars", label: "Show avatars", type: "toggle" },
      { key: "showQuoteMark", label: "Show quote marks", type: "toggle" },
    ],
    sample: () => ({
      type: "testimonials",
      title: "Testimonials",
      eyebrow: "Kind words",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "cards",
      columns: 2,
      options: { showAvatars: true, showQuoteMark: true },
      items: [
        item({
          description:
            "One of those rare people who improves everything they touch — the work, the process and the mood in the room.",
          title: "Priya Raman",
          subtitle: "Operations Director, Northwind",
        }),
        item({
          description:
            "Delivered in six weeks what our previous vendor could not finish in six months. I would hire again without hesitation.",
          title: "Daniel Okafor",
          subtitle: "Founder, Cobalt Systems",
        }),
      ],
    }),
  },

  {
    type: "publications",
    label: "Publications",
    description: "Papers, articles and citations.",
    icon: "BookOpen",
    group: "career",
    itemLabel: "Publication",
    itemFields: ["title", "subtitle", "period", "description", "url", "urlLabel", "tags"],
    hasBody: false,
    hasColumns: false,
    variants: [
      { value: "list", label: "Citation list" },
      { value: "cards", label: "Cards" },
      { value: "grouped", label: "Grouped by year" },
    ],
    options: [{ key: "numbered", label: "Number the entries", type: "toggle" }],
    sample: () => ({
      type: "publications",
      title: "Publications",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "list",
      options: { numbered: true },
      items: [
        item({
          title: "Consensus under partial network failure",
          subtitle: "Journal of Distributed Systems, Vol. 41",
          period: "2023",
          description: "A protocol that maintains availability during asymmetric partitions.",
          url: "https://example.com/paper",
          urlLabel: "DOI",
        }),
        item({
          title: "Teaching systems design to non-engineers",
          subtitle: "ACM SIGCSE Proceedings",
          period: "2021",
          description: "Results from a two-year curriculum experiment with 300 students.",
        }),
      ],
    }),
  },

  {
    type: "certifications",
    label: "Certifications",
    description: "Licences, credentials and completed courses.",
    icon: "BadgeCheck",
    group: "career",
    itemLabel: "Certification",
    itemFields: ["title", "subtitle", "period", "description", "url", "urlLabel", "image"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "cards", label: "Cards" },
      { value: "list", label: "Simple list" },
      { value: "badges", label: "Badges" },
    ],
    options: [{ key: "showIssuer", label: "Show issuing body", type: "toggle" }],
    sample: () => ({
      type: "certifications",
      title: "Certifications",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "cards",
      columns: 3,
      options: { showIssuer: true },
      items: [
        item({ title: "AWS Solutions Architect — Professional", subtitle: "Amazon Web Services", period: "2024" }),
        item({ title: "Certified Kubernetes Administrator", subtitle: "CNCF", period: "2023" }),
        item({ title: "Google UX Design Certificate", subtitle: "Google", period: "2022" }),
      ],
    }),
  },

  {
    type: "awards",
    label: "Awards",
    description: "Recognition, prizes and honours.",
    icon: "Trophy",
    group: "extra",
    itemLabel: "Award",
    itemFields: ["title", "subtitle", "period", "description", "icon", "url"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "list", label: "Simple list" },
      { value: "cards", label: "Cards" },
      { value: "timeline", label: "Timeline" },
    ],
    options: [{ key: "showIcons", label: "Show icons", type: "toggle" }],
    sample: () => ({
      type: "awards",
      title: "Awards",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "list",
      columns: 2,
      options: { showIcons: true },
      items: [
        item({ title: "Engineer of the Year", subtitle: "Northwind Labs", period: "2024", icon: "Trophy" }),
        item({ title: "Best Paper Award", subtitle: "SIGCSE", period: "2021", icon: "Award" }),
      ],
    }),
  },

  {
    type: "stats",
    label: "Stats",
    description: "Headline numbers that prove the point quickly.",
    icon: "TrendingUp",
    group: "extra",
    itemLabel: "Stat",
    itemFields: ["value", "title", "description", "icon"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "row", label: "Simple row" },
      { value: "cards", label: "Cards" },
      { value: "big", label: "Oversized numbers" },
      { value: "inline", label: "Inline band" },
    ],
    options: [
      { key: "countUp", label: "Count up on scroll", type: "toggle" },
      { key: "showDividers", label: "Show dividers", type: "toggle" },
    ],
    sample: () => ({
      type: "stats",
      title: "By the numbers",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: false,
      variant: "row",
      columns: 4,
      options: { countUp: true, showDividers: true },
      items: [
        item({ value: "6+", title: "Years experience" }),
        item({ value: "40", title: "Projects shipped" }),
        item({ value: "12", title: "Team members mentored" }),
        item({ value: "2.4k", title: "GitHub stars" }),
      ],
    }),
  },

  {
    type: "blog",
    label: "Writing",
    description: "Articles, essays and posts you want to surface.",
    icon: "PenLine",
    group: "work",
    itemLabel: "Post",
    itemFields: ["title", "description", "period", "image", "tags", "url", "urlLabel"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "list", label: "Reading list" },
      { value: "cards", label: "Cards" },
      { value: "minimal", label: "Titles only" },
    ],
    options: [
      { key: "showDates", label: "Show dates", type: "toggle" },
      { key: "showImages", label: "Show cover images", type: "toggle" },
    ],
    sample: () => ({
      type: "blog",
      title: "Writing",
      eyebrow: "",
      subtitle: "Occasional notes on building software and teams.",
      enabled: true,
      inNav: true,
      variant: "list",
      columns: 2,
      options: { showDates: true, showImages: false },
      items: [
        item({
          title: "The cost of a clever abstraction",
          description: "Why the second use case is the one that should shape your API.",
          period: "March 2025",
          url: "https://example.com/post-1",
        }),
        item({
          title: "Interviewing without a whiteboard",
          description: "A hiring loop that predicted on-the-job performance better than puzzles ever did.",
          period: "November 2024",
          url: "https://example.com/post-2",
        }),
      ],
    }),
  },

  {
    type: "pricing",
    label: "Pricing",
    description: "Packages and rates, laid out for comparison.",
    icon: "Tags",
    group: "commerce",
    itemLabel: "Plan",
    itemFields: ["title", "value", "description", "bullets", "url", "urlLabel", "featured"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "cards", label: "Plan cards" },
      { value: "table", label: "Comparison table" },
      { value: "simple", label: "Simple rows" },
    ],
    options: [
      { key: "highlightFeatured", label: "Highlight the featured plan", type: "toggle" },
      { key: "showCta", label: "Show call-to-action buttons", type: "toggle" },
    ],
    sample: () => ({
      type: "pricing",
      title: "Pricing",
      eyebrow: "",
      subtitle: "Simple, transparent, no surprises.",
      enabled: true,
      inNav: true,
      variant: "cards",
      columns: 3,
      options: { highlightFeatured: true, showCta: true },
      items: [
        item({
          title: "Starter",
          value: "$1,200",
          description: "For a single, well-defined piece of work.",
          bullets: ["One deliverable", "2-week turnaround", "Email support"],
          url: "#contact",
          urlLabel: "Enquire",
        }),
        item({
          title: "Standard",
          value: "$4,800",
          description: "The usual shape of a project engagement.",
          bullets: ["Up to 4 deliverables", "Weekly check-ins", "Priority support", "Two rounds of revision"],
          url: "#contact",
          urlLabel: "Enquire",
          featured: true,
        }),
        item({
          title: "Retainer",
          value: "$3,000/mo",
          description: "Ongoing capacity, reserved for you.",
          bullets: ["Rolling backlog", "Same-day replies", "Quarterly strategy review"],
          url: "#contact",
          urlLabel: "Enquire",
        }),
      ],
    }),
  },

  {
    type: "faq",
    label: "FAQ",
    description: "Answers to the questions you get asked every time.",
    icon: "MessageCircleQuestion",
    group: "extra",
    itemLabel: "Question",
    itemFields: ["title", "description"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "accordion", label: "Accordion" },
      { value: "list", label: "Open list" },
      { value: "twoColumn", label: "Two columns" },
    ],
    options: [{ key: "openFirst", label: "Open the first answer", type: "toggle" }],
    sample: () => ({
      type: "faq",
      title: "FAQ",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "accordion",
      columns: 1,
      options: { openFirst: true },
      items: [
        item({
          title: "What is your typical turnaround?",
          description: "Most projects run four to eight weeks. I will give you a firm date after the scoping call.",
        }),
        item({
          title: "Do you work with teams outside your timezone?",
          description:
            "Yes. I keep a four-hour overlap with your working day and everything else runs asynchronously.",
        }),
        item({
          title: "Can you pick up something someone else started?",
          description:
            "Often, yes. I start with a short audit so we both know what we are dealing with before committing.",
        }),
      ],
    }),
  },

  {
    type: "languages",
    label: "Languages",
    description: "Spoken languages and fluency.",
    icon: "Languages",
    group: "extra",
    itemLabel: "Language",
    itemFields: ["title", "subtitle", "level"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "bars", label: "Fluency bars" },
      { value: "list", label: "Simple list" },
      { value: "chips", label: "Chips" },
    ],
    options: [{ key: "showLevels", label: "Show fluency levels", type: "toggle" }],
    sample: () => ({
      type: "languages",
      title: "Languages",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: false,
      variant: "bars",
      columns: 2,
      options: { showLevels: true },
      items: [
        item({ title: "English", subtitle: "Native", level: 100 }),
        item({ title: "Hindi", subtitle: "Fluent", level: 90 }),
        item({ title: "Spanish", subtitle: "Conversational", level: 55 }),
      ],
    }),
  },

  {
    type: "clients",
    label: "Clients",
    description: "Logos or names of the people you have worked with.",
    icon: "Building2",
    group: "social",
    itemLabel: "Client",
    itemFields: ["title", "image", "url"],
    hasBody: false,
    hasColumns: true,
    variants: [
      { value: "logos", label: "Logo grid" },
      { value: "marquee", label: "Scrolling marquee" },
      { value: "names", label: "Names only" },
    ],
    options: [{ key: "grayscale", label: "Greyscale until hover", type: "toggle" }],
    sample: () => ({
      type: "clients",
      title: "Trusted by",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: false,
      variant: "names",
      columns: 5,
      options: { grayscale: true },
      items: [
        item({ title: "Northwind" }),
        item({ title: "Cobalt" }),
        item({ title: "Bright Fox" }),
        item({ title: "Meridian" }),
        item({ title: "Lumen" }),
      ],
    }),
  },

  {
    type: "contact",
    label: "Contact",
    description: "How to reach you, with an optional message form.",
    icon: "Mail",
    group: "core",
    singleton: true,
    itemLabel: "Contact method",
    itemFields: ["title", "description", "url", "icon"],
    hasBody: true,
    hasColumns: false,
    variants: [
      { value: "split", label: "Details + form" },
      { value: "centered", label: "Centred call to action" },
      { value: "cards", label: "Contact cards" },
      { value: "minimal", label: "Just an email" },
    ],
    options: [
      { key: "showForm", label: "Show message form", type: "toggle" },
      { key: "showSocials", label: "Show social links", type: "toggle" },
      {
        key: "formAction",
        label: "Form endpoint",
        type: "text",
        help: "A Formspree, Getform or Basin URL. Leave empty to open the visitor's email client instead.",
      },
    ],
    sample: () => ({
      type: "contact",
      title: "Contact",
      eyebrow: "Get in touch",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "split",
      body: "I read every message. Tell me what you are working on and I will get back to you within two working days.",
      options: { showForm: true, showSocials: true, formAction: "" },
      items: [],
    }),
  },

  {
    type: "cta",
    label: "Call to action",
    description: "A banner that pushes visitors toward one action.",
    icon: "Megaphone",
    group: "extra",
    itemLabel: "Button",
    itemFields: ["title", "url", "icon"],
    hasBody: true,
    hasColumns: false,
    variants: [
      { value: "banner", label: "Banner" },
      { value: "boxed", label: "Boxed card" },
      { value: "split", label: "Text left, buttons right" },
    ],
    options: [{ key: "useGradient", label: "Use the accent gradient", type: "toggle" }],
    sample: () => ({
      type: "cta",
      title: "Have a project in mind?",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: false,
      variant: "banner",
      body: "I take on a small number of engagements each quarter. If the timing is right, let us talk.",
      options: { useGradient: true },
      items: [item({ title: "Start a conversation", url: "#contact", icon: "ArrowRight" })],
    }),
  },

  {
    type: "custom",
    label: "Custom",
    description: "A free-form block for anything the other sections do not cover.",
    icon: "Blocks",
    group: "extra",
    itemLabel: "Block",
    itemFields: ["title", "description", "image", "url", "icon"],
    hasBody: true,
    hasColumns: true,
    variants: [
      { value: "prose", label: "Prose" },
      { value: "cards", label: "Cards" },
      { value: "list", label: "List" },
      { value: "embed", label: "Embedded iframe" },
    ],
    options: [
      {
        key: "embedUrl",
        label: "Embed URL",
        type: "text",
        help: "Used by the Embedded iframe variant — a YouTube, Figma, Maps or Calendly link.",
      },
      { key: "embedHeight", label: "Embed height (px)", type: "number", min: 200, max: 1200, step: 20 },
    ],
    sample: () => ({
      type: "custom",
      title: "Custom section",
      eyebrow: "",
      subtitle: "",
      enabled: true,
      inNav: true,
      variant: "prose",
      columns: 2,
      body: "Use this block for anything the built-in sections do not cover — a manifesto, a reading list, an embed.",
      options: { embedUrl: "", embedHeight: 420 },
      items: [],
    }),
  },
];

export const SECTION_DEFS_BY_TYPE = new Map(SECTION_DEFS.map((d) => [d.type, d]));

export function getSectionDef(type: SectionType): SectionDefinition {
  // Falls back to `custom` so an unknown type from an imported file still renders.
  return SECTION_DEFS_BY_TYPE.get(type) ?? SECTION_DEFS_BY_TYPE.get("custom")!;
}

export const SECTION_GROUPS: { id: SectionDefinition["group"]; label: string }[] = [
  { id: "core", label: "Essentials" },
  { id: "career", label: "Career" },
  { id: "work", label: "Work" },
  { id: "social", label: "Social proof" },
  { id: "commerce", label: "Commerce" },
  { id: "extra", label: "Extras" },
];

/** Build a ready-to-insert section, with an anchor unique among `existing`. */
/** Give an item and anything nested inside it a fresh id. */
function withIds(source: Omit<Item, "id">): Item {
  const next: Item = { ...source, id: uid("it") };
  if (source.items) next.items = source.items.map((child) => withIds(child));
  return next;
}

/**
 * Build a section, filled with sample content.
 *
 * `presetId` decides whose sample: an accountant should not be handed a
 * developer's job history. Sections a profession has nothing particular to say
 * about — FAQ, pricing — keep the generic copy.
 */
export function createSection(type: SectionType, existing: Section[] = [], presetId?: string): Section {
  const def = getSectionDef(type);
  const base = def.sample();

  const pack = presetId ? sampleFor(presetId, type) : null;
  if (pack) {
    if (pack.title !== undefined) base.title = pack.title;
    if (pack.eyebrow !== undefined) base.eyebrow = pack.eyebrow;
    if (pack.subtitle !== undefined) base.subtitle = pack.subtitle;
    if (pack.body !== undefined) base.body = pack.body;
    if (pack.items) base.items = pack.items.map(withIds);
  }
  const anchor = uniqueSlug(
    slugify(base.title || def.label),
    existing.map((s) => s.anchor),
  );
  return { ...base, id: uid("sec"), anchor };
}
