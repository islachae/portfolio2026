/**
 * Jellycat of the Day: what's in the claw machine and everything it says.
 * The 3D for each plush is in components/jellycat/plush.ts, picked by `id`.
 */

export type JellycatId = "sun" | "cursor" | "scottie" | "clawd";

export type Jellycat = {
  id: JellycatId;
  name: string;
  /** where it sits on the machine's floor, left to right (the chute is at the far left) */
  x: number;
  /** a little turn, so the row doesn't look lined up by a ruler */
  yaw: number;
  /** its height before scaling: the claw stops just above this */
  top: number;
  /** size in the machine (0.64 when left out) */
  scale?: number;
  /** today's fortune is one of these, the same one all day */
  lines: string[];
};

export const jellycats: Jellycat[] = [
  {
    id: "sun",
    name: "Fluffy Sun",
    x: -1.3,
    yaw: 0.15,
    top: 2.36,
    lines: [
      "A window seat brings you luck today.",
      "Little things will make you laugh out loud today.",
      "Take a ten-minute walk in the sun and something good will happen.",
    ],
  },
  {
    id: "cursor",
    name: "Fluffy Cursor",
    x: 0.3,
    yaw: -0.1,
    top: 2.25,
    lines: [
      "Today is the day to click the thing you keep putting off.",
      "Try one new thing, like opening a fresh tab.",
      "One quick save and your mind will feel lighter.",
    ],
  },
  {
    id: "scottie",
    name: "Scottie",
    x: 1.45,
    yaw: -0.2,
    top: 1.8,
    scale: 0.7,
    lines: [
      "A brisk walk will sort out whatever is on your mind.",
      "Stick with the plan. It is working.",
      "Wear something cozy today. Good things follow.",
    ],
  },
  {
    id: "clawd",
    name: "Clawd",
    x: 2.75,
    yaw: -0.25,
    top: 1.3,
    scale: 0.74,
    lines: [
      "Break the big task into small steps and it all gets done.",
      "Ask the question you have been holding. Someone wants to help.",
      "Today’s bug is tomorrow’s best story.",
    ],
  },
];

export const jellycatCopy = {
  hint: "Move the claw with ◀ ▶, then press Grab right above a plush",
  left: "Move the claw left",
  right: "Move the claw right",
  grab: "Grab",
  again: "Play again",
  ofTheDay: "Jellycat of the day",
  slip: "So close! It slipped. Try again?",
  empty: "Empty claw. Press Grab right above a plush.",
  noPick: "No plush picked yet today",
  firstPick: "Today’s first pick: ",
  fan: "Fan project · not affiliated with Jellycat",
  noGL: "This browser can’t draw 3D, so the machine is resting today.",
  canvas: "A claw machine holding Fluffy Sun, Fluffy Cursor, Scottie and Clawd. Move the claw with the arrow keys and press Space to grab.",
};
