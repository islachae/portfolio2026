# Chaewon Lim — Portfolio

A productivity-tool shell: a **library** on the left, a **deck** in the middle that flips one page per scroll, and an **inspector** on the right that explains whatever is on screen.

Next.js (App Router, static export) + TypeScript + [Motion](https://motion.dev).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Edit the words

**All copy lives in [`content/site.ts`](content/site.ts).** Search for `TODO`.

- `pages` — every page in the deck (home, 4 projects, 3 “for fun”, about, say hi). Order here = order on the site.
- `handoff` — the “How I design with AI” ledger. Keep each phrase short enough for one line.
- Tipping copy is placeholder until the new case study is written.

Images live in `public/about`, `public/work`, `public/fun`. Resume is `public/resume.pdf`.

## ChaeLLM (chat mode)

ChaeLLM’s face is traced 1:1 from Chaewon’s own blinking GIF (`components/PixelFace.tsx`: one path for the hair, mouth and ears, one each for open and shut eyes). Ink is the accent violet and the face is transparent. Like the GIF it blinks every ~3s (eyes shut 180ms), plus right away when an answer appears and on hover. Reduced motion keeps the eyes open.

The **✦ ChaeLLM** box at the bottom of the right panel (or `⌘K` → “Ask ChaeLLM”, the floating ✦ when the panel is hidden, or the sparkle on phones) turns the right sidebar into a chat. × goes back to the details; the conversation is kept until ↻ New chat.

Right now it's a **placeholder**: `content/chaellm.ts` holds the greeting, starter questions and canned answers stitched from the site copy, matched by keyword. To plug in a real model, replace `reply()` with a call to your own API route (same `{ text, follow }` return shape) and delete `answers`. The UI already streams the reply in word by word.

## Home: one way in

The home is the hero only: no “Selected work” cards (they were a fourth route to the same four projects, next to the ticker rail, ⌘K and scrolling, and made scrolling look optional). At the bottom (48px up from the edge), **SCROLL** in 12px ink with a 1.5px hairline that draws down and the arrowhead riding its tip (one SVG, so the shaft and the head can't drift apart), every 3s from 1.2s after load **until the visitor scrolls, uses the keyboard or leaves Home**; then it rests with the line drawn. Click it to go to Rethinking Tipping. Reduced motion: it just sits there. The jump box (⌘K) stays: it's search, not a list.

## About me, next to Résumé and LinkedIn

The top-right row reads **ABOUT ME · RESUME ↗ · LINKEDIN ↗ | ChaeLLM** on every page (and in the case-study bar). ABOUT ME is the one in a box (Résumé and LinkedIn are plain links, with one underline under the word and the ↗ on hover); it opens the full About page (`/#about/story`), and on the About page the box is filled. It's a plain link on purpose (option A): the expected place, no popover. Phones: the top bar has ABOUT ME (boxed) and RESUME ↗ (the name is 12px so it all fits at 390px, and steps aside below 380px); the case-study bar keeps ABOUT ME and RESUME and drops LinkedIn. `ContactLinks` in `components/IndexRail.tsx`, `MobileBar` in `components/Chrome.tsx`.

## Work pages: the brief (no panel, no click)

Work pages (anything with `challenge` and `did` in `content/site.ts`) are split at 1024px and up: the text on the left (eyebrow, title, tagline, then **Challenge** / **What I did**, then **Role / Timeline / Type** and the **Tool stack** as chips, then “Read case study” when there is one), and the stage on the right. Below 1024px the same brief stacks above the stage. Hierarchy (option A, story first): the tagline is the hook (Satoshi 20px, ink), Challenge reads grey and What I did reads ink, and Role / Timeline / Type / Tool stack sit below as a small muted 2×2. Team projects label their line “My part” (`didLabel` in `content/site.ts`). The stage is a way in too ([`components/StageDoor.tsx`](components/StageDoor.tsx)): **OPEN CASE STUDY ↗** sits boxed in the stage's top-left corner (1200px and up; the right side is where the Tipping phone runs to the edge), and over the prototype itself, not its buttons, a small ink chip follows the mouse (“Read case study →”) and a click opens the case study (1024px and up, mouse only). Pebbo's stage is the working app, so it gets the corner button only. Component: [`components/ProjectBrief.tsx`](components/ProjectBrief.tsx); styles under “Work pages: the brief” in `globals.css`. The case study heroes show the same tool stack where the reading time used to be. The reading time (`readingTime` in each case file) is no longer shown on the button or the home cards; it is kept in the data (⌘K) in case you want it back. The page eyebrow (“AI COMPANION · 2024”) and the case section labels are 13px mono caps, a step above the 11–12px brief labels and tickers. From 800px up every page starts 120px in, leaving about 48px between the ticker rail and the text.

**ZipFlow is marked “Coming soon”** (`status: "soon"` in `content/site.ts`): a violet COMING SOON tag under its eyebrow, “Soon” in the index menu, and “Coming soon ·” in ⌘K. Remove the line to publish it.

Still to fill in (marked `TODO(Chaewon)` in `content/site.ts`): the real tool stack for each project (only Figma is listed), ZipFlow's timeline length, and Melon's Role and Type.

## About: a short hello in the deck, the full story on its own page

The deck's About page is split like a work page: “ABOUT ME • NEW YORK”, “안녕! I’m Chaewon” (the page's `heading` in `content/site.ts`; the sidebar and index still say “About me”), the tagline “Interactive artist turned product designer.”, three lines in Chaewon's words (`about.short`), four facts (Based in, Studying, Before design, Speaks), and a **More about me →** button styled like “Read case study”. The photo collage stays on the right.

The button opens the About page at `/#about/story`, built like chaewon.works/about in this site's style and in the case study shell (Back, the name in the bar once you scroll, a table of contents on the left): **Intro** (three polaroids, the full intro, New York City · MDes Carnegie Mellon, “Working on something cool? Get in touch”, then What I’m good at / What pulls me in), **Art** (the six shows as a hairline list, four show photos; Mycelia links to Wish Tree), **Principles** (four square cards, each quote ending on where it shows up in the work: Melon, Tipping, Pebbo, the Lab, each a link there), **Off the clock** (baker, foster mom, Mets fan; the baker links to Bakery Log) and **Say hi** (the handwritten note, Copy email, Résumé, LinkedIn). It ends on “Start with the work → Rethinking Tipping”. Content: [`content/cases/about.ts`](content/cases/about.ts) (the words themselves come from `about` in `content/site.ts`); component: [`components/case/AboutCase.tsx`](components/case/AboutCase.tsx); styles under “About page” in `globals.css`. Grey eyebrows here; violet only on the “In <project>” lines. Still to confirm: the 2021 show title “Her’s”.

## Case studies

Three projects have a full case study: Rethinking Tipping (`/#case/tipping`), Pebbo (`/#case/pebbo`) and CMU Melon (`/#case/melon`, first draft; its **Survey** section turns the 12-student survey from September 2026 into three numbers side by side: the count, one square per student who answered, a few-word headline and where it shows up “In Melon”; then one line on the open funding question, and every answer folded under “All answers” as bar charts). The registry is [`content/cases/index.ts`](content/cases/index.ts): add a case there and its project page gets the “Read case study” button and the `#case/<id>` route. Shared pieces (count-ups, sticky/scroll progress hooks, section headers, takeaways with evidence links) live in [`components/case/kit.tsx`](components/case/kit.tsx).

### CMU Melon (first draft)

`/#case/melon`, built from the team's research deck, the advisor and student interview transcripts, the project hypothesis, the card and chat explorations and the prototype recording. Copy: [`content/cases/melon.ts`](content/cases/melon.ts); layout: [`components/case/MelonCase.tsx`](components/case/MelonCase.tsx); images in `public/work/melon-case/` (the video is shared with the project page, in `public/work/melon/`).

- Order follows the work: the gap (one email, two readers) → scope (one event through the system, with the orientation map as Chaewon's part) → research (methods, assumptions that held or broke) → what both sides said → framing, constraints and the assistant's limits → five directions, two kept → the panel → the advisor view → takeaways.
- “What we heard” is one picture (messages go out, almost nothing comes back) and three short insights with trimmed quotes; the constraints are four one-line rules; “Where Melon stops” shows Donna's limits as three lanes (answers / checks with Donna / always Donna) with illustrative example questions.
- Each case study's table of contents works like Rachel Chen's: mostly names you recognize at a glance (Overview, Problem, Solution, Research, Testing, Reflection…) plus one or two only that project has (Tipping: Why now?, Systemic thinking; Pebbo: User journey, Designing for trust, Try Pebbo; Melon: Scope, Framing, Advisor view). Each label matches the mono label on its section, and the set and order follow the story. An entry can cover several sections: it points at the first one.
- Two interactions only: **One email, two readers** (tabs re-mark an illustrative email the way the coordinator meant it vs how a student read it, with numbered notes from the interviews) and **the prototype recording** with six chapters that seek the video and follow along as it plays.
- The coordinator agreed to be named. Students are not named.
- Still to fill in (`TODO(Chaewon)` in the content file): the survey numbers, number of student interviews and written questions, exact timeline, the tool stack, the advisor-view screens, the rest of her answer on control, and the staff first names on the orientation map (swap for roles before publishing).

### Pebbo

Built from Chaewon's Pebbo portfolio PDF (2026), laid out like Rachel Chen's OpenAI hardware case: problem, then the device and the flows it drives, then the research and reasoning behind them.

- Copy: [`content/cases/pebbo.ts`](content/cases/pebbo.ts). Images are crops of the PDF pages in `public/work/pebbo-case/`; the hero reuses `public/work/pebbo.webp`.
- Layout and interactions: [`components/case/PebboCase.tsx`](components/case/PebboCase.tsx). Pebbo's amber replaces Tipping's orange inside `.cs[data-case="pebbo"]`.
- Scroll moments:
  - **Problem:** the scale as one sentence instead of stat tiles (Tipping already counts people): “About 1 in 11 Americans will face an eating disorder in their lifetime. Every year, eating disorders cost the US $64.7 billion.” The two figures are marked in with a yellow highlighter as the sentence comes into view; footnotes carry 28.8 million / 9% and 2018–19, from the Deloitte Access Economics report with Harvard STRIPED and the Academy for Eating Disorders (2020). The two context notes below are hairline columns, not tinted cards.
  - **Solution:** the device render with its parts called out (lines draw in once it scrolls into view). Mood chips recolour the LED (calm / anxious / depressed); hold “Squeeze” for the haptic “Are you OK?” and a pulse down the You → Pebbo → App line.
  - **Grip · Talk · Reflect:** a sticky stage your scroll plays: the device glows blue and squeezes, then warms back while you talk, a Bluetooth hop carries it to the phone, and the screen moves from home → listening → recipe → saved.
  - **Daily reflection:** a line fills down the day as you read (notification → home → chat → suggestion chips → summaries). log / explore / quest / peek are tabs.
  - **Research:** a light touch: when the board comes into view each affinity note arrives a few pixels off and slightly tilted, then straightens into its cluster (55ms apart); the yellow cluster heads fade in last. No pinning or scroll scrubbing.
  - **Problem definition:** the emotional eating loop turns once with your scroll (Stress → Binge eating → Guilt → Restrict).
  - **Approach:** the problem → solution → method → feature map builds row by row; the IA tree draws in.
  - **Trust:** press and hold the quest bubble (or Enter) for the context menu, then “Check AI reason” opens the reasoning card.
  - **Try Pebbo** (last section): the Pebbo app's chat, working, rebuilt from Chaewon's screens. The phone lives in `components/PebboPhone.tsx` (used here and as the Pebbo work-page stage); it is drawn at the mockup's 336 × 724 and scaled down as a whole when the column or stage is smaller. Light phone, #F4F4F4 screen, Barlow and Barlow Semi Condensed (the app's typefaces, OFL, `app/fonts/Barlow*.woff2`, loaded only for this phone). Home: gray avatar, calendar + bookmark, the date pill, the greeting, the prompt typing itself in (55ms a letter, once the phone is on screen) and changing with the visitor's local time (`home.prompts` in `content/cases/pebbo.ts`: morning 5–11 “How are you feeling about food this morning?”, lunch 11–14, afternoon 14–18, evening 18–22, night 22–2, and two lines that rotate on Start over for 2–5), and Pebbo floating over its shadow, with the four round buttons (log / explore / quest / peek). Chat: dark Pebbo bubbles and white user bubbles with tails, “thinking...” with Chaewon’s blurred orange dot (`thinking-dot.svg`, breathing), the + button that opens the four buttons, and the white bottom panel with “Tell me anything” (the round button turns orange with a stop square while Pebbo thinks). Pebbo's face is Chaewon's own character drawings (`public/work/pebbo-case/faces/*.svg`, 17 expressions from `cmu mellon/emotions`), picked to mirror the mood of what you typed (`face` in the answer); a new mood doesn't snap: the new face fades in and unblurs over 1.4s while the old one fades out behind it, and a soft halo eases from one mood colour to the next (`FACE_COLOR`). Press and hold any Pebbo message or card (or Enter on it) for the app's long-press menu over a blurred screen: Check Ai reason · Save · Copy · Mention · Share. “Check Ai reason” tucks the gray reasoning panel under the card (why this answer, “AI noticed:”, mood read, the sparkle badge) with the Pattern / Frequency / Impact table below, as in the app; the labels switch to Korean when Pebbo answered in Korean.
    - **Who answers** (`content/cases/pebbo-brain.ts`): a local safety check always runs first (self-harm, purging → a care reply with the National Alliance for Eating Disorders and 988, or 109 / 1577-0199 in Korean). Then a live model if one can be reached: inside the claude.ai preview that is Claude itself (the page declares the `sample` capability; the viewer is asked once and it runs on their own account), or your own endpoint if `NEXT_PUBLIC_PEBBO_API` is set at build time. Otherwise the scripted listener answers: it scores feelings and situations (skipped, overate, guilt, craving, stress, low, social, diet talk, small wins, asking for an idea), catches the restrict → binge loop from the research, echoes the food and meal you named, reads English or Korean and answers in the same language, and handles hello / thanks / yes / no / “who are you”.
    - **Live on the deployed site:** a static site can't hold an API key, so deploy `examples/pebbo-worker.js` (a ~60-line Cloudflare Worker that keeps the key and Pebbo's rules; steps at the top of the file), then build with `NEXT_PUBLIC_PEBBO_API=<worker URL>`. The rules the model follows are `PEBBO_RULES` in `pebbo-brain.ts` (no calories or weight, one optional suggestion, same language, JSON out).
