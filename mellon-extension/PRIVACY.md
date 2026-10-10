# Mellon privacy policy

_Last updated: October 10, 2026_

Mellon is a Chrome extension that shows your recent email as a short, ranked list of updates in a side panel next to Gmail. This page explains what Mellon reads, where that data goes, and how to remove it.

**The short version:** Mellon has no server. Your email is read in your own browser, sent only to the Claude API (Anthropic) to be summarized, and the results are kept only in Chrome on your computer. The developer of Mellon never receives, sees or stores your email.

## What Mellon reads

- **Gmail (read-only, `gmail.readonly`).** Mellon reads the messages in your inbox from a recent period you choose (7 or 14 days, up to 100 emails). It skips Gmail's Promotions and Social tabs. It reads the sender, subject, date and text of each message. When you ask, it also searches your Gmail or opens one message for the Ask Mellon chat. Mellon cannot send, delete, archive or change your mail.
- **Google Calendar (only if you use "Put in my calendar", `calendar.events.owned`).** Mellon asks for this permission only the first time you click the button. It is used only to create an event you clicked to add, and to remove that event if you click Remove. Mellon does not read your existing events.
- **Your Google account email address,** to show which account is signed in and to keep you signed in to the same account.

## Where your data goes

- **Anthropic (Claude API).** To summarize an email, Mellon sends its sender, subject, date and text to the Claude API at `api.anthropic.com`. The same applies to questions you ask in Ask Mellon and to Korean translations. Requests go straight from your browser to Anthropic, not through any server run by the developer. Anthropic processes this data under its commercial terms for API customers.
- **Whose API key.** Mellon uses the Claude API key entered in its settings. That can be your own key, or a key the person who invited you gave you. With a shared key, the cost of your requests is billed to that person's Anthropic account, and they can see how much was used. They do not receive your emails through Mellon.
- **Google.** Mellon talks to Google's Gmail and Calendar APIs only to do what is described above.
- **No one else.** Mellon has no analytics, no ads and no tracking. It does not sell, share or transfer your data to anyone else.

## What is stored, and where

Everything Mellon stores stays in Chrome's local storage on your computer (`chrome.storage`):

- Settings: your Google OAuth client ID, your Claude API key, language, interests and scan range.
- Mellon's notes on each email: title, one-line summary, action, deadline, category, key details, sender, subject and date. Translations of those notes if you use Korean.
- What you did: which updates you marked done, discarded, marked safe or corrected, and which events you added to your calendar.
- A running count of Claude tokens used, so Settings can estimate cost.

Google sign-in tokens are kept in memory only and are cleared when Chrome closes. The full text of your emails is not stored. It is fetched from Gmail when needed and kept on screen only. Ask Mellon conversations are also kept in memory only.

## How to remove your data

- **Settings → Forget saved results** deletes Mellon's notes and translations.
- **Settings → Sign out** clears your Google sign-in.
- **Removing the extension** from Chrome deletes everything Mellon stored.
- To remove Mellon's access to your Google account, go to [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

## Google API Services User Data Policy

Mellon's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements. Google user data is used only to provide Mellon's features shown in its interface. It is not used for advertising, it is not sold, and no person reads it. It is transferred only to the Claude API to provide those features.

## Contact

Questions about this policy: [shleychae@gmail.com](mailto:shleychae@gmail.com)
