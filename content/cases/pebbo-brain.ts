/**
 * Pebbo's brain for the “Try Pebbo” demo at the end of the case study.
 *
 * askPebbo() answers in this order:
 *  1. Safety first, always local: anything that sounds like self-harm or purging gets the care
 *     reply (no model is asked).
 *  2. A live model, when one is reachable:
 *     - inside a claude.ai artifact viewer, Claude itself (the `sample` capability: the viewer is
 *       asked once, and it runs on the viewer's own Claude account);
 *     - or your own endpoint, if NEXT_PUBLIC_PEBBO_API is set at build time (see
 *       examples/pebbo-worker.js: a tiny server that holds the API key and PEBBO_RULES).
 *  3. Otherwise the scripted listener below: it reads feelings, foods and meals from what was
 *     typed (English or Korean), answers in the same language, and picks one suggestion.
 *
 * Every path returns the same shape, so the phone UI never cares which one answered.
 */

export type Mood = "calm" | "anxious" | "low";
export type Kind = "log" | "explore" | "quest" | "peek";
export type Suggestion = { kind: Kind; title: string; text?: string };
export type Turn = { role: "user" | "assistant"; content: string };
/** Pebbo's faces: Chaewon's character drawings in public/work/pebbo-case/faces/<face>.svg */
export const FACES = ["happy", "content", "curious", "surprised", "excited", "cheerful", "singing", "worried", "nervous", "uneasy", "tired", "down", "sad", "drained", "dizzy", "frustrated", "annoyed"] as const;
export type Face = (typeof FACES)[number];
export const faceSrc = (f: Face) => `/work/pebbo-case/faces/${f}.svg`;
/** Each face's glow colour (the first stop of its outer gradient), for the halo that eases between moods. */
export const FACE_COLOR: Record<Face, string> = {
  happy: "#EDC855", content: "#F3A634", curious: "#EDC855", surprised: "#E6C72B", excited: "#E898C8", cheerful: "#FFAAD5",
  singing: "#FCEB37", worried: "#57B4EA", nervous: "#57B4EA", uneasy: "#9572C6", tired: "#57B4EA", down: "#57B4EA",
  sad: "#57B4EA", drained: "#959595", dizzy: "#959595", frustrated: "#FB9241", annoyed: "#D2534F",
};
const MOOD_FACE: Record<Mood, Face> = { calm: "happy", anxious: "worried", low: "down" };

export type PebboAnswer = {
  reply: string;
  mood: Mood | null;
  /** the face Pebbo shows: it mirrors the mood of your words */
  face: Face;
  /** a short name for the pattern behind the answer, for the reasoning table (none for small talk) */
  pattern: string | null;
  suggestion: Suggestion | null;
  /** words or phrases from the message that shaped the answer */
  noticed: string[];
  why: string;
  safety?: boolean;
  source: "live" | "script";
};
type Lang = "en" | "ko";

/* ───────────── The rules a live model answers by (also copied into examples/pebbo-worker.js) ───────────── */

export const PEBBO_RULES = `You are Pebbo, a gentle AI companion in a design portfolio demo (the Pebbo concept by Chaewon Lim). People tell Pebbo how eating felt today. Pebbo listens first and turns guilt into gentle awareness.

How to answer:
- Answer in the same language the person wrote in.
- 1 to 3 short sentences, warm and plain, like a kind friend. Reflect what they said in their own words (name the food, meal or moment they mentioned). You may end with one soft question. No lectures, no lists.
- Never count calories, mention weight, BMI or diets, call foods good or bad, or suggest making up for eating (skipping meals, exercising it off). Never diagnose.
- Offer at most one small, optional suggestion, as one of: "log" (a small win or feeling noted for later), "explore" (a simple, comforting food idea or recipe), "quest" (one tiny, doable action for today), "peek" (a gentle look back at a pattern). Title under 60 characters, text under 110 characters, same language as the reply. Use null when a suggestion would not fit (a greeting, a question about Pebbo).
- If the message is unrelated to eating or feelings, answer briefly and kindly bring it back.
- If they mention self-harm, purging or wanting to die, reply only with care, encourage them to reach the National Alliance for Eating Disorders or to call or text 988 in the US, and set suggestion to null.
- "mood" is your read of their mood: "calm", "anxious" (tense, stressed, restless) or "low" (sad, tired, guilty, heavy).
- "noticed": 1 to 4 short words or phrases copied exactly from their message that shaped your reading.
- "why": one sentence, in the reply's language, on why you answered this way, starting from what you noticed.
- "face": the Pebbo face that mirrors their mood, one of "happy", "content", "curious", "surprised", "excited", "cheerful", "singing", "worried", "nervous", "uneasy", "tired", "down", "sad", "drained", "dizzy", "frustrated", "annoyed".
- "pattern": a 2 to 4 word name for the eating or feeling pattern you noticed (like "Evening cravings" or "Skipped meals"), or null for small talk.

Reply with only this JSON:
{"reply": "...", "mood": "calm" | "anxious" | "low", "face": "...", "pattern": "..." | null, "suggestion": {"kind": "log" | "explore" | "quest" | "peek", "title": "...", "text": "..."} | null, "noticed": ["..."], "why": "..."}`;

/* ───────────── Safety (always checked here first) ───────────── */

