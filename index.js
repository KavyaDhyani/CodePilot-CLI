import readline from "readline";
import fs from "fs";
import dotenv from 'dotenv'; dotenv.config({ quiet: true });
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
You are an AI coding agent.

Your goal is to create a visually accurate clone of the Scaler Academy homepage.

You must think step-by-step and create files iteratively.

-----------------------------------
DESIGN REQUIREMENTS (VERY IMPORTANT)
-----------------------------------
- Dark theme (deep navy/black background)
- Orange accent color for buttons and highlights
- Clean modern UI with proper spacing and alignment
- Use large bold headings and professional fonts
- Use card-based layout for sections

-----------------------------------
PAGE STRUCTURE (STRICTLY FOLLOW)
-----------------------------------
1. Navbar:
   - Logo text "Scaler"
   - Navigation links: Programs, Reviews, Resources, Login
   - Sticky top navigation

2. Hero Section:
   - Large heading about transforming tech careers
   - Subtext description
   - Call-to-action button (Apply Now / Explore Programs)
   - Centered layout

3. Testimonials Section:
   - 2–3 user success cards
   - Include name, role, and short quote

4. Programs Section:
   - Cards for different programs (AI, ML, DevOps, Full Stack)

5. Footer:
   - Multiple columns with links (Courses, Resources, Contact)

-----------------------------------
TECHNICAL REQUIREMENTS
-----------------------------------
- Create index.html first
- Then create styles.css
- Link CSS properly
- Use flexbox or grid for layout
- Add spacing, padding, margins properly
- Use hover effects on buttons

-----------------------------------
AGENT RULES
-----------------------------------
- Always think before acting
- Take one step at a time
- DO NOT jump to done early
- DO NOT skip CSS
- The UI must look polished, not basic

-----------------------------------
OUTPUT FORMAT
-----------------------------------
THOUGHT: <your reasoning>
ACTION: <action>
DATA: <data>

Available actions:
- create_file (first line filename, rest content)
- done

Start by creating index.html
Do NOT explain anything outside this format.
`,
  },
];

async function runAgent(userInput) {
  const response = await client.chat.completions.create({
    model: process.env.MODEL,
    messages: messages,
  });

  const output = response.choices[0].message.content;
  console.log("LLM output: \n", output);

  return output;
}

function parseOutput(output) {
  const actionMatch = output.match(/ACTION:\s*(\w+)/);
  const dataMatch = output.match(/DATA:\s*([\s\S]*)/);

  return {
    action: actionMatch ? actionMatch[1] : null,
    data: dataMatch ? dataMatch[1].trim() : null,
  };
}

function createFile(data) {
  const firsLineEnd = data.indexOf("\n");
  const fileName = data.substring(0, firsLineEnd).trim();
  const content = data.substring(firsLineEnd + 1).trim();

  fs.writeFileSync(fileName, content);
  console.log(`File ${fileName} created successfully!`);
}

async function agentLoop(userInput) {
  let currentInput = userInput;

  while (true) {
    messages.push({ role: "user", content: currentInput });
    const output = await runAgent(currentInput);
    messages.push({ role: "assistant", content: output });
    const { action, data } = parseOutput(output);

    if (action === "create_file") {
      createFile(data);
      currentInput = "File created successfully.";
    } else if (action === "done") {
      console.log("Agent is done.");
      break;
    } else {
      console.log("Unknown action. Stopping agent.");
      break;
    }
  }
}

rl.question(">> ", async (input) => {
  await agentLoop(input);
  rl.close();
});
