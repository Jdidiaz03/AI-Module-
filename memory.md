# Roadmap Project Memory

This file is the fast context brief for new chats. Read it with `agents.md`, then load the linked memory and task files when the task needs detail.

## Startup Context Protocol

- First read `agents.md`; it is the source of truth for brand, product, copy, UX, and GitHub security rules.
- Then read this `memory.md` for the compact project brief.
- Then read `memory/MEMORY.md`, `memory/lessons.md`, and `tasks/todo.md` before planning or building.
- If the user corrects project context or asks Codex to remember something, update the appropriate file immediately.

## Project Snapshot

- Brand: Roadmap.
- Product: microwave popcorn bags that require the Roadmap app.
- Core promise: reduce burned popcorn by removing timing guesswork.
- Mechanism: the app listens to popping sounds, predicts the right stop point, and alerts the user.
- Boundary: the app does not control the microwave. The user stops the microwave.
- Primary current artifact: landing page files in `index.html`, `styles.css`, `script.js`, plus concept pages and campaign assets.
- Active forward direction: mobile-first React/PWA prototype for the Roadmap app, tracked in `tasks/todo.md`.

## Audience And Positioning

- Audience: adults 25-45 who regularly burn microwave popcorn and want a practical fix.
- They are impatient with vague claims; lead with the problem, the app-powered solution, and the outcome.
- Roadmap should feel confident, practical, technology-backed, and direct.
- Do not make this feel like a generic snack brand. The app is the differentiator.

## Brand Voice

- Confident, corporate, polished, and clear.
- Use restrained corporate wit when it sharpens the point.
- Avoid cozy, nostalgic, rustic, handmade, artisanal, or sentimental framing.
- Favor short claims and concrete language: `predicts`, `listens`, `alerts`, `stops the guesswork`, `designed for microwave popcorn`.
- Treat burnt popcorn as the main enemy.

## Copy Guardrails

- Do not claim a specific accuracy percentage.
- Do not claim the app prevents every burned bag.
- Do not imply the app controls the microwave.
- Do not imply the popcorn works the same without the app.
- Do not focus on flavor variety unless the user explicitly asks.
- Banned brand-copy words: `premium`, `gourmet`, `family`.

## Proof Strategy

- Strongest proof logic: popcorn makers already recommend listening; Roadmap automates the listening job.
- Core claim: Roadmap listens for the moment most people miss.
- Use sources from `agents.md` when factual support is needed:
  - Orville Redenbacher popcorn guidance.
  - Allrecipes microwave timing article.
  - Allrecipes popcorn button article.
- Use practical facts: microwave age, wattage, bag size, and kernel type affect cook time; overcooking may cause scorching.

## UX Principles

- Prioritize clarity over decoration.
- Make app dependency obvious before purchase or first use.
- Design active use for someone standing near a microwave.
- Show clear session states: ready, listening, predicting, stop alert, complete.
- Active popping sessions should be uncluttered and quick to understand.
- Good action labels include `Start Listening`, `Track Pops`, `Stop Alert`, and `Begin Microwave Session`.

## Active Sprint Memory

- Current sprint target: Roadmap App v1 mobile-first prototype.
- Build assumption: React/PWA-style prototype, no backend for v1.
- Audio assumption: start mocked, then add Web Audio API microphone detection.
- Storage boundary: no raw audio is stored or sent anywhere in v1.
- Safety boundary: the app alerts the user; the user stops the microwave.
- Check `tasks/todo.md` before building and mark shipped items complete.

## Workflow Memory

- `memory/MEMORY.md` is the memory index.
- `memory/lessons.md` stores strategic lessons only when the user identifies a lesson/pattern or repeated corrections reveal one.
- Standalone memory files inside `memory/` should start with `user_`, `project_`, `feedback_`, or `reference_`.
- Keep `tasks/todo.md` as the active sprint plan.
- When adding durable context, avoid duplicating long details already in `agents.md`; add summaries and pointers.

## GitHub And Security Memory

- Before any Codex-assisted push to GitHub or PR, spawn a dedicated security-review subagent.
- The subagent must check staged or committed code for private information: API keys, access tokens, private keys, JWTs, hard-coded secrets, passwords, `.env` values, credentials, credit card numbers, US Social Security numbers, personal data, private URLs, internal notes, generated artifacts, and accidental logs.
- If private information is found, do not push. Remove it, rotate anything exposed, and run the audit again.
- The final GitHub update should say the security audit was completed and whether anything was fixed.
- `SECURITY_AUDIT_RULE.md` is the human-readable copy of this rule.

## Open Founder Questions

- Does Roadmap need a starter kit, subscription, or single-box purchase flow?
- What proprietary test data can Roadmap collect to support stronger claims?
- Should the tone lean more enterprise-tech, consumer-tech, or direct-to-consumer retail?
- Are legal disclaimers needed around microwave use, phone placement, or food safety? Current answer: no.
- Are there primary brand colors? Current answer: no defined colors.
- Which competitors should Roadmap avoid sounding like? Current answer: none identified.
