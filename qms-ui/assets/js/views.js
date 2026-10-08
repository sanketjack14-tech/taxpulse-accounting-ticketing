/* =====================================================================
   Ledger — QMS screens. One function per route; each returns HTML.
   Scope references (#n) point to rows in "QMS - Scope.xlsx".
   ===================================================================== */

const VIEWS = {};

/* ---------------------------------------------------------------------
   Dashboard (#18, #20, #21)
   --------------------------------------------------------------------- */
VIEWS.dashboard = () => {
  const u = me();
  let list = scopedTickets();
  if (state.dashOwner !== "all") list = list.filter((t) => t.owner === state.dashOwner);
  if (state.dashClient !== "all") list = list.filter((t) => t.client === state.dashClient);
  const open = list.filter(isOpen);
  const overdue = open.filter(isOverdue);
  const pending = list.filter((t) => t.status === "pending");
  const awaiting = list.filter((t) => t.status === "resolved");
  const closedN = { day: 9, week: 31, month: 58, quarter: 58, custom: Math.round(periodDays() * 8.5) }[state.period];
  const scale = state.role === "member" ? 0.18 : state.role === "manager" ? 0.55 : 1;

  const title = state.role === "member" ? `Good morning, ${u.name.split(" ")[0]}` : state.role === "manager" ? "Team overview" : "Firm overview";
  const sub = state.role === "member" ? "Your queue, ordered by what breaches SLA first." : state.role === "manager" ? `${u.team} · ${USERS.filter((x) => x.team === u.team && x.role === "member").length} members plus external consultants on your clients` : "All teams, all clients · Mehta & Associates, Chartered Accountants";

  const members = state.role === "member" ? [] : USERS.filter((x) => x.role === "member" && x.active && (state.role === "leadership" || x.team === u.team || TICKETS.some((t) => t.owner === x.id && t.escalation === u.id)));
  const ownerOpts = [["all", state.role === "member" ? "Me" : "All accountants"], ...members.map((m) => [m.id, m.name])];
  const clientOpts = [["all", "All clients"], ...CLIENTS.map((c) => [c.id, `${c.code} · ${c.name}`])];

  const periods = {
    day: ["Daily · last 14 days", SERIES_14D, ["24 Sep", "25", "26", "27", "28", "29", "30", "1 Oct", "2", "3", "4", "5", "6", "Today"]],
    week: ["Weekly · last 8 weeks", [96, 104, 118, 92, 121, 133, 110, 61], ["W34", "W35", "W36", "W37", "W38", "W39", "W40", "W41"]],
    month: ["Monthly · last 6 months", [402, 388, 455, 520, 497, 168], ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]],
    quarter: ["Quarterly · last 4 quarters", [1180, 1265, 1342, 412], ["Q4 FY26", "Q1 FY27", "Q2 FY27", "Q3 FY27"]],
  };
  if (state.period === "custom") {
    const from = toDate(state.customFrom), n = Math.min(periodDays(), 62);
    const days = Array.from({ length: n }, (_, i) => new Date(from.getTime() + i * 86400000));
    periods.custom = [`Custom · ${periodLabel()}`, days.map((d, i) => [0, 6].includes(d.getDay()) ? 4 + (i % 3) : 14 + ((i * 7 + 3) % 13)),
      days.map((d, i) => (i === 0 || d.getDate() === 1 ? fmtDay(d, false) : String(d.getDate()))), days.map((d) => fmtDay(d))];
  }
  const [pLabel, pVals, pLabels, pTips] = periods[state.period];
  const vals = pVals.map((v) => Math.max(1, Math.round(v * scale)));

  const kpis = `<div class="kpis">
    <button class="kpi" data-href="#tickets" data-set="ticketTab=open"><span class="kpi__label">${icon("ticket", "icon--sm")}Open</span><span class="kpi__value">${open.length}</span><span class="kpi__delta"><b class="up-bad">+3</b> vs yesterday</span></button>
    <button class="kpi kpi--crit" data-href="#tickets" data-set="ticketTab=overdue"><span class="kpi__label">${icon("alert", "icon--sm")}Overdue</span><span class="kpi__value">${overdue.length}</span><span class="kpi__delta">${overdue.filter((t) => t.ageMin > 1440).length} pending over 24h</span></button>
    <button class="kpi kpi--pend" data-href="#tickets" data-set="ticketTab=pending"><span class="kpi__label">${icon("swap", "icon--sm")}Pending acceptance</span><span class="kpi__value">${pending.length}</span><span class="kpi__delta">Oldest ${pending.length ? fmtDur(Math.max(...pending.map((t) => Math.min(t.ageMin, 160)))) : "—"}</span></button>
    <button class="kpi" data-href="#tickets" data-set="ticketTab=approval"><span class="kpi__label">${icon("usercheck", "icon--sm")}Awaiting approval</span><span class="kpi__value">${awaiting.length}</span><span class="kpi__delta">Maker–checker queue</span></button>
    <button class="kpi" data-href="#tickets" data-set="ticketTab=closed"><span class="kpi__label">${icon("check", "icon--sm")}Closed · ${{ day: "today", week: "this week", month: "this month", quarter: "this quarter", custom: "in range" }[state.period]}</span><span class="kpi__value">${Math.round(closedN * scale)}</span><span class="kpi__delta"><b class="down-good">94%</b> within SLA</span></button>
  </div>`;

  const slaCounts = { ok: 0, warn: 0, crit: 0, pend: 0 };
  open.forEach((t) => { const s = slaInfo(t); const k = t.status === "pending" && !s.over ? "pend" : s.cls; if (slaCounts[k] !== undefined) slaCounts[k]++; });
  const total = Math.max(1, open.length);
  const slaRows = [["ok", "On track", "--ok"], ["warn", "Due soon", "--warn"], ["crit", "Overdue", "--crit"], ["pend", "Pending acceptance", "--pend"]];
  const slaPanel = panel("SLA health", `
    <div class="stackbar" role="img" aria-label="SLA split of open tickets">${slaRows.filter(([k]) => slaCounts[k]).map(([k, l, c]) => `<i style="flex:${slaCounts[k]};background:var(${c})" data-tip="${l}: ${slaCounts[k]}"></i>`).join("")}</div>
    <div class="stack" style="margin-top:16px">${slaRows.map(([k, l, c]) => `<div class="row row--between"><span class="row" style="gap:8px"><span class="legend__sw" style="background:var(${c});margin:0"></span>${l}</span><span class="num"><b>${slaCounts[k]}</b> <span class="muted">· ${Math.round(slaCounts[k] / total * 100)}%</span></span></div>`).join("")}</div>
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
    <p class="eyebrow" style="margin-bottom:8px">Reading the SLA ring</p>
    <p class="muted" style="font-size:var(--fs-sm)">The ring fills as the turnaround time is used up. Owners get a reminder at 75%, the manager at 100%, and the engagement partner when a critical ticket stays overdue.</p>
  `, { sub: `${open.length} open tickets` });

  const attention = [
    ...list.filter((t) => t.status === "pending" && t.transferTo === u.id).map((t) => ["pend", "swap", `Accept transfer: ${t.subject}`, `${t.id} · from ${user(t.transferBy).name} · ${t.transferReason}`, t.id, "Review"]),
    ...overdue.map((t) => ["crit", "alert", t.subject, `${t.id} · ${slaInfo(t).main} · ${user(t.owner).name}`, t.id, "Open"]),
    ...list.filter((t) => t.status === "reopened").map((t) => ["warn", "reopen", `Reopened by client: ${t.subject}`, `${t.id} · escalated to ${user(t.escalation).name}`, t.id, "Open"]),
    ...(state.role !== "member" ? awaiting.map((t) => ["info", "usercheck", `Approve closure: ${t.subject}`, `${t.id} · resolved by ${user(t.owner).name}`, t.id, "Review"]) : []),
    ...list.filter((t) => t.status === "pending" && t.transferTo !== u.id).map((t) => ["pend", "swap", `Transfer not yet accepted: ${t.subject}`, `${t.id} · ${user(t.owner).name} → ${user(t.transferTo).name}`, t.id, "Open"]),
  ].slice(0, 7);
  const attentionPanel = panel("Needs attention", `<div class="alist">${attention.map(([c, ic, ti, meta, id, cta]) => `<div class="alist__item" data-href="#ticket-${id}"><span class="alist__icon alist__icon--${c}">${icon(ic, "icon--sm")}</span><div style="min-width:0"><div class="alist__title">${esc(ti)}</div><div class="alist__meta">${esc(meta)}</div></div><span class="btn btn--sm">${cta}</span></div>`).join("") || `<div class="empty">Nothing needs you right now.</div>`}</div>`, { flush: true, sub: "Escalations, transfers and approvals waiting on someone" });

  const volume = panel("Ticket volume", `${barChart(vals, pLabels, { highlightLast: state.period !== "custom" || state.customTo === "2026-10-07", tipLabels: pTips })}
    <div class="legend" style="margin-top:8px"><span><span class="legend__sw" style="background:var(--brand)"></span>New tickets</span><span><span class="legend__sw" style="background:var(--brass)"></span>Current period (partial)</span></div>`,
    { sub: `${pLabel} · WhatsApp, email and logged calls`, actions: periodPicker() });

  let lower;
  if (state.role === "member") {
    const mine = list.filter(isOpen).sort((a, b) => (a.tatMin - a.ageMin) - (b.tatMin - b.ageMin));
    const tasks = TASKS.filter((t) => t.owner === u.id && t.status !== "done");
    lower = `<div class="grid grid--wide-narrow">
      ${panel("My queue", ticketTable(mine, { showOwner: false }), { flush: true, sub: "Sorted by time left", actions: `<a class="btn btn--sm" href="#tickets">All my tickets ${icon("right", "icon--sm")}</a>` })}
      ${panel("My tasks this week", `<div class="alist">${tasks.map((t) => `<div class="alist__item" data-href="#tasks"><span class="alist__icon alist__icon--${t.status === "pending" ? "pend" : "info"}">${icon(t.kind === "Onboarding" ? "flag" : "repeat", "icon--sm")}</span><div style="min-width:0"><div class="alist__title">${esc(t.name)}</div><div class="alist__meta">${client(t.client).code} · due ${t.due}</div></div>${statusPill(t.status)}</div>`).join("")}</div>`, { flush: true, sub: "Recurring and onboarding tasks" })}
    </div>`;
  } else {
    const rows = members.map((m) => {
      const mt = TICKETS.filter((t) => t.owner === m.id);
      const o = mt.filter(isOpen).length, od = mt.filter(isOverdue).length;
      const pin = TICKETS.filter((t) => t.transferTo === m.id).length;
      const res = mt.filter((t) => t.status === "resolved").length;
      const load = Math.min(100, o * 22 + od * 10);
      return `<tr><td>${person(m.id, m.title)}</td><td class="t-right num">${o}</td><td class="t-right num" style="color:${od ? "var(--crit)" : "inherit"};font-weight:${od ? 600 : 400}">${od}</td><td class="t-right num">${pin}</td><td class="t-right num">${res}</td><td style="width:160px">${meter(load, load > 80 ? "meter--crit" : load > 55 ? "meter--warn" : "")}</td></tr>`;
    }).join("");
    lower = `<div class="grid grid--wide-narrow">
      ${panel("Team workload", `<div class="table-wrap"><table class="table"><thead><tr><th>Member</th><th class="t-right">Open</th><th class="t-right">Overdue</th><th class="t-right">To accept</th><th class="t-right">Resolved</th><th>Load</th></tr></thead><tbody>${rows}</tbody></table></div>`, { flush: true, sub: "Open work per person, internal and external" })}
      ${attentionPanel}
    </div>`;
  }

  return `${pageHead(title, sub, `${state.role === "member" ? "" : selectEl("dash-owner", ownerOpts, state.dashOwner, "dashOwner")}${selectEl("dash-client", clientOpts, state.dashClient, "dashClient")}`)}
    ${kpis}
    <div class="grid grid--wide-narrow">${volume}${slaPanel}</div>
    ${state.role === "member" ? attentionPanel : ""}
    ${lower}`;
};

