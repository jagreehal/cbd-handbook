---
title: "Incident communications: who says what, when"
owner: customer-operations
tags: [incident, communications, policy]
related: [cbd-payments-service/runbook]
---

# Incident communications

Who says what to customers while something is broken. Nobody on this page
writes code, and the policy still lives in git, under the same two paths as
everything else.

## Who decides

The engineer holding the pager decides that an incident exists. They do not
decide what customers are told. Page the duty incident lead, who owns every
outbound message until they hand it back.

Out of hours the duty lead is in the shared on-call calendar. If nobody
answers within ten minutes, send the holding statement below and carry on. An
unattributed holding statement beats forty minutes of silence.

## Holding statement

Send this within thirty minutes of declaring, before anyone knows the cause:

> We are investigating an issue affecting some payments. Money is not at risk.
> We will update here within the hour.

Do not name a cause, a system, or a team. Do not estimate a fix time. Both get
quoted back at you when they turn out to be wrong, and the second one turns out
to be wrong most of the time.

## Money movement

Any incident where a customer was charged twice, charged the wrong amount, or
shown a balance that was not theirs is a money-movement incident, and finance
and the regulator liaison are told before the next customer update goes out.
The engineering severity does not decide this. The symptom does.

The payments service runbook covers the replay procedure. Read the section on
replaying from the last acknowledged offset before running anything: a replay
from the wrong offset is itself a money-movement incident, and it has happened.

## Afterwards

The review is written within five working days by the duty lead, not by the
engineer who was awake for it. It names causes and never people. It is
published, not circulated, because the second one means nobody outside the
thread ever reads it.