const RISK = {
  en: ["suicide", "suicidal", "kill myself", "killing myself", "want to die", "wanna die", "end my life", "end it all", "self harm", "self-harm", "hurt myself", "cut myself", "purge", "purging", "make myself sick", "made myself sick", "throw up", "threw up", "throwing up", "vomit", "starve myself", "starving myself"],
  ko: ["죽고 싶", "죽고싶", "자살", "자해", "사라지고 싶", "사라지고싶", "토했", "토하고", "토하게", "억지로 토", "구토", "굶어 죽"],
};
const SAFETY = {
  en: {
    reply: "Thank you for trusting me with that. I’m only a portfolio demo, so I can’t support you the way a person can, and you deserve real support. The National Alliance for Eating Disorders can help, and in the US you can call or text 988 any time.",
    why: "When Pebbo hears risk, it steps aside and points to people who can help.",
  },
  ko: {
    reply: "말해줘서 고마워요. 저는 포트폴리오 데모라서 사람처럼 곁에서 도와줄 수는 없어요. 당신은 진짜 도움을 받을 자격이 있어요. 한국에서는 109(자살예방상담전화)나 1577-0199(정신건강위기상담)에 언제든 연락할 수 있어요.",
    why: "위험한 신호가 들리면 Pebbo는 한 발 물러서서 도와줄 수 있는 사람들을 알려줘요.",
  },
};

/* ───────────── The scripted listener ───────────── */

type Cat = "skipped" | "overate" | "guilt" | "craving" | "stress" | "low" | "social" | "diet" | "win" | "idea" | "workout";

/** Word starts to look for, per language. English matches at a word start (“stress” finds “stressed”). */
const LEX: Record<Cat, { en: string[]; ko: string[] }> = {
  skipped: {
    en: ["skip", "didn't eat", "didnt eat", "did not eat", "haven't eaten", "havent eaten", "forgot to eat", "no time to eat", "not hungry", "no appetite", "barely ate", "only had coffee", "fasting"],
    ko: ["굶", "안 먹", "안먹", "못 먹", "못먹", "거르", "걸렀", "입맛", "식욕", "커피만"],
  },
  overate: {
    en: ["too much", "overate", "over ate", "overeat", "binge", "binged", "stuffed", "so full", "ate a lot", "ate so much", "whole bag", "whole box", "whole pizza", "whole pint", "couldn't stop", "couldnt stop", "kept eating", "seconds and thirds"],
    ko: ["폭식", "과식", "많이 먹", "너무 먹", "배 터", "배터", "멈출 수", "계속 먹", "한 봉지 다", "다 먹어"],
  },
  guilt: {
    en: ["guilt", "ashamed", "shame", "gross", "disgust", "hate myself", "regret", "feel bad", "felt bad", "ruined", "failed", "no self control", "weak", "should not have", "shouldn't have", "shouldnt have"],
    ko: ["죄책", "후회", "한심", "부끄", "망했", "자책", "역겨", "미워", "실패"],
  },
  craving: {
    en: ["crav", "sweet", "sugar", "dessert", "snack", "junk", "fast food", "late night", "midnight", "want something", "needed something", "hungry", "starving"],
    ko: ["당기", "땡기", "땡겨", "당겨", "먹고 싶", "먹고싶", "단 거", "단거", "달달", "달콤", "디저트", "야식", "군것질", "간식"],
  },
  stress: {
    en: ["stress", "anxious", "anxiety", "worried", "worry", "pressure", "deadline", "exam", "busy", "overwhelm", "work ", "at work", "workload", "working late", "job", "rushed", "panic", "nervous", "hectic", "boss", "yell", "fight", "argu", "angry", "mad at", "frustrat", "upset", "annoyed"],
    ko: ["스트레스", "불안", "바쁘", "바빠", "마감", "시험", "과제", "회사", "일이 많", "초조", "긴장", "정신없", "화나", "짜증", "싸웠", "혼났", "상사"],
  },
  low: {
    en: ["tired", "exhausted", "sad", "lonely", "alone", "down", "depress", "numb", "empty", "bored", "heavy", "awful", "bad day", "cry", "cried", "miserable", "drained"],
    ko: ["피곤", "지쳤", "지쳐", "우울", "슬프", "슬퍼", "외로", "무기력", "힘들", "힘든", "지루", "울었", "공허"],
  },
  social: {
    en: ["friend", "party", "family", "date", "restaurant", "eating out", "dinner out", "coworker", "team lunch", "everyone", "people", "roommate", "mom", "dad"],
    ko: ["친구", "가족", "회식", "모임", "외식", "데이트", "사람들", "엄마", "아빠", "동료"],
  },
  diet: {
    en: ["calorie", "diet", "weight", "fat ", "fatty", "lose weight", "carb", "macro", "bmi", "skinny", "burn it off"],
    ko: ["칼로리", "다이어트", "살 빼", "살빼", "살쪘", "살 쪘", "체중", "몸무게", "탄수화물"],
  },
  win: {
    en: ["cooked", "made ", "homemade", "proud", "enjoy", "delicious", "tasty", "happy", "good", "great", "nice", "better", "slowly", "mindful", "veggie", "vegetable", "salad", "fruit", "real breakfast", "balanced", "calm", "loved it", "fun", "laugh", "love"],
    ko: ["요리", "만들어", "만들었", "뿌듯", "맛있", "잘 먹", "잘먹", "행복", "좋았", "좋아", "천천히", "채소", "야채", "샐러드", "과일", "편안", "재밌", "즐거"],
  },
  workout: {
    en: ["worked out", "work out", "workout", "gym", "exercise", "exercising", "ran ", "went running", "running", "yoga", "pilates", "hike", "hiked", "long walk", "swim"],
    ko: ["운동", "헬스", "러닝", "달렸", "뛰었", "요가", "필라테스", "산책", "수영"],
  },
  idea: {
    en: ["recipe", "idea", "what should i eat", "what to eat", "suggest", "what can i make", "dinner idea"],
    ko: ["뭐 먹", "뭘 먹", "레시피", "추천", "배고", "메뉴"],
  },
};

const WEIGHT: Record<Cat, number> = { skipped: 1.2, overate: 1.3, guilt: 1.4, craving: 1, stress: 1, low: 1.1, social: 0.9, diet: 1.3, win: 0.8, idea: 1, workout: 1.3 };

const FOODS = {
  en: ["pizza", "chips", "burger", "fries", "ramen", "noodles", "pasta", "rice", "salad", "sandwich", "cake", "cookies", "cookie", "chocolate", "ice cream", "candy", "donut", "bread", "toast", "cereal", "yogurt", "fruit", "soup", "sushi", "tacos", "burrito", "snacks", "coffee", "boba", "cheesecake", "brownie", "pancakes", "eggs", "avocado toast", "fried chicken", "chicken", "dumplings", "popcorn", "crackers", "cake pop", "sweets", "something sweet", "dessert"],
  ko: ["라면", "치킨", "떡볶이", "피자", "과자", "빵", "케이크", "초콜릿", "아이스크림", "밥", "샐러드", "커피", "햄버거", "김밥", "마라탕", "도넛", "쿠키", "떡", "국밥", "편의점"],
};
const MEALS = {
  en: [["breakfast", "breakfast"], ["lunch", "lunch"], ["dinner", "dinner"], ["brunch", "brunch"], ["supper", "dinner"], ["late night", "a late-night snack"], ["midnight", "a midnight snack"]],
  ko: [["아침", "아침"], ["점심", "점심"], ["저녁", "저녁"], ["야식", "야식"], ["브런치", "브런치"]],
} as const;

/**
 * One answer type. `reply` is used as is; `withFood` / `withMeal` are used instead when the message
 * named a food or a meal ({food} / {meal} fill in; in Korean {food:이가}, {meal:을를} also pick the
 * right particle). Variants are picked by the message, so the same message gets the same answer.
 */
type Script = { reply: string[]; withFood?: string[]; withMeal?: string[]; mood: Mood | null; s: Suggestion | null; why: string };
type Key = Cat | "askLog" | "askQuest" | "askPeek" | "loop" | "food" | "greet" | "thanks" | "who" | "yes" | "no" | "more" | "unknown" | "offtopic";

const FACE: Record<Key, Face> = {
  loop: "uneasy", skipped: "tired", overate: "uneasy", guilt: "down", craving: "excited", stress: "nervous", low: "sad",
  social: "worried", diet: "dizzy", win: "singing", idea: "content", workout: "cheerful", food: "curious", askLog: "cheerful", askQuest: "content",
  askPeek: "happy", greet: "happy", thanks: "cheerful", who: "happy", yes: "curious", no: "content", more: "happy",
  unknown: "curious", offtopic: "surprised",
};
const PATTERN: Record<Lang, Partial<Record<Key, string>>> = {
  en: {
    loop: "Skip → binge loop", skipped: "Skipped meals", overate: "Eating past full", guilt: "Guilt after eating",
    craving: "Evening cravings", stress: "Stress eating", low: "Low-energy days", social: "Social eating pressure",
    diet: "Numbers talk", win: "Positive reflection", idea: "Asking for ideas", askPeek: "Rest after long days",
    workout: "Hunger after exercise", askQuest: "Small daily quests", askLog: "Logging small wins",
  },
  ko: {
    loop: "굶기 → 폭식", skipped: "끼니 거르기", overate: "배부른데 더 먹기", guilt: "먹고 난 죄책감",
    craving: "저녁 식욕", stress: "스트레스성 식사", low: "기운 없는 날", social: "같이 먹을 때의 압박",
    diet: "숫자 얘기", win: "긍정적인 회고", idea: "메뉴 고민", askPeek: "긴 하루 뒤의 휴식",
    workout: "운동 후 허기", askQuest: "작은 하루 퀘스트", askLog: "작은 성공 기록",
  },
};

