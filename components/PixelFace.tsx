/**
 * ChaeLLM's face, traced 1:1 from Chaewon's own drawing (the blinking GIF): bob, bangs, ears,
 * tall eyes, flat mouth. Ink is the accent color; the face itself is transparent.
 *
 * Like the GIF, it blinks every ~3s (eyes shut for 180ms). It also blinks right away when
 * `blink` changes (e.g. an answer appears) and on hover of a `.pf-hover` parent.
 * Reduced motion keeps the eyes open.
 */
const HAIR =
  "M163.5 3.2 160 28 124.1 28 120 56 92 56 92 76.6 84.4 84 64.1 84 59.9 127.4 32 132 32 228 0 232 0 376 23.6 376 31.9 384.5 32.5 412.3 44 416.2 44 444 88 444 88 416.4 96.6 408 116 408 116 384 95.4 384 88 376.4 88 232 116 227.9 116 156.6 124.4 148 139.6 148 148 156.6 148 200 168 200 168 84.3 172.6 80 196 84 196 208 215.9 212 220.1 228 288 228 288 132.3 292.5 128.1 320 132 320 228 340 228 344.6 200 368 204 368 228 392 228 396.6 200.1 424 204 424 379.9 396 384 396 408 415.4 408 424 416.4 424 444 468.7 444 472 440.3 472 416.4 479.6 409 488 412.1 491.9 384.8 516 380 516 232 492 228 492 116 452 108 452 68.6 456.3 64 435.4 64 428 56.4 428 28 372.1 28 363.9 0 164.1 0Z" +
  "M56 262 68 264 68 324.7 64.2 328.1 40 323.8 40 264.6 44.3 260Z" +
  "M460 262 472 264 472 324.7 468.2 328.1 444 323.8 444 264.6 448.3 260Z" +
  "M120 416.4 124 436 156 436 156 416Z" +
  "M360 426 360 436 392 436 392 416 360 416Z" +
  "M164 452 164 464 352 464 352 440 164 440Z";

const EYES_OPEN =
  "M160 320 160 360 191.8 360 196 336.2 192 284.7 196.3 280 160 280Z" + "M320 320 320 360 352 360 352 280 320 280Z";

const EYES_SHUT =
  "M161 306 161 308 155 308 155 318 161 318 161 322 195 322 195 318 201 318 201 308 195 308 195 304 161 304Z" +
  "M321 306 321 308 315 308 315 318 321 318 321 322 351 322 351 318 357 318 357 308 351 308 351 304 321 304Z";

export function PixelFace({ size = 24, blink = 0, className }: { size?: number; blink?: number; className?: string }) {
  return (
    <svg
      key={blink}
      viewBox="0 -26 520 520"
      width={size}
      height={size}
      className={`pixel-face${blink ? " pixel-face--blink" : ""}${className ? " " + className : ""}`}
      aria-hidden
    >
      <path className="pf-ink" fillRule="evenodd" d={HAIR} />
      <path className="pf-ink pf-eye" d={EYES_OPEN} />
      <path className="pf-ink pf-shut" d={EYES_SHUT} />
    </svg>
  );
}
