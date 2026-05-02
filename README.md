# 🧪 TestCraft AI — Professional Test Case Generator

> AI-powered BDD test case generator for QA engineers. Paste a user story, get production-ready Gherkin scenarios in seconds.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-D4A574?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📌 The Problem

QA engineers spend hours writing test cases manually — documenting scenarios that could be generated in seconds. Under sprint pressure, edge cases, security, and accessibility tests are the first to be skipped, leading to inconsistent coverage across releases.

**TestCraft AI solves this.**

---

## ✨ What It Does

Paste any user story or feature description. TestCraft AI generates a complete set of professional BDD test cases covering:

| Coverage Type | What it validates |
|---|---|
| ✅ **Positive** | Happy path and valid input flows |
| ❌ **Negative** | Invalid inputs, missing fields, wrong credentials |
| ⚠️ **Edge Cases** | Boundary values, empty states, special characters |
| 🔒 **Security** | Auth bypass, IDOR, data exposure, XSS/CSRF |
| ♿ **Accessibility** | Keyboard navigation, screen readers, ARIA labels |
| ⚡ **Performance** | Response time SLAs, slow connections, large datasets |

Every scenario includes:
- Unique ID (`TC-001`, `TC-002`...)
- Priority level (`Critical`, `High`, `Medium`, `Low`)
- Gherkin tags (`@smoke`, `@regression`, `@security`...)
- Detailed `Given / When / Then / And` steps
- Technical notes and risk rationale

---

## 🖥️ Live Demo

> 🔗 **[testcraft-ai.vercel.app](https://testcraft-ai.vercel.app)** *(coming soon)*

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v20.19+` or `v22.12+`
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/MiguelGuedes1/TestCraft-AI.git
cd TestCraft-AI

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

### Configuration

Edit the `.env` file and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

> ⚠️ Never commit your `.env` file. It is already included in `.gitignore`.

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧠 How It Works

TestCraft AI uses Claude (Anthropic) as its reasoning engine, prompted to behave as a senior QA engineer with 15+ years of experience in BDD, risk-based testing, and test design techniques.

```
User Story Input
      │
      ▼
 Claude API (claude-sonnet-4-5)
      │
      ├── Analyses requirements
      ├── Maps positive and negative flows
      ├── Applies boundary value analysis
      ├── Identifies security risks
      ├── Checks accessibility requirements
      └── Structures output as Gherkin JSON
      │
      ▼
 Rendered Scenarios
      │
      └── Copy to clipboard / Export .feature
```

The system prompt enforces:
- Minimum 8 scenarios per generation (typically 12–22)
- At least 1 security, 1 accessibility, and 1 performance scenario always included
- Atomic, specific steps — clear enough for a junior tester to execute without ambiguity
- Language detection — input in Portuguese returns scenarios in Portuguese

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 + Vite | Frontend framework and build tool |
| Anthropic Claude API | AI test case generation |
| hugeicons-react | Icon library |
| Vercel | Deployment and hosting |

No backend. No database. No framework overhead. Everything runs in the browser.

---

## 📁 Project Structure

```
testcraft-ai/
├── public/
│   └── favicon.svg          # Custom TestCraft icon
├── src/
│   ├── App.jsx              # Main application (landing page + generator)
│   ├── App.css              # Global styles (empty — all styles inline)
│   └── main.jsx             # React entry point
├── .env                     # API key (not committed)
├── .env.example             # Template for environment variables
├── index.html               # HTML entry point with meta tags
└── package.json
```

---

## 🔒 Security Notes

- The Anthropic API key is read from environment variables via `import.meta.env`
- The `anthropic-dangerous-direct-browser-access` header is required for direct browser API calls
- For production use with public access, consider implementing a backend proxy to protect your API key
- Never expose your API key in version control

---

## 🗺️ Roadmap

- [ ] Deploy to Vercel with public link
- [ ] Add example user stories (one-click fill)
- [ ] Export as `.feature` file download
- [ ] User-provided API key input (no backend needed)
- [ ] Cypress spec skeleton generation from Gherkin output
- [ ] Test case history (localStorage)
- [ ] Open source release

---

## 👨‍💻 Author

**Miguel Guedes** — QA Engineer in training, building tools that make QA more strategic.

[![GitHub](https://img.shields.io/badge/GitHub-MiguelGuedes1-181717?style=flat-square&logo=github)](https://github.com/MiguelGuedes1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-miguel--guedes1-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/miguel-guedes1/)

---

## 📄 License

MIT License — free to use, modify and distribute.

---

> *"QA exists to protect the business. TestCraft AI gives you the time to actually do that."*