const COPY: Record<Lang, Record<Key, Script>> = {
  en: {
    loop: {
      withMeal: ["Skipping {meal} and then eating a lot later is your body catching up, not a lack of willpower. It happens to so many people."],
      reply: ["Going without and then eating a lot is a loop so many people know. It isn’t a failure, it’s hunger doing its job."],
      mood: "low",
      s: { kind: "quest", title: "A small snack mid-afternoon tomorrow", text: "So evening doesn’t arrive starving. Anything counts." },
      why: "You mentioned skipping and then eating a lot, the restrict–binge loop from Pebbo’s research, so the suggestion closes the gap instead of fighting the craving.",
    },
    skipped: {
      withMeal: ["Skipping {meal} on a full day happens, and it isn’t a failure. Your body was busy carrying everything else."],
      reply: ["That sounds like a stretched day. Missing a meal doesn’t say anything about you. It says the day was a lot."],
      mood: "anxious",
      s: { kind: "quest", title: "Something small and warm before bed", text: "Tea and toast count. So does a bowl of anything." },
      why: "A skipped meal usually comes back later as a strong craving, so the suggestion is small and for tonight.",
    },
    overate: {
      withFood: ["Thank you for telling me about the {food}. One big meal doesn’t undo anything, and your body knows how to handle it."],
      reply: ["Eating more than you planned is really common. One big meal doesn’t undo anything, and nothing about today needs fixing tonight."],
      mood: "low",
      s: { kind: "log", title: "Note one part of it you enjoyed", text: "Taste, company, the moment. It all counts." },
      why: "Pebbo answers the feeling around the food, not the amount, so there’s nothing to make up for.",
    },
    guilt: {
      withFood: ["That guilt sounds heavy. Food isn’t a test you can fail, and the {food} doesn’t get a vote on who you are."],
      reply: ["Thank you for saying it out loud. Guilt tends to make the next meal harder, not easier, so let’s put it down for tonight."],
      mood: "low",
      s: { kind: "log", title: "Write one kind sentence to yourself", text: "The one you’d say to a friend who told you the same thing." },
      why: "Guilt words came up, so Pebbo answers the feeling first and leaves the food alone.",
    },
    craving: {
      withFood: ["Wanting {food} after a long day is natural. It’s often a wish for comfort, not a lack of willpower."],
      reply: ["Cravings are information, not a problem. After a long day they’re often a wish for comfort, not a lack of willpower."],
      mood: "anxious",
      s: { kind: "explore", title: "No-guilt yogurt bark for sweet cravings", text: "Greek yogurt, honey, berries. Freeze for two hours." },
      why: "You mentioned a craving. Evening cravings often follow tiring days, so Pebbo offers something to try, not a rule.",
    },
    stress: {
      reply: ["That sounds like a lot to carry. When days get this full, eating often turns into something to squeeze in.", "Stress changes how hungry we feel, in both directions. It makes sense if eating felt off today."],
      mood: "anxious",
      s: { kind: "quest", title: "One meal today, sitting down", text: "Phone face down, even for five minutes." },
      why: "Stress came up, and stress often turns eating into multitasking, so the suggestion is about slowing one meal down.",
    },
    low: {
      reply: ["I’m sorry today felt heavy. You don’t have to fix anything tonight.", "It sounds like you’re running low. Eating can feel like one more thing on days like this, and that’s okay."],
      mood: "low",
      s: { kind: "peek", title: "Last week you rested twice, on purpose", text: "Pebbo noticed. Rest counts as taking care of yourself." },
      why: "Low-energy words came up, so Pebbo looks back at what went okay instead of asking for more.",
    },
    social: {
      reply: ["Eating with other people can bring its own pressure. You’re allowed to simply enjoy the table.", "Meals with people are about more than food. It makes sense if it felt like a lot, or a lot of fun."],
      mood: "anxious",
      s: { kind: "quest", title: "Next time, pick one dish just because", text: "Because it sounds good, not because it seems right." },
      why: "Other people came up, and eating together is where the pressure to eat “right” often shows up.",
    },
    diet: {
      reply: ["I don’t count calories or weigh anything, and I won’t start. I’m more curious how eating felt for you today."],
      mood: "anxious",
      s: { kind: "log", title: "One thing your body did for you today", text: "Walked you somewhere, got you through a meeting. Anything." },
      why: "Diet and number words came up. Pebbo stays away from calories and weight by design and turns back to how it felt.",
    },
    win: {
      withFood: ["That’s worth noticing. {Food} you enjoyed is a small win, and habits are built from small wins."],
      reply: ["That’s worth noticing. A meal you enjoyed is a small win, and habits are built from small wins.", "I love that. Moments like this are easy to forget, so let’s keep this one."],
      mood: "calm",
      s: { kind: "log", title: "Small win, saved", text: "Pebbo will bring it back on a harder day." },
      why: "Positive words came up, so Pebbo keeps it as a win to show you later.",
    },
    workout: {
      withFood: ["Wanting {food} after a workout is natural. Your body used a lot of energy, and moving was a good choice too."],
      reply: ["Craving carbs or sweets after a workout is natural. Your body used a lot of energy, and working out was a good choice too."],
      mood: "calm",
      s: { kind: "log", title: "A workout today, saved as a win", text: "Pebbo will remind you how it felt." },
      why: "You mentioned working out and getting hungry after, so Pebbo explains the hunger instead of judging the snack.",
    },
    idea: {
      reply: ["Let’s keep it easy and comforting. Here’s one idea you can make in a few minutes."],
      mood: "calm",
      s: { kind: "explore", title: "Warm rice bowl with a soft egg", text: "Leftover rice, one egg, soy sauce, sesame. Five minutes." },
      why: "You asked what to eat, so Pebbo offers one easy idea instead of a plan.",
    },
    food: {
      reply: ["{Food} sounds good. How did it feel while you were eating it: calm, rushed, or somewhere in between?"],
      mood: "calm",
      s: null,
      why: "You named a food but not a feeling yet, so Pebbo asks about the moment instead of the food.",
    },
    askLog: {
      reply: ["I’d love to keep it. What was the win? Tiny ones count the most."],
      mood: "calm",
      s: null,
      why: "You asked to log something, so Pebbo makes room for it instead of guessing what it was.",
    },
    askQuest: {
      reply: ["Here’s one. It takes a minute, and there’s no wrong way to do it."],
      mood: "calm",
      s: { kind: "quest", title: "Remember how your first bite tasted", text: "Take one minute. What did it remind you of?" },
      why: "You asked for something to do, so Pebbo offers one small, sensory quest instead of a goal.",
    },
    askPeek: {
      reply: ["You checked in four times this week. Evenings were harder, and you gave yourself rest twice. That counts."],
      mood: "calm",
      s: { kind: "peek", title: "This week · You gave yourself permission to rest", text: "Tired evenings came after long days, not after “bad” meals." },
      why: "You asked for a look back, so Pebbo shows a pattern from your check-ins, not a score. (Demo week.)",
    },
    greet: { reply: ["Hi, I’m glad you’re here. How did eating feel today?"], mood: "calm", s: null, why: "A hello gets a hello back, then one open question." },
    thanks: { reply: ["Anytime. I’ll be here tomorrow too."], mood: "calm", s: null, why: "A thank-you closes the moment gently." },
    who: {
      reply: ["I’m Pebbo, a companion that listens when eating feels heavy. In this demo I only chat, but the real Pebbo also hangs on your keychain. How did eating feel today?"],
      mood: "calm",
      s: null,
      why: "You asked about Pebbo, so Pebbo introduces itself and turns back to you.",
    },
    yes: { reply: ["I’m listening. Tell me a little more: what did you eat, and what was going on around it?"], mood: "calm", s: null, why: "A short yes is an invitation, so Pebbo asks one open question." },
    no: { reply: ["That’s okay. You don’t have to say more. I’m here if anything comes up later."], mood: "calm", s: null, why: "A no is respected as it is." },
    more: {
      reply: ["Thank you for telling me more. However the eating went, how you felt counts too."],
      mood: "calm",
      s: { kind: "log", title: "Note one kind thing about today", text: "Even something tiny." },
      why: "You kept sharing without a clear feeling word, so Pebbo thanks you and keeps it light.",
    },
    unknown: { reply: ["I’m listening. What did you eat, and how did it feel?"], mood: null, s: null, why: "No clear feeling or food came through yet, so Pebbo asks instead of guessing." },
    offtopic: { reply: ["I’m better at food and feelings than that. How did eating go today?"], mood: "calm", s: null, why: "The message wasn’t about eating or feelings, so Pebbo gently turns back." },
  },
  ko: {
    loop: {
      withMeal: ["{meal:을를} 거르고 나중에 많이 먹게 되는 건 의지가 약해서가 아니라 몸이 채우려는 거예요. 정말 많은 사람들이 겪어요."],
      reply: ["굶었다가 많이 먹게 되는 건 의지가 약해서가 아니라 몸이 채우려는 거예요. 정말 많은 사람들이 겪어요."],
      mood: "low",
      s: { kind: "quest", title: "내일은 오후에 작은 간식 하나", text: "저녁에 너무 배고프지 않게요. 뭐든 괜찮아요." },
      why: "굶었다가 많이 먹었다는 말에서 Pebbo 리서치의 '제한–폭식' 고리가 보여서, 식욕과 싸우기보다 공백을 줄이는 제안을 했어요.",
    },
    skipped: {
      withMeal: ["바쁜 날엔 {meal:을를} 거를 수도 있어요. 실패가 아니에요. 오늘 하루가 그만큼 벅찼다는 뜻이에요."],
      reply: ["바쁜 날엔 끼니를 거를 수도 있어요. 실패가 아니에요. 오늘 하루가 그만큼 벅찼다는 뜻이에요."],
      mood: "anxious",
      s: { kind: "quest", title: "자기 전에 따뜻한 거 조금", text: "차 한 잔에 토스트도 충분해요." },
      why: "거른 끼니는 나중에 강한 식욕으로 돌아오기 쉬워서, 오늘 밤에 할 수 있는 작은 제안을 했어요.",
    },
    overate: {
      withFood: ["{food} 얘기 해줘서 고마워요. 한 번 많이 먹은 걸로 무너지는 건 없어요. 몸은 알아서 잘 소화해요."],
      reply: ["생각보다 많이 먹는 건 정말 흔한 일이에요. 한 번 많이 먹은 걸로 무너지는 건 없어요."],
      mood: "low",
      s: { kind: "log", title: "좋았던 부분 하나만 적어보기", text: "맛, 같이 먹은 사람, 그 순간. 다 괜찮아요." },
      why: "Pebbo는 먹은 양이 아니라 그 주변의 감정에 답해요. 만회할 건 없어요.",
    },
    guilt: {
      reply: ["죄책감이 무겁게 느껴지네요. 음식은 통과해야 하는 시험이 아니에요. 오늘 밤은 그 마음을 잠깐 내려놔도 돼요."],
      mood: "low",
      s: { kind: "log", title: "나에게 다정한 한 문장 쓰기", text: "친구가 같은 말을 했다면 해줬을 그 말이요." },
      why: "죄책감이 담긴 말이 보여서, 음식보다 마음에 먼저 답했어요.",
    },
    craving: {
      withFood: ["긴 하루 끝에 {food:이가} 당기는 건 자연스러워요. 의지가 약한 게 아니라 위로가 필요한 걸 수도 있어요."],
      reply: ["긴 하루 끝에 뭔가 당기는 건 자연스러워요. 의지가 약한 게 아니라 위로가 필요한 걸 수도 있어요."],
      mood: "anxious",
      s: { kind: "explore", title: "죄책감 없는 요거트 바크", text: "그릭요거트, 꿀, 베리. 두 시간 얼리면 끝." },
      why: "당긴다는 말이 있었어요. 저녁 식욕은 지친 날 뒤에 오기 쉬워서, 규칙 대신 해볼 만한 걸 제안했어요.",
    },
    stress: {
      reply: ["많이 버거운 하루였나 봐요. 이렇게 바쁠 땐 먹는 게 틈틈이 욱여넣는 일이 되기 쉬워요."],
      mood: "anxious",
      s: { kind: "quest", title: "오늘 한 끼는 앉아서 먹기", text: "5분이라도 폰은 엎어두고요." },
      why: "스트레스가 보였어요. 스트레스는 먹는 걸 멀티태스킹으로 만들기 쉬워서, 한 끼를 천천히 먹는 제안을 했어요.",
    },
    low: {
      reply: ["오늘 마음이 무거웠군요. 오늘 밤 뭔가를 고치지 않아도 괜찮아요."],
      mood: "low",
      s: { kind: "peek", title: "지난주에 두 번, 일부러 쉬었어요", text: "Pebbo가 봤어요. 쉬는 것도 나를 돌보는 거예요." },
      why: "기운 없는 말들이 보여서, 더 하라고 하기보다 잘 됐던 걸 돌아봤어요.",
    },
    social: {
      reply: ["사람들과 먹을 땐 그 나름의 부담이 있죠. 그냥 그 자리를 즐겨도 괜찮아요."],
      mood: "anxious",
      s: { kind: "quest", title: "다음엔 먹고 싶은 메뉴 하나 고르기", text: "맞아 보이는 거 말고, 맛있어 보이는 걸로요." },
      why: "다른 사람들이 등장했어요. 같이 먹는 자리에서 '제대로 먹어야 한다'는 압박이 자주 생겨요.",
    },
    diet: {
      reply: ["저는 칼로리나 몸무게는 세지 않아요. 오늘 먹을 때 기분이 어땠는지가 더 궁금해요."],
      mood: "anxious",
      s: { kind: "log", title: "오늘 내 몸이 해준 일 하나 적기", text: "어딘가로 데려다줬거나, 하루를 버텨줬거나. 뭐든요." },
      why: "다이어트나 숫자 얘기가 나왔어요. Pebbo는 일부러 칼로리와 체중에서 거리를 두고, 감정으로 돌아가요.",
    },
    win: {
      reply: ["그거 꼭 기억해둘 만해요. 즐겁게 먹은 한 끼는 작은 성공이고, 습관은 그런 작은 성공으로 만들어져요."],
      mood: "calm",
      s: { kind: "log", title: "작은 성공, 저장했어요", text: "힘든 날에 Pebbo가 다시 꺼내 보여줄게요." },
      why: "긍정적인 말들이 보여서, 나중에 보여줄 작은 성공으로 저장했어요.",
    },
    workout: {
      withFood: ["운동 후에 {food:이가} 당기는 건 자연스러워요. 몸이 에너지를 많이 썼거든요. 운동한 것도 정말 잘한 선택이에요."],
      reply: ["운동 후에 탄수화물이나 단 게 당기는 건 자연스러워요. 몸이 에너지를 많이 썼거든요. 운동한 것도 정말 잘한 선택이에요."],
      mood: "calm",
      s: { kind: "log", title: "오늘의 운동, 작은 성공으로 저장", text: "어땠는지 Pebbo가 다시 떠올려줄게요." },
      why: "운동하고 배가 고팠다는 말이 있어서, 간식을 판단하기보다 허기를 설명했어요.",
    },
    idea: {
      reply: ["쉽고 편안한 걸로 해봐요. 몇 분이면 만들 수 있는 아이디어 하나예요."],
      mood: "calm",
      s: { kind: "explore", title: "반숙 달걀 따뜻한 밥 한 그릇", text: "남은 밥, 달걀 하나, 간장, 참기름. 5분이면 돼요." },
      why: "뭘 먹을지 물어봐서, 계획 대신 쉬운 아이디어 하나를 드렸어요.",
    },
    food: {
      reply: ["{food} 좋네요. 먹는 동안 기분은 어땠어요? 편안했는지, 급했는지, 그 사이 어딘가였는지요."],
      mood: "calm",
      s: null,
      why: "음식은 말했지만 기분은 아직이라, 음식보다 그 순간을 물어봤어요.",
    },
    askLog: { reply: ["꼭 기억해둘게요. 어떤 성공이었어요? 아주 작은 것일수록 좋아요."], mood: "calm", s: null, why: "기록하고 싶다고 해서, 추측하지 않고 자리를 비워뒀어요." },
    askQuest: {
      reply: ["하나 드릴게요. 1분이면 되고, 틀린 방법은 없어요."],
      mood: "calm",
      s: { kind: "quest", title: "첫 입의 맛 떠올려보기", text: "1분만요. 무엇이 떠올랐나요?" },
      why: "할 일을 물어봐서, 목표 대신 작은 감각 퀘스트를 드렸어요.",
    },
    askPeek: {
      reply: ["이번 주에 네 번 얘기해줬어요. 저녁이 더 힘들었고, 두 번은 스스로 쉬어줬어요. 그것도 잘한 거예요."],
      mood: "calm",
      s: { kind: "peek", title: "이번 주 · 쉬어도 된다고 허락해줬어요", text: "지친 저녁은 '나쁜' 식사가 아니라 긴 하루 뒤에 왔어요." },
      why: "돌아보고 싶다고 해서, 점수 대신 체크인에서 보인 패턴을 보여줬어요. (데모 주간)",
    },
    greet: { reply: ["안녕하세요, 와줘서 반가워요. 오늘 먹는 건 어땠어요?"], mood: "calm", s: null, why: "인사에는 인사로, 그리고 열린 질문 하나." },
    thanks: { reply: ["언제든요. 내일도 여기 있을게요."], mood: "calm", s: null, why: "고맙다는 말로 부드럽게 마무리했어요." },
    who: {
      reply: ["저는 Pebbo예요. 먹는 게 무겁게 느껴질 때 들어주는 친구예요. 이 데모에선 대화만 하지만, 진짜 Pebbo는 키링으로도 함께해요. 오늘 먹는 건 어땠어요?"],
      mood: "calm",
      s: null,
      why: "Pebbo에 대해 물어봐서 소개하고 다시 당신 얘기로 돌아왔어요.",
    },
    yes: { reply: ["듣고 있어요. 조금 더 얘기해줄래요? 뭘 먹었고, 그때 무슨 일이 있었는지요."], mood: "calm", s: null, why: "짧은 대답은 초대라서, 열린 질문을 하나 했어요." },
    no: { reply: ["괜찮아요. 더 말 안 해도 돼요. 생각나면 언제든 얘기해요."], mood: "calm", s: null, why: "'아니'는 그대로 존중해요." },
    more: {
      reply: ["더 얘기해줘서 고마워요. 어떻게 먹었든, 그때 느낀 마음도 소중해요."],
      mood: "calm",
      s: { kind: "log", title: "오늘의 다정한 순간 하나 적기", text: "아주 작은 것도 괜찮아요." },
      why: "뚜렷한 감정 단어 없이 이야기를 이어가서, 고마움을 전하고 가볍게 이어갔어요.",
    },
    unknown: { reply: ["듣고 있어요. 뭘 먹었고, 기분은 어땠어요?"], mood: null, s: null, why: "아직 감정이나 음식이 뚜렷하지 않아서, 추측하지 않고 물어봤어요." },
    offtopic: { reply: ["그건 제가 잘 모르는 얘기예요. 오늘 먹는 건 어땠어요?"], mood: "calm", s: null, why: "먹는 것이나 감정 얘기가 아니어서, 부드럽게 다시 돌아왔어요." },
  },
};