/* ---------------------------------------------------------------------
   Intake inbox (#1–#5, #7, #15)
   --------------------------------------------------------------------- */
VIEWS.inbox = () => {
  const f = state.inboxFilter;
  const filters = [
    ["all", "All messages", "inbox", MESSAGES.length],
    ["ticket", "Became tickets", "ticket", MESSAGES.filter((m) => m.verdict !== "skip").length],
    ["skip", "Skipped by AI", "skip", MESSAGES.filter((m) => m.verdict === "skip").length],
    ["wa", "WhatsApp", "wa", MESSAGES.filter((m) => m.channel === "wa").length],
    ["mail", "Email", "mail", MESSAGES.filter((m) => m.channel === "mail").length],
    ["phone", "Phone logs", "phone", MESSAGES.filter((m) => m.channel === "phone").length],
  ];
  const list = MESSAGES.filter((m) => f === "all" || (f === "ticket" ? m.verdict !== "skip" : f === "skip" ? m.verdict === "skip" : m.channel === f));
  const sel = list.find((m) => m.id === state.inboxSel) || list[0];
  const verdict = (m) => ({
    ticket: () => `<span class="verdict verdict--ticket">${icon("ticket", "icon--sm")}Ticket ${m.ticket}</span>`,
    skip: () => `<span class="verdict verdict--skip">${icon("skip", "icon--sm")}Skipped</span>`,
    split: () => `<span class="verdict verdict--split">${icon("split", "icon--sm")}${m.multiDept ? `${m.subs.length} departments tagged` : `Split into ${m.subs.length}`}</span>`,
    link: () => `<span class="verdict verdict--link">${icon("link", "icon--sm")}Follow-up → ${m.ticket}</span>`,
  }[m.verdict]());

  let detail = `<div class="empty">Select a message.</div>`;
  if (sel) {
    const c = sel.client ? client(sel.client) : null;
    const t = sel.ticket ? findTicket(sel.ticket) : null;
    const routing = c ? `<div class="route">
        <div class="route__cell"><span class="eyebrow">1 · Owner</span>${person(t ? t.owner : c.owner)}</div>
        <div class="route__cell"><span class="eyebrow">2 · Backup</span>${person(t ? t.backup : c.backup)}</div>
        <div class="route__cell"><span class="eyebrow">3 · Escalation</span>${person(t ? t.escalation : c.manager)}</div>
      </div>` : "";
    const outcome = {
      ticket: () => `<div class="banner banner--ok"><span class="banner__icon">${icon("check")}</span><div class="banner__body"><span class="banner__title">Created ${sel.ticket}${sel.multi ? " · one ticket for all recipients" : ""}</span><span class="banner__text">${sel.multi ? `Sent to ${sel.to.join(", ")}. One ticket with Neha as owner; Aditya and Priya added as members.` : `Due ${slaInfo(t).sub.replace("Due ", "")} under the ${TIERS[c.tier].label.toLowerCase()} SLA (${t.type}: ${fmtDur(t.tatMin)}).`}</span></div><div class="banner__actions"><a class="btn btn--sm" href="#ticket-${sel.ticket}">Open ticket</a></div></div>`,
      skip: () => `<div class="banner banner--info"><span class="banner__icon">${icon("skip")}</span><div class="banner__body"><span class="banner__title">Not converted to a ticket</span><span class="banner__text">${sel.reason}. Skipped messages stay searchable here for 90 days.</span></div><div class="banner__actions"><button class="btn btn--sm" data-action="override">Create ticket anyway</button></div></div>`,
      split: () => `<div class="banner banner--pend"><span class="banner__icon">${icon("split")}</span><div class="banner__body"><span class="banner__title">${sel.multiDept ? `Needs ${sel.subs.length} departments · nested under ${sel.ticket}` : `Multi-issue message split into ${sel.subs.length} sub-tickets`}</span><span class="banner__text">${sel.subs.map((s) => { const p = findTicket(s); return `<a href="#ticket-${s}" class="mono">${s}</a> ${p.dept ? `<b>${p.dept}</b> → ${user(p.owner).name}: ` : ""}${esc(p.subject)}`; }).join("<br>")}${sel.multiDept ? `<br>Coordinator: ${user(findTicket(sel.ticket).owner).name}, who sends the combined reply.` : ""}</span></div>${sel.multiDept ? `<div class="banner__actions"><a class="btn btn--sm" href="#ticket-${sel.ticket}">Open ticket</a></div>` : ""}</div>`,
      link: () => `<div class="banner banner--info"><span class="banner__icon">${icon("link")}</span><div class="banner__body"><span class="banner__title">Linked as a follow-up to ${sel.ticket}</span><span class="banner__text">${esc(t.subject)} · owner ${user(t.owner).name}. No new ticket created; the owner is notified.</span></div><div class="banner__actions"><a class="btn btn--sm" href="#ticket-${sel.ticket}">Open ticket</a></div></div>`,
    }[sel.verdict]();
    detail = `
      <button class="btn btn--sm btn--ghost inbox__back" data-action="inboxBack">${icon("left", "icon--sm")}All messages</button>
      <div class="row row--between"><div class="row">${channelTag(sel.channel)}<span class="muted">via ${esc(sel.via)}</span></div><span class="muted num">${sel.time}</span></div>
      <div><h2 style="font-size:var(--fs-xl);font-weight:600">${esc(sel.subject || sel.org)}</h2><p class="muted">${esc(sel.from)} · ${esc(sel.org)}${sel.to ? ` · to ${sel.to.length} people` : ""}</p></div>
      <div class="msg__bubble msg__text">${esc(sel.body)}</div>
      ${sel.attachments ? `<div>${sel.attachments.map((a) => `<span class="attach">${icon("clip", "icon--sm")}${a}<span class="phase-tag">Parse in Phase 2</span></span>`).join("")}<p class="field__hint" style="margin-top:8px">Stored in <span class="code-chip">${c.code}/FY2026-27/${sel.ticket}/</span></p></div>` : ""}
      ${outcome}
      <div class="ai-card">
        <div class="ai-card__head">${icon("spark")}AI classification<span class="conf" style="margin-left:auto">Confidence ${sel.conf}% <span style="width:80px">${meter(sel.conf)}</span></span></div>
        <dl class="dl">
          <dt>Is it a query?</dt><dd>${sel.verdict === "skip" ? "No" : "Yes — client query"}</dd>
          ${c ? `<dt>Client match</dt><dd><span class="mono">${c.code}</span> ${esc(c.name)} ${tierTag(c.tier)}</dd><dt>Query type</dt><dd>${sel.type}</dd><dt>Engagement</dt><dd>${c.engagements.join(", ")}</dd>` : ""}
        </dl>
        ${routing ? `<div><p class="eyebrow" style="margin-bottom:8px">Routed by client &amp; service-provider mapping</p>${routing}</div>` : ""}
      </div>
      ${sel.verdict !== "skip" ? `<div class="row"><button class="btn btn--sm" data-action="reclassify">${icon("edit", "icon--sm")}Correct classification</button><button class="btn btn--sm btn--ghost" data-action="not-query">${icon("skip", "icon--sm")}Mark as not a query</button></div>` : ""}`;
  }

  return `${pageHead("Intake", "Every WhatsApp message, email and logged call lands here first. The AI decides what becomes a ticket; your team can override it.",
      `<button class="btn" data-action="log-call">${icon("phone", "icon--sm")}Log phone instruction</button>`)}
    <div class="inbox ${state.inboxOpen ? "is-detail" : ""}">
      <aside class="inbox__rail">
        <p class="eyebrow" style="padding:4px 10px 8px">View</p>
        ${filters.map(([k, l, ic, n]) => `<button class="inbox__railitem ${k === f ? "is-active" : ""}" data-action="inboxFilter" data-val="${k}">${icon(ic, "icon--sm")}${l}<span class="nav__count">${n}</span></button>`).join("")}
        <p class="eyebrow inbox__health" style="padding:16px 10px 8px">Connected</p>
        <div class="channel-health inbox__health" style="padding:0 10px;color:var(--ink-2)">
          <div class="channel-health__row"><span class="dot"></span>+91 98200 41110</div>
          <div class="channel-health__row"><span class="dot"></span>+91 98200 41120</div>
          <div class="channel-health__row"><span class="dot"></span>queries@</div>
          <div class="channel-health__row"><span class="dot dot--warn"></span>audit@ (renewing)</div>
        </div>
      </aside>
      <div class="inbox__list">${list.map((m) => `<div class="inbox__item ${sel && m.id === sel.id ? "is-active" : ""}" data-action="inboxSel" data-val="${m.id}" tabindex="0">
          <div class="inbox__from"><b class="row" style="gap:6px;flex-wrap:nowrap;min-width:0"><span class="channel channel--${m.channel}">${icon(CHANNEL[m.channel][0], "icon--sm")}</span>${esc(m.from)}</b><span class="muted num" style="white-space:nowrap">${m.time}</span></div>
          <div class="muted" style="font-size:var(--fs-xs)">${esc(m.org)}</div>
          <div class="inbox__snip">${esc(m.subject ? m.subject + " — " + m.body : m.body)}</div>
          <div>${verdict(m)}</div></div>`).join("")}</div>
      <div class="inbox__detail">${detail}</div>
    </div>`;
};

