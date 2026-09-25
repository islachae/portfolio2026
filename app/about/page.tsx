import type { Metadata } from "next";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import ScrollParallax from "../components/scroll-parallax";
import ScrollFade from "../components/scroll-fade";

export const metadata: Metadata = {
  title: "About — Chaewon Lim",
  description:
    "Interactive artist turned product designer. Based across New York, Daejeon, and Seattle — designing with intention, craft, and a little hardcore energy.",
};

const values = [
  "less, but intentional",
  "craft builds trust",
  "design for agency",
  "prototype before overthinking",
];

const quotes = [
  {
    value: "less, but intentional",
    quote:
      "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    value: "craft builds trust",
    quote: "The details are not the details. They make the design.",
    author: "Charles Eames",
  },
  {
    value: "design for agency",
    quote: "People ignore design that ignores people.",
    author: "Frank Chimero",
  },
  {
    value: "prototype before overthinking",
    quote: "The best way to have a good idea is to have lots of ideas.",
    author: "Linus Pauling",
  },
];

const exhibitions = [
  { title: "Sungan; MOMENT", type: "Solo Exhibition", place: "Daejeon, South Korea · Temiorae", year: "2020" },
  { title: "Dreamscape/Escape", type: "Two-person Exhibition", place: "New York, NY · 80WSE gallery", year: "2023" },
  { title: "Myclia", type: "Group Exhibition", place: "New York, NY · Barney building", year: "2023" },
  { title: "Asian Students and Young Artists Art Festival", type: "Group Exhibition", place: "Seoul, South Korea · Chosun Press", year: "2021" },
  { title: "Young Korean Artists Exhibition", type: "Group Exhibition", place: "Seoul, South Korea · Seoul 284", year: "2020" },
  { title: "Her s", type: "Group Exhibition", place: "Daejeon, South Korea", year: "2021" },
];

function Img({
  src,
  alt,
  ratio = "aspect-[4/5]",
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${ratio} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

function Polaroid({
  src,
  alt,
  ratio = "aspect-[4/5]",
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Img src={src} alt={alt} ratio={ratio} className="rounded-xl" />
      <span
        aria-hidden="true"
        className="absolute -top-4 left-1/2 z-10 h-10 w-28 -translate-x-1/2 rotate-[-4deg] rounded-[3px] bg-[var(--periwinkle)]/25"
      />
    </div>
  );
}

function Thumb({ label }: { label: string }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-dashed border-[var(--border)] bg-neutral-100">
      <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] leading-snug text-neutral-400">
        {label}
      </span>
    </div>
  );
}

