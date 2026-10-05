/**
 * The About page: opens from the deck's About page (“More about me”), at /#about/story.
 * Same content as chaewon.works/about, in this site's style. The words are Chaewon's own
 * (`about` in content/site.ts); this file adds the page's structure, the photos, and one line
 * per principle saying where it shows up in the work (each one links to that project).
 */
import { about } from "../site";

export const aboutPage = {
  id: "about" as const,
  toc: [
    { id: "ab-intro", label: "Intro" },
    { id: "ab-art", label: "Art" },
    { id: "ab-principles", label: "Principles" },
    { id: "ab-off", label: "Off the clock" },
    { id: "ab-hi", label: "Say hi" },
  ],

  intro: {
    label: "Intro",
    title: "안녕! I’m Chaewon",
    badges: [
      { icon: "pin", text: "Pittsburgh" },
      { icon: "cap", text: "MDes, Carnegie Mellon" },
    ],
    text: about.intro,
    motto: about.motto,
    photos: [
      { src: "/about/portrait.webp", alt: "Chaewon on a street in Tokyo at night", cap: "me, in Tokyo", w: 900, h: 1200 },
      { src: "/about/daejeon.webp", alt: "Daejeon Expo Bridge on a clear day", cap: "home, Daejeon", w: 649, h: 900 },
      { src: "/about/student-id.webp", alt: "Chaewon's Carnegie Mellon student ID", cap: "cmu, go tartans!", w: 900, h: 674 },
    ],
    good: { label: "What I’m good at", items: about.strengths },
    pulls: { label: "What pulls me in", items: about.interests },
    touch: { lead: "Want the longer story?", cta: "Get in touch" },
  },

  art: {
    label: "Art",
    title: "Before interfaces, I was an interactive artist",
    note: "My pieces were only complete once people took part. Six exhibitions in Seoul and New York taught me to shape space, pace, and attention. Now I do it in interfaces.",
    shows: about.exhibitions,
    /** Mycelia later became Wish Tree, which is on this site */
    grewInto: { title: "Mycelia", page: "wish" as const, text: "Grew into Wish Tree" },
    photos: [
      { src: "/about/show-indigo.webp", alt: "Indigo gradient wall pieces" },
      { src: "/about/show-sculptures.webp", alt: "Two blue ceramic sculptures on a plinth" },
      { src: "/about/show-fabric.webp", alt: "Suspended fabric installation" },
      { src: "/about/show-domes.webp", alt: "White dome sculptures along a window" },
    ],
  },

  principles: {
    label: "Principles",
    title: "Words I design by",
    items: [
      {
        ...about.philosophy[0],
        where: { project: "Melon", to: { case: "melon" as const }, text: "Each school email becomes a short summary, with a link back to the original." },
      },
      {
        ...about.philosophy[1],
        where: { project: "Tipping", to: { case: "tipping" as const }, text: "“View reason” moved right beside the final tip, with the service details behind it." },
      },
      {
        ...about.philosophy[2],
        where: { project: "Pebbo", to: { case: "pebbo" as const }, text: "Every suggestion is optional. What to do stays the person’s call." },
      },
      {
        ...about.philosophy[3],
        where: { project: "Interaction Lab", to: { page: "lab" as const }, text: "Everything in the Lab follows this rule. One toy, one job." },
      },
    ],
  },

  off: {
    label: "Off the clock",
    title: "When I’m not designing",
    items: [
      { src: "/fun/bake-pancakes.webp", alt: "A stack of pancakes with berries and banana", cap: "hardcore baker", note: "Michelin-starred kitchen alum", link: { page: "bakery" as const, text: "Bakery Log" } },
      { src: "/about/cats.webp", alt: "Chaewon holding two cats next to a Christmas tree", cap: "proud foster mom", note: "14 cats and 1 dog" },
      { src: "/about/mets.webp", alt: "At a Mets game, holding up a Let's Go Mets sign", cap: "mets fan", note: "yes I’m still rooting..." },
    ],
  },

  hi: {
    label: "Say hi",
    note: "/about/end-note.webp",
    alt: "Handwritten note: You scrolled all the way to the end! We should grab tea and talk about half-formed ideas or what we could build together. Find me at chaewon2@andrew.cmu.edu",
  },

  /** The footer: the About page hands off to the work */
  next: { id: "tipping" as const, label: "Start with the work", title: "Rethinking Tipping", line: "Tipping, rethought for checkouts with AI in the loop." },
};