/* ---------------------------------------------------------------------
   Tickets list (#5, #8, #10, #14, #18)
   --------------------------------------------------------------------- */
VIEWS.tickets = () => {
  const base = scopedTickets();
  const groups = {
    open: ["Open", base.filter(isOpen)],
    overdue: ["Overdue", base.filter(isOverdue)],
    pending: ["Pending acceptance", base.filter((t) => t.status === "pending")],
    approval: ["Awaiting approval", base.filter((t) => t.status === "resolved")],
    reopened: ["Reopened", base.filter((t) => t.status === "reopened")],
    closed: ["Closed", base.filter((t) => t.status === "closed")],
  };
  let list = groups[state.ticketTab][1];
  if (state.ticketChannel !== "all") list = list.filter((t) => t.channel === state.ticketChannel);
  if (state.ticketType !== "all") list = list.filter((t) => t.type === state.ticketType);
  list = [...list].sort((a, b) => (a.tatMin - a.ageMin) - (b.tatMin - b.ageMin));
  const scopeLabel = { member: "My tickets", manager: "My team's tickets", leadership: "All tickets", platform: "All tickets" }[state.role] || "Tickets";
  return `${pageHead(scopeLabel, "Every relevant query becomes a ticket with an owner, a backup and an escalation contact. Sorted by time left on the SLA.",
      `<button class="btn" data-action="export">${icon("download", "icon--sm")}Export</button><button class="btn btn--primary" data-action="log-call">${icon("plus", "icon--sm")}New ticket</button>`)}
    <section class="panel">
      <div style="padding:0 20px">${tabs(Object.entries(groups).map(([k, [l, arr]]) => [k, l, arr.length]), state.ticketTab, "ticketTab")}</div>
      <div class="row row--between" style="padding:14px 20px">
        <div class="filterbar">
          ${[["all", "All channels"], ["wa", "WhatsApp"], ["mail", "Email"], ["phone", "Phone"]].map(([k, l]) => `<button class="chip ${state.ticketChannel === k ? "is-active" : ""}" data-action="ticketChannel" data-val="${k}">${l}</button>`).join("")}
          ${selectEl("ticket-type", [["all", "All query types"], ...QUERY_TYPES.map((q) => [q, q])], state.ticketType, "ticketType")}
        </div>
        ${slaLegend()}
      </div>
      ${ticketTable(list)}
    </section>`;
};

/* ---------------------------------------------------------------------
   Ticket detail (#8–#15, #18, #19, #24)
   --------------------------------------------------------------------- */
function threadFor(t) {
  const c = client(t.client);
  const src = MESSAGES.find((m) => m.ticket === t.id || (m.subs || []).includes(t.id));
  const owner = user(t.owner);
  const items = [];
  items.push({ kind: "client", who: src ? src.from : c.name, org: src ? src.org : c.name, when: src ? `Today ${src.time}` : clockAt(-t.ageMin), body: src ? src.body : t.subject + ".", attachments: src && src.attachments });
  items.push({ kind: "system", body: t.multiDept
    ? `Ticket created from ${CHANNEL[t.channel][1]} · AI found ${t.subs.length} departments (${t.subs.map((s) => s.dept).join(", ")}) · one part each, routed by client mapping · ${owner.name} coordinates`
    : `Ticket created from ${CHANNEL[t.channel][1]} · classified as ${t.type} · routed to ${owner.name} by mapping (${c.code} → ${t.type} owner)` });
  items.push({ kind: "system", body: `Instant acknowledgement is off in Phase 1. The team replies personally.`, phase: true });
  if (t.followUps) items.push({ kind: "client", who: "Anita D'Souza", org: "Oakridge – HR & Payroll", when: "Today 10:40", body: "Any update on the PF claim? Both employees are asking again." });
  if (t.status !== "received") items.push({ kind: "note", who: owner.name, when: clockAt(-t.ageMin + 40), body: t.type === "GST" ? "Pulled 2B vs books. Differences: Gujarat Chemicals ₹48,200 (filed late), Ravi Packaging ₹12,600 (invoice not uploaded), Om Logistics ₹3,150 (RCM)." : "Checked the client file and prior correspondence. Drafting a reply." });
  if (["resolved", "closed", "reopened"].includes(t.status)) items.push({ kind: "team", who: owner.name, when: clockAt(-t.ageMin + 300), body: "Dear Sir, we have reviewed this. Summary and next steps are attached. Please let us know if anything is unclear.", channelTo: t.channel });
  if (t.status === "reopened") items.push({ kind: "client", who: "Ramesh Iyer", org: c.name, when: "Today 09:12", body: "We still disagree on capitalising the site office containers — these are reused across projects. Reopening.", attachments: ["FAR_FY26_rev2.xlsx"] });
  if (t.status === "reopened") items.push({ kind: "system", body: `Reopened by client via email link · escalated to ${user(t.escalation).name} · reopen count ${t.reopens}` });
  return items.map((m) => {
    if (m.kind === "system") return `<div class="msg msg--system"><div class="msg__bubble">${icon(m.phase ? "clock" : "spark", "icon--sm")}${m.body}${m.phase ? ' <span class="phase-tag">Phase 2</span>' : ""}</div></div>`;
    const avatar = m.kind === "client" ? `<span class="av" style="background:var(--surface-3);color:var(--ink-2)">${m.who.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>` : `<span class="av">${USERS.find((u) => u.name === m.who)?.initials || "?"}</span>`;
    const label = m.kind === "note" ? `<span class="tag">${icon("lock", "icon--sm")}Internal note</span>` : m.kind === "team" ? `<span class="tag">${icon("send", "icon--sm")}Sent on ${CHANNEL[m.channelTo][1]}</span>` : "";
    return `<div class="msg msg--${m.kind}">${avatar}<div class="msg__bubble"><div class="msg__head"><span class="msg__who">${esc(m.who)}</span>${m.org ? `<span class="msg__when">${esc(m.org)}</span>` : ""}<span class="msg__when">${m.when}</span>${label}</div><div class="msg__text">${esc(m.body)}</div>${(m.attachments || []).map((a) => `<span class="attach">${icon("clip", "icon--sm")}${a}<span class="phase-tag">Parse in Phase 2</span></span>`).join("")}</div></div>`;
  }).join("");
}

