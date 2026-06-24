---
description: Get help with procurement workflow tasks (PR, PO, Receipt, Disbursement, Approval) using a domain-specialist agent
argument-hint: <what you want to do>
---

Use the `purchase-flow-helper` agent for tasks touching the procurement workflow.

The task is: **$ARGUMENTS**

Steps:
1. If $ARGUMENTS is empty, ask the user what part of the procurement flow they need help with (PR, PO, Receipt, Disbursement, Approval Workflow, OTP, Budget Approval)
2. Launch the `purchase-flow-helper` agent with the task description and any context the user provided
3. Present the agent's plan or implementation
4. If implementation is needed, confirm with the user before the agent edits files