- Reduced motion: everything is shown in its finished state.
- Takeaways each link up to their evidence (the scene, the reasoning card, the device).

### CMU Melon: the project page video

The project page plays Chaewon's prototype recording instead of a mock inbox. `public/work/melon/melon-demo.mp4` (H.264) with `melon-demo.webm` (VP9) as a fallback and `melon-poster.webp` as the still: cropped to the panel from the 2026-09-28 screen recording, 480px wide, 30fps, no audio, about 1 MB each. It plays only while the Melon page is on screen, never on its own with reduced motion, and has a pause button. The chips under it (Triage, Filter, Calendar, AI summary, All clear, Ask Melon) jump to that part and follow along as it plays; the times are `MELON_CHAPTERS` in `components/Stages.tsx`. To swap in a new recording, re-crop it to the panel and update those times.

### Rethinking Tipping

Rethinking Tipping has a full case study at `/#case/tipping`: a page of its own with the side panels out of the way, a Back button to the deck, reading progress, and a Next project link. Open it from the Tipping page (“Read case study”), the right panel, or ⌘K.

- Copy and image list: [`content/cases/tipping.ts`](content/cases/tipping.ts) (taken from the “Rethinking Tipping – Portfolio Case Study” canvas). Images are in `public/work/tipping-case/`.
- Layout and the interactive pieces (the tip guess, the journey map, the “one order, start to finish” scroll scene, Try the flow tabs, the stakeholder loop): [`components/case/TippingCase.tsx`](components/case/TippingCase.tsx); the page shell is [`components/case/CasePage.tsx`](components/case/CasePage.tsx).
- The project's orange is used only inside the case study; screens always sit on light “paper” so they read the same in dark mode.
- The scroll scene (`scene` in the content file) keeps the phone on screen while the reader scrolls through four steps; the Trust Tip moves from the $2.00 pre-tip to $4.50 and the breakdown lines land one by one. Its numbers come from the breakdown card and feedback sheet.
- Wide screens get a table of contents in the left margin (`toc` in the content file), with the current section in ink; it replaces the old reading-progress line. Hidden below 1200px.
- The existing explanations are interactive rather than added to:
  - **Numbers as pictures:** 58% fills a 10×10 grid, 2/3 fills three people, and the 24 testers fill a row, all in step with the count-up (`pic` on each stat).
  - **The tip guess:** readers pick $3 / $5 / $7 (a radio group) before “See after delivery”; the line under the receipt echoes their pick (`prompt`, `picked`, `verdict` in `problem.sim`).
  - **Why now:** a sticky timeline the scroll plays from Then to Now. Payment and dining tiles arrive; the tip prompt stays where it started (`whyNow.tip`).
  - **Tested vs iterated:** the two versions sit side by side (no extra interaction); the note lines sit on the dashed lines drawn in the screenshots.
  - **Takeaways:** each links to its evidence (`evidence.id`), scrolls there with a brief highlight, and shows a “Back to takeaways” button.
  - With reduced motion, the timeline shows its finished state and nothing animates.
