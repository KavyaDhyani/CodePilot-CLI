# CodePilot CLI

CodePilot CLI is a conversational AI agent that runs in the terminal and builds a frontend website from a natural language instruction.

Inspired by tools like Cursor and Windsurf, it demonstrates agentic AI behavior by reasoning step-by-step, taking actions, and generating real output files.

The agent generates a structured clone of the Scaler Academy homepage using HTML, CSS, and JavaScript, and automatically opens the result in your browser.

---

## Sample Site

A sample of the generated output is hosted at: https://kavyadhyani.github.io/CodePilot-CLI/

---

## Features

- Agentic loop using a THOUGHT → ACTION → DATA structure
- Terminal-based conversational interface
- Streaming LLM output with a typewriter effect
- Automatic generation of:
  - `index.html`
  - `styles.css`
  - `script.js`
- Automatically opens the generated page in the default browser
- Built-in step limit to prevent infinite loops

---

## Tech Stack

- Node.js
- OpenAI-compatible API (supports OpenAI, GitHub Models, and others)
- Native modules: `fs`, `readline`, `child_process`

---

## Project Structure

```
.
├── index.js
├── inputPrompt.txt
├── .env.example
├── .gitignore
├── README.md
```

Generated after execution:

```
├── index.html
├── styles.css
├── script.js
```

---

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
API_KEY=your_api_key_here
BASE_URL=https://api.openai.com/v1
MODEL=gpt-4o-mini
```

You can also use other OpenAI-compatible endpoints:

```env
API_KEY=your_github_pat_here
BASE_URL=https://models.github.ai/inference
MODEL=model_name_here
```

---

## Run

```bash
node index.js
```

You will see a `>>` prompt. Enter an instruction such as:

```
Create a visually accurate clone of the Scaler Academy homepage with proper layout, styling, and sections. Build it step by step.
```

The agent will:

1. Reason step-by-step
2. Create files one at a time
3. Improve structure and styling iteratively
4. Open the final output in your browser

---

## How It Works

1. `runAgent()` sends the conversation to the model and streams the response.
2. `parseOutput()` extracts THOUGHT, ACTION, and DATA fields.
3. `createFile()` writes files using the filename and content from DATA.
4. `agentLoop()`:
   - Feeds results back to the model
   - Continues until all required files are created or a step limit is reached
5. `openInBrowser()` opens the generated `index.html` automatically.

---

## Configuration

You can adjust behavior in `index.js`:

- **Typing speed:** modify `TYPE_DELAY_MS`
- **Maximum steps:** modify `MAX_STEPS`
- **Agent behavior and UI design:** modify the system prompt inside `messages`

---

## Notes

- The generated UI is not a pixel-perfect clone but follows the layout, structure, and visual style of the Scaler website.
- No external UI frameworks are used; everything is generated using plain HTML, CSS, and JavaScript.
- The agent enforces a structured output format to ensure reliable file creation.