VIEWS.ticket = (id) => {
  const t = findTicket(id);
  if (!t) return `<div class="empty">Ticket ${esc(id)} not found. <a href="#tickets">Back to tickets</a></div>`;
  const c = client(t.client);
  const u = me();
  const s = slaInfo(t);
  const isMgr = ["manager", "leadership"].includes(state.role);
  const steps = ["Received", "Assigned", "In progress", "Resolved", "Closed"];
  const cur = { received: 0, assigned: 1, pending: 1, progress: 2, reopened: 2, resolved: 3, closed: 4 }[t.status];
  const stepper = `<div class="stepper" aria-label="Status">${steps.map((l, i) => `${i ? `<span class="step__line ${i <= cur ? "is-done" : ""}"></span>` : ""}<span class="step ${i < cur || t.status === "closed" ? "is-done" : ""} ${i === cur && t.status !== "closed" ? "is-current" : ""}"><span class="step__dot">${i < cur || t.status === "closed" ? icon("check", "icon--sm") : i + 1}</span>${l}</span>`).join("")}</div>`;

  const actions = [];
  if (isOpen(t) && t.status !== "pending") actions.push(`<button class="btn" data-action="reassign" data-val="${t.id}">${icon("swap", "icon--sm")}${isMgr ? "Assign / reassign" : "Reassign"}</button>`);
  if (isOpen(t) && t.status !== "pending" && !t.parentId) actions.push(`<button class="btn" data-action="tag-dept" data-val="${t.id}">${icon("split", "icon--sm")}Tag a department</button>`);
  const partsOpen = t.subs ? t.subs.filter((x) => !["resolved", "closed"].includes(x.status)).length : 0;
  if (isOpen(t) && t.status !== "pending") actions.push(t.multiDept && partsOpen
    ? `<button class="btn btn--primary" disabled data-tip="${partsOpen} department part${partsOpen > 1 ? "s" : ""} still open">${icon("check", "icon--sm")}Mark resolved</button>`
    : `<button class="btn btn--primary" data-action="resolve" data-val="${t.id}">${icon("check", "icon--sm")}Mark resolved</button>`);
  if (t.status === "resolved" && isMgr) actions.push(`<button class="btn" data-action="sendback" data-val="${t.id}">Send back</button><button class="btn btn--primary" data-action="approve" data-val="${t.id}">${icon("usercheck", "icon--sm")}Approve &amp; close</button>`);
  if (t.status === "closed") actions.push(`<button class="btn" data-action="reopen" data-val="${t.id}">${icon("reopen", "icon--sm")}Reopen</button>`);

  const parent = t.parentId ? findTicket(t.parentId) : null;
  let banner = "";
  if (parent && parent.multiDept) {
    banner = `<div class="banner banner--info"><span class="banner__icon">${icon("split")}</span><div class="banner__body"><span class="banner__title">${t.dept} part of a ${parent.subs.length}-department query</span><span class="banner__text">Answer only your department's part. ${user(parent.owner).name} combines all parts into one reply to the client.</span></div><div class="banner__actions"><a class="btn btn--sm" href="#ticket-${parent.id}">Open parent ${parent.id}</a></div></div>`;
  }
  if (t.status === "pending") {
    const forMe = t.transferTo === u.id;
    banner = `<div class="banner banner--pend"><span class="banner__icon">${icon("swap")}</span><div class="banner__body">
      <span class="banner__title">${forMe ? `${user(t.transferBy).name} wants to transfer this ticket to you` : `Pending acceptance by ${user(t.transferTo).name}`}</span>
      <span class="banner__text">“${esc(t.transferReason)}” · Ticket stays with ${user(t.owner).name} until accepted. Reminder sent at ${clockAt(-25).replace("Today ", "")}; escalates to ${user(t.escalation).name} at ${clockAt(95).replace("Today ", "")}.</span></div>
      <div class="banner__actions">${forMe ? `<button class="btn btn--sm" data-action="decline" data-val="${t.id}">Decline</button><button class="btn btn--sm btn--primary" data-action="accept" data-val="${t.id}">Accept ownership</button>` : `<button class="btn btn--sm" data-action="nudge" data-val="${t.id}">Send reminder</button><button class="btn btn--sm btn--ghost" data-action="withdraw" data-val="${t.id}">Withdraw</button>`}</div></div>`;
  } else if (t.status === "resolved") {
    banner = `<div class="banner banner--ok"><span class="banner__icon">${icon("usercheck")}</span><div class="banner__body"><span class="banner__title">Resolved by ${user(t.owner).name} · waiting for ${user(t.escalation).name} to approve</span><span class="banner__text">Maker–checker: closure is final only after the manager approves. The client is then emailed with a link to reopen.</span></div></div>`;
  } else if (t.status === "reopened") {
    banner = `<div class="banner banner--crit"><span class="banner__icon">${icon("reopen")}</span><div class="banner__body"><span class="banner__title">Reopened by the client · escalated</span><span class="banner__text">Reopened tickets are tracked separately and appear in the daily exception report.</span></div></div>`;
  } else if (s.over) {
    banner = `<div class="banner banner--crit"><span class="banner__icon">${icon("alert")}</span><div class="banner__body"><span class="banner__title">${s.main} · escalated to ${user(t.escalation).name}</span><span class="banner__text">${t.priority === "high" ? `High priority: ${user(c.partner).name} (Engagement Partner) is copied on the escalation.` : "The owner and backup were reminded before the due time."}</span></div></div>`;
  }

  let subsPanel = "";
  if (t.multiDept) {
    const done = t.subs.filter((x) => ["resolved", "closed"].includes(x.status)).length;
    subsPanel = panel("Departments on this query", `
      <div class="row" style="gap:12px;margin-bottom:14px"><span style="flex:1;min-width:120px">${meter(done / t.subs.length * 100)}</span><span class="num" style="font-size:var(--fs-sm)"><b>${done} of ${t.subs.length}</b> parts resolved</span></div>
      <div class="dept-grid">${t.subs.map((x) => { const part = { ...t, ...x, subs: undefined }; return `<a class="dept-card" href="#ticket-${x.id}">
        <span class="row row--between" style="flex-wrap:nowrap"><span class="eyebrow">${x.dept}</span>${slaCue(part, { ringOnly: true })}</span>
        <span>${statusPill(x.status)}</span>
        <span class="dept-card__q">${esc(x.subject)}</span>
        ${person(x.owner)}
        <span class="t-id">${x.id}</span></a>`; }).join("")}</div>
      <p class="field__hint" style="margin-top:14px">${user(t.owner).name} coordinates. The parent can be resolved once every department has resolved its part, then one combined reply goes to the client.</p>`,
      { sub: "One query, answered by several departments. Each tagged person owns their part and its SLA.", actions: isOpen(t) ? `<button class="btn btn--sm" data-action="tag-dept" data-val="${t.id}">${icon("plus", "icon--sm")}Tag another department</button>` : "" });
  } else if (t.subs) {
    subsPanel = panel("Sub-tickets", ticketTable(t.subs.map((x) => ({ ...t, ...x, subs: undefined })), { subs: false }), { flush: true, sub: "AI split one message into separate queries; each has its own owner and SLA" });
  }

  const pct = Math.round(Math.min(t.ageMin / t.tatMin, 9.99) * 100);
  const ladderStep = s.over ? (t.priority === "high" || t.ageMin > t.tatMin * 2 ? 3 : 2) : 1;
  const history = HISTORY[t.id] || [
    ...(t.status === "pending" ? [{ dot: "pend", text: `<b>${user(t.transferBy).name}</b> requested transfer to <b>${user(t.transferTo).name}</b> — “${esc(t.transferReason)}”`, meta: `${clockAt(-80)} · awaiting acceptance` }] : []),
    ...(s.over ? [{ dot: "crit", text: `Escalated to <b>${user(t.escalation).name}</b> (SLA breached)`, meta: clockAt(-t.ageMin + t.tatMin) + " · auto" }] : []),
    { dot: "", text: `Reminder sent to <b>${user(t.owner).name}</b> at 75% of TAT`, meta: clockAt(-t.ageMin + t.tatMin * 0.75) + " · auto" },
    t.multiDept
      ? { dot: "brand", text: `Split across ${t.subs.length} departments. <b>${user(t.owner).name}</b> (client owner for ${c.code}) coordinates; tagged: ${t.subs.map((x) => `${user(x.owner).name} (${x.dept})`).join(", ")}`, meta: clockAt(-t.ageMin + 1) + " · auto" }
      : { dot: "brand", text: `Assigned to <b>${user(t.owner).name}</b> via mapping (${c.code} → ${t.type}). Backup: ${user(t.backup).name}. Escalation: ${user(t.escalation).name}`, meta: clockAt(-t.ageMin + 1) + " · auto" },
    { dot: "", text: `Ticket created from ${CHANNEL[t.channel][1]} (${esc(t.source)})`, meta: clockAt(-t.ageMin) + " · auto" },
  ];
  const kb = KB.filter((k) => k.tags.some((tag) => t.type.startsWith(tag) || tag.startsWith(t.type.split(" ")[0]))).slice(0, 2);

  return `
    <div>${`<div class="crumbs"><a href="#tickets">Tickets</a>${icon("right", "icon--sm")}${parent ? `<a href="#ticket-${parent.id}" class="mono">${parent.id}</a>${icon("right", "icon--sm")}` : ""}<span class="mono">${t.id}</span></div>`}
    <header class="page-head"><div style="min-width:0"><h1 class="page-head__title" style="font-size:var(--fs-2xl)">${esc(t.subject)}</h1>
      <div class="row" style="margin-top:10px">${statusPill(t.status)}${prio(t.priority)}${channelTag(t.channel)}<span class="tag">${t.type}</span><span class="muted" style="font-size:var(--fs-sm)">${esc(c.name)} · <span class="mono">${c.code}</span></span></div></div>
      <div class="page-head__actions">${actions.join("")}</div></header></div>
    ${banner}
    <section class="panel"><div class="panel__body" style="padding:14px 20px">${stepper}<p class="field__hint" style="margin-top:10px">Each status change is posted back to the client on the same channel (${CHANNEL[t.channel][1]}).</p></div></section>
    <div class="grid grid--main-side">
      <div class="stack" style="gap:18px">
        ${subsPanel}
        ${panel("Conversation", `<div class="thread">${threadFor(t)}</div>
          <div class="composer" style="margin-top:18px">
            <div class="composer__tabs"><button class="composer__tab ${state.composerTab === "reply" ? "is-active" : ""}" data-action="composerTab" data-val="reply">Reply to client</button><button class="composer__tab ${state.composerTab === "note" ? "is-active" : ""}" data-action="composerTab" data-val="note">Internal note</button></div>
            <label class="sr-only" for="composer-text">Message</label>
            <textarea id="composer-text" placeholder="${state.composerTab === "reply" ? `Write your reply. It is sent from your name to ${t.channel === "wa" ? "the client's WhatsApp group" : "the client's email thread"}.` : "Visible only to the team. Mention someone with @"}"></textarea>
            <div class="composer__foot"><span class="field__hint">${state.composerTab === "reply" ? `${icon("lock", "icon--sm")} Only people send answers. The system never replies on its own.` : "Notes are never shared with the client."}</span><div class="row"><button class="btn btn--sm btn--ghost">${icon("clip", "icon--sm")}Attach</button><button class="btn btn--sm btn--primary" data-action="send">${icon("send", "icon--sm")}${state.composerTab === "reply" ? `Send on ${CHANNEL[t.channel][1]}` : "Add note"}</button></div></div>
          </div>`, { sub: `${t.source}` })}
      </div>
      <aside class="stack" style="gap:18px">
        ${panel("SLA", `<div class="row" style="gap:14px;margin-bottom:14px">${slaCue(t)}<span class="muted num" style="margin-left:auto">${pct}% of TAT used</span></div>
          <dl class="dl">
            <dt>Received</dt><dd class="num">${clockAt(-t.ageMin)}</dd>
            <dt>Respond by</dt><dd class="num">${clockAt(t.tatMin - t.ageMin)} <span class="muted">(${fmtDur(t.tatMin)} · ${TIERS[c.tier].label})</span></dd>
            <dt>Remind owner</dt><dd class="num">${clockAt(t.tatMin * 0.75 - t.ageMin)}</dd>
            <dt>Remind manager</dt><dd class="num">${clockAt(t.tatMin - t.ageMin)}</dd>
          </dl>
          <p class="eyebrow" style="margin:18px 0 4px">Escalation matrix</p>
          <div class="ladder">${[["Accountant", t.owner, "At 75% of TAT"], ["Manager", t.escalation, "At due time"], ["Engagement Partner", c.partner, "Critical or 2× TAT"]].map(([r, uid, when], i) => `<div class="ladder__step ${i + 1 < ladderStep ? "is-done" : ""} ${i + 1 === ladderStep && s.over ? "is-now" : ""}"><span class="ladder__n">${i + 1}</span><div style="min-width:0"><div style="font-weight:500">${user(uid).name}</div><div class="muted" style="font-size:var(--fs-xs)">${r} · ${when}</div></div></div>`).join("")}</div>`)}
        ${panel("People", `<dl class="dl">
            <dt>${t.multiDept ? "Coordinator" : "Owner"}</dt><dd>${person(t.owner)}</dd>
            <dt>Backup</dt><dd>${person(t.backup)}</dd>
            <dt>Escalation</dt><dd>${person(t.escalation)}</dd>
            <dt>Partner</dt><dd>${person(c.partner)}</dd>
            ${t.multiDept ? t.subs.map((x, i) => `<dt>${i ? "" : "Tagged"}</dt><dd>${person(x.owner, x.dept)}</dd>`).join("") : ""}
            ${(t.members || []).length ? `<dt>Members</dt><dd><span class="av-stack">${t.members.map((m) => av(m, "sm")).join("")}</span> <span class="muted" style="font-size:var(--fs-xs)">from email To/Cc</span></dd>` : ""}
          </dl>`)}
        ${panel("Client mapping", `<dl class="dl">
            <dt>Client</dt><dd><a href="#client-${c.id}">${esc(c.name)}</a></dd>
            <dt>Code / group</dt><dd><span class="mono">${c.code}</span> · ${esc(c.group)}</dd>
            <dt>SLA tier</dt><dd>${tierTag(c.tier)}</dd>
            <dt>Engagement</dt><dd>${c.engagements.join(", ")}</dd>
            <dt>Service providers</dt><dd>${Object.entries(c.providers).map(([k, v]) => `${k}: ${user(v).name}`).join("<br>")}</dd>
          </dl>`)}
        ${panel("Assignment history", `<div class="timeline">${history.map((h) => `<div class="tl"><span class="tl__dot ${h.dot ? "tl__dot--" + h.dot : ""}"></span><div><div class="tl__text">${h.text}</div><div class="tl__meta">${h.meta}</div></div></div>`).join("")}</div>`)}
        ${kb.length ? panel("Similar resolved queries", kb.map((k) => `<div style="display:grid;gap:4px;padding:10px 0;border-top:1px solid var(--line)"><a href="#knowledge" style="font-weight:500">${esc(k.q)}</a><span class="muted" style="font-size:var(--fs-xs)">From ${k.source} · used ${k.used}×</span></div>`).join(""), { sub: "From the knowledge base" }) : ""}
      </aside>
    </div>`;
};

/* ---------------------------------------------------------------------
   Tasks & compliance (#25–#28, #30)
   --------------------------------------------------------------------- */
VIEWS.tasks = () => {
  const tabsHtml = tabs([["calendar", "Compliance calendar"], ["recurring", "Recurring tasks", TASKS.filter((t) => t.kind === "Recurring").length], ["onboarding", "Onboarding tasks", TASKS.filter((t) => t.kind === "Onboarding").length]], state.tasksTab, "tasksTab");
  let body;
  if (state.tasksTab === "calendar") {
    const first = new Date(2026, 9, 1);
    const offset = (first.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const d = i - offset + 1;
      const inMonth = d >= 1 && d <= 31;
      const evs = inMonth ? COMPLIANCE.filter((e) => e.day === d) : [];
      const label = inMonth ? d : d < 1 ? 30 + d : d - 31;
      cells.push(`<div class="cal__day ${inMonth ? "" : "cal__day--out"} ${d === 7 ? "cal__day--today" : ""}"><span class="cal__date">${label}${d === 7 ? " · Today" : ""}</span>${evs.map((e) => {
        const cls = e.status === "overdue" ? "crit" : e.done === e.clients ? "ok" : d <= 11 ? "warn" : "";
        return `<span class="cal__ev ${cls ? "cal__ev--" + cls : ""}" data-tip="${esc(e.title)} · ${e.done}/${e.clients} clients done">${esc(e.title)} <b class="num">${e.done}/${e.clients}</b></span>`;
      }).join("")}</div>`);
    }
    body = `<div class="row row--between" style="padding:16px 20px"><div class="row"><button class="iconbtn" aria-label="Previous month">${icon("left")}</button><h2 style="font-family:var(--font-display);font-weight:500;font-size:var(--fs-xl)">October 2026</h2><button class="iconbtn" aria-label="Next month">${icon("right")}</button></div>
      <div class="legend"><span><span class="legend__sw" style="background:var(--crit)"></span>Overdue</span><span><span class="legend__sw" style="background:var(--warn)"></span>Due within 5 days</span><span><span class="legend__sw" style="background:var(--ok)"></span>All clients done</span><span><span class="legend__sw" style="background:var(--line-strong)"></span>Upcoming</span></div></div>
      <div class="table-wrap"><div class="cal" style="min-width:640px">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div class="cal__dow">${d}</div>`).join("")}${cells.join("")}</div></div>`;
  } else {
    const kind = state.tasksTab === "recurring" ? "Recurring" : "Onboarding";
    const list = TASKS.filter((t) => t.kind === kind && (state.role !== "member" || t.owner === me().id || t.transferTo === me().id));
    body = `<div class="table-wrap"><table class="table"><thead><tr><th>Task</th><th>Client</th><th>Owner</th><th>Due</th><th>From template</th><th>Status</th></tr></thead><tbody>
      ${list.map((t) => { const tpl = byId(TASK_TEMPLATES, t.template); return `<tr><td><div class="t-title">${esc(t.name)}<small class="mono">${t.id}</small></div></td><td>${clientCell(t.client)}</td><td>${person(t.owner, t.transferTo ? `→ ${user(t.transferTo).name.split(" ")[0]} (pending)` : undefined)}</td><td class="num">${t.due}</td><td><span class="tag">${esc(tpl.name)}</span><div class="muted" style="font-size:var(--fs-xs);margin-top:3px">${tpl.rule}</div></td><td>${statusPill(t.status)}</td></tr>`; }).join("")}
      </tbody></table></div>`;
  }
  return `${pageHead("Tasks & compliance", "Recurring statutory work and onboarding checklists, generated from task templates. They follow the same reminders, escalation and acceptance flow as tickets.",
      `<button class="btn" data-action="generate">${icon("repeat", "icon--sm")}Generate November cycle</button><button class="btn btn--primary" data-action="new-task">${icon("plus", "icon--sm")}Add task</button>`)}
    <section class="panel"><div style="padding:0 20px">${tabsHtml}</div>${body}</section>`;
};

/* ---------------------------------------------------------------------
   Clients (#17, #26, #28, #29)
   --------------------------------------------------------------------- */
VIEWS.clients = () => {
  const rows = CLIENTS.map((c) => {
    const ts = TICKETS.filter((t) => t.client === c.id);
    const tasks = TASKS.filter((t) => t.client === c.id);
    const done = tasks.filter((t) => t.status === "done").length;
    return `<tr class="is-link" data-href="#client-${c.id}"><td><div class="t-title">${esc(c.name)}<small>${c.kind} · ${esc(c.group)}</small></div></td><td class="t-id">${c.code}</td><td>${tierTag(c.tier)}</td><td>${person(c.manager)}</td><td>${person(c.owner)}</td><td><div class="row" style="gap:4px">${c.engagements.map((e) => `<span class="tag">${e}</span>`).join("")}</div></td><td class="t-right num">${ts.filter(isOpen).length}${ts.some(isOverdue) ? ` <span class="pill pill--crit pill--plain">${ts.filter(isOverdue).length} overdue</span>` : ""}</td><td style="min-width:120px">${tasks.length ? `<div class="row" style="gap:8px;flex-wrap:nowrap">${meter(done / tasks.length * 100)}<span class="muted num" style="font-size:var(--fs-xs)">${done}/${tasks.length}</span></div>` : '<span class="muted">—</span>'}</td></tr>`;
  }).join("");
  return `${pageHead("Clients", "Client master: SLA tier, partner, manager, owners and service providers. This mapping drives ticket routing and task generation.",
      `<button class="btn" data-action="export">${icon("download", "icon--sm")}Import / export</button><button class="btn btn--primary" data-action="new-client">${icon("plus", "icon--sm")}Add client</button>`)}
    <section class="panel"><div class="row row--between" style="padding:14px 20px"><div class="filterbar">${["All", "Key", "Retainer", "Standard"].map((x, i) => `<button class="chip ${i === 0 ? "is-active" : ""}">${x}</button>`).join("")}</div><span class="muted" style="font-size:var(--fs-sm)">${CLIENTS.length} clients · ${new Set(CLIENTS.map((c) => c.group).filter((g) => g !== "—")).size} groups</span></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>Client</th><th>Code</th><th>Tier</th><th>Manager</th><th>Owner</th><th>Engagements</th><th class="t-right">Open tickets</th><th>Tasks (Oct)</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
};

VIEWS.client = (id) => {
  const c = client(id);
  if (!c) return `<div class="empty">Client not found.</div>`;
  const tpls = TASK_TEMPLATES.filter((t) => t.engagement === "All" || c.engagements.some((e) => e.startsWith(t.engagement) || t.engagement.startsWith(e.split("/")[0])));
  const off = new Set(c.id === "c1" ? ["tt3"] : []);
  return `<div><div class="crumbs"><a href="#clients">Clients</a>${icon("right", "icon--sm")}<span class="mono">${c.code}</span></div>
    ${pageHead(esc(c.name), `${c.kind} · Group: ${esc(c.group)} · <span class="mono">${c.code}</span>`, `${tierTag(c.tier)}<button class="btn" data-action="edit-client">${icon("edit", "icon--sm")}Edit mapping</button><button class="btn btn--danger">Deactivate</button>`)}</div>
    <div class="grid grid--3">
      ${panel("Responsibility", `<dl class="dl"><dt>Engagement partner</dt><dd>${person(c.partner)}</dd><dt>Manager</dt><dd>${person(c.manager)}</dd><dt>Owner</dt><dd>${person(c.owner)}</dd><dt>Backup</dt><dd>${person(c.backup)}</dd></dl>`)}
      ${panel("Service providers", `<dl class="dl">${Object.entries(c.providers).map(([k, v]) => `<dt>${k}</dt><dd>${person(v)}</dd>`).join("")}</dl>`)}
      ${panel("SLA for this client", `<dl class="dl">${Object.entries(SLA_MATRIX).slice(0, 6).map(([k, v]) => `<dt>${k}</dt><dd class="num">${v[c.tier]} working hrs</dd>`).join("")}</dl>`, { sub: `${TIERS[c.tier].label} tier · from engagement terms` })}
    </div>
    ${panel("Task plan", `<div class="table-wrap"><table class="table"><thead><tr><th>Include</th><th>Task</th><th>Type</th><th>Due-date rule</th><th>Owner</th><th></th></tr></thead><tbody>
      ${tpls.map((t) => `<tr><td><label class="switch"><input type="checkbox" id="tpl-${c.id}-${t.id}" ${off.has(t.id) ? "" : "checked"} data-action="toggle-tpl" aria-label="Include ${esc(t.name)}"><span></span></label></td><td><div class="t-title">${esc(t.name)}<small>${t.engagement}</small></div></td><td><span class="tag">${t.kind} · ${t.freq}</span></td><td>${t.rule}</td><td>${t.role}</td><td class="t-right"><button class="btn btn--sm btn--ghost">${icon("edit", "icon--sm")}Modify</button></td></tr>`).join("")}
      <tr><td></td><td colspan="5"><button class="btn btn--sm" data-action="new-task">${icon("plus", "icon--sm")}Add a client-specific task</button></td></tr>
      </tbody></table></div>`, { flush: true, sub: "Templates for this client's engagement types. Switch off, modify or add tasks for this client only." })}
    ${panel("Tickets", ticketTable(TICKETS.filter((t) => t.client === c.id)), { flush: true })}`;
};

/* ---------------------------------------------------------------------
   Knowledge base (#24)
   --------------------------------------------------------------------- */
