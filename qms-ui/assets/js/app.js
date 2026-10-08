/* =====================================================================
   Ledger — QMS shell: navigation, routing, events and dialogs.
   Routes are bare hash tokens: #dashboard, #ticket-TKT-1048, #client-c1
   ===================================================================== */

const NAV = [
  ["Work", [
    ["dashboard", "Dashboard", "dashboard", ["leadership", "manager", "member", "platform"]],
    ["inbox", "Intake", "inbox", ["manager", "member"]],
    ["tickets", "Tickets", "ticket", ["leadership", "manager", "member"]],
    ["tasks", "Tasks & compliance", "calendar", ["leadership", "manager", "member", "platform"]],
  ]],
  ["Insight", [
    ["reports", "Reports", "chart", ["leadership", "manager"]],
    ["knowledge", "Knowledge base", "book", ["leadership", "manager", "member", "platform"]],
  ]],
  ["Masters", [
    ["clients", "Clients", "building", ["leadership", "manager", "platform"]],
    ["templates", "Task templates", "layers", ["manager", "platform"]],
    ["sla", "SLA & escalation", "shield", ["leadership", "platform"]],
  ]],
  ["Administration", [
    ["users", "Users & access", "users", ["platform", "sysadmin"]],
    ["channels", "Channels", "plug", ["platform", "sysadmin"]],
    ["logs", "System logs", "terminal", ["sysadmin"]],
  ]],
];

function parseRoute() {
  const h = (location.hash || "").slice(1) || "dashboard";
  if (h.startsWith("ticket-")) return { name: "ticket", arg: h.slice(7), nav: "tickets" };
  if (h.startsWith("client-")) return { name: "client", arg: h.slice(7), nav: "clients" };
  if (h === "forgot") return { name: "login", arg: "forgot" };
  return { name: VIEWS[h] ? h : "dashboard", nav: h };
}

function navCount(key) {
  const t = scopedTickets();
  if (key === "tickets") { const n = t.filter(isOverdue).length; return n ? `<span class="nav__count nav__count--alert" data-tip="${n} overdue">${n}</span>` : ""; }
  if (key === "inbox") return `<span class="nav__count">${MESSAGES.filter((m) => m.verdict !== "skip").length}</span>`;
  return "";
}