const norm = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'ㄱ-ㆎ가-힣 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

/** Where a cue sits in the text (English: at a word start; Korean: anywhere), or -1. */
function find(q: string, cue: string, lang: Lang) {
  return lang === "en" ? q.indexOf(` ${cue}`) : q.indexOf(cue);
}

const NEGATED_WIN = [/ (not|wasn't|wasnt|didn't|didnt|never|no longer) (really |that |very |so )?(good|great|happy|enjoy|nice|tasty|delicious|proud|calm|better)/, / 안 ?좋| 별로| 맛없| 안 ?행복/];
const GREETING = /^ (hi|hello|hey|yo|hiya|good (morning|evening|afternoon)|안녕|하이|헬로)( there| pebbo| 페보)?[ !.]*$/;
const THANKS = / (thank|thanks|thx|ty|고마워|고맙|감사)/;
const WHO = / (who are you|what are you|what is pebbo|what's pebbo|what can you do|are you (an )?ai|너 누구|누구야|뭐 하는|넌 뭐)/;
const YES = /^ (yes|yeah|yep|sure|ok|okay|kind of|kinda|maybe|응|네|어|그래|웅|좀)[ !.]*$/;
const ASK_PEEK = / (how (has|was) my week|my week been|look back|this week so far|이번 ?주 어땠|일주일 어땠|돌아보)/;
const ASK_LOG = / (note a small win|log a (small )?win|save a win|want to note|작은 성공|기록하고 싶)/;
const ASK_QUEST = / (tiny thing|one small thing|something to do for myself|give me a quest|what can i do for myself|할 일 하나|뭐 하면 좋)/;
const NO = /^ (no|nope|nah|not really|아니|아뇨|별로|노)[ !.]*$/;

function pick<T>(list: T[], seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/** Korean particle after a word: 이/가, 을/를, 은/는 by whether the last syllable has a final consonant. */
function josa(word: string, pair: string) {
  const c = word.charCodeAt(word.length - 1);
  const batchim = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : false;
  return word + (batchim ? pair[0] : pair[1]);
}

/** English foods that read better with “a” (“Wanting a cake pop”), unless the template says “the”. */
const COUNTABLE = new Set(["cake pop", "burger", "sandwich", "donut", "burrito", "cookie", "brownie", "salad", "bagel", "muffin"]);

function fill(t: string, meal: string, food: string) {
  const a = COUNTABLE.has(food) ? `a ${food}` : food;
  return t
    .replace(/\{meal:(..)\}/g, (_, p: string) => josa(meal, p))
    .replace(/\{food:(..)\}/g, (_, p: string) => josa(food, p))
    .replace("{meal}", meal)
    .replace("the {food}", `the ${food}`)
    .replace("{Food}", a.charAt(0).toUpperCase() + a.slice(1))
    .replace("{food}", a);
}

export function listenScripted(text: string, history: Turn[] = []): PebboAnswer {
  const lang: Lang = /[\uac00-\ud7a3]/.test(text) ? "ko" : "en";
  const q = norm(text);
  const words = q.trim() ? q.trim().split(" ").length : 0;
  const out = (key: Key, noticed: string[] = [], meal = "", food = ""): PebboAnswer => {
    const c = COPY[lang][key];
    const list = food && c.withFood ? c.withFood : meal && c.withMeal ? c.withMeal : c.reply;
    return {
      reply: fill(pick(list, text), meal, food),
      mood: c.mood,
      face: FACE[key],
      pattern: PATTERN[lang][key] ?? null,
      suggestion: c.s,
      noticed,
      why: c.why,
      source: "script",
    };
  };

  if (!words) return out("unknown");
  if (GREETING.test(q)) return out("greet");
  if (WHO.test(q)) return out("who");
  if (ASK_PEEK.test(q)) return out("askPeek");
  if (ASK_LOG.test(q)) return out("askLog");
  if (ASK_QUEST.test(q)) return out("askQuest");

  // What was said: feelings and situations (scored), plus the food and meal it was about
  const hits: Partial<Record<Cat, string[]>> = {};
  const score: Partial<Record<Cat, number>> = {};
  for (const cat of Object.keys(LEX) as Cat[]) {
    for (const cue of LEX[cat][lang]) {
      const at = find(q, cue, lang);
      if (at < 0) continue;
      // the word as it was typed (“stressed”, not “stress”)
      const word = lang === "en" && !cue.trim().includes(" ") ? q.slice(at + 1).split(" ")[0] : cue.trim();
      const list = (hits[cat] ??= []);
      if (!list.includes(word)) list.push(word);
      score[cat] = (score[cat] ?? 0) + WEIGHT[cat];
    }
  }
  if (NEGATED_WIN.some((r) => r.test(q))) {
    delete score.win;
    delete hits.win;
    score.low = (score.low ?? 0) + 1.2;
    (hits.low ??= []).push(lang === "ko" ? "별로" : "not good");
  }
  const food = [...FOODS[lang]].sort((a, b) => b.length - a.length).find((f) => find(q, f, lang) >= 0) ?? "";
  const mealHit = MEALS[lang].find(([k]) => find(q, k, lang) >= 0);
  const meal = mealHit ? mealHit[1] : "";

  const ranked = (Object.keys(score) as Cat[]).sort((a, b) => score[b]! - score[a]!);
  const noticed = Array.from(new Set([...ranked.flatMap((c) => hits[c] ?? []), ...(food ? [food] : [])])).slice(0, 4);

  if (!ranked.length) {
    if (THANKS.test(q)) return out("thanks");
    if (YES.test(q)) return out("yes");
    if (NO.test(q)) return out("no");
    if (food) return out("food", [food], meal, food);
    // Pebbo asked something and the answer is a real sentence: thank and keep it light
    if (history.some((t) => t.role === "assistant") && words >= 4) return out("more", [], meal, food);
    return out(/\?/.test(text) ? "offtopic" : "unknown");
  }

  // A few stories matter more than the loudest word
  const has = (c: Cat) => (score[c] ?? 0) > 0;
  let key: Key = ranked[0];
  if (has("skipped") && has("overate")) key = "loop";
  else if (has("diet")) key = "diet";
  else if (has("workout")) key = "workout";
  else if (has("guilt") && (has("overate") || has("craving") || key === "win")) key = "guilt";
  else if (has("skipped") && (has("stress") || has("low"))) key = "skipped";
  else if (key === "craving" && has("overate")) key = "overate";
  else if (key === "win" && has("low")) key = "low";
  else if (key === "social" && has("win")) key = "win";

  return out(key, noticed, meal, food);
}

/* ───────────── Live answers ───────────── */

type SampleFn = ((input: Turn[], opts?: object) => Promise<{ text: string }>) & {
  json: <T>(input: Turn[], opts?: object) => Promise<T>;
};
let livePromise: Promise<SampleFn | null> | null = null;
let liveOff = false;

/** Resolves Claude's `sample` inside a claude.ai artifact viewer, else null (asks nothing). */
export function getLive(): Promise<SampleFn | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!livePromise) {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    livePromise = c?.use
      ? Promise.race([
          c.use("sample").then((s) => (s as SampleFn | null) ?? null).catch(() => null),
          new Promise<null>((r) => setTimeout(() => r(null), 11000)),
        ])
      : Promise.resolve(null);
  }
  return livePromise;
}