- TODO: the DoorDash reference card still needs its core value, features and evidence (`principle.doordash.rows`). Until then it says “Write-up in progress.”

## Visitor poll

**Parked:** the poll is not on the site right now (`POLL_ON = false` in `content/poll.ts`); everything below still works when it's switched back on.

A “Quick question” card sits in the right panel on Home, right under “How I design with AI”. Each visit shows **one random question** (an unanswered one when possible), numbered 001–005. Answers are icon tiles: tap one and each tile flips to its share, with yours in violet. On every fresh load the card unfolds for about five seconds, with a hairline counting down, then folds into a small card on the right: “Quick question” with a question mark before you vote, or your pick (“team AI”, with its icon) after. Hovering or focusing keeps it open; after a vote the results show for a moment, then it folds into “team …”. Each option’s `team` word in `content/poll.ts` sets what the folded card says. Below 1200px, where the panel becomes a drawer, the card sits under the jump box and peeks there instead, and only if it's on screen (a phone opening `/#about` would otherwise have the page above it grow and move the button under the reader's thumb). Questions, answers and icons live in [`content/poll.ts`](content/poll.ts); the icons are in [`components/PollIcon.tsx`](components/PollIcon.tsx) (dog, cat, robot, brain, coffee, music, silence and café noise are traced from Chaewon’s set; undo, pause, inbox, align and sparkle are drawn to match, and the last three animate when picked).