export default function About() {
  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[860px] px-6 pb-24 pt-16 sm:px-10">
        {/* ── Intro: portrait left, text + photos right ────────────── */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-[352px_1fr] lg:gap-8">
          {/* Left: photo cluster — Figma positions */}
          {/* Mobile: simple stack */}
          <div className="space-y-6 lg:hidden">
            <Img src="/about/portrait.jpg" alt="Chaewon in Tokyo" ratio="aspect-[3/4]" className="rounded-xl" />
            <Img src="/about/daejeon.jpg" alt="Daejeon Expo Bridge, South Korea" ratio="aspect-[4/5]" className="rounded-xl" />
            <Img src="/about/student-id.png" alt="CMU student ID" ratio="aspect-[4/3]" className="rounded-md border border-solid border-[var(--border)] shadow-sm" />
          </div>
          {/* Desktop: absolute Figma coords */}
          <div className="relative hidden h-[700px] lg:block">
            <div className="absolute left-0 top-0 w-[290px]">
              <ScrollParallax speed={48} className="lg:-rotate-2">
                <Img src="/about/portrait.jpg" alt="Chaewon in Tokyo" ratio="aspect-[3/4]" className="rounded-xl" />
              </ScrollParallax>
            </div>
            <div className="absolute left-[202px] top-[410px] w-[150px]">
              <ScrollParallax speed={28}>
                <Img src="/about/daejeon.jpg" alt="Daejeon Expo Bridge, South Korea" ratio="aspect-[4/5]" className="rounded-xl" />
                <p className="ml-[54px] mt-1.5 whitespace-nowrap text-xs text-[var(--muted)]">my home, Daejeon South Korea</p>
              </ScrollParallax>
            </div>
            <div className="absolute left-[62px] top-[554px] w-[162px]">
              <ScrollParallax speed={22}>
                <div className="-rotate-3">
                  <Img src="/about/student-id.png" alt="CMU student ID" ratio="aspect-[4/3]" className="rounded-md border border-solid border-[var(--border)] shadow-sm" />
                  <p className="mt-1.5 text-xs text-[var(--muted)]">cmu — go tartans!</p>
                </div>
              </ScrollParallax>
            </div>
          </div>

          {/* Right: heading + bio, then Daejeon + ID photos */}
          <div className="lg:pt-20">
            <ScrollFade>
              <h1 className="text-[28px] font-semibold leading-[1.5] tracking-[-0.02em]">
                안녕! I&apos;m Chaewon
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <img src="/icons/map-pin.svg" alt="" className="h-3.5 w-3.5" />
                  New York City
                </span>
                <span className="flex items-center gap-1.5">
                  <img src="/icons/academic-cap.svg" alt="" className="h-3.5 w-3.5" />
                  MDES, Carnegie Mellon University
                </span>
              </div>

              <p className="mt-8 max-w-[416px] text-[16px] font-normal leading-[22px] text-[var(--muted)]">
                Coming from a background in interactive art, I learned the hard
                way that an artifact truly shines when it creates flow, rather
                than demanding the center stage.
              </p>
              <p className="mt-[22px] max-w-[416px] text-[16px] font-normal leading-[22px] text-[var(--muted)]">
                I&apos;ve carried that into my design practice: looking closely
                at where people hesitate, disengage, or lose trust, and finding
                small ways to shift the rhythm. To me, good design feels
                intentional, crafted, and almost effortless.
              </p>

              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e8f5ec] px-4 py-1.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[var(--green)]"
                />
                <p className="text-sm leading-snug text-[var(--green)]">
                  Working on something cool? Get in{" "}
                  <a
                    href="mailto:chaewon2@andrew.cmu.edu"
                    className="font-bold transition-colors duration-200 hover:text-[var(--periwinkle)]"
                  >
                    touch!
                  </a>
                </p>
              </div>
            </ScrollFade>
          </div>
        </section>

        {/* ── Exhibitions (artist career) ────────────────────────────── */}
        <section className="mt-[120px]">
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Exhibitions
            </h2>
            <p className="mt-3 text-sm text-[var(--periwinkle)]">
              + where I&apos;ve shown work
            </p>

            <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
              {/* Left: list + paragraph */}
              <div>
                <ul className="border-t border-solid border-[var(--border)]">
                  {exhibitions.map((e) => (
                    <li
                      key={e.title}
                      className="flex flex-col gap-1 border-b border-solid border-[var(--border)] py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--fg)]">
                          {e.title}{" "}
                          <span className="font-normal text-[var(--muted)]">{e.type}</span>
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{e.place}</p>
                      </div>
                      <p className="shrink-0 text-sm text-[var(--muted)]">{e.year}</p>
                    </li>
                  ))}
                </ul>

                <p className="mt-10 leading-relaxed text-[var(--muted)]">
                  Throughout my artistic career, I&apos;ve always created participatory
                  work. I invite audiences in and give them more autonomy. The
                  artworks become complete only when people take part, deepening
                  their meaning through participation. Through these meditative
                  experiences, I&apos;ve aimed to bring people into the present moment —
                  away from work and the digital world, and into the here and now.
                </p>
              </div>

              {/* Right: artwork collage — Figma positions */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                <Img src="/about/exhibitions/fabric.jpg" alt="Suspended fabric installation artwork" ratio="aspect-[3/4]" className="rounded-xl shadow-sm" />
                <Img src="/about/exhibitions/indigo.jpg" alt="Indigo gradient wall artworks" ratio="aspect-[3/2]" className="rounded-xl shadow-sm" />
                <Img src="/about/exhibitions/gradient.jpg" alt="Cracked gradient artwork" ratio="aspect-[2/5]" className="rounded-xl shadow-sm" />
                <Img src="/about/exhibitions/sculptures.jpg" alt="Ceramic sculptures on a plinth" ratio="aspect-[4/3]" className="rounded-xl shadow-sm" />
              </div>
              <div className="relative hidden h-[620px] lg:block">
                <div className="absolute left-0 top-0 w-[245px]">
                  <ScrollParallax speed={36}>
                    <Img src="/about/exhibitions/indigo.jpg" alt="Indigo gradient wall artworks" ratio="aspect-[3/2]" className="rounded-xl shadow-sm" />
                  </ScrollParallax>
                </div>
                <div className="absolute left-[202px] top-[88px] w-[119px]">
                  <ScrollParallax speed={44}>
                    <Img src="/about/exhibitions/fabric.jpg" alt="Suspended fabric installation artwork" ratio="aspect-[3/4]" className="rounded-xl shadow-sm" />
                  </ScrollParallax>
                </div>
                <div className="absolute left-[59px] top-[224px] w-[112px]">
                  <ScrollParallax speed={28}>
                    <Img src="/about/exhibitions/gradient.jpg" alt="Cracked gradient artwork" ratio="aspect-[2/5]" className="rounded-xl shadow-sm" />
                  </ScrollParallax>
                </div>
                <div className="absolute left-[125px] top-[490px] w-[172px]">
                  <ScrollParallax speed={20}>
                    <Img src="/about/exhibitions/sculptures.jpg" alt="Ceramic sculptures on a plinth" ratio="aspect-[4/3]" className="rounded-xl shadow-sm" />
                  </ScrollParallax>
                </div>
              </div>
            </div>
        </section>

        {/* ── Design Philosophy ─────────────────────────────────────── */}
        <section className="mt-40">
          <ScrollFade>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              My Design Philosophy
            </h2>
            <p className="mt-3 text-sm text-[var(--periwinkle)]">
              + my life core values
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {values.map((v) => (
                <div
                  key={v}
                  className="flex min-h-[140px] items-center rounded-xl bg-[var(--soft-blue)] px-6 py-6"
                >
                  <p className="text-lg font-medium tracking-tight sm:text-xl">
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </ScrollFade>
        </section>

        {/* ── Related Quotes ─────────────────────────────────────── */}
        <section className="mt-40">
          <ScrollFade>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Related Quotes
            </h2>
            <p className="mt-3 text-sm text-[var(--periwinkle)]">
              + my design &amp; life philosophy
            </p>

            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {quotes.map((q) => (
                <li key={q.value} className="rounded-3xl bg-[var(--soft-blue)] p-6 sm:p-8">
                  <p className="font-medium text-[var(--fg)]">{q.value}</p>
                  <p className="mt-3 leading-relaxed text-[var(--muted)]">{q.quote}</p>
                  <p className="mt-4 text-sm text-zinc-400">— {q.author}</p>
                </li>
              ))}
            </ul>
          </ScrollFade>
        </section>

        {/* ── Off the clock (taped, staggered collage) ───────────────── */}
        <section className="mt-40">
          <ScrollFade>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              off the clock
            </h2>
            <p className="mt-3 text-sm text-[var(--periwinkle)]">
              + where I spontaneously get ideas!
            </p>
          </ScrollFade>

          <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
            {/* Baker */}
            <div className="md:-rotate-2">
              <ScrollParallax speed={36}>
                <Polaroid
                  src="/about/pancakes.jpg"
                  alt="A big plate of pancakes"
                  ratio="aspect-[4/5]"
                />
              </ScrollParallax>
              <ScrollFade>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rotate-3">
                    <img
                      src="/about/bake-raspberry.png"
                      alt="Raspberry mousse cake"
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="-rotate-2 translate-y-1">
                    <img
                      src="/about/bake-cookies.png"
                      alt="Chocolate chip cookies"
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="rotate-2">
                    <img
                      src="/about/bake-roll.png"
                      alt="Raspberry Swiss roll"
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
                <p className="mt-4 text-base font-medium text-[var(--fg)]">
                  hardcore baker
                </p>
              </ScrollFade>
            </div>

            {/* Cats */}
            <div className="md:translate-y-16 md:rotate-2">
              <ScrollParallax speed={28}>
                <Polaroid
                  src="/about/cats.jpg"
                  alt="Holding two cats"
                  ratio="aspect-[4/5]"
                />
              </ScrollParallax>
              <ScrollFade>
                <div className="-mt-4 grid grid-cols-3 gap-2">
                  <div className="-rotate-3">
                    <Img
                      src="/about/cat-tote.jpg"
                      alt="Kitten in a tote bag"
                      ratio="aspect-square"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="col-span-2" />
                </div>
                <p className="mt-4 text-base font-medium text-[var(--fg)]">
                  proud foster mom of 14 cats and 1 dog
                </p>
              </ScrollFade>
            </div>

            {/* Mets */}
            <div className="md:translate-y-8 md:-rotate-3">
              <ScrollParallax speed={44}>
                <Polaroid
                  src="/about/mets.jpg"
                  alt="At a Mets game"
                  ratio="aspect-[4/5]"
                />
              </ScrollParallax>
              <ScrollFade>
                <p className="mt-4 text-base font-medium text-[var(--fg)]">
                  ... and still rooting for the mets
                </p>
              </ScrollFade>
            </div>
          </div>
        </section>

        {/* ── CTA (handwritten note) ───────────────────────────────── */}
        <section className="mt-96 flex justify-center px-4">
          <ScrollFade>
            <div className="relative w-full max-w-md -rotate-2">
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-[3px] bg-[var(--periwinkle)]/25"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/about/end-note.jpg"
                alt="You scrolled all the way to the end! We should grab tea & talk about half-formed ideas or what we could build together. find me at chaewon2@andrew.cmu.edu"
                className="w-full rounded-md shadow-[0_8px_24px_-8px_rgba(20,20,34,0.35)]"
              />
              <a
                href="mailto:chaewon2@andrew.cmu.edu"
                aria-label="Email Chaewon at chaewon2@andrew.cmu.edu"
                className="absolute left-[23%] top-[68%] h-[12%] w-[64%] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]"
              />
            </div>
          </ScrollFade>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