const ENDPOINT = process.env.NEXT_PUBLIC_PEBBO_API || "";
export const hasEndpoint = !!ENDPOINT;

function clean(x: unknown): Omit<PebboAnswer, "source"> | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.reply !== "string" || !o.reply.trim()) return null;
  const mood = o.mood === "calm" || o.mood === "anxious" || o.mood === "low" ? o.mood : null;
  let suggestion: Suggestion | null = null;
  const s = o.suggestion as Record<string, unknown> | null | undefined;
  if (s && typeof s === "object" && typeof s.title === "string" && ["log", "explore", "quest", "peek"].includes(String(s.kind))) {
    suggestion = { kind: s.kind as Kind, title: s.title.slice(0, 80), text: typeof s.text === "string" ? s.text.slice(0, 160) : undefined };
  }
  const noticed = Array.isArray(o.noticed) ? o.noticed.filter((w): w is string => typeof w === "string").slice(0, 4) : [];
  const why = typeof o.why === "string" ? o.why : "";
  const face = (FACES as readonly string[]).includes(String(o.face)) ? (o.face as Face) : MOOD_FACE[mood ?? "calm"];
  const pattern = typeof o.pattern === "string" && o.pattern.trim() ? o.pattern.trim().slice(0, 40) : null;
  return { reply: o.reply.trim(), mood, face, pattern, suggestion, noticed, why };
}

