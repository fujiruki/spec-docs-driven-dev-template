---
name: kaigi
description: Run a low-cost expert meeting in one Codex context. Use when the user invokes $kaigi, writes kaigi or kaiig, asks to 会議して, requests an expert meeting, or wants a decision explored from multiple perspectives. Do not use when the user explicitly requests independent subagents or exhaustive adversarial validation; use kaigi2 instead.
---

# Kaigi

Run the full meeting in the main context. Do not spawn subagents.

## Define the meeting

State these before discussing. Ask only when ambiguity would materially change the result.

- Theme
- Goal: decision, idea generation, or design review
- Constraints and settled facts
- Decision criteria

## Cast the panel

Choose three or four lenses that fit the theme, plus one devil's advocate. Replace generic roles with domain specialists when useful. Define each role by its decision lens, not a persona name.

## Run three rounds

1. Divergence
   - Give every expert one uninterrupted turn.
   - Start with a one-sentence position.
   - Produce at least two proposals, including one non-obvious option.
   - Separate evidence from opinion and state assumptions and concerns.
   - Do not let later speakers agree with or mention earlier speakers.
2. Debate
   - Steelman the strongest competing proposal before criticizing it.
   - Give at least two concrete objections.
   - Allow position changes only with an explicit reason.
   - Make the devil's advocate attack the emerging consensus.
3. Convergence
   - Separate adopted and rejected options.
   - Explain tradeoffs and unresolved disagreement.
   - Add a short premortem: assume the decision failed in six months and explain why.

Use read-only code or web research for material factual claims when needed. Keep the meeting moving and share concise commentary updates during longer research.

## Deliver and save

Return:

- Conclusion: yes, no, or conditional with concrete conditions
- Adopted rationale
- Rejected options and reasons
- Risks and mitigations
- Minority view that may become useful if conditions change
- Confidence and what would increase it
- Next actions

Save a self-contained Markdown record when working in a project:

- Project meeting: `docs/kaigi/YYYY-MM-DD-topic.md`
- Non-project meeting: `secretary/notes/YYYY-MM-DD-meeting-topic.md`

Do not create a branch, modify product code, or execute the decision unless the user also requested implementation.