VIEWS.knowledge = () => {
  const q = state.kbQuery.toLowerCase();
  const list = KB.filter((k) => (state.kbTag === "all" || k.tags.includes(state.kbTag)) && (!q || (k.q + " " + k.a).toLowerCase().includes(q)));
  const tags = ["all", "GST", "TDS", "Income Tax", "ROC", "PF/ESI"];
  return `${pageHead("Knowledge base", "Every resolved ticket can be saved here so repeat GST, TDS, ROC and tax questions get the same answer every time.")}
    <div class="kb-search">${icon("search", "icon--lg")}<label class="sr-only" for="kb-q">Search knowledge base</label><input id="kb-q" data-input="kbQuery" value="${esc(state.kbQuery)}" placeholder="Search answers, e.g. “194Q”, “e-way bill”, “26AS”"></div>
    <div class="filterbar">${tags.map((t) => `<button class="chip ${state.kbTag === t ? "is-active" : ""}" data-action="kbTag" data-val="${t}">${t === "all" ? "All topics" : t} <span class="chip__n">${t === "all" ? KB.length : KB.filter((k) => k.tags.includes(t)).length}</span></button>`).join("")}</div>
    <section class="panel">${list.map((k) => `<article class="kb-card"><h2 class="kb-card__q">${esc(k.q)}</h2><p class="kb-card__a">${esc(k.a)}</p>
      <div class="kb-card__meta">${k.tags.map((t) => `<span class="tag">${t}</span>`).join("")}<span>From <span class="mono">${k.source}</span></span><span>${person(k.by)}</span><span>Used ${k.used}×</span><span>Updated ${k.updated}</span><button class="btn btn--sm btn--ghost" style="margin-left:auto" data-action="copy-kb" data-val="${k.id}">Copy answer</button></div></article>`).join("") || `<div class="empty">No answers match “${esc(state.kbQuery)}”.</div>`}</section>`;
};

/* ---------------------------------------------------------------------
   Reports & analytics (#20, #22, #23)
   --------------------------------------------------------------------- */
