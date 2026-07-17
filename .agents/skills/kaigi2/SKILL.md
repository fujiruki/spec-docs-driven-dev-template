---
name: kaigi2
description: Run a high-quality multi-agent expert meeting with independent subagents, cross-critique, fact checking, falsification, and a premortem. Use when the user invokes $kaigi2, asks for an exhaustive or adversarial meeting, explicitly requests independent experts or subagents, or faces a high-impact decision. Do not use for lightweight consultation; use kaigi instead.
---

# Kaigi 2

Act only as moderator and editor. Use independent subagents for expert opinions. Tell the user briefly that this costs materially more than `$kaigi` because it uses multiple agents.

## Phase 0: Define the meeting

State:

- Theme
- Goal: decision, idea generation, or design review
- Constraints and settled facts
- Decision criteria
- Relevant code, specifications, and prior meeting paths

Ask only when ambiguity would materially change the result.

## Phase 1: Cast experts

Choose four to six lenses when capacity allows, including:

- Relevant technical or domain specialists
- Product, user, operations, business, security, legal, or risk lenses as appropriate
- One devil's advocate who must attack the likely consensus

Define each expert by a decision lens. Respect the available agent concurrency limit; run experts in waves if necessary. If subagents are unavailable, stop and recommend `$kaigi` rather than pretending independence.

## Phase 2: Independent divergence

Spawn experts with only the meeting definition, their lens, and raw source paths. Do not give them other experts' opinions or the expected answer.

Require:

- Multiple proposals
- Evidence separated from opinion
- Assumptions
- Concerns and failure modes
- Focused read-only research for material claims

Wait for every expert before starting critique.

## Phase 3: Cross-critique

Send each expert its own output plus all other round-one outputs. Trigger a new turn with `followup_task` when available.

Require:

- Steelman the strongest competing proposal
- At least two concrete objections
- A revised position and reason for any change
- The devil's advocate to challenge the emerging consensus itself

## Phase 4: Adversarial validation

Select one to three leading options. Reuse or start independent agents for these lenses:

- Falsifier: seek evidence that the option is wrong or will fail
- Premortem: narrate why it failed after six months
- Fact checker: verify material repository or web claims

Downgrade or reject options that do not survive validation. Do not expose secrets or send project data to external services without the user's authorization.

## Phase 5: Converge

As moderator, write:

- Conclusion: yes, no, or conditional with concrete conditions
- Adopted rationale
- Rejected options and reasons
- Tradeoffs and unresolved disagreements
- Risks and mitigations
- Minority opinion that may matter later
- Confidence and what would increase it
- Next actions

Treat unanimous agreement as a signal to recheck the debate.

## Phase 6: Save

Save a self-contained Markdown record including the meeting definition, expert summaries, critiques, validation results, and conclusion:

- Project meeting: `docs/kaigi/YYYY-MM-DD-topic.md`
- Non-project meeting: `secretary/notes/YYYY-MM-DD-meeting-topic.md`

Do not create a branch, modify product code, or execute the decision unless the user also requested implementation.
