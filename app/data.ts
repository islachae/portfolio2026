// ── Shared portfolio data ────────────────────────────────────────────
// Single source of truth for work/side projects and skills, used by
// both the home page and the /about page.
//
// Card copy follows vivianzhao.ca's format: a short, lowercase, punchy
// project line (not a full paragraph) + a small tag underneath, with a
// project-type badge ("case study", "ux/ui design", etc.) top-right.

export interface WorkProject {
  title: string;
  tag: string;
  type: string;
  org: string;
  year: string;
  readTime: string;
  comingSoon?: string;
  tools: string[];
  link: string;
  image: string;
}

export const workProjects: WorkProject[] = [
  {
    title: "rethinking tipping for the age of ai",
    tag: "UX research · Design strategy · UXUI Design",
    type: "Payment UX",
    org: "Independent Concept Proposal",
    year: "Jun 2025",
    readTime: "6 min",
    tools: ["UX Research", "Design Strategy", "Interaction Design", "Agentic AI", "Figma"],
    link: "/case-studies/tipping",
    image: "/placeholder-1.png",
  },
  {
    title: "pebbo — a companion that listens when eating feels heavy",
    tag: "UX research · Design strategy · UX/UI design",
    type: "AI Companion",
    org: "Individual Project",
    year: "Oct 2024",
    readTime: "4 min",
    tools: ["UX Research", "Design Strategy", "UX/UI Design", "3D Modeling", "Affective Computing"],
    link: "/case-studies/pebbo",
    image: "/placeholder-1.png",
  },
  {
    title: "zipflow — one listing, every workflow",
    tag: "UX/UI design · Design strategy · AI prototyping",
    type: "B2B SaaS",
    org: "Independent Project",
    year: "Sep 2026",
    readTime: "5 min",
    tools: ["UX/UI Design", "Design Strategy", "AI Prototyping", "Figma"],
    link: "/case-studies/zipflow",
    image: "/placeholder-1.png",
  },
  {
    title: "Aye, Scotty! - school communication tailored to what matters to you",
    tag: "UX Research · Service Design · AI Interaction",
    type: "Communication UX",
    org: "Carnegie Mellon University",
    year: "Oct 2026",
    readTime: "7 min",
    comingSoon: "Oct 07 2026",
    tools: ["UX Research", "Service Design", "AI Interaction", "Figma"],
    link: "/case-studies/scotty",
    image: "/case-studies/scotty-thumb.png",
  },
];

export const skills = [
  "Figma",
  "Python",
  "Data Visualization",
  "Photoshop",
  "Illustrator",
  "Premiere Pro",
  "Canva",
  "Wix",
  "Squarespace",
  "Design Systems",
  "User Research",
  "Affinity Diagramming",
  "Prototyping",
  "AI Prototyping",
  "Cross-functional Collaboration",
  "Design Leadership",
  "English",
  "Korean",
  "Spanish",
];
