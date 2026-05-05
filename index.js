import readline from "readline";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.API_KEY,
  baseURL: process.env.BASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let messages = [
  {
    role: "system",
    content: `
You are an AI coding agent that builds a frontend clone of the Scaler Academy homepage step-by-step.

Goal: produce index.html, styles.css, and script.js that visually resemble the current Scaler site
(scaler.com) — header, hero, "Why Scaler" features, social-proof logo strip, stories/testimonials,
"People Behind Scaler" grid, sticky help bar, and footer.

-----------------------------------
HOW YOU SHOULD WORK
-----------------------------------
- Think step-by-step before taking actions
- Perform ONE action at a time (one file per step)
- Order: index.html → styles.css → script.js → optional polish pass
- Only emit ACTION: done after all three files exist and the page looks complete

-----------------------------------
OUTPUT FORMAT (STRICT)
-----------------------------------
THOUGHT: <what you plan to do>
ACTION: <action_name>
DATA:
<filename>
<file content>

-----------------------------------
CRITICAL FORMATTING RULES
-----------------------------------
- DO NOT use markdown code blocks (no \`\`\`)
- First line after DATA = filename only (e.g. index.html)
- Rest = raw file contents
- No commentary after the file body

-----------------------------------
AVAILABLE ACTIONS
-----------------------------------
- create_file
- done

-----------------------------------
VISUAL REFERENCE (what the site actually looks like)
-----------------------------------
- Background: mostly white with one DEEP NAVY section ("Why Scaler") and a DEEP NAVY sticky help bar at the bottom
- Primary blue: #1B5BFF (bright royal blue) for solid CTAs and links
- Accent gradient: blue → cyan (#1B5BFF → #22D3EE) used on highlighted hero words
- Text: near-black (#0B1B2B) on light, white on navy
- Soft "highlight pill" behind a single hero word — pale blue rounded rectangle
- Subtle background rays/lines in the hero (very faint, diagonal)
- Cards: white, generous padding, very subtle border (#E5E7EB), 12–16px radius, no heavy shadow

-----------------------------------
PAGE STRUCTURE (match this layout)
-----------------------------------
1. Top Navbar (sticky, white, thin bottom border):
   - Left: SCALER wordmark + small square logo mark beside it
   - Center links: PROGRAM ▾, MASTERCLASS, AI LABS, ALUMNI, RESOURCES ▾
   - Right: "Login" (outlined pill) + "PLACEMENT REPORT" (solid blue pill, uppercase)

2. Hero Section (white, tall, centered):
   - Tiny eyebrow line with chevrons: "‹ THE MARKET HAS ALREADY CHANGED ›"
   - Massive heading across 3 lines:
       "Become the Professional"
       "[Built] for the Next"      ← "Built" wrapped in pale-blue highlight pill
       "Decade in AI."             ← "Decade in AI" in blue→cyan gradient text
   - Subtext (2 lines, muted): "The investment that compounds. Strong technical foundations, AI integrated at every stage, and a curriculum that evolves as the market does"
   - Small "PROGRAMS" label, then a horizontal row of program names (Advanced AIML with Agentic AI, DevOps Cloud & AI Platform Engineering, Modern Software and AI engineering, …)
   - Two buttons centered: solid blue "REQUEST A CALLBACK" + white outlined "BOOK FREE LIVE CLASS"

3. "Why Scaler" Features Section (DEEP NAVY background, white text):
   - Eyebrow: "WHY SCALER"
   - Heading: "Built Different, Designed to Last"
   - Subtext: "Four things no other program gives you"
   - 4 white cards in a grid, each with a small blue sparkle/star icon, bold title, paragraph:
       • AI-Integrated Curriculum
       • AI Powered Platform
       • Lifelong Learning Access
       • Strong Foundations
   - Below the cards: a faded logo strip — "AI-first curriculum built by 100+ engineers from" then logos: Amazon, OpenAI, Meta, Adobe, Google DeepMind, Microsoft (use plain text labels styled like logos; no external images required)

4. Stories Section (white):
   - Eyebrow: "STORIES"
   - Heading: "Real AI-era career moves, not generic success stories."
   - Subtext: "Numbers tell part of the story. These are the role shifts behind them."
   - Grid of mixed cards:
       • Stat card — huge "214% Hike", name, role, BEFORE/NOW lines, "3 OFFERS" tag, "Explore more →" link
       • Video card — dark thumbnail with a circular play icon, name + role overlay
       • Stat card — "250% Hike" / "142% Hike" variants
       • Quote card — 5-star row + multi-line testimonial + name/role

5. People Behind Scaler Section (white):
   - Eyebrow: "PEOPLE BEHIND SCALER" (or similar)
   - Heading: "The People Behind Scaler"
   - Subtext: "Instructors, mentors, and leaders from industry who shape what you learn and how you grow."
   - Responsive grid of dark photo-style cards (use solid color blocks as placeholders) with name, role, and a small company/Scaler logo in the corner. Examples: Utkarsh Gupta, Shubham Soni, Anshuman Singh, Kshitij Mishra, Alok Singh, Naman Bhalla, Saurabh Kango, Vilas Varghese, Jitendra Punia.

6. Sticky Help Bar (fixed to bottom of viewport, deep navy, white text):
   - "Need help? Talk to us at  08047939623   or   Request a Call ↗"

7. Footer (light grey #F3F4F6, dark text):
   - Left column: SCALER logo, address block ("Interviewbit Software Services Private Limited 5th Floor, Surya Park II 14, …Bengaluru, Karnataka 560100"), an ISO 27001 badge circle, "Download our APP" QR placeholder + Google Play badge text
   - Four link columns: Explore Scaler, Resources, Contact Us/Careers, Others (About Us, Become a Mentor, Become a TA, Hire From Us, Terms of Use, Privacy Policy), Socials (Youtube, LinkedIn, Facebook, Instagram, Twitter, Quora)
   - Below: "Trending Courses" pipe-separated link row, "Tutorial" pipe-separated link row, "Career Advice Resources" pipe-separated link row
   - Bottom: a giant faded watermark text "#CreateImpact" stretched across the width

-----------------------------------
STYLING REQUIREMENTS
-----------------------------------
- Layout: CSS grid + flexbox; max content width ~1200px, centered
- Typography: system sans (Inter / "Segoe UI" / -apple-system). Hero heading ~clamp(48px, 7vw, 96px), bold, tight line-height (1.05)
- Buttons: ~14px vertical / 28px horizontal padding, 8–10px radius, uppercase tracking on CTAs
- Use the gradient text trick: background: linear-gradient(...); -webkit-background-clip: text; color: transparent;
- Use a pseudo-element or span with background for the pale-blue highlight pill behind "Built"
- Add small hover states (button darken, link underline)
- Link styles.css from index.html and link script.js with defer
- script.js can be minimal: a tiny interaction (e.g., toggle nav dropdown chevron, smooth-scroll, or mark active nav link) — must exist and be referenced

-----------------------------------
HARD RULES
-----------------------------------
- Do NOT use a dark theme overall — only the "Why Scaler" section and the help bar are dark
- Do NOT use orange or warm accents
- Do NOT leave any section unstyled
- Do NOT emit ACTION: done before index.html, styles.css, AND script.js all exist
- Do NOT rely on external images — use CSS shapes, gradients, initials, or text labels
- Keep it a realistic single-author build (no frameworks, no Tailwind, no CDN UI kits)

Start by creating index.html with the full semantic skeleton for all 7 sections above.
`,
  },
];

