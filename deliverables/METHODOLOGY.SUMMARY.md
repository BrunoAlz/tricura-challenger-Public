# Methodology Statement — Executive Summary

> Public summary of `METHODOLOGY.md` for the tricura-challenger evaluation.
> Full content held privately; available to the evaluator, sent by E-MAIL

## Document type and purpose

Brief-conformant methodology statement describing how the candidate approached
the challenge. It accompanies the audit memo and findings catalog as part of
the deliverable set, articulating the disciplines applied rather than what was
found.

## Scope and methodology

A black-box review of a deployed system over a defined audit window. Read-only
enumeration of documented surfaces came first, followed by privileged probes
via authenticated UI sessions, with strict lockout discipline and deliberate
deferral of mutating operations until a finding was confirmed. Prioritization
followed a tiered cost-versus-payoff framework, and severity was scored
against a fixed banded rubric. Regression-worthiness was triaged separately
from severity, with the rationale recorded per item.

## Thematic coverage

- Investigation workflow and probe-to-regression promotion
- Severity classification and triage discipline
- Prioritization framework
- Deferred-work and follow-up planning

## Availability

The complete unredacted methodology statement is held privately under the
candidate's `.private/` workspace (not committed to the public repository)
and is available to the evaluator for review on request.