VIEWS.reports = () => {
  let body;
  if (state.reportsTab === "exceptions") {
    const sec = (title, sub, list, extra = "") => panel(`${title} <span class="tab__n">${list.length}</span>`, list.length ? ticketTable(list, { subs: false }) : `<div class="empty">None in this period.</div>`, { flush: true, sub, actions: extra });
    const all = TICKETS;
    body = `<div class="banner banner--info"><span class="banner__icon">${icon("mail")}</span><div class="banner__body"><span class="banner__title">${{ day: "Daily", week: "Weekly", month: "Monthly", quarter: "Quarterly", custom: "Custom" }[state.period]} exception report · ${periodLabel()}</span><span class="banner__text">${state.period === "custom" ? "One-off report for the dates you picked." : "Emailed automatically to Rohan Mehta, Priya Iyer and Sameer Joshi."} Pending-age buckets are measured as of today.</span></div><div class="banner__actions"><button class="btn btn--sm" data-action="schedule">Edit schedule</button><button class="btn btn--sm" data-action="export">${icon("download", "icon--sm")}Download</button></div></div>
      ${sec("Pending over 72 hours", "Open tickets received more than 3 days ago", all.filter((t) => isOpen(t) && t.ageMin > 4320))}
      ${sec("Pending over 24 hours", "Open tickets received 1–3 days ago", all.filter((t) => isOpen(t) && t.ageMin > 1440 && t.ageMin <= 4320))}
      ${sec("Reopened queries", "Clients reopened these after closure", all.filter((t) => t.status === "reopened"))}
      ${sec("High-priority complaints", "High priority and overdue", all.filter((t) => t.priority === "high" && isOverdue(t)))}
      ${sec("Unaccepted reassignments", "Transfers still waiting for the new owner", all.filter((t) => t.status === "pending"))}`;
  } else {
    const dims = { accountant: USERS.filter((u) => u.role === "member" && u.active).map((u) => [u.name, u.title]), client: CLIENTS.map((c) => [c.name, c.code]), engagement: ["GST", "TDS", "Income Tax", "ROC", "Audit", "PF/ESI", "Accounting"].map((e) => [e, "Engagement type"]), provider: ["CS", "GST", "Income Tax", "Auditor", "PF Consultant"].map((e) => [e, "Service provider"]) }[state.analyticsDim];
    const scale = { day: 0.05, week: 0.25, month: 1, quarter: 3, custom: periodDays() / 30 }[state.period];
    const rows = dims.map(([n, m], i) => { const seed = (n.length * 7 + i * 13) % 17; return { n, m, vol: Math.max(1, Math.round((18 + seed * 4) * scale)), frt: (1.1 + (seed % 7) * 0.45).toFixed(1), res: 82 + (seed % 15), tat: (3 + (seed % 9) * 1.3).toFixed(1), reo: ((seed % 5) * 1.4).toFixed(1) }; });
    const maxF = Math.max(...rows.map((r) => +r.frt));
    body = `<div class="grid grid--wide-narrow">
      ${panel("Breakdown", `<div class="table-wrap"><table class="table"><thead><tr><th>${{ accountant: "Accountant", client: "Client", engagement: "Engagement", provider: "Service provider" }[state.analyticsDim]}</th><th class="t-right">Volume</th><th class="t-right">Median 1st response</th><th class="t-right">Resolved in SLA</th><th class="t-right">Avg TAT</th><th class="t-right">Reopen rate</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td><div class="t-title">${esc(r.n)}<small>${esc(r.m)}</small></div></td><td class="t-right num">${r.vol}</td><td class="t-right num">${r.frt} h</td><td class="t-right num" style="color:${r.res < 88 ? "var(--warn)" : "inherit"}">${r.res}%</td><td class="t-right num">${r.tat} h</td><td class="t-right num">${r.reo}%</td></tr>`).join("")}
      </tbody></table></div>`, { flush: true, sub: periodLabel(), actions: segmented([["accountant", "Accountant"], ["client", "Client"], ["engagement", "Engagement"], ["provider", "Provider"]], state.analyticsDim, "analyticsDim") })}
      ${panel("Median first response", `<div class="stack">${rows.map((r) => `<div class="hbar" data-tip="${esc(r.n)}: ${r.frt} h median first response"><span class="hbar__label">${esc(r.n)}</span><span class="hbar__track"><span class="hbar__fill ${+r.frt > 3 ? "hbar__fill--warn" : ""}" style="display:block;width:${(+r.frt / maxF) * 100}%"></span></span><span class="hbar__val">${r.frt} h</span></div>`).join("")}</div>
        <div class="legend" style="margin-top:14px"><span><span class="legend__sw" style="background:var(--brand)"></span>Within 3 h target</span><span><span class="legend__sw" style="background:var(--warn)"></span>Above target</span></div>`, { sub: `Hours · ${periodLabel()}` })}
    </div>`;
  }
  return `${pageHead("Reports", "Exceptions for follow-up, and performance by accountant, client, engagement type and service provider.", periodPicker())}
    ${tabs([["exceptions", "Exceptions"], ["analytics", "Analytics"]], state.reportsTab, "reportsTab")}
    ${body}`;
};

/* ---------------------------------------------------------------------
   Masters & admin (#16, #19, #25, #29, #33–#37, #48, #49)
   --------------------------------------------------------------------- */
VIEWS.templates = () => {
  const groups = [...new Set(TASK_TEMPLATES.map((t) => t.engagement))];
  return `${pageHead("Task templates", "Standard tasks per engagement type. Each has a default owner role, due-date rule and SLA. Onboarding tasks are created when a client is added; recurring ones on schedule.", `<button class="btn btn--primary" data-action="new-template">${icon("plus", "icon--sm")}New template</button>`)}
    ${groups.map((g) => panel(g === "All" ? "Every new client" : g, `<div class="table-wrap"><table class="table"><thead><tr><th>Task</th><th>Type</th><th>Frequency</th><th>Due-date rule</th><th>Default owner</th><th>Reminder</th><th></th></tr></thead><tbody>
      ${TASK_TEMPLATES.filter((t) => t.engagement === g).map((t) => `<tr><td style="font-weight:500">${esc(t.name)}</td><td>${t.kind === "Onboarding" ? `<span class="pill pill--info">Onboarding</span>` : `<span class="pill pill--brand">Recurring</span>`}</td><td>${t.freq}</td><td>${t.rule}</td><td>${t.role}</td><td>${t.sla}</td><td class="t-right"><button class="btn btn--sm btn--ghost" aria-label="Edit">${icon("edit", "icon--sm")}</button></td></tr>`).join("")}
    </tbody></table></div>`, { flush: true })).join("")}`;
};

VIEWS.sla = () => `${pageHead("SLA & escalation", "Turnaround times by query type and client tier, plus the reminder and escalation rules. Changes apply to new tickets.", `<button class="btn btn--primary" data-action="save">Save changes</button>`)}
  ${panel("Turnaround time (working hours)", `<div class="table-wrap"><table class="table matrix"><thead><tr><th>Query type</th><th>${tierTag("key")}</th><th>${tierTag("retainer")}</th><th>${tierTag("standard")}</th></tr></thead><tbody>
    ${Object.entries(SLA_MATRIX).map(([k, v], i) => `<tr><td style="font-weight:500">${k}</td>${["key", "retainer", "standard"].map((tier) => `<td><label class="sr-only" for="sla-${i}-${tier}">${k} ${tier}</label><input class="cell-in" id="sla-${i}-${tier}" value="${v[tier]}" inputmode="numeric"></td>`).join("")}</tr>`).join("")}
  </tbody></table></div>`, { flush: true, sub: "A client's engagement terms can override these on the client record." })}
  <div class="grid grid--2">
    ${panel("Ticket reminders & escalation", `<div class="ladder">
      ${[["Owner", "Reminder at 75% of TAT, and again at due time", "Accountant"], ["Owner + backup + manager", "At due time — ticket turns red", "Manager"], ["Engagement partner", "High priority overdue, or open at 2× TAT", "Engagement Partner"]].map(([w, d, r], i) => `<div class="ladder__step"><span class="ladder__n">${i + 1}</span><div><div style="font-weight:500">${w}</div><div class="muted" style="font-size:var(--fs-sm)">${d}</div></div><span class="tag">${r}</span></div>`).join("")}
    </div>`, { sub: "Accountant → Manager → Engagement Partner" })}
    ${panel("Unaccepted transfers", `<div class="form-grid">
      <div class="field"><label class="field__label" for="r1">Remind new owner after</label><select class="select" id="r1"><option>1 hour</option><option>2 hours</option></select></div>
      <div class="field"><label class="field__label" for="r2">Escalate to manager after</label><select class="select" id="r2"><option>3 hours</option><option>4 hours</option></select></div>
      <label class="check span-2"><input type="checkbox" checked id="r3">Show on the engagement partner's dashboard after 1 working day</label>
      <label class="check span-2"><input type="checkbox" checked id="r4">Include in the daily exception report</label>
    </div>`, { sub: "The ticket stays with the current owner until the transfer is accepted" })}
  </div>`;

VIEWS.users = () => `${pageHead("Users & access", "Add, edit, activate or deactivate internal staff and external consultants. External members receive assignments by email.", `<button class="btn btn--primary" data-action="new-user">${icon("plus", "icon--sm")}Invite user</button>`)}
  <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Type</th><th>Active</th><th></th></tr></thead><tbody>
  ${USERS.map((u) => `<tr><td>${person(u.id, u.title)}</td><td class="muted">${u.email}</td><td><span class="tag">${{ leadership: "Leadership", manager: "Manager", member: "Team member", platform: "Platform admin", sysadmin: "System admin" }[u.role]}</span></td><td>${u.team}</td><td>${u.type === "external" ? '<span class="pill pill--plain" style="background:var(--brass-soft);color:var(--brass)">External</span>' : '<span class="pill pill--plain">Internal</span>'}</td><td><label class="switch"><input type="checkbox" id="active-${u.id}" ${u.active ? "checked" : ""} data-action="toggle-user" data-val="${u.id}" aria-label="Active"><span></span></label></td><td class="t-right"><button class="btn btn--sm btn--ghost" aria-label="Edit">${icon("edit", "icon--sm")}</button></td></tr>`).join("")}
  </tbody></table></div></section>`;

VIEWS.channels = () => `${pageHead("Channels & integrations", "Where queries come in, and how the system sends notifications.")}
  <div class="grid grid--2">
    ${panel("WhatsApp intake", `<div class="stack">${[["+91 98200 41110", "Added to 38 client groups", "ok"], ["+91 98200 41120", "Added to 31 client groups", "ok"]].map(([n, d, s]) => `<div class="row row--between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row">${icon("wa")}<div><div style="font-weight:500" class="num">${n}</div><div class="muted" style="font-size:var(--fs-xs)">${d}</div></div></div><span class="pill pill--${s}">Connected</span></div>`).join("")}
      <p class="field__hint">Messages are read through Loop2.AI. Last sync 11:28.</p></div>`, { sub: "Loop2.AI" })}
    ${panel("Microsoft 365 mailboxes", `<div class="stack">${[["queries@mehtaassociates.in", "ok", "Connected"], ["accounts@mehtaassociates.in", "ok", "Connected"], ["audit@mehtaassociates.in", "warn", "Renewing access"]].map(([n, s, l]) => `<div class="row row--between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row">${icon("mail")}<span>${n}</span></div><span class="pill pill--${s}">${l}</span></div>`).join("")}
      <button class="btn btn--sm" style="justify-self:start">${icon("plus", "icon--sm")}Connect mailbox</button></div>`, { sub: "Microsoft Graph API" })}
    ${panel(`Instant acknowledgement <span class="phase-tag">Phase 2</span>`, `<div class="row row--between"><span>Send an automatic “received” reply</span><label class="switch"><input type="checkbox" id="ack" disabled aria-label="Auto acknowledgement"><span></span></label></div>
      <div class="field" style="margin-top:14px"><label class="field__label" for="ack-tpl">Message template</label><textarea class="textarea" id="ack-tpl" disabled>Thank you, we have received your query ({ticket_id}). {owner_name} will respond by {due_time}.</textarea><span class="field__hint">Built and ready; switched off for Phase 1.</span></div>`)}
    ${panel(`Attachments <span class="phase-tag">Phase 2 parsing</span>`, `<p class="ink-2" style="font-size:var(--fs-sm)">Attachments are stored with the ticket now. Parsing switches on in Phase 2, with one folder per document set.</p>
      <div class="field" style="margin-top:14px"><label class="field__label" for="nomen">Folder naming</label><input class="input mono" id="nomen" value="{client_code}/{financial_year}/{ticket_id}/{doc_type}_{date}"><span class="field__hint">Example: <span class="code-chip">SHR-001/FY2026-27/TKT-1048/Purchase-register_2026-10-07</span></span></div>`)}
    ${panel("Outgoing email", `<dl class="dl"><dt>Sender</dt><dd>notifications@mehtaassociates.in</dd><dt>Used for</dt><dd>External assignments, password resets, closure and reopen links</dd><dt>Status</dt><dd><span class="pill pill--ok">Verified</span></dd></dl>`, { sub: "Amazon SES" })}
  </div>`;

VIEWS.logs = () => {
  const list = LOGS.filter((l) => state.logLevel === "all" || l.level === state.logLevel);
  const pill = { info: "info", warn: "warn", error: "crit" };
  return `${pageHead("System logs", "Integration, scheduler, mailer and sign-in events. Kept for 90 days.", segmented([["all", "All"], ["info", "Info"], ["warn", "Warnings"], ["error", "Errors"]], state.logLevel, "logLevel"))}
    <section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Time</th><th>Level</th><th>Source</th><th>Event</th></tr></thead><tbody>
      ${list.map((l) => `<tr><td class="t-id">07 Oct ${l.t}</td><td><span class="pill pill--${pill[l.level]}">${l.level}</span></td><td class="mono" style="font-size:var(--fs-xs)">${l.src}</td><td>${esc(l.msg)}</td></tr>`).join("")}
    </tbody></table></div></section>`;
};

/* ---------------------------------------------------------------------
   Sign in (#41–#43)
   --------------------------------------------------------------------- */
VIEWS.login = (mode) => `<div class="login">
  <section class="login__art">
    <div class="brand" style="padding:0"><span class="brand__mark">L</span><div><div class="brand__name">Ledger</div><div class="brand__sub">Query management</div></div></div>
    <p class="login__quote">Every client query, <em>owned</em> and answered on time.</p>
    <div class="ledger-preview" aria-hidden="true">
      ${TICKETS.slice(0, 3).map((t) => `<div class="ledger-preview__row">${slaCue(t, { ringOnly: true })}<span style="min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.subject)}</span><span class="t-id">${t.id}</span></div>`).join("")}
    </div>
    <p style="font-size:var(--fs-xs)">Mehta &amp; Associates · Chartered Accountants</p>
  </section>
  <section class="login__form">
    ${mode === "forgot" ? `<form class="login__card" data-submit="forgot">
      <div><p class="eyebrow">Reset password</p><h1>Forgot your password?</h1><p class="ink-2" style="margin-top:8px">Enter your work email. We'll send a link to set a new password.</p></div>
      <div class="field"><label class="field__label" for="fp-email">Work email</label><input class="input" id="fp-email" type="email" value="aditya.rao@mehtaassociates.in" required></div>
      <button class="btn btn--primary btn--block" type="submit">Send reset link</button>
      <a href="#login" style="font-size:var(--fs-sm)">${icon("left", "icon--sm")} Back to sign in</a>
    </form>` : `<form class="login__card" data-submit="login">
      <div><p class="eyebrow">Welcome back</p><h1>Sign in</h1></div>
      <button type="button" class="btn btn--block" data-action="ms-login"><span class="ms-logo" aria-hidden="true"><i style="background:#f25022"></i><i style="background:#7fba00"></i><i style="background:#00a4ef"></i><i style="background:#ffb900"></i></span>Sign in with Microsoft</button>
      <div class="divider">or use email</div>
      <div class="field"><label class="field__label" for="li-email">Work email</label><input class="input" id="li-email" type="email" value="aditya.rao@mehtaassociates.in" required></div>
      <div class="field"><div class="row row--between"><label class="field__label" for="li-pass">Password</label><a href="#forgot" style="font-size:var(--fs-sm)">Forgot password?</a></div><input class="input" id="li-pass" type="password" value="••••••••••" required></div>
      <label class="check"><input type="checkbox" id="li-remember" checked>Keep me signed in for 30 days</label>
      <button class="btn btn--primary btn--block" type="submit">Sign in</button>
    </form>`}
  </section></div>`;