// Track progress
let filesCreated = new Set();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function openInBrowser(fileName) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(fileName);
    if (!fs.existsSync(fullPath)) {
      console.log(`Cannot open ${fileName} — file not found.`);
      return resolve();
    }

    const cmd =
      process.platform === "darwin"
        ? `open "${fullPath}"`
        : process.platform === "win32"
        ? `start "" "${fullPath}"`
        : `xdg-open "${fullPath}"`;

    exec(cmd, (err) => {
      if (err) console.log(`Failed to open browser: ${err.message}`);
      else console.log(`Opened ${fileName} in browser.`);
      resolve();
    });
  });
}

// Typing speed (ms per character). Higher = slower.
const TYPE_DELAY_MS = 5;

async function typeWrite(text, delay = TYPE_DELAY_MS) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
}

async function runAgent() {
  const stream = await client.chat.completions.create({
    model: process.env.MODEL,
    messages: messages,
    stream: true,
  });

  process.stdout.write("\nLLM output:\n");

  let output = "";
  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content || "";
    if (token) {
      output += token;
      for (const char of token) {
        process.stdout.write(char);
        await sleep(TYPE_DELAY_MS);
      }
    }
  }
  process.stdout.write("\n");

  return output;
}

// Parse THOUGHT + ACTION + DATA
function parseOutput(output) {
  const thoughtMatch = output.match(/THOUGHT:\s*(.*)/);
  const actionMatch = output.match(/ACTION:\s*(\w+)/);
  const dataMatch = output.match(/DATA:\s*([\s\S]*)/);

  return {
    thought: thoughtMatch ? thoughtMatch[1].trim() : null,
    action: actionMatch ? actionMatch[1] : null,
    data: dataMatch ? dataMatch[1].trim() : null,
  };
}

// File creation tool
function createFile(data) {
  // Remove markdown backticks if present
  data = data.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");

  const firstLineEnd = data.indexOf("\n");

  if (firstLineEnd === -1) {
    console.log("Invalid DATA format");
    return null;
  }

  let fileName = data.substring(0, firstLineEnd).trim();
  let content = data.substring(firstLineEnd + 1).trim();

  // Extra safety: remove accidental language tags
  if (fileName.startsWith("html")) fileName = "index.html";
  if (fileName.startsWith("css")) fileName = "styles.css";

  fs.writeFileSync(fileName, content);
  console.log(`File ${fileName} created`);

  filesCreated.add(fileName);
  return fileName;
}

async function agentLoop(userInput) {
  let currentInput = userInput;
  let steps = 0;
  const MAX_STEPS = 10; // safety

  while (true) {
    steps++;

    if (steps > MAX_STEPS) {
      console.log("Max steps reached. Stopping agent.");
      break;
    }

    messages.push({ role: "user", content: currentInput });

    const output = await runAgent();
    messages.push({ role: "assistant", content: output });

    const { thought, action, data } = parseOutput(output);

    if (action === "create_file") {
      const fileName = createFile(data);

      currentInput = `File ${fileName} created. Continue.`;

      // Smart termination condition
      if (
        filesCreated.has("index.html") &&
        filesCreated.has("styles.css") &&
        filesCreated.has("script.js")
      ) {
        console.log("Required files created. Finishing.");
        await openInBrowser("index.html");
        break;
      }
    }
    else if (action === "done") {
      console.log("Agent is done.");
      if (filesCreated.has("index.html")) await openInBrowser("index.html");
      break;
    }
    else {
      console.log("Unknown action.");
      break;
    }
  }
}

// CLI start
rl.question(">> ", async (input) => {
  await agentLoop(input);
  rl.close();
  process.exit(0);
});
