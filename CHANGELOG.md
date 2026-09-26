# Changelog

## 2026-09-26
- Home hero: two-line statement ("Chaewon is a designer and thinker / who shapes trust in AI into intuitive interactions").
- Project cards: boxless layout (image + title + subtitle + read time sit directly on the page), Figma-exact typography and 678×368 image ratio; tags renamed to "Payment UX" / "AI Companion" / "B2B SaaS".
- Cursor: liumichelle-style translucent circle (40px), smooth grow on hover, white circle + arrow over project cards.
- Header: full-bleed background bar (removes left/right cutoff against the page background).
- shadergradient waterPlane home background (color3 #c19dff).
- Project thumbnails: tipping phone mockups, pebbo pebble device, zipflow dashboard.

## 2026-09-25
- Initial portfolio release.
- Pages: Home, About, Contact, Design System, and Case Studies (Pebbo, Tipping).
- About: hero photo cluster, Exhibitions (list + collage), My Design Philosophy, and Related Quotes.
- Custom cursor, scroll parallax + fade, Satoshi typeface.
- Tipping case study: added "Working prototype" section with an embedded clickable Trust-First Tipping demo (iframe), rebuilt pixel-exact from the Figma `workingprototype1` frame via Figma MCP — tip-priority popup, hover drop-off tooltip, rating → feedback → tip slider flow.
- Tipping demo micro-interactions: scaled the phone to ~2/3, onboarding-style guide glow on the next actionable element, disabled the "Custom tip" card, guided "Place order" after priority submit, hover-to-reveal courier info on the tracking map, and a working drag slider for the final tip.
- Tipping demo polish: non-scrolling iframe (phone fits, step label enlarged, hint/dots removed), pixel-exact fit of the checkout/tracking screens (scaled to the 874px viewport so "Place order" sits at the bottom with no gap), location icon flashes → hover reveals the black "Drop-off Precision" tooltip, circular guide glow on thumbs, clickable single-select "What did you like?" options (Clear Communication pre-selected), tip slider snaps to the 5 tick values and updates the trust-tip text, partial scrollable "View reason" bottom sheet, Apple-style frosted toast, and a back button to revisit previous steps.
