# Chrome Web Store listing: Mellon

Everything to paste into the Chrome Web Store Developer Dashboard, field by field.
Visibility: **Unlisted** (only people with the link can install it).

---

## Package

- Upload file: `dist/mellon-store-<version>.zip` (built by `python3 mellon-extension/tools/make-store-zip.py`)
- The store gives Mellon its own extension ID. Add `https://<that ID>.chromiumapp.org/` as an Authorized redirect URI in Google Cloud. Mellon's Settings page shows the exact address.

## Store listing tab

**Name:** Mellon

**Summary** (132 characters max):
> Your Gmail, sorted into what to do first: deadlines, short summaries and a calendar button, in a side panel. Read-only.

**Category:** Productivity → Workflow & Planning (or "Productivity" if there are no subcategories)

**Language:** English

**Description:**
> Mellon is a side panel for Gmail that turns a busy student inbox into a short list of updates.
>
> • Action needed first: emails that ask you to do something (submit, pay, register, reply) are listed by deadline. Deadlines within 24 hours are shown in red.
> • Everything else, today and earlier this week: the categories you care about come first.
> • Every card says why it is where it is ("Action: Submit · due tonight · ★ Courses"). Words like "URGENT" in a subject line never change the order.
> • Open a card for a one-line summary, the key details (when, where, who, how much), and the original email.
> • Put in my calendar: one click adds an event or a deadline reminder to your Google Calendar, or download an .ics file for Apple Calendar.
> • Ask Mellon: ask about one email ("Draft a reply") or about all your mail ("What's due this week?").
> • A phishing warning flags emails that ask you to log in or pay from outside your school, or that imitate it.
> • Mark updates done, hide the ones you don't need, fix a wrong deadline yourself, and switch between English and Korean.
>
> Privacy: Mellon has no server. It reads Gmail read-only, sends email text only to the Claude API (Anthropic), and keeps its notes in Chrome on your computer. The developer never sees your email.
>
> You need: an invitation (Mellon is in a limited test). The person who invites you adds your Google account and gives you a Google client ID and a Claude API key, or you can use your own key from console.anthropic.com.

**Icon:** `mellon-extension/icons/icon128.png`

**Screenshots** (1280×800): `store/screenshot-1.png`, `store/screenshot-2.png`, `store/screenshot-3.png`

**Small promo tile** (440×280): `store/promo-small-440x280.png`

**Official URL / Homepage URL:** https://chaewon.works

**Support URL:** https://github.com/islachae/portfolio2026/tree/main/mellon-extension

## Privacy practices tab

**Single purpose:**
> Show the user's recent Gmail as a prioritized list of updates (to-dos, deadlines and summaries) in a side panel.

**Permission justifications:**

| Permission | Justification |
|---|---|
| `sidePanel` | Mellon's whole interface is a side panel that opens next to Gmail. |
| `storage` | Saves the user's settings and Mellon's notes on each email (summary, deadline, category) locally, so emails are not summarized twice. |
| `identity` | Google sign-in through chrome.identity.launchWebAuthFlow: read-only Gmail access, and Calendar access only when the user clicks "Put in my calendar". |
| Host `https://gmail.googleapis.com/*` | Reads the user's recent emails (read-only) to build the list. |
| Host `https://www.googleapis.com/calendar/*` | Adds an event to the user's calendar, only when the user clicks "Put in my calendar", and removes it if they click Remove. |
| Host `https://api.anthropic.com/*` | Sends an email's text to the Claude API, with the user's own API key, to get a summary, deadline and category. |

**Remote code:** No, I am not using remote code. (All JavaScript is in the package. The fonts are bundled.)

**Data usage: what the extension handles** (check these):
- ☑ Personally identifiable information (the user's email address)
- ☑ Authentication information (the user's Claude API key, stored only on their computer)
- ☑ Personal communications (email content)
- ☐ everything else

**Certify** (check all three):
- ☑ I do not sell or transfer user data to third parties, outside of the approved use cases
- ☑ I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://chaewon.works/mellon/privacy/

## Distribution tab

- **Visibility:** Unlisted
- **Regions:** All regions (or United States and South Korea only)
- **Pricing:** Free

## Notes for the reviewer (optional field, "Test instructions")

> Mellon needs Google sign-in (OAuth app in testing mode) and a Claude API key, so it cannot be fully used without being added as a test user. The extension only reads Gmail (gmail.readonly), writes calendar events only when the user clicks a button (calendar.events.owned), and sends email text only to api.anthropic.com with the Claude API key entered in Settings. No server is involved. Privacy policy: https://chaewon.works/mellon/privacy/