function renderShell(route, content) {
  const u = me();
  const nav = NAV.map(([group, items]) => {
    const vis = items.filter((i) => i[3].includes(state.role));
    if (!vis.length) return "";
    return `<div class="nav__group">${group}</div>${vis.map(([k, l, ic]) => `<a class="nav__item ${route.nav === k ? "is-active" : ""}" href="#${k}" ${route.nav === k ? 'aria-current="page"' : ""}>${icon(ic)}${l}${navCount(k)}</a>`).join("")}`;
  }).join("");
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  return `<div class="shell" id="shell">
    <aside class="sidebar" aria-label="Main navigation">
      <div class="brand"><span class="brand__mark">L</span><div><div class="brand__name">Ledger</div><div class="brand__sub">Mehta &amp; Associates</div></div></div>
      <nav>${nav}</nav>
      <div class="sidebar__foot">
        <div class="channel-health">
          <div class="channel-health__row"><span class="dot"></span>WhatsApp · 2 numbers</div>
          <div class="channel-health__row"><span class="dot dot--warn"></span>Microsoft 365 · 3 mailboxes</div>
        </div>
        <a class="nav__item" href="#login">${icon("logout")}Sign out</a>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="iconbtn topbar__menu" data-action="menu" aria-label="Open menu">${icon("menu")}</button>
        <label class="search">${icon("search", "icon--sm")}<span class="sr-only">Search</span><input id="global-search" placeholder="Search tickets, clients, PAN, GSTIN…"><span class="kbd">/</span></label>
        <span class="topbar__spacer"></span>
        <div class="role-switch"><label for="role">Viewing as</label><select id="role" data-change="role">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${k === state.role ? "selected" : ""}>${r.label}</option>`).join("")}</select></div>
        <button class="iconbtn" data-action="theme" aria-label="Toggle dark mode">${icon(dark ? "sun" : "moon")}</button>
        <button class="iconbtn" data-action="notifications" aria-label="Notifications">${icon("bell")}<span class="iconbtn__badge">4</span></button>
        <div class="me">${av(u.id)}<div class="me__text"><div class="me__name">${esc(u.name)}</div><div class="me__role">${esc(u.title)}</div></div></div>
      </header>
      <main class="page" id="page">${content}</main>
    </div>
  </div>`;
}

function render() {
  const route = parseRoute();
  const app = document.getElementById("app");
  if (route.name === "login") { app.innerHTML = VIEWS.login(route.arg); return; }
  const allowed = NAV.flatMap(([, items]) => items).find((i) => i[0] === route.nav);
  if (allowed && !allowed[3].includes(state.role)) {
    const first = NAV.flatMap(([, items]) => items).find((i) => i[3].includes(state.role));
    location.hash = first[0];
    return;
  }
  app.innerHTML = renderShell(route, VIEWS[route.name](route.arg));
}

/* ---------- dialogs ---------- */
function reassignDialog(id) {
  const t = findTicket(id);
  const isMgr = ["manager", "leadership"].includes(state.role);
  const people = USERS.filter((u) => u.role === "member" && u.active && u.id !== t.owner);
  openSheet(sheet("drawer", isMgr ? "Assign or reassign" : "Reassign ticket", `<span class="mono">${t.id}</span> · ${esc(t.subject)}`, `
    <div class="banner banner--pend"><span class="banner__icon">${icon("swap")}</span><div class="banner__body"><span class="banner__text">The new owner must accept. Until then the ticket stays with <b>${user(t.owner).name}</b> and shows “Pending acceptance”. If it isn't accepted in 1 hour they get a reminder; after 3 hours it escalates to ${user(t.escalation).name}.</span></div></div>
    <div class="field"><span class="field__label">New owner</span><div class="pick" role="radiogroup">${people.map((p, i) => { const open = TICKETS.filter((x) => x.owner === p.id && isOpen(x)).length; return `<label class="pick__opt ${i === 0 ? "is-active" : ""}"><input type="radio" name="newowner" value="${p.id}" ${i === 0 ? "checked" : ""} class="sr-only">${av(p.id, "sm")}<span><span style="font-weight:500">${esc(p.name)}</span><span class="muted" style="font-size:var(--fs-xs);display:block">${esc(p.title)}${p.type === "external" ? " · notified by email" : ""}</span></span><span class="muted num" style="font-size:var(--fs-xs)">${open} open</span></label>`; }).join("")}</div></div>
    <div class="field"><label class="field__label" for="rs-reason">Reason</label><select class="select" id="rs-reason"><option>Better suited — subject expertise</option><option>Workload rebalancing</option><option>Owner on leave</option><option>Client relationship</option><option>Other</option></select></div>
    <div class="field"><label class="field__label" for="rs-note">Note for the new owner</label><textarea class="textarea" id="rs-note" placeholder="Context they need to pick this up"></textarea></div>`,
    `<button class="btn" data-action="close-sheet">Cancel</button><button class="btn btn--primary" data-action="do-reassign" data-val="${t.id}">Send transfer request</button>`));
}
function resolveDialog(id) {
  const t = findTicket(id);
  openSheet(sheet("modal", "Mark as resolved", `<span class="mono">${t.id}</span> · ${esc(t.subject)}`, `
    <div class="field"><label class="field__label" for="res-sum">Resolution summary</label><textarea class="textarea" id="res-sum">Explained the treatment and shared the working. Client confirmed the figures.</textarea><span class="field__hint">Used for the closure email and the knowledge base entry.</span></div>
    <label class="check"><input type="checkbox" id="res-kb" checked>Add to the knowledge base</label>
    <div class="banner banner--info"><span class="banner__icon">${icon("usercheck")}</span><div class="banner__body"><span class="banner__text">Goes to <b>${user(t.escalation).name}</b> for approval. Once approved, the client is emailed that the query is closed, with a link to reopen it.</span></div></div>`,
    `<button class="btn" data-action="close-sheet">Cancel</button><button class="btn btn--primary" data-action="do-resolve" data-val="${t.id}">Submit for approval</button>`), { center: true });
}
function logCallDialog() {
  openSheet(sheet("drawer", "Log a phone instruction", "Creates a ticket with the same SLA and routing as WhatsApp and email.", `
    <div class="form-grid">
      <div class="field span-2"><label class="field__label" for="lc-client">Client</label><select class="select" id="lc-client">${CLIENTS.map((c) => `<option value="${c.id}">${c.code} · ${esc(c.name)}</option>`).join("")}</select></div>
      <div class="field"><label class="field__label" for="lc-caller">Caller</label><input class="input" id="lc-caller" value="Mahesh Shah"></div>
      <div class="field"><label class="field__label" for="lc-type">Query type</label><select class="select" id="lc-type">${QUERY_TYPES.map((q) => `<option>${q}</option>`).join("")}</select></div>
      <div class="field span-2"><label class="field__label" for="lc-text">What did the client ask?</label><textarea class="textarea" id="lc-text" placeholder="Write the instruction in the client's words"></textarea></div>
      <div class="field"><label class="field__label" for="lc-prio">Priority</label><select class="select" id="lc-prio"><option>Medium</option><option>High</option><option>Low</option></select></div>
      <div class="field"><label class="field__label" for="lc-time">Call time</label><input class="input" id="lc-time" value="07 Oct 2026, 11:20"></div>
      <label class="check span-2"><input type="checkbox" id="lc-post" checked>Post a summary to the client's WhatsApp group so the instruction is on record</label>
    </div>`,
    `<button class="btn" data-action="close-sheet">Cancel</button><button class="btn btn--primary" data-action="do-logcall">Create ticket</button>`));
}
function simpleDrawer(title, sub, fields, cta) {
  openSheet(sheet("drawer", title, sub, `<div class="form-grid">${fields}</div>`, `<button class="btn" data-action="close-sheet">Cancel</button><button class="btn btn--primary" data-action="do-simple" data-val="${esc(cta[1])}">${cta[0]}</button>`));
}
const f = (id, label, val = "", span = false, type = "input") => `<div class="field ${span ? "span-2" : ""}"><label class="field__label" for="${id}">${label}</label>${type === "input" ? `<input class="input" id="${id}" value="${esc(val)}">` : `<select class="select" id="${id}">${val}</select>`}</div>`;

/* ---------- events ---------- */
const actions = {
  menu: () => document.getElementById("shell").classList.toggle("nav-open"),
  theme: () => {
    const root = document.documentElement;
    const dark = root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    render();
  },
  notifications: () => openSheet(sheet("drawer", "Notifications", "", `<div class="alist" style="margin:0 -22px">${[
    ["pend", "swap", "Priya Iyer wants to transfer TKT-1036 to you", "10 min ago", "TKT-1036"],
    ["crit", "alert", "TKT-1045 is overdue by " + fmtDur(65), "65 min ago", "TKT-1045"],
    ["warn", "clock", "TKT-1048 is at 85% of its turnaround time", "20 min ago", "TKT-1048"],
    ["info", "link", "New follow-up on TKT-1044 from Oakridge", "50 min ago", "TKT-1044"],
  ].map(([c, ic, t, m, id]) => `<div class="alist__item" data-href="#ticket-${id}"><span class="alist__icon alist__icon--${c}">${icon(ic, "icon--sm")}</span><div><div class="alist__title" style="white-space:normal">${t}</div><div class="alist__meta">${m}</div></div><span></span></div>`).join("")}</div>`, `<button class="btn" data-action="close-sheet">Close</button>`)),
  "close-sheet": closeSheet,
  period: (v) => { state.period = v; render(); },
  ticketTab: (v) => { state.ticketTab = v; render(); },
  ticketChannel: (v) => { state.ticketChannel = v; render(); },
  inboxFilter: (v) => { state.inboxFilter = v; state.inboxOpen = false; render(); },
  inboxSel: (v) => { state.inboxSel = v; state.inboxOpen = true; render(); if (matchMedia("(max-width: 700px)").matches) window.scrollTo(0, 0); },
  inboxBack: () => { state.inboxOpen = false; render(); },
  tasksTab: (v) => { state.tasksTab = v; render(); },
  reportsTab: (v) => { state.reportsTab = v; render(); },
  analyticsDim: (v) => { state.analyticsDim = v; render(); },
  kbTag: (v) => { state.kbTag = v; render(); },
  logLevel: (v) => { state.logLevel = v; render(); },
  composerTab: (v) => { state.composerTab = v; render(); },
  reassign: reassignDialog,
  resolve: resolveDialog,
  "log-call": logCallDialog,
  "do-reassign": (id) => {
    const t = findTicket(id);
    const to = document.querySelector('input[name="newowner"]:checked').value;
    Object.assign(t, { status: "pending", transferTo: to, transferBy: me().id, transferReason: document.getElementById("rs-reason").value });
    closeSheet(); render();
    toast(`Transfer sent to ${user(to).name}${user(to).type === "external" ? " (by email)" : ""}. You stay the owner until they accept.`);
  },
  accept: (id) => { const t = findTicket(id); const prev = t.owner; Object.assign(t, { owner: t.transferTo, status: "assigned", transferTo: null }); (HISTORY[id] = HISTORY[id] || []).unshift({ dot: "brand", text: `<b>${user(t.owner).name}</b> accepted ownership from ${user(prev).name}`, meta: "Just now" }); render(); toast("You now own this ticket."); },
  decline: (id) => { const t = findTicket(id); Object.assign(t, { status: "progress", transferTo: null }); render(); toast(`Declined. ${user(t.owner).name} keeps the ticket and has been told.`); },
  withdraw: (id) => { const t = findTicket(id); Object.assign(t, { status: "progress", transferTo: null }); render(); toast("Transfer request withdrawn."); },
  nudge: () => toast("Reminder sent."),
  "do-resolve": (id) => { findTicket(id).status = "resolved"; closeSheet(); render(); toast("Submitted for manager approval."); },
  approve: (id) => { findTicket(id).status = "closed"; render(); toast("Closed. The client has been emailed with a reopen link."); },
  sendback: (id) => { findTicket(id).status = "progress"; render(); toast("Sent back to the owner with your comments."); },
  reopen: (id) => { const t = findTicket(id); t.status = "reopened"; t.reopens = (t.reopens || 0) + 1; render(); toast("Reopened and escalated to the manager."); },
  "do-logcall": () => { closeSheet(); toast("Ticket TKT-1049 created and routed to the client owner."); },
  send: () => { const ta = document.getElementById("composer-text"); if (!ta.value.trim()) { ta.focus(); ta.placeholder = "Write something before sending."; return; } ta.value = ""; toast(state.composerTab === "reply" ? "Reply sent to the client." : "Note added."); },
  override: () => toast("Ticket created from this message and routed by client mapping."),
  "not-query": () => toast("Marked as not a query. The model will learn from this correction."),
  reclassify: () => toast("Classification updated."),
  export: () => toast("Export prepared (CSV / Excel)."),
  schedule: () => toast("Schedule editor opens here."),
  generate: () => toast("Preview: 128 recurring tasks for November across 10 clients."),
  save: () => toast("SLA settings saved. They apply to new tickets."),
  "toggle-tpl": () => toast("Client task plan updated."),
  "toggle-user": (id) => { const u = user(id); u.active = !u.active; toast(`${u.name} ${u.active ? "activated" : "deactivated"}.`); },
  "copy-kb": (id) => { const k = byId(KB, id); const done = () => toast("Answer copied."); try { navigator.clipboard.writeText(k.a).then(done, done); } catch (e) { done(); } },
  "new-client": () => simpleDrawer("Add client", "Onboarding tasks are created automatically and assigned to the mapped owner.", f("nc-name", "Client name", "", true) + f("nc-code", "Client code", "ACM-080") + f("nc-group", "Group", "—") + f("nc-tier", "SLA tier", '<option>Key</option><option selected>Retainer</option><option>Standard</option>', false, "select") + f("nc-kind", "Constitution", "<option>Company</option><option>LLP</option><option>Partnership</option><option>Individual</option><option>Trust</option>", false, "select") + f("nc-partner", "Engagement partner", USERS.filter((u) => u.role === "leadership").map((u) => `<option>${u.name}</option>`).join(""), false, "select") + f("nc-manager", "Manager", USERS.filter((u) => u.role === "manager").map((u) => `<option>${u.name}</option>`).join(""), false, "select") + f("nc-owner", "Owner", USERS.filter((u) => u.role === "member").map((u) => `<option>${u.name}</option>`).join(""), false, "select") + f("nc-backup", "Backup", USERS.filter((u) => u.role === "member").map((u) => `<option>${u.name}</option>`).join(""), false, "select") + `<div class="field span-2"><span class="field__label">Engagement types</span><div class="row">${["GST", "TDS", "Income Tax", "ROC", "Audit", "PF/ESI", "Accounting"].map((e, i) => `<label class="check"><input type="checkbox" id="nc-e${i}" ${i < 2 ? "checked" : ""}>${e}</label>`).join("")}</div></div>`, ["Add client & create onboarding tasks", "Client added. 5 onboarding tasks created."]),
  "edit-client": () => toast("Mapping editor opens here."),
  "new-user": () => simpleDrawer("Invite user", "They receive an email to set a password.", f("nu-name", "Full name", "", true) + f("nu-email", "Work email", "", true) + f("nu-role", "Role", "<option>Team member</option><option>Manager</option><option>Leadership</option><option>Platform admin</option><option>System admin</option>", false, "select") + f("nu-type", "Type", "<option>Internal</option><option>External</option>", false, "select") + f("nu-team", "Team", "<option>GST &amp; Accounting</option><option>Direct Tax &amp; ROC</option><option>External</option>", true, "select"), ["Send invite", "Invite sent."]),
  "new-template": () => simpleDrawer("New task template", "Applies to every client with this engagement type.", f("ntp-name", "Task name", "", true) + f("ntp-eng", "Engagement type", "<option>GST</option><option>TDS</option><option>Income Tax</option><option>ROC</option><option>PF/ESI</option><option>All</option>", false, "select") + f("ntp-kind", "Type", "<option>Recurring</option><option>Onboarding</option>", false, "select") + f("ntp-freq", "Frequency", "<option>Monthly</option><option>Quarterly</option><option>Annual</option><option>Once</option>", false, "select") + f("ntp-rule", "Due-date rule", "20th of following month") + f("ntp-role", "Default owner role", "<option>Client owner</option><option>GST owner</option><option>TDS owner</option><option>Company Secretary</option>", false, "select") + f("ntp-sla", "Reminder", "2 days before due"), ["Save template", "Template saved."]),
  "new-task": () => simpleDrawer("Add task", "A one-off or client-specific task with the same reminders and acceptance flow as tickets.", f("nt-name", "Task", "", true) + f("nt-client", "Client", CLIENTS.map((c) => `<option>${c.code} · ${esc(c.name)}</option>`).join(""), true, "select") + f("nt-owner", "Owner", USERS.filter((u) => u.role === "member").map((u) => `<option>${u.name}</option>`).join(""), false, "select") + f("nt-due", "Due date", "20 Oct 2026"), ["Create task", "Task created."]),
  "do-simple": (msg) => { closeSheet(); toast(msg); },
  "ms-login": () => { location.hash = "dashboard"; toast("Signed in with Microsoft."); },
};

document.addEventListener("click", (e) => {
  const opt = e.target.closest(".pick__opt");
  if (opt) { opt.parentElement.querySelectorAll(".pick__opt").forEach((o) => o.classList.remove("is-active")); opt.classList.add("is-active"); }
  const a = e.target.closest("[data-action]");
  if (a && actions[a.dataset.action]) {
    if (a.tagName !== "INPUT") e.preventDefault();
    actions[a.dataset.action](a.dataset.val);
    return;
  }
  const link = e.target.closest("[data-href]");
  if (link) {
    if (link.dataset.set) { const [k, v] = link.dataset.set.split("="); state[k] = v; }
    location.hash = link.dataset.href.slice(1);
  }
  const navLink = e.target.closest(".nav__item");
  if (navLink) document.getElementById("shell")?.classList.remove("nav-open");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSheet();
  if (e.key === "Enter" && e.target.matches(".inbox__item")) e.target.click();
  if (e.key === "/" && !e.target.matches("input, textarea, select")) { const s = document.getElementById("global-search"); if (s) { e.preventDefault(); s.focus(); } }
});
document.addEventListener("change", (e) => {
  const k = e.target.dataset.change;
  if (!k) return;
  state[k] = e.target.value;
  if (k === "role") { state.dashOwner = "all"; store.set("role", e.target.value); }
  render();
});
document.addEventListener("input", (e) => {
  const k = e.target.dataset.input;
  if (!k) return;
  state[k] = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const el = document.getElementById(e.target.id);
  if (el) { el.focus(); el.setSelectionRange(pos, pos); }
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.dataset.submit === "login") { location.hash = "dashboard"; toast("Signed in. You'll stay signed in on this device for 30 days."); }
  if (e.target.dataset.submit === "forgot") { location.hash = "login"; toast("If that email is registered, a reset link is on its way."); }
});

/* tooltip */
const tip = document.createElement("div");
tip.className = "tooltip"; tip.hidden = true; tip.setAttribute("role", "tooltip");
document.body.appendChild(tip);
document.addEventListener("mouseover", (e) => {
  const t = e.target.closest("[data-tip]");
  if (!t) { tip.hidden = true; return; }
  tip.textContent = t.dataset.tip; tip.hidden = false;
});
document.addEventListener("mousemove", (e) => {
  if (tip.hidden) return;
  const x = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
  tip.style.left = x + "px"; tip.style.top = (e.clientY + 16) + "px";
});

/* boot */
const savedTheme = store.get("theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
const savedRole = store.get("role");
if (savedRole && ROLES[savedRole]) state.role = savedRole;
window.addEventListener("hashchange", () => { closeSheet(); render(); window.scrollTo(0, 0); });
render();
