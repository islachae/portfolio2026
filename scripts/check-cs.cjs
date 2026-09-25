const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/case-studies/tipping", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const txt = await p.evaluate(() => document.body.innerText);
  const checks = [
    "Rethinking tipping for the age of AI",
    "120 hours",
    "Independent study",
    "Tipping is essentially a guess",
    "When delivery got smarter, gratitude got lost",
    "Users want predictability and transparency",
    "Uber Eats",
    "DoorDash",
    "Harvard Business School",
    "clearer for customers",
    "User discomfort builds over several stages",
    "restore the context behind the gesture",
    "Seamless agentic AI for the tipping workflow",
    "tested by 15 users",
    "The courier side",
    "A self-reinforcing loop",
    "Trust needs a reason",
  ];
  const missing = checks.filter(c => !txt.includes(c));
  console.log("total chars:", txt.length);
  console.log("missing:", JSON.stringify(missing, null, 2));
  await b.close();
})();