function safetyCheck(text: string): PebboAnswer | null {
  const lang: Lang = /[가-힣]/.test(text) ? "ko" : "en";
  const q = norm(text);
  const risk = RISK[lang].filter((k) => (lang === "en" ? q.includes(` ${k}`) : q.includes(k)));
  if (!risk.length) return null;
  return { ...SAFETY[lang], mood: "low", face: "sad", pattern: null, suggestion: null, noticed: risk.slice(0, 3), safety: true, source: "script" };
}

/**
 * One answer for `text`, given the conversation so far (oldest first, without `text`).
 * `signal` stops a live call; the scripted listener is instant.
 */
export async function askPebbo(text: string, history: Turn[], signal?: AbortSignal): Promise<PebboAnswer> {
  const safe = safetyCheck(text);
  if (safe) return safe;
  const turns: Turn[] = [{ role: "user", content: PEBBO_RULES }, ...history.slice(-8), { role: "user", content: text }];

  if (!liveOff) {
    const live = await getLive();
    if (live) {
      try {
        const data = await live.json<unknown>(turns, { modelTier: "quick", cache: false, signal });
        const c = clean(data);
        if (c) return { ...c, source: "live" };
      } catch (e) {
        const code = (e as { code?: string })?.code;
        if (code === "cancelled") throw e;
        // declined, disabled or unavailable: stay scripted for the rest of this visit
        if (code && !["upstream_error", "invalid_json", "rate_limited", "empty_completion"].includes(code)) liveOff = true;
      }
    }
  }
  if (ENDPOINT) {
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...history.slice(-8), { role: "user", content: text }] }),
        signal,
      });
      const c = r.ok ? clean(await r.json()) : null;
      if (c) return { ...c, source: "live" };
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") throw e;
    }
  }
  return listenScripted(text, history);
}
