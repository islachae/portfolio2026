"use client";

import { useState } from "react";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio inquiry — ${name || "no name"}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}`);
    window.location.href = `mailto:chaewon2@andrew.cmu.edu?subject=${subject}&body=${body}`;
  };

  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="px-6 pb-24 pt-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
              Contact
            </p>
            <h1 className="mt-3 text-4xl font-medium leading-[1.15] tracking-tight sm:text-5xl">
              Let&apos;s talk.
            </h1>
            <p className="mt-5 max-w-md leading-relaxed text-[var(--muted)]">
              I&apos;m available for 2027 summer internships in design and
              product. Send a note and I&apos;ll get back to you.
            </p>

            <div className="mt-8 flex flex-col gap-2 text-sm text-[var(--muted)]">
              <p className="font-medium text-[var(--fg)]">Elsewhere</p>
              <a
                href="https://www.linkedin.com/in/chaewon-lim-7591891a4/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--fg)]"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl border border-solid border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--fg)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl border border-solid border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--fg)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What are you working on?"
                className="rounded-xl border border-solid border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--fg)]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--fg)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Send message
            </button>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
