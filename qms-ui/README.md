# Ledger — Query Management System (UI prototype)

A clickable, high-fidelity UI prototype for the client's QMS, built from **QMS - Scope.xlsx**.
It lives in its own folder and doesn't share code with the existing TaxPulse app in the repo root.

- **No build step.** Plain HTML, CSS and JavaScript. Open `index.html` in Chrome or Safari, or run `npx serve qms-ui`.
- **Leadership** sees only Dashboard and Reports (scope #38). Tiles and rows that would open a ticket are read-only for them.
- **Masters** (Clients, Task templates, SLA & escalation) are for Platform admin only.
- **Role switcher** in the top bar ("Viewing as") shows what each role sees (scope #36–#40).
- **Light and dark themes** from one token file. The layout is responsive down to phone width (#47).
- All data is sample data in `assets/js/data.js`, with "now" fixed at **Wed 7 Oct 2026, 11:30 IST** so SLA timers always render the same way.

## Folder layout

```
qms-ui/
├── index.html              # entry point, loads fonts + scripts
├── assets/css/tokens.css   # design tokens (colour, type, radius, shadow); light + dark
├── assets/css/app.css      # component styles (BEM-style class names)
├── assets/js/data.js       # sample entities — mirrors the proposed data model
├── assets/js/icons.js      # inline SVG icon set (Lucide paths)
├── assets/js/core.js       # state, lookups, SLA maths, shared components
├── assets/js/views.js      # one function per screen
└── assets/js/app.js        # shell, navigation, routing, dialogs, events
```

## Screens and routes

| Route | Screen | Roles |
|---|---|---|
| `#login`, `#forgot` | Sign in (email + password, 30-day session, Microsoft SSO, reset) | all |
| `#dashboard` | Firm / team / personal overview: KPIs, volume, SLA health, workload, needs attention | leadership, manager, member, platform |
| `#inbox` | Intake: WhatsApp, email and phone logs with AI verdicts and routing | sysadmin |
| `#tickets` | Ticket list: tabs for open, overdue, pending acceptance, awaiting approval, reopened, closed | manager, member |
| `#ticket-<ID>` | Ticket detail: status stepper, conversation, composer, SLA, escalation, people, mapping, history | manager, member |
| `#tasks` | Compliance calendar, recurring and onboarding tasks | manager, member, platform |
| `#reports` | Daily exception report and analytics | leadership, manager |
| `#knowledge` | Searchable knowledge base | manager, member, platform |
| `#clients`, `#client-<id>` | Client master and client detail with task customisation | platform |
| `#templates` | Task template master | platform |
| `#sla` | SLA matrix, reminders, escalation and unaccepted-transfer rules | platform |
| `#users` | Users and access | platform, sysadmin |
| `#channels` | WhatsApp, M365, auto-acknowledgement, attachments, outgoing email | platform, sysadmin |
| `#logs` | System logs | sysadmin |

### Try these flows

1. **Transfer and acceptance (#13, #14):** as *Team member*, open `#ticket-TKT-1036` and click **Accept ownership**. As *Manager*, open any open ticket and click **Assign / reassign**.
2. **Maker–checker closure (#12):** as *Team member*, click **Mark resolved** on a ticket. As *Manager*, open `#ticket-TKT-1041` and click **Approve & close**. On a closed ticket, click **Reopen**.
3. **AI intake (#5, #7, #15):** as *System admin (IT)*, open Intake and compare a skipped greeting, a split multi-issue message, a linked follow-up and one ticket created from a multi-recipient email.

## Scope traceability

| # | Scope point | Where it appears |
|---|---|---|
| 1 | WhatsApp intake (2 numbers) | Intake (System admin), Channels → WhatsApp, sidebar health |
| 2 | M365 email via Graph | Intake, Channels → Microsoft 365 mailboxes |
| 3 | Phone instructions | "Log phone instruction" drawer (Intake, Tickets) |
| 4 | Attachments (parse in Phase 2) | "Parse in Phase 2" tags, folder naming in Channels |
| 5 | Auto ticket creation, owner/backup/escalation, skip non-queries | Intake verdicts, ticket People panel |
| 6 | Instant acknowledgement (built, off) | Channels → disabled toggle and template; system note in thread |
| 7 | AI classification, routing, sub-tickets, follow-ups | Intake AI card, sub-tickets panel, "follow-ups linked" |
| 8 | Response-by, reminders, closing | Ticket SLA panel |
| 9 | Human-only responses | Composer footer note; no auto-replies |
| 10 | Status updates on same channel | Ticket status stepper |
| 11 | External members emailed | "Ext" tag, reassign drawer note, Channels → Outgoing email |
| 12 | Resolve → manager approval → close → reopen | Resolve dialog, approval banner, Reopen action, Reopened tab |
| 13 | Reassign by owner with reason | Reassign drawer |
| 14 | Manager assign, acceptance, reminder, escalation, history | Pending banner, Assignment history, SLA → Unaccepted transfers |
| 15 | Many recipients → one ticket | Intake message m10 → TKT-1034 members |
| 16 | Client-wise SLA | SLA matrix, client detail SLA panel, tier tags |
| 17 | Master data mapping | Client detail, ticket Client mapping panel |
| 18 | Reminders and visual cues | **SLA ring** (see below), legend on Tickets |
| 19 | Escalation matrix | Ticket SLA panel ladder, SLA & escalation page |
| 20 | Leadership dashboard | Dashboard as Leadership, with filters and Day/Week/Month/Quarter |
| 21 | User panel by role | Dashboard and Tickets scope change with role |
| 22 | Exception reporting | Reports → Daily exceptions |
| 23 | Analytics | Reports → Analytics (accountant, client, engagement, provider) |
| 24 | Knowledge base | Knowledge base page; "Add to knowledge base" on resolve; similar queries on ticket |
| 25 | Task master | Task templates |
| 26 | Onboarding tasks | Add client drawer, Tasks → Onboarding |
| 27 | Recurring tasks | Tasks → Recurring, calendar, "Generate November cycle" |
| 28 | Client-level customisation | Client detail → Task plan toggles, Modify, Add |
| 29 | User and client access | Users & access, client Deactivate |
| 30 | Statutory compliance tracker | Tasks → Compliance calendar |
| 36–40 | Roles | "Viewing as" switcher and role-based navigation |
| 41–43 | Login | `#login`, `#forgot`, Microsoft button |
| 47 | Mobile responsive | Off-canvas nav and stacked layouts below 900px |
| 48–49 | Email accounts, Loop2.AI | Channels page |

### Proposed visual cue for #18: the SLA ring

The scope leaves the cue as "TBD". The prototype uses a small ring that fills as turnaround time is used up:

| State | Colour | Rule |
|---|---|---|
| On track | green | under 75% of TAT |
| Due soon | amber | 75–100% of TAT (owner reminded) |
| Overdue | red | past due (manager reminded, then partner) |
| Pending acceptance | violet | a transfer is waiting for the new owner |
| Resolved / closed | grey | finished |

The ring always appears next to a text label such as "35m left" or "Overdue 1h 30m", so the state never depends on colour alone.

## Notes for the build team

- **Components:** each function in `core.js` (`slaCue`, `statusPill`, `person`, `ticketTable`, `panel`, `barChart`…) returns markup for one component. Port them 1:1 to React, Vue or Angular.
- **Tokens:** `tokens.css` is the single source of colour and type. Map it to Tailwind `theme.extend` or CSS-in-JS as needed. Semantic colours (`--ok`, `--warn`, `--crit`, `--pend`) are reserved for SLA state.
- **Fonts:** Fraunces for headings and key figures, IBM Plex Sans for UI, IBM Plex Mono for IDs and codes (Google Fonts).
- **Data model:** `data.js` suggests these entities: `User`, `Client` (tier, partner, manager, owner, backup, service providers), `Ticket` (owner, backup, escalation, members, status, TAT, transfer fields, sub-tickets), `Message` (channel, AI verdict), `TaskTemplate`, `Task`, `KBArticle`, `SLA matrix`, `AuditLog`.
- **Status set:** `received → assigned → in progress → resolved (awaiting approval) → closed`, plus `pending acceptance` and `reopened`.
- **Prototype limits:** actions change data in memory only and confirm with a toast. Nothing is sent or saved.
