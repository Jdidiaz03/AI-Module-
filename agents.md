# Project Instructions

## Project Overview

This project is for Roadmap, a popcorn brand built around one clear promise: popcorn that does not burn.

The product works only with the brand's app. The app listens to the sound of kernels popping in the microwave, predicts the right stopping point, and alerts the user when to stop the microwave so the popcorn comes out right.

The current primary deliverable is a landing page. The product format is microwave popcorn bags.

## New Chat Context Engineering Rule

At the start of every new Codex chat in this workspace, read `memory.md` after this file. Then read `memory/MEMORY.md`, `memory/lessons.md`, and `tasks/todo.md` before planning or building. Use those files to recover project context, current sprint status, user workflow preferences, and prior lessons.

## GitHub Push Security Audit Rule

For any Codex-assisted workflow that pushes code to GitHub or opens a pull request:

- Before pushing, spawn a dedicated security-review subagent.
- The subagent must audit the staged or committed diff and relevant files for high-confidence private information patterns, including API keys, access tokens, private keys, JWTs, hard-coded secrets, passwords, `.env` values, credentials, credit card numbers, US Social Security numbers, customer or personal data, private URLs, internal notes, generated artifacts, and accidental logs.
- The subagent must check that real secrets are not present in committed config files and that `.env`, `.env.local`, `.env.*.local`, `*.pem`, and `*.key` remain ignored.
- If private information is found, do not push. Remove it, rotate anything exposed, and run the subagent audit again.
- Intentional fake fixtures may use `security-audit: allow-next-line` on the line above the fixture. Use this only for values that cannot unlock any real account, service, database, or environment.
- The final GitHub update must state that the security audit was completed and whether anything was fixed.
- Keep `SECURITY_AUDIT_RULE.md` aligned with this rule.

## Audience

Primary audience:

- Adults ages 25-45.
- People who regularly burn microwave popcorn.
- People who want popcorn to feel easy, reliable, and less annoying.
- People who are comfortable using an app if it solves a real everyday problem.

Assume the audience is practical, impatient with vague claims, and motivated by a simple outcome: stop burning popcorn.

## Product Positioning

Lead with the core problem and the app-powered solution:

- The problem: microwave popcorn burns easily because timing is hard.
- The solution: the app listens to the pops and alerts the user when the microwave should stop.
- The outcome: better popcorn without guessing.

Keep the product message direct, confident, and technology-backed. Do not make the product feel like a snack-only brand. The app is central to the product experience.

Roadmap should feel high-value and high-confidence without relying on vague luxury language. Explain the technology, the practical benefit, and the cost of continuing to burn popcorn.

## Proof Strategy

Recommended proof point:

Roadmap automates the listening rule that popcorn makers already recommend. The app does not need to claim mystery or magic. It should claim disciplined timing by sound.

Use this logic in landing page copy:

- Microwave cook times vary by microwave age, wattage, bag size, and kernel type.
- Established popcorn guidance already tells people to watch, listen, and stop when popping slows.
- Roadmap turns that manual listening job into an app-powered alert.
- The strongest claim is: "Roadmap listens for the moment most people miss."

Facts to use:

- Orville Redenbacher's guidance says to use sound as the timer and remove popcorn from heat when popping slows to 2-3 seconds between pops.
- Orville Redenbacher's microwave guidance says popping times vary, microwaves vary, and overcooking may cause scorching.
- Allrecipes reported that Orville Redenbacher's team recommends paying more attention to time between pops than to the microwave display, because cook time varies by microwave age and wattage.
- Allrecipes also explains that many microwave popcorn buttons use a time estimate or steam/humidity sensing, and that microwave and bag variation can still lead to burning.

Source links for factual support:

- https://www.orville.com/get-inspired/how-to-make-popcorn
- https://www.allrecipes.com/how-long-to-microwave-popcorn-8608693
- https://www.allrecipes.com/article/dont-use-microwave-popcorn-button/

Avoid unsupported proof claims until Roadmap has its own test data:

- Do not claim a specific accuracy percentage.
- Do not claim the app prevents every burned bag.
- Do not claim the app controls the microwave.
- Do not claim results across every microwave model unless tested.

## Brand Voice

The brand voice is confident, corporate, and uses corporate wit.

Write with:

- Clear claims.
- Short, direct sentences.
- A polished and professional tone.
- Practical confidence.
- Minimal slang.
- Controlled corporate wit that makes burnt popcorn feel like an obvious problem to eliminate.
- No overly playful language.
- No cozy, sentimental, or nostalgic framing.

The brand should sound like a company that built a reliable solution to a common problem. Humor may be used, but it should feel sharp, dry, restrained, and professionally delivered.

## Messaging Rules

Do:

- Emphasize no more burnt popcorn.
- Emphasize the app's sound-based prediction.
- Explain that the microwave bags work with the app.
- Explain that the app alerts the user; it does not control the microwave.
- For the landing page, make the app-powered burn-prevention promise immediately clear in the first viewport.
- Keep calls to action direct.
- Use practical language such as "predicts," "listens," "alerts," "stops the guesswork," and "designed for microwave popcorn."
- Treat burnt popcorn as the main enemy.

Avoid:

- Making the brand sound artisanal.
- Making the brand sound handmade, nostalgic, rustic, or cozy.
- Focusing on flavor variety unless explicitly requested.
- Overpromising perfect results without context.
- Implying the popcorn works the same without the app.

## Banned Words

Do not use these words in brand copy, UI copy, marketing copy, or product descriptions:

- premium
- gourmet
- family

If a similar idea is needed, use alternatives such as "reliable," "consistent," "well-made," "everyday," "app-powered," or "designed."

## Product Requirements

When building or describing the product experience:

- The app must be treated as required, not optional.
- The app listens to microwave popping sounds.
- The app predicts when the microwave should stop and sends an alert to the user.
- The user is responsible for stopping the microwave.
- The popcorn is sold as microwave bags.
- The app should help prevent burning by removing timing guesswork.
- Any setup flow should make the app dependency obvious before purchase or first use.

## UX Guidance

For app or website interfaces, especially the landing page:

- Prioritize clarity over decoration.
- Make the main action obvious.
- Use confident labels like "Start Listening," "Track Pops," "Stop Alert," or "Begin Microwave Session."
- Show status clearly: listening, predicting, ready to stop, session complete.
- Design for quick use near a microwave.
- Avoid clutter during the active popping session.
- Do not make the landing page feel like a generic snack website. The app and its listening technology are the differentiator.

## Copy Examples

Good directions:

- "Stop guessing. Let the app listen."
- "The app tracks popping sounds and predicts when to stop."
- "Built for people who keep burning the bag."
- "Microwave popcorn, timed by sound."
- "Roadmap listens. You stop the microwave. A clear chain of command."

Avoid directions:

- Copy that frames the product as a cozy household snack.
- Copy that sells the popcorn as elevated or chef-like.
- Copy that relies on vague quality positioning instead of app-powered burn prevention.

## Open Questions For The Founder

Ask these before finalizing major brand, website, packaging, or app decisions:

- Does the product need a starter kit, subscription, or single-box purchase flow?
- What proprietary test data can Roadmap collect to support stronger performance claims?
- Should the tone feel more enterprise-tech, consumer-tech, or direct-to-consumer retail?
- Are there required legal disclaimers around microwave use, phone placement, or food safety? Current answer: no.
- What are the primary brand colors, if any? Current answer: no defined colors.
- Which competitors should the brand avoid sounding like? Current answer: none identified.