- `herPick` (per question) — set an option id, e.g. `"cat"`, to label it **Chaewon’s pick** in the results; visitors who agree see **Me too — Chaewon**. `null` hides both.
- **Shared results need a backend.** Set `NEXT_PUBLIC_POLL_ENDPOINT` to any small API that follows the contract in [`lib/poll-store.ts`](lib/poll-store.ts) (GET counts per question; POST `{poll, question, option, previous}` so a changed answer replaces the old one). Upstash/Vercel KV, Supabase or a Cloudflare Worker all work.
- Until then the poll runs as a demo with each question’s `sample` numbers, and the UI says so (“Sample results · N votes” under the tiles). It never presents them as live data.
- A visitor’s answers are remembered in their browser, so returning visitors see results instead of voting again.

## Where things are

| File | What |
| --- | --- |
| `components/App.tsx` | Three-pane shell, sliding side panels |
| `components/Deck.tsx` | Scroll-snapped pages; floating panel toggles appear only while a panel is hidden |
| `components/HomePage.tsx` | Cover: New York time at the top right; “Currently @ Carnegie Mellon Univ. MDes” as a caption under the hello; the hello and bio as one voice (Satoshi Bold 28/42, left-aligned) where the hello and key phrases are ink and the connecting words a pale grey (all Bold; the grey is a touch under 3:1 on purpose, about 2.5:1, so the key phrases carry the sentence). The hover notes on the phrases are regular weight (line breaks on wide screens come from `breakAfter` and `\n` in `profile.bio` in `content/site.ts`; phones wrap naturally); jump-to-project box, project cards, next arrow |
| `components/Stages.tsx` | One playable “stage” per page (Tipping prototype walkthrough, before/after, the working Pebbo app, Melon prototype recording, wishes, bakes, toys, collage, say hi). Pebbo's stage is the working app itself (`components/PebboPhone.tsx`, the same phone as “Try Pebbo” at the end of the case study), with three starter chips and Start over under it; it starts typing its prompt when the page comes on screen. Tipping plays the real prototype screens as a “focus pull”: each step shows its new screen whole for a moment, then the camera leans into the one element that matters (about 1.3–1.55×, a 0.9s ease-in-out, even in and even out), rings it once it has landed, and a caption under the step bar says what it does; it leans back out and the screen only changes once the camera is fully back, so nothing jumps. A step picked by hand cuts straight to its screen, then leans in. Steps are named for what happens (Minimum → Delivered → Feedback → Your call → Courier). Each step in `TIP_STEPS` (5–5.6s each; the rhythm is `ZOOM_IN_AT` / `ZOOM_OUT_BEFORE`) has its caption, a zoom target (`zoom: {x, y, s}` in % of the screen) and a ring, tap marker or slider nudge; the stage clips the zoomed phone and fades its edges into the page. It auto-advances only while the page is on screen, with chips to jump (a jump zooms straight in) and a pause button. Reduced motion: no zoom, rings and captions only. The sheets are `sheet-feedback.webp` / `sheet-adjust.webp`, cut from `final-adjust.webp`. Say hi: “Send a hi” folds the note in thirds, drops it into an envelope, seals it and sends it flying; the click copies the email and the end state offers the mail app. Bakery Log: tap (or Enter/Space) the top photo to flip it |
| `content/bakery.ts` | The Bakery Log photos and their backs: “Chaewon’s secret recipe” for the bakes, “The best pancake place in NYC” (Five Leaves, Brooklyn) for the pancakes. The three recipes are **rough placeholders** (4 ingredients, 3 one-line steps): swap in the real amounts. Under them, “Secret ingredient” is followed by a strip of mosaic tiles and “Ask Chaewon!”; the ingredient itself is never written, `secret` is only how many tiles wide. A back with nothing filled in shows a redacted “classified” card |
| `components/IndexRail.tsx` | Wide screens have no left sidebar. The project index rests in the left margin as a watchlist of tickers (HOME / TIP · PEBO · MELN · ZIPF / WISH · BAKE · LAB / ME · HI, starting from Home, from `ticker` in `content/site.ts`), the current one marked with a violet square, with nothing else showing: a white blur behind the labels fades out at its edges (no box, border or glow; `--frost` in `globals.css`) so they stay readable over the Home gradient; hover or tab in and it opens into the list (square, hairline, blurred) (Work 01–04, Play, About / Say hi, ⌘K) with a small preview beside the name you point at; after you pick one it folds back to tickers until the pointer leaves (or you Tab back in). Top left, a name chip (square hairline box on the same blur, as DESIGN.md asks: 0px corners, no glow), marked with the 採 monogram (`components/Monogram.tsx`; to go back to the photo, render `<img src="/about/avatar.webp">` in `ProfileChip` instead), goes Home; hover it for display settings (they open downward; after you pick Appearance or Motion they close on their own, unhurried: 1.4s after your last pick or move inside, or half a second after the pointer leaves, with a slow fade; keyboard users land back on the settings button). Top right, always visible (no hover): ABOUT ME (boxed) · RESUME · LINKEDIN, then ChaeLLM after a hairline (`TopLinks` / `ContactLinks` in `components/IndexRail.tsx`). The same links sit on the right of the case study bar (phones keep only Résumé there), a Résumé button sits next to “Copy email” at the end of a case study, and a RÉSUMÉ button sits in the phone top bar. There is no right panel: ChaeLLM slides in as a column (wide) or a drawer, and each work page carries its own brief (below). Under the bio, “Currently @ CMU MDes” sits on the left and New York time on the right, ending where the sentence ends; the green dot still reveals “Open to Summer ’27 internships in NYC” on hover. Home cards carry no tags on the images: title and eyebrow sit under each one, like Rachel’s. Phones keep the slide-in menu (`Sidebar.tsx`) |
| `components/Inspector.tsx` | ChaeLLM only: a right column on wide screens (open exactly while the chat is) and a drawer / bottom sheet below 1200px. There is no details panel any more; the older details views (Home ledger, poll, facts) are still in the file but not shown |
| `components/ChaeLLM.tsx` | Chat mode for the right panel: state, panel, bottom composer, floating button |
| `components/case/*` | Full-page case studies (Rethinking Tipping, Pebbo) and their shared kit |
| `components/Poll.tsx` | The visitor poll (card, icon tiles, peek, results) |
| `components/PollIcon.tsx` | Poll answer icons (currentColor, 24×24) |
| `components/toys.tsx` | Rolling digits, slide-to-confirm, hold-to-confirm |
| `app/globals.css` | Tokens (light + dark), all styles |

## Loading: the monogram loader and skeletons

Measured on a throttled connection (gzip on, like any real host), before → after:

| | Before | After |
|---|---|---|
| Home, 3G phone | white until 1.4s, everything loaded at 11.9s | the loader at 0.5s, the page from ~2s, everything at 5.6s |
| Home, 4G | page at 0.5s | page at 0.5s (no loader: it only shows when the page is slow) |
| A link to a case study, 3G | white until 7.2s | the page's outline at 0.35s, the case study at 5.7s |

How it works (all in [`lib/boot.ts`](lib/boot.ts), inlined into `<head>` by `app/layout.tsx`, so it paints before the stylesheet arrives):

- **The stylesheet doesn't block the first paint any more.** `npm run build` runs `next build` and then [`scripts/defer-css.mjs`](scripts/defer-css.mjs), which gives each stylesheet `media="print"` plus a high-priority preload, and a `<noscript>` fallback. The boot script switches each one on the moment it has loaded, and keeps the page itself hidden until then (no flash of an unstyled page; the loader and the outline still show). If anything goes wrong it switches them on after 12s regardless. `npm run dev` isn't affected.
- **The monogram loader** (option B): the 採 monogram in the middle with a hairline ring, and under it **“Curiously, Chaewon” writes itself again the way Chaewon wrote it**: her own stroke order, pace and pen lifts, traced from a screen recording of her writing it (~3.5s, with a breath after the comma). **The first visit on a browser plays it as an intro (the dot lands at ~3.7s, ~4.9s with the flight), whatever the connection** (localStorage `cw-intro`); later visits show it only if the styles aren't in after 0.3s (fonts alone never trigger it), and once the page is ready the rest of the signature is written within about half a second. Any click, tap, scroll or key skips it as soon as the page is ready. To see it again, clear `cw-intro` or use ⌘K → “Replay the intro”. The ring follows real steps (page read 35% → styles in 72% → fonts in 100%, waiting at most 0.4s for fonts), never a timer. When the page is ready and the signature has finished, **the full stop lands as a small violet dot** where she put hers (the only violet on the screen), then the ring fades, the signature sinks away and the monogram flies into the name chip (on phones, into the mark in the top bar, which is now the monogram too) while the page appears under it. Reduced motion: the signature is just there, the dot appears, it all fades. Links to a project, a case study or About skip it. ⌘K → “Replay the intro” plays it again (with pretend steps) to show someone.
  - **It doesn't stutter while the page wakes up.** The intro plays while React hydrates the page, and the main thread is busy in bursts. So nothing in it waits for the main thread: the pen draws on a canvas from a worker (OffscreenCanvas; browsers without it draw on the main thread instead), the ring fills by two half-arcs turning in behind two half-windows, and the backdrop fades as its own layer (transforms and opacity run on the compositor). With the main thread blocked for 0.9s on purpose, the pen keeps writing (its longest pause is the 0.3s breath after the comma); drawn on the main thread it would stop for the whole 0.9s. The Home gradient (three.js, ~260 KB) no longer starts during the intro: compiling its shader stalled everything for ~0.5s right as the monogram flew. It now starts when the intro is over and the browser is idle, and fades in once it has drawn; `scripts/defer-css.mjs` prefetches its chunk after the page loads (Home visits only) so it's already cached.
  - **The signature is hers, traced from a recording** ([`lib/signature.ts`](lib/signature.ts), generated by [`scripts/trace-signature.py`](scripts/trace-signature.py)). The video never ships: frame by frame, the middle of the newly inked pixels is where the pen was, so the script gets each stroke's path and timing, centres it on the ink line and smooths it into Bézier curves (27 strokes, 7.6 KB; the stand-in it replaces, pieced together from her end note, was 11 KB). The ink takes the text colour in light and dark. The size is 0.65× the old one (195px wide, at most 49.4vw on phones). Speed is `PACE` in the same file: strokes 2.86× and pauses 5.72× faster than she wrote them (her recording took 13s). To redo it: record yourself writing it on a white page with a round pen, then `python3 scripts/trace-signature.py recording.mov` (needs ffmpeg, numpy, scipy, scikit-image, Pillow).
- **The outline for links to a long read**: `/#case/…` and `/#about/story` draw the page's frame right away (Back, Résumé / LinkedIn, the table of contents, grey bars for the eyebrow, title, subtitle and meta, a hero box with a slow sheen) until the page is ready.
- **Image skeletons** ([`components/ImageMarks.tsx`](components/ImageMarks.tsx) + “Skeletons” in `globals.css`): every image holds its exact space. Screens and figures (home cards, case study images, Wish Tree) are surface grey with one soft light pass every 1.6s, then ink in. Photos (polaroids, bakes, show photos) are warm grey inside their white frame, then develop like an instant photo (~1s). Titles and labels are real text and never skeleton. Reduced motion: no sheen or developing; dark mode has its own greys.
- **Fewer downloads up front**: the stage images further down the deck (Tipping screens, Wish Tree, bakes, the About collage, the end note) load lazily now, so on a slow phone they stop competing with the first screen.

## Deploying to chaewon.works

chaewon.works already points at Vercel (apex A record 76.76.21.21, `www` → cname.vercel-dns.com), so no DNS changes are needed: the domain just moves to the project that serves this code.

1. Put this folder in a GitHub repo (GitHub Desktop: File → Add local repository → Publish). `node_modules`, `.next` and `out` are git-ignored.
2. Vercel → Add New → Project → import the repo → Deploy. `vercel.json` sets everything: a plain static site (`framework: null`), `npm run build` (which runs `next build` and then `scripts/defer-css.mjs`), output `out/`. Node 20.9+ (`engines` in package.json).
3. Check the `…vercel.app` URL it gives you.
4. In the new project: Settings → Domains → add `chaewon.works` (and `www.chaewon.works`). Vercel shows “Move Domain” from the old project; confirm. HTTPS comes with it. To roll back, add the domain to the old project the same way.

Old links keep working (`vercel.json` → redirects): `/about` → the About page, `/contact` → Say hi, `/case-studies/tipping` and `/case-studies/pebbo` → their case studies, `/case-studies/zipflow` → the ZipFlow page (coming soon), `/design-system` → Home. `/resume.pdf` is served from `public/resume.pdf` (replace the file to update it). Share previews use `metadataBase` = https://chaewon.works.

### Try Pebbo, live on chaewon.works

On the real domain there's no claude.ai runtime, so “Try Pebbo” asks the site's own endpoint, [`api/pebbo.js`](api/pebbo.js): a Vercel Function deployed with the site (anything in `api/` becomes one). It keeps the API key, adds Pebbo's rules (`api/_pebbo-rules.js`, copied from `PEBBO_RULES` in `content/cases/pebbo-brain.ts` by `npm run build`; commit it) and returns the same JSON the scripted listener does. Until a key is set it says so (`GET /api/pebbo` → `{"live": false}`) and the phone stays scripted, with the scripted note under it, so deploying first is safe.

To turn it on:

1. [console.anthropic.com](https://console.anthropic.com): sign up, add billing, and **set a monthly spend limit** (Settings → Limits; a few dollars is plenty). Create an API key.
2. Vercel → the project (summer-intern-portfolio) → Settings → Environment Variables → add `ANTHROPIC_API_KEY` with that key, for Production (and Preview if you want it there too).
3. Deploy again (`vercel --prod`). The note under the phone changes to “Replies come from Claude (a small, fast model)…”.

Optional variables: `PEBBO_MODEL` (default `claude-haiku-4-5-20251001`), `PEBBO_DAILY_LIMIT` (default 300 answers a day per running instance; the Console limit is the real ceiling), `PEBBO_ORIGINS` (extra pages allowed to call it). Guard rails in the function: only this site's pages may call it, 20 messages per visitor per 10 minutes, the last 9 turns, 1,000 characters a turn, 400 output tokens; nothing is stored or logged. If the endpoint is busy, over its limit or not set up, the visit carries on with the script. Haiku 4.5 costs about $1 / $5 per million input / output tokens, roughly 0.2¢ a message here. `NEXT_PUBLIC_PEBBO_API` at build time points the site somewhere else instead (e.g. the Cloudflare Worker in `examples/pebbo-worker.js`).

## Deep links

Each page has an anchor: `yoursite.com/#pebbo`, `#zipflow`, `#tipping`, `#melon`, `#about`, `#hi`. The long reads have their own: `#case/tipping`, `#case/pebbo`, `#case/melon`, and `#about/story` for the full About page.
Send `#tipping` to a fintech team, `#zipflow` to a B2B SaaS team.

## Shortcuts

`⌘K` or `/` search · `↑` `↓` (or `j` `k`) flip pages · `1`–`4` jump to work · `a` about · `h` home · `Esc` in the chat box closes ChaeLLM

## Deploy

**Vercel:** push to GitHub → import on vercel.com → Deploy. Add your domain in Settings → Domains.
**Anywhere static:** `npm run build` writes the site to `out/`.

## Design system

Styles follow the “Rachelchen” DESIGN.md (alpha), applied to a three-pane layout split by hairlines. Tokens live at the top of `app/globals.css`.

- **Color:** canvas `#FAFCFD`, ink `#32404F`, one violet accent `#6C4FE0` (`#A996FF` in dark mode) for active nav, hover, “You decide”. Light and dark themes use the spec’s `themes` values. Muted text is `#6A737E` instead of `#78828C` so it passes AA contrast.
- **Type:** heading1 = Satoshi Medium 48 / 55.2 / −2px (cover and page titles), Satoshi 22px for the cover's second line, Satoshi headings 17px, Geist body 15px/1.5, Geist Mono 12px caps for labels. Satoshi stands in for the spec's Tiempos Text; it's from Fontshare (Indian Type Foundry, free license), self-hosted as `app/fonts/Satoshi-*.woff2`.
- **Shape:** 0px corners on structure, pills only for primary CTAs. One shadow tier; everything else is separated by hairlines and surface color.
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48.

Cover emoji (brain, bread, human-and-robot handshake) are Chaewon’s own images, in `public/emoji/` (192px webp). Swap a file there to change one; the hover animations stay. The brain strains (a tremble that builds and swells), then pops in a ring of sparks and re-forms; with reduced motion the emoji stay still. The Home background is the same ShaderGradient as chaewon.works (`shadergradient` + `three` + `@react-three/fiber`, settings in `components/ShaderHero.tsx`: waterPlane, white → lilac, grain on). It fills only the Home page of the canvas and is mounted only while Home is on screen; dark mode swaps the three colours for dark ones, and reduced motion stops the animation.

## Design skill

`.claude/skills/frontend-design/` is Anthropic's `frontend-design` skill (same files `npx skills add anthropics/skills@frontend-design` installs), so Claude Code picks it up when you work on this repo. Where the skill and DESIGN.md disagree (mono caps labels, 0px corners, hairlines), DESIGN.md wins, as the skill itself says a brief should.

## References (for the case study pages later)

Visual guide: rachelchen.tech. Interaction notes: designspells.com (Granola sidebar icon, Arc icon animation, Typefully sliding sidebars), tradingview.com and fin.ai for later case study pages.
