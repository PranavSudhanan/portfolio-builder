import {

  ArrowRight,
  ArrowUpRight,
  Award,
  Backpack,
  BadgeCheck,
  Blocks,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Camera,
  ChartSpline,
  Check,
  ChefHat,
  Code2,
  Codepen,
  Compass,
  Database,
  Download,
  Dribbble,
  ExternalLink,
  Facebook,
  Figma,
  FilePlus2,
  FolderGit2,
  GitBranch,
  Github,
  Gitlab,
  Globe,
  GraduationCap,
  Hammer,
  HandHeart,
  HardHat,
  Heart,
  HeartPulse,
  Images,
  Instagram,
  Kanban,
  Languages,
  LayoutGrid,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  MessageCircleQuestion,
  Moon,
  Music,
  Palette,
  PenLine,
  Phone,
  Plus,
  Presentation,
  Quote,
  Rocket,
  Ruler,
  Scale,
  ScrollText,
  Server,
  Slack,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Tags,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Truck,
  Twitch,
  Twitter,
  User,
  Users,
  Wrench,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon registry.
 *
 * Icons are imported by name rather than dynamically so the bundler can drop
 * the ones nobody uses. These components are hook-free, which matters because
 * the renderer also runs through `renderToStaticMarkup` for the HTML export.
 */
export const ICONS: Record<string, LucideIcon> = {

  ArrowRight,
  ArrowUpRight,
  Award,
  Backpack,
  BadgeCheck,
  Blocks,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Camera,
  ChartSpline,
  Check,
  ChefHat,
  Code2,
  Codepen,
  Compass,
  Database,
  Download,
  Dribbble,
  ExternalLink,
  Facebook,
  Figma,
  FilePlus2,
  FolderGit2,
  GitBranch,
  Github,
  Gitlab,
  Globe,
  GraduationCap,
  Hammer,
  HandHeart,
  HardHat,
  Heart,
  HeartPulse,
  Images,
  Instagram,
  Kanban,
  Languages,
  LayoutGrid,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  MessageCircleQuestion,
  Moon,
  Music,
  Palette,
  PenLine,
  Phone,
  Plus,
  Presentation,
  Quote,
  Rocket,
  Ruler,
  Scale,
  ScrollText,
  Server,
  Slack,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Tags,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Truck,
  Twitch,
  Twitter,
  User,
  Users,
  Wrench,
  Youtube,
  Zap,
};

/** Names offered in the icon picker, grouped so the list stays scannable. */
export const ICON_PICKER_GROUPS: { label: string; names: string[] }[] = [
  {
    label: "General",
    names: ["Sparkles", "Star", "Heart", "Zap", "Target", "Check", "Plus", "Award", "Trophy"],
  },
  {
    label: "Work",
    names: ["Briefcase", "Building2", "Kanban", "Rocket", "Hammer", "Compass", "Presentation", "HandHeart"],
  },
  {
    label: "Tech",
    names: ["Code2", "Terminal", "Database", "Server", "GitBranch", "Smartphone", "LayoutGrid", "Blocks"],
  },
  {
    label: "Craft",
    names: ["Palette", "Camera", "Music", "PenLine", "Ruler", "ChefHat", "Images", "Figma"],
  },
  {
    label: "Study",
    names: ["GraduationCap", "BookOpen", "BadgeCheck", "Backpack", "Languages", "ChartSpline", "Scale", "Stethoscope"],
  },
  {
    label: "Contact",
    names: ["Mail", "Phone", "MapPin", "Globe", "Link2", "Calendar", "Download", "ExternalLink"],
  },
];

/** Render an icon by registry name. Unknown names render nothing. */
export function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 2,
}: {
  name?: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  if (!name) return null;
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

/* ───────────────────────── Social platforms ───────────────────────── */

export interface SocialPlatform {
  key: string;
  label: string;
  icon: string;
  /** Prefix offered as a hint in the URL field. */
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "github", label: "GitHub", icon: "Github", placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", icon: "Linkedin", placeholder: "https://linkedin.com/in/username" },
  { key: "x", label: "X", icon: "Twitter", placeholder: "https://x.com/username" },
  { key: "instagram", label: "Instagram", icon: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "facebook", label: "Facebook", icon: "Facebook", placeholder: "https://facebook.com/username" },
  { key: "youtube", label: "YouTube", icon: "Youtube", placeholder: "https://youtube.com/@username" },
  { key: "dribbble", label: "Dribbble", icon: "Dribbble", placeholder: "https://dribbble.com/username" },
  { key: "figma", label: "Figma", icon: "Figma", placeholder: "https://figma.com/@username" },
  { key: "gitlab", label: "GitLab", icon: "Gitlab", placeholder: "https://gitlab.com/username" },
  { key: "codepen", label: "CodePen", icon: "Codepen", placeholder: "https://codepen.io/username" },
  { key: "twitch", label: "Twitch", icon: "Twitch", placeholder: "https://twitch.tv/username" },
  { key: "slack", label: "Slack", icon: "Slack", placeholder: "https://yourteam.slack.com" },
  { key: "email", label: "Email", icon: "Mail", placeholder: "mailto:you@example.com" },
  { key: "website", label: "Website", icon: "Globe", placeholder: "https://example.com" },
  { key: "phone", label: "Phone", icon: "Phone", placeholder: "tel:+910000000000" },
  { key: "other", label: "Other", icon: "Link2", placeholder: "https://" },
];

export const SOCIAL_BY_KEY = new Map(SOCIAL_PLATFORMS.map((p) => [p.key, p]));

/** Icon for a social link, falling back to a generic link glyph. */
export function SocialIcon({ platform, size = 17 }: { platform?: string; size?: number }) {
  const found = platform ? SOCIAL_BY_KEY.get(platform) : undefined;
  return <Icon name={found?.icon ?? "Link2"} size={size} />;
}
