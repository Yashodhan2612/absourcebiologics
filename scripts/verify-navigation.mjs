/**
 * Client-side navigation smoke test.
 *
 * Exists because of a real crash: ScrollTrigger's `pin` wraps its target in a
 * `.pin-spacer` and moves it inside. When that target was the <section> React
 * had rendered into <main>, React's `main.removeChild(section)` on navigation
 * threw "The node to be removed is not a child of this node", which Next
 * escalated into "Application error: a client-side exception has occurred" on
 * every route change. Two things fixed it — pinning an inner wrapper, and
 * tearing GSAP down in a layout effect rather than a passive one — and both
 * are easy to undo by accident, so this guards them.
 *
 *   node scripts/verify-navigation.mjs
 *   BASE=http://localhost:3330 node scripts/verify-navigation.mjs
 *
 * It walks home -> route -> back for every page, exercises browser history,
 * and checks that every legacy 301 in next.config.ts still lands.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3330";

const ROUTES = [
  "/solutions",
  "/solutions/curd-dahi",
  "/solutions/cheese-paneer",
  "/products",
  "/products/cultures/abdahi",
  "/products/ingredients/abpro",
  "/products/taste-makers/abspice",
  "/culture-selector",
  "/services",
  "/services/turnkey-plant-setup",
  "/why-absource",
  "/quality",
  "/about",
  "/about/leadership",
  "/customers",
  "/export",
  "/news",
  "/careers",
  "/contact",
  "/request-a-quote",
  "/downloads",
  "/legal/privacy",
  "/styleguide",
];

/** Legacy URLs redirected in next.config.ts. */
const REDIRECTS = [
  ["/ab-about-us", "/about"],
  ["/management", "/about/leadership"],
  ["/ab-products", "/products"],
  ["/ab-dairy-ingredients", "/products"],
  ["/ab-taste-maker", "/products"],
  ["/ab-our-clientele", "/customers"],
  ["/events-exhibitions", "/news"],
  ["/exhibitions", "/news"],
  ["/ab-careers", "/careers"],
  ["/ab-contact-us", "/contact"],
  ["/Curd-Discovery.html", "/culture-selector"],
];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const failures = [];
let current = [];
page.on("console", (m) => m.type() === "error" && current.push("console: " + m.text().slice(0, 180)));
page.on("pageerror", (e) => current.push("pageerror: " + e.message.slice(0, 180)));

/** Navigate the way a reader does — an in-app link, not a fresh page load. */
async function clientNavigate(href) {
  const clicked = await page.evaluate((target) => {
    const link =
      document.querySelector(`header a[href="${target}"]`) ??
      document.querySelector(`a[href="${target}"]`);
    if (!link) return false;
    link.click();
    return true;
  }, href);
  if (!clicked) await page.goto(`${BASE}${href}`, { waitUntil: "load" });
  await page.waitForTimeout(900);
}

async function crashed() {
  return page.evaluate(() => document.body.innerText.includes("Application error"));
}

console.log(`Base: ${BASE}\n`);
console.log("Client-side navigation, home -> route -> back:");

for (const route of ROUTES) {
  current = [];

  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  // Scroll past the pinned section so the pin is definitely installed before
  // we navigate away. That is the exact condition that used to crash.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, window.innerHeight * 2.2);
  });
  await page.waitForTimeout(700);

  await clientNavigate(route);
  const forwardCrash = await crashed();

  await page.goBack({ waitUntil: "load" });
  await page.waitForTimeout(900);
  const backCrash = await crashed();

  const bad = current.filter((e) => !e.includes("favicon"));
  const ok = !forwardCrash && !backCrash && bad.length === 0;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${route}`);
  if (!ok) {
    failures.push({ route, forwardCrash, backCrash, errors: [...new Set(bad)] });
  }
}

console.log("\nLegacy redirects:");
for (const [from, to] of REDIRECTS) {
  current = [];
  await page.goto(`${BASE}${from}`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const landed = new URL(page.url()).pathname;
  const bad = current.filter((e) => !e.includes("favicon"));
  const ok = landed === to && !(await crashed()) && bad.length === 0;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${from} -> ${landed}${ok ? "" : ` (expected ${to})`}`);
  if (!ok) failures.push({ route: from, landed, expected: to, errors: [...new Set(bad)] });
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error("  " + JSON.stringify(f));
  process.exit(1);
}
console.log("\nAll routes and redirects navigate cleanly.");
