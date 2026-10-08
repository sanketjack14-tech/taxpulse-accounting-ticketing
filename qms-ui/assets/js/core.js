/* =====================================================================
   Ledger — QMS core: state, lookups, formatters and shared components.
   Each component is a pure function returning an HTML string so it maps
   1:1 to a React/Vue/Angular component during build.
   ===================================================================== */

const ROLES = {
  leadership: { label: "Leadership", user: "u1" },
  manager: { label: "Manager", user: "u2" },
  member: { label: "Team member", user: "u4" },
  platform: { label: "Platform admin", user: "u11" },
  sysadmin: { label: "System admin (IT)", user: "u12" },
};

const state = {
  role: "manager",
  period: "day",
  dashOwner: "all",
  dashClient: "all",
  ticketTab: "open",
  ticketChannel: "all",
  ticketType: "all",
  inboxFilter: "all",
  inboxSel: "m1",
  inboxOpen: false, // phone only: showing one message full-screen
  tasksTab: "calendar",
  reportsTab: "exceptions",
  analyticsDim: "accountant",
  kbQuery: "",
  kbTag: "all",
  logLevel: "all",
  composerTab: "reply",
};

const store = {
  get(k) { try { return localStorage.getItem("qms." + k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem("qms." + k, v); } catch (e) { /* storage unavailable */ } },
};

/* ---------- lookups ---------- */
const byId = (arr, id) => arr.find((x) => x.id === id);
const user = (id) => byId(USERS, id);
const client = (id) => byId(CLIENTS, id);
const me = () => user(ROLES[state.role].user);
const allTickets = () => TICKETS.flatMap((t) => [t, ...(t.subs || []).map((s) => ({ ...t, ...s, parentId: t.id, subs: undefined, parent: false }))]);
const findTicket = (id) => {
  const t = TICKETS.find((x) => x.id === id);
  if (t) return t;
  for (const p of TICKETS) {
    const s = (p.subs || []).find((x) => x.id === id);
    if (s) return Object.assign(s, { client: s.client || p.client, channel: s.channel || p.channel, source: s.source || p.source, backup: s.backup || p.backup, escalation: s.escalation || p.escalation, priority: s.priority || p.priority, parentId: p.id, members: s.members || [] });
  }
  return null;
};
const isOpen = (t) => !["resolved", "closed"].includes(t.status);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Tickets visible to the active role (#21) */
function scopedTickets() {
  const u = me();
  const top = TICKETS;
  if (state.role === "member") return top.filter((t) => t.owner === u.id || t.transferTo === u.id || (t.subs || []).some((s) => s.owner === u.id) || (t.members || []).includes(u.id));
  if (state.role === "manager") return top.filter((t) => t.escalation === u.id);
  return top;
}

/* ---------- time / SLA ---------- */
function fmtDur(min) {
  const m = Math.abs(Math.round(min));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return r ? `${h}h ${String(r).padStart(2, "0")}m` : `${h}h`;
}
function clockAt(offsetMin) {
  const d = new Date(NOW.getTime() + offsetMin * 60000);
  const hm = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const sameDay = d.toDateString() === NOW.toDateString();
  return sameDay ? `Today ${hm}` : `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} ${hm}`;
}
function slaInfo(t) {
  const left = t.tatMin - t.ageMin;
  const pct = t.ageMin / t.tatMin;
  if (t.status === "closed") return { cls: "done", pct: 1, main: "Closed", sub: `in ${fmtDur(Math.min(t.ageMin, t.tatMin * 0.8))}` };
  if (t.status === "resolved") return { cls: "done", pct: 1, main: "Resolved", sub: "Awaiting approval" };
  if (left < 0) return { cls: "crit", pct: 1, main: `Overdue ${fmtDur(-left)}`, sub: `Was due ${clockAt(left)}`, over: true };
  if (pct >= 0.75) return { cls: "warn", pct, main: `${fmtDur(left)} left`, sub: `Due ${clockAt(left)}` };
  return { cls: "ok", pct, main: `${fmtDur(left)} left`, sub: `Due ${clockAt(left)}` };
}
const isOverdue = (t) => isOpen(t) && t.ageMin > t.tatMin;

/* ---------- components ---------- */
function slaCue(t, opts = {}) {
  const s = slaInfo(t);
  const C = 2 * Math.PI * 10;
  const cls = t.status === "pending" && !s.over ? "pend" : s.cls;
  return `<span class="sla sla--${cls}" data-tip="${esc(s.main + " · " + s.sub)}">
    <svg class="sla__ring" viewBox="0 0 26 26" aria-hidden="true"><circle class="sla__track" cx="13" cy="13" r="10"/><circle class="sla__val" cx="13" cy="13" r="10" stroke-dasharray="${(Math.min(s.pct, 1) * C).toFixed(1)} ${C.toFixed(1)}"/></svg>
    ${opts.ringOnly ? "" : `<span class="sla__text"><span class="sla__main">${s.main}</span><span class="sla__sub">${s.sub}</span></span>`}
  </span>`;
}

const STATUS = {
  received: ["Received", "info"],
  assigned: ["Assigned", "brand"],
  progress: ["In progress", "brand"],
  pending: ["Pending acceptance", "pend"],
  resolved: ["Resolved · awaiting approval", "ok"],
  closed: ["Closed", ""],
  reopened: ["Reopened", "crit"],
  done: ["Done", "ok"],
  overdue: ["Overdue", "crit"],
};
function statusPill(s) {
  const [label, cls] = STATUS[s] || [s, ""];
  return `<span class="pill ${cls ? "pill--" + cls : ""}">${label}</span>`;
}
function tierTag(tier) { return `<span class="tier tier--${tier}">${TIERS[tier].label}</span>`; }
function prio(p) {
  const label = { high: "High", med: "Medium", low: "Low" }[p];
  return `<span class="prio prio--${p}"><span class="prio__bars"><i></i><i></i><i></i></span>${label}</span>`;
}
const CHANNEL = { wa: ["wa", "WhatsApp"], mail: ["mail", "Email"], phone: ["phone", "Phone"] };
function channelTag(c) { const [ic, label] = CHANNEL[c]; return `<span class="channel channel--${c}">${icon(ic, "icon--sm")}${label}</span>`; }
function av(id, size = "") {
  const u = user(id);
  if (!u) return "";
  return `<span class="av ${size ? "av--" + size : ""} ${u.type === "external" ? "av--ext" : ""}" data-tip="${esc(u.name + " · " + u.title)}">${u.initials}</span>`;
}
function person(id, meta) {
  const u = user(id);
  return `<span class="person">${av(id, "sm")}<span style="min-width:0"><span class="person__name">${esc(u.name)}</span>${meta !== undefined ? `<span class="person__meta">${meta}</span>` : ""}</span>${u.type === "external" ? `<span class="tag" data-tip="External member — notified by email">${icon("external", "icon--sm")}Ext</span>` : ""}</span>`;
}
function clientCell(cid) {
  const c = client(cid);
  return `<div style="display:grid;gap:3px"><span style="font-weight:500;white-space:nowrap">${esc(c.name)}</span><span class="row" style="gap:6px"><span class="t-id">${c.code}</span>${tierTag(c.tier)}</span></div>`;
}
function meter(pct, cls = "") { return `<div class="meter ${cls}"><i style="width:${Math.max(3, Math.min(100, pct))}%"></i></div>`; }
function panel(title, body, opts = {}) {
  return `<section class="panel ${opts.cls || ""}">
    ${title ? `<header class="panel__head"><div><h2 class="panel__title">${title}</h2>${opts.sub ? `<p class="panel__sub">${opts.sub}</p>` : ""}</div>${opts.actions || ""}</header>` : ""}
    <div class="panel__body ${opts.flush ? "panel__body--flush" : ""}">${body}</div>
  </section>`;
}
function pageHead(title, sub, actions = "", crumbs = "") {
  return `<header class="page-head"><div>${crumbs}<h1 class="page-head__title">${title}</h1>${sub ? `<p class="page-head__sub">${sub}</p>` : ""}</div><div class="page-head__actions">${actions}</div></header>`;
}
function tabs(items, active, action) {
  return `<nav class="tabs" role="tablist">${items.map(([k, label, n]) => `<button class="tab ${k === active ? "is-active" : ""}" role="tab" aria-selected="${k === active}" data-action="${action}" data-val="${k}">${label}${n !== undefined ? `<span class="tab__n">${n}</span>` : ""}</button>`).join("")}</nav>`;
}
function segmented(items, active, action) {
  return `<div class="segmented" role="group">${items.map(([k, label]) => `<button class="${k === active ? "is-active" : ""}" data-action="${action}" data-val="${k}">${label}</button>`).join("")}</div>`;
}
function selectEl(id, options, value, action) {
  return `<select class="select" id="${id}" data-change="${action}" style="width:auto">${options.map(([v, l]) => `<option value="${v}" ${v === value ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
}

/* ---------- ticket table (shared by dashboard, tickets, client detail) ---------- */
function ticketRows(list, { showOwner = true, subs = true } = {}) {
  return list.map((t) => {
    const main = `<tr class="is-link" data-href="#ticket-${t.id}">
      <td>${slaCue(t)}</td>
      <td><div class="t-title">${esc(t.subject)}<small><span class="mono">${t.id}</span> · ${t.type}${t.followUps ? ` · ${t.followUps} follow-ups linked` : ""}${t.reopens ? ` · reopened ${t.reopens}×` : ""}</small></div></td>
      <td>${clientCell(t.client)}</td>
      <td>${channelTag(t.channel)}</td>
      ${showOwner ? `<td>${person(t.owner, t.status === "pending" ? `→ ${user(t.transferTo).name.split(" ")[0]} (pending)` : `Backup: ${user(t.backup).name.split(" ")[0]}`)}</td>` : ""}
      <td>${statusPill(t.status)}</td>
      <td>${prio(t.priority)}</td>
    </tr>`;
    const subRows = subs && t.subs ? t.subs.map((s) => `<tr class="is-link sub-row" data-href="#ticket-${s.id}">
      <td>${slaCue({ ...t, ...s })}</td>
      <td><div class="t-title">${esc(s.subject)}<small><span class="mono">${s.id}</span> · ${s.type} · sub-ticket</small></div></td>
      <td></td><td></td>
      ${showOwner ? `<td>${person(s.owner)}</td>` : ""}
      <td>${statusPill(s.status)}</td><td></td></tr>`).join("") : "";
    return main + subRows;
  }).join("");
}
function ticketTable(list, opts = {}) {
  if (!list.length) return `<div class="empty">No tickets match these filters.</div>`;
  return `<div class="table-wrap"><table class="table">
    <thead><tr><th>SLA</th><th>Query</th><th>Client</th><th>Channel</th>${opts.showOwner === false ? "" : "<th>Owner</th>"}<th>Status</th><th>Priority</th></tr></thead>
    <tbody>${ticketRows(list, opts)}</tbody></table></div>`;
}

function slaLegend() {
  return `<div class="legend-cues">
    <span class="sla sla--ok"><svg class="sla__ring" viewBox="0 0 26 26" style="width:16px;height:16px"><circle class="sla__track" cx="13" cy="13" r="10"/><circle class="sla__val" cx="13" cy="13" r="10" stroke-dasharray="25 63"/></svg>On track</span>
    <span class="sla sla--warn"><svg class="sla__ring" viewBox="0 0 26 26" style="width:16px;height:16px"><circle class="sla__track" cx="13" cy="13" r="10"/><circle class="sla__val" cx="13" cy="13" r="10" stroke-dasharray="52 63"/></svg>Due soon (≥75% of TAT)</span>
    <span class="sla sla--crit"><svg class="sla__ring" viewBox="0 0 26 26" style="width:16px;height:16px"><circle class="sla__track" cx="13" cy="13" r="10"/><circle class="sla__val" cx="13" cy="13" r="10" stroke-dasharray="63 63"/></svg>Overdue</span>
    <span class="sla sla--pend"><svg class="sla__ring" viewBox="0 0 26 26" style="width:16px;height:16px"><circle class="sla__track" cx="13" cy="13" r="10"/><circle class="sla__val" cx="13" cy="13" r="10" stroke-dasharray="30 63"/></svg>Pending acceptance</span>
  </div>`;
}

/* ---------- chart: vertical bars, single series ---------- */
function barChart(values, labels, { highlightLast = false, unit = "tickets", tipLabels } = {}) {
  const W = 640, H = 220, pl = 34, pr = 8, pt = 12, pb = 26;
  const max = Math.max(...values);
  const step = max > 40 ? 20 : max > 20 ? 10 : 5;
  const top = Math.ceil(max / step) * step;
  const iw = W - pl - pr, ih = H - pt - pb;
  const bw = iw / values.length;
  const y = (v) => pt + ih - (v / top) * ih;
  let g = "";
  for (let v = 0; v <= top; v += step) g += `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const bars = values.map((v, i) => {
    const x = pl + i * bw + 1, w = bw - 2 - Math.max(0, bw * 0.28), cx = x + (bw - 2) / 2, bx = cx - w / 2, by = y(v), bh = pt + ih - by, r = Math.min(4, bh);
    const last = highlightLast && i === values.length - 1;
    const d = `M${bx},${pt + ih} V${by + r} Q${bx},${by} ${bx + r},${by} H${bx + w - r} Q${bx + w},${by} ${bx + w},${by + r} V${pt + ih} Z`;
    const tip = `${tipLabels ? tipLabels[i] : labels[i]}: ${v} ${unit}${last ? " (so far)" : ""}`;
    const showLabel = values.length <= 8 || i % 2 === (values.length - 1) % 2;
    return `<g><rect class="hit" x="${pl + i * bw}" y="${pt}" width="${bw}" height="${ih}" data-tip="${tip}"/><path class="bar ${last ? "bar--today" : ""}" d="${d}" pointer-events="none"/>${showLabel ? `<text x="${cx}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>` : ""}</g>`;
  }).join("");
  return `<div class="table-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ticket volume">${g}<line class="axis-line" x1="${pl}" x2="${W - pr}" y1="${pt + ih}" y2="${pt + ih}"/>${bars}
    <line class="line" x1="${pl}" x2="${W - pr}" y1="${y(avg)}" y2="${y(avg)}" pointer-events="none"/><text x="${W - pr}" y="${y(avg) - 6}" text-anchor="end">avg ${avg.toFixed(0)}</text></svg></div>`;
}

/* ---------- overlays ---------- */
function openSheet(html, { center = false } = {}) {
  closeSheet();
  const el = document.createElement("div");
  el.className = "scrim" + (center ? " scrim--center" : "");
  el.id = "sheet";
  el.innerHTML = html;
  el.addEventListener("click", (e) => { if (e.target === el) closeSheet(); });
  document.body.appendChild(el);
  const f = el.querySelector("input, select, textarea, button.btn--primary");
  if (f) f.focus();
}
function closeSheet() { const s = document.getElementById("sheet"); if (s) s.remove(); }
function sheet(kind, title, sub, body, foot) {
  return `<div class="${kind}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <header class="sheet__head"><div><h2 class="sheet__title">${title}</h2>${sub ? `<p class="panel__sub">${sub}</p>` : ""}</div><button class="iconbtn" data-action="close-sheet" aria-label="Close">${icon("x")}</button></header>
    <div class="sheet__body">${body}</div>
    <footer class="sheet__foot">${foot}</footer></div>`;
}
function toast(msg) {
  let box = document.querySelector(".toasts");
  if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); document.body.appendChild(box); }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = icon("check") + `<span>${msg}</span>`;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3600);
}
