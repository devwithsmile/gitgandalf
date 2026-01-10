# 🧙 Git Gandalf

**An AI-powered pre-commit gatekeeper that reviews your code locally — before it reaches the repo.**

Git Gandalf analyzes your staged changes using a **local LLM** and decides whether your commit should be **allowed**, **warned**, or **blocked**.

> _“You shall not commit (…unless it’s safe).”_

---

## ✨ Features

- 🔍 Reviews **staged diffs** before commit
- 🧠 Uses a **local LLM** (no cloud, no telemetry)
- 🚦 Clear decisions: **ALLOW / WARN / BLOCK**
- ❌ Fails loudly — no silent passes
- 🔐 No network calls, no data leaks
- ⚡ Runs automatically as a Git pre-commit hook

---

## 📋 Requirements

Make sure you have the following installed:

- **Node.js** `v14+`
- **LM Studio**
- **LM Studio CLI (`lms`)** available in your `PATH`
- Local model:qwen/qwen3-4b-2507
  > ⚠️ Git Gandalf does **not** use fallback models or remote APIs.

---

## 📦 Installation

### 1️⃣ Add Git Gandalf to your repo

Copy `gitgandalf.js` into your project root.

---

### 2️⃣ Create the pre-commit hook

Create `.git/hooks/pre-commit`:

```sh
#!/bin/sh

DIFF=$(git diff --cached)

if [ -z "$DIFF" ]; then
  exit 0
fi

echo "$DIFF" | node gitgandalf.js

if [ $? -ne 0 ]; then
  exit 1
fi

exit 0
```

### 3️⃣ Make it executable

```sh
chmod +x .git/hooks/pre-commit
```

That’s it. Git Gandalf is now guarding your commits 🧙‍♂️

⸻

## ▶️ How It Works

On every commit:

- Git collects staged changes
- Git Gandalf extracts metadata
- A local LLM reviews the diff
- A decision is made:

## 🚦 Decision Matrix

| Decision | Exit Code | Meaning |
|---------|-----------|---------|
| **ALLOW** | `0` | Low risk — commit proceeds |
| **WARN**  | `0` | Medium risk — commit proceeds with warnings |
| **BLOCK** | `1` | High risk — commit is rejected |

## 🧪 Example Output

```sh
=======================================

🧙 Git Gandalf Review

Risk: MEDIUM
Summary: Adds structured error handling and failure classification logic.

Issues:
  - Introduces multiple exit paths that should be reviewed carefully
  - Error handling logic affects commit flow

Decision: WARN

⚠️  Review the issues above before proceeding
=======================================
```

## 🚫 Bypassing the Hook

```sh
git commit --no-verify -m "message"
```
⚠️ Use with caution. Gandalf is watching.

## ⛔ Limitations
	•	❌ Diffs larger than 1MB are rejected
	•	📦 Binary-only commits are skipped
	•	🧠 Requires a running local LLM
	•	🔁 No retries
	•	⚙️ No configuration flags
	•	🌐 No telemetry or caching

## 🧠 Design Philosophy
	•	Local-first
	•	No magic
	•	Fail loudly
	•	Trust, but verify
	•	Humans stay in control

Git Gandalf is a gatekeeper, not an autopilot.