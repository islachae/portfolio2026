/**
 * Jellycat of the Day: what's in the claw machine and everything it says.
 * The 3D for each plush is in components/jellycat/plush.ts, picked by `id`.
 */

export type JellycatId = "sun" | "cursor" | "scottie" | "parfait" | "baseball" | "matcha" | "taxi" | "clawd";

export type Jellycat = {
  id: JellycatId;
  name: string;
  /** where it sits on the machine's floor, left to right (the chute is at the far left) */
  x: number;
  /** a little turn, so the row doesn't look lined up by a ruler */
  yaw: number;
  /** how it flops in the machine: tipped back (x) and over to one side (z), in radians */
  slump?: [number, number];
  /** forward (+) or back (−) from the claw's line; the claw reaches in to it */
  z?: number;
  /** how high it rests in the pile, on top of the others (0, on the floor, when left out) */
  y?: number;
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
    x: -1.95,
    z: -0.8,
    slump: [-0.42, 0.18],
    yaw: 0.15,
    lines: [
      "A window seat brings you luck today.",
      "Little things will make you laugh out loud today.",
      "Take a ten-minute walk in the sun and something good will happen.",
    ],
  },
  {
    id: "cursor",
    name: "Fluffy Cursor",
    x: -2.65,
    z: 0.55,
    slump: [-0.12, 0.55],
    yaw: -0.1,
    lines: [
      "Today is the day to click the thing you keep putting off.",
      "Try one new thing, like opening a fresh tab.",
      "One quick save and your mind will feel lighter.",
    ],
  },
  {
    id: "scottie",
    name: "Scottie",
    x: -0.5,
    z: 0.6,
    slump: [-0.22, 0.3],
    yaw: -0.2,
    scale: 0.7,
    lines: [
      "A brisk walk will sort out whatever is on your mind.",
      "Stick with the plan. It is working.",
      "Wear something cozy today. Good things follow.",
    ],
  },
  {
    id: "parfait",
    name: "Strawberry Parfait",
    x: 2.05,
    z: -0.25,
    y: 0.52,
    slump: [0.25, 1.15],
    yaw: 0.1,
    scale: 0.6,
    lines: [
      "Today is better in layers. Take it one at a time.",
      "Save the best bite for last. It’s on its way.",
      "A sweet surprise is waiting at the top of your day.",
    ],
  },
  {
    id: "baseball",
    name: "Baseball",
    x: -1.28,
    z: -0.1,
    y: 0.55,
    slump: [-0.62, 0.32],
    yaw: 0.12,
    scale: 0.62,
    lines: [
      "Swing at the first good pitch that comes your way today.",
      "You don’t need a home run today. A base hit will do.",
      "Keep your eye on the ball and the rest will follow.",
    ],
  },
  {
    id: "matcha",
    name: "Matcha Latte",
    x: 0.35,
    z: -0.8,
    slump: [-0.2, -0.26],
    yaw: -0.15,
    scale: 0.62,
    lines: [
      "Slow sips today. You have more time than you think.",
      "A calm start leads to a clear finish.",
      "Whip up something new. It will turn out lovely.",
    ],
  },
  {
    id: "taxi",
    name: "NYC Taxi",
    x: 1.0,
    z: 0.6,
    slump: [0, 0.12],
    yaw: -0.75,
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
    x: 2.9,
    z: -0.85,
    slump: [-0.5, -0.12],
    yaw: -0.25,
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
  canvas: "A claw machine holding Fluffy Sun, Fluffy Cursor, Scottie, Strawberry Parfait, Baseball, Matcha Latte, NYC Taxi and Clawd. Move the claw with the arrow keys and press Space to grab.",
};
