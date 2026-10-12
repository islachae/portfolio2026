/**
 * Jellycat of the Day: what's in the claw machine and everything it says.
 * The 3D for each plush is in components/jellycat/plush.ts, picked by `id`.
 */

export type JellycatId = "sun" | "cursor" | "scottie" | "baseball" | "taxi" | "clawd";

export type Jellycat = {
  id: JellycatId;
  name: string;
  /** where it sits on the machine's floor, left to right (the chute is at the far left) */
  x: number;
  /** a little turn, so the row doesn't look lined up by a ruler */
  yaw: number;
  /** how it flops in the machine: tipped back (x) and over to one side (z), in radians */
  slump?: [number, number];
  /** a little forward (+) or back (−) from the claw's line */
  z?: number;
  /** size in the machine (0.64 when left out) */
  scale?: number;
  /** its turn when it's out on show (0, facing you, when left out) */
  showYaw?: number;
  /** today's fortune is one of these, the same one all day */
  lines: string[];
};

export const jellycats: Jellycat[] = [
  {
    id: "sun",
    name: "Fluffy Sun",
    x: -2.67,
    yaw: 0.15,
    slump: [-0.42, 0.18],
    z: -0.12,
    lines: [
      "A window seat brings you luck today.",
      "Little things will make you laugh out loud today.",
      "Take a ten-minute walk in the sun and something good will happen.",
    ],
  },
  {
    id: "cursor",
    name: "Fluffy Cursor",
    x: -1.12,
    yaw: -0.1,
    slump: [-0.12, 0.55],
    lines: [
      "Today is the day to click the thing you keep putting off.",
      "Try one new thing, like opening a fresh tab.",
      "One quick save and your mind will feel lighter.",
    ],
  },
  {
    id: "scottie",
    name: "Scottie",
    x: -0.28,
    yaw: -0.2,
    slump: [-0.22, 0.3],
    scale: 0.7,
    lines: [
      "A brisk walk will sort out whatever is on your mind.",
      "Stick with the plan. It is working.",
      "Wear something cozy today. Good things follow.",
    ],
  },
  {
    id: "baseball",
    name: "Baseball",
    x: 0.9,
    yaw: 0.12,
    slump: [-0.36, 0.3],
    z: 0.12,
    scale: 0.62,
    lines: [
      "Swing at the first good pitch that comes your way today.",
      "You don’t need a home run today. A base hit will do.",
      "Keep your eye on the ball and the rest will follow.",
    ],
  },
  {
    id: "taxi",
    name: "NYC Taxi",
    x: 2.33,
    yaw: -0.75,
    slump: [0, 0.2],
    scale: 0.66,
    showYaw: -0.95,
    lines: [
      "Hail the chance when you see it. It won’t wait at the corner.",
      "Take the long way home. Something good is on that block.",
      "Someone is on their way to you with good news.",
    ],
  },
  {
    id: "clawd",
    name: "Clawd",
    x: 3.95,
    yaw: -0.25,
    slump: [-0.5, -0.12],
    z: -0.15,
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
  canvas: "A claw machine holding Fluffy Sun, Fluffy Cursor, Scottie, Baseball, NYC Taxi and Clawd. Move the claw with the arrow keys and press Space to grab.",
};
