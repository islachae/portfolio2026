/**
 * The tiny visitor poll in the right panel on Home: five quick questions, one at a time.
 * Everything you may want to change is here.
 */
import type { PollIconName } from "@/components/PollIcon";

/**
 * Parked for now: the poll is kept (questions, icons, results, the backend hook) but not shown on
 * the site. Set to true to bring it back under the jump box on Home (below 1200px, where it lived).
 */
export const POLL_ON = false;

export type PollOption = {
  id: string;
  label: string;
  /** Icon on the answer tile (see components/PollIcon.tsx). */
  icon: PollIconName;
  /** How your pick reads on the folded card: “team AI”, “team cat”. */
  team: string;
};
export type PollQuestion = {
  id: string;
  question: string;
  options: PollOption[];
  /**
   * Your own answer. Set an option id (e.g. "cat") to mark that tile “Chaewon’s pick” in the results;
   * visitors who agree see “Me too — Chaewon”. null hides both.
   */
  herPick: string | null;
  /**
   * Used ONLY while no backend is connected (NEXT_PUBLIC_POLL_ENDPOINT unset).
   * The UI labels these as sample results; they are never shown as live data.
   */
  sample: Record<string, number>;
};

export const poll = {
  /** Bump the id to start a fresh poll (old local answers are ignored). */
  id: "tiny-poll-2026",
  /** Small label above the question, and on the folded card before you vote. */
  kicker: "Quick question",
  /** Folded card after you vote: `${teamPrefix} ${option.team}` */
  teamPrefix: "team",
  questions: [
    {
      id: "satisfying",
      question: "What’s your kind of satisfying?",
      options: [
        { id: "inbox", icon: "inbox", label: "Inbox zero", team: "inbox zero" },
        { id: "align", icon: "align", label: "A perfect alignment", team: "alignment" },
        { id: "spark", icon: "spark", label: "A tiny animation", team: "animation" },
      ],
      herPick: null,
      sample: { inbox: 14, align: 19, spark: 11 },
    },
    {
      id: "coworker",
      question: "Who’s your ideal coworker?",
      options: [
        { id: "dog", icon: "dog", label: "A dog", team: "dog" },
        { id: "cat", icon: "cat", label: "A cat", team: "cat" },
      ],
      herPick: null,
      sample: { dog: 23, cat: 19 },
    },
    {
      id: "superpower",
      question: "Pick your superpower.",
      options: [
        { id: "undo", icon: "undo", label: "Undo anything", team: "undo" },
        { id: "pause", icon: "pause", label: "Pause time", team: "pause" },
      ],
      herPick: null,
      sample: { undo: 17, pause: 25 },
    },
    {
      id: "heavy-lifting",
      question: "Who’s doing the heavy lifting?",
      options: [
        { id: "ai", icon: "robot", label: "AI", team: "AI" },
        { id: "brain", icon: "brain", label: "My brain", team: "brain" },
        { id: "coffee", icon: "coffee", label: "Coffee", team: "coffee" },
      ],
      herPick: null,
      sample: { ai: 12, brain: 15, coffee: 18 },
    },
    {
      id: "company",
      question: "A little company?",
      options: [
        { id: "music", icon: "music", label: "Music", team: "music" },
        { id: "silence", icon: "silence", label: "Silence", team: "silence" },
        { id: "cafe", icon: "cafe", label: "Café noise", team: "café" },
      ],
      herPick: null,
      sample: { music: 21, silence: 9, cafe: 13 },
    },
  ] as PollQuestion[],
};
