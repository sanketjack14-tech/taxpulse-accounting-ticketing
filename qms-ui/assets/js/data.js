/* =====================================================================
   Ledger — QMS sample data (prototype only).
   Shapes here mirror the proposed backend entities; see README.md.
   "Now" is fixed so SLA timers render deterministically.
   ===================================================================== */

const NOW = new Date(2026, 9, 7, 11, 30); // Wed 7 Oct 2026, 11:30 IST

const USERS = [
  { id: "u1", name: "Rohan Mehta", initials: "RM", role: "leadership", title: "Engagement Partner", team: "Firm", type: "internal", email: "rohan.mehta@mehtaassociates.in", active: true },
  { id: "u2", name: "Priya Iyer", initials: "PI", role: "manager", title: "Manager · GST & Accounting", team: "GST & Accounting", type: "internal", email: "priya.iyer@mehtaassociates.in", active: true },
  { id: "u3", name: "Sameer Joshi", initials: "SJ", role: "manager", title: "Manager · Direct Tax & ROC", team: "Direct Tax & ROC", type: "internal", email: "sameer.joshi@mehtaassociates.in", active: true },
  { id: "u4", name: "Aditya Rao", initials: "AR", role: "member", title: "Accountant", team: "GST & Accounting", type: "internal", email: "aditya.rao@mehtaassociates.in", active: true },
  { id: "u5", name: "Neha Kulkarni", initials: "NK", role: "member", title: "Accountant", team: "GST & Accounting", type: "internal", email: "neha.kulkarni@mehtaassociates.in", active: true },
  { id: "u6", name: "Farhan Shaikh", initials: "FS", role: "member", title: "Accountant", team: "Direct Tax & ROC", type: "internal", email: "farhan.shaikh@mehtaassociates.in", active: true },
  { id: "u7", name: "Ishita Desai", initials: "ID", role: "member", title: "Senior Accountant", team: "Direct Tax & ROC", type: "internal", email: "ishita.desai@mehtaassociates.in", active: true },
  { id: "u8", name: "Vikram Nair", initials: "VN", role: "member", title: "Senior Accountant", team: "GST & Accounting", type: "internal", email: "vikram.nair@mehtaassociates.in", active: true },
  { id: "u9", name: "CS Anjali Bhatt", initials: "AB", role: "member", title: "Company Secretary · Bhatt & Co.", team: "External", type: "external", email: "anjali@bhattcs.in", active: true },
  { id: "u10", name: "Deepak Verma", initials: "DV", role: "member", title: "PF Consultant", team: "External", type: "external", email: "deepak@vermapf.in", active: true },
  { id: "u11", name: "Kavya Menon", initials: "KM", role: "platform", title: "Platform Admin", team: "Operations", type: "internal", email: "kavya.menon@mehtaassociates.in", active: true },
  { id: "u12", name: "Arjun Pillai", initials: "AP", role: "sysadmin", title: "System Admin (IT)", team: "IT", type: "internal", email: "it@mehtaassociates.in", active: true },
  { id: "u13", name: "Rahul Sinha", initials: "RS", role: "member", title: "Article Assistant", team: "GST & Accounting", type: "internal", email: "rahul.sinha@mehtaassociates.in", active: false },
];

const CLIENTS = [
  { id: "c1", code: "SHR-001", name: "Shreeji Polymers Pvt Ltd", group: "Shreeji Group", kind: "Company", tier: "key", partner: "u1", manager: "u2", owner: "u4", backup: "u5", engagements: ["GST", "TDS", "ROC", "Statutory Audit"], providers: { CS: "u9", GST: "u4", "Income Tax": "u7", Auditor: "u7" } },
  { id: "c2", code: "SHR-002", name: "Shreeji Logistics LLP", group: "Shreeji Group", kind: "LLP", tier: "key", partner: "u1", manager: "u2", owner: "u8", backup: "u4", engagements: ["GST", "TDS", "Accounting"], providers: { GST: "u8", "Income Tax": "u6" } },
  { id: "c3", code: "KAP-014", name: "Kapoor Textiles", group: "—", kind: "Partnership", tier: "retainer", partner: "u1", manager: "u2", owner: "u5", backup: "u8", engagements: ["GST", "Accounting"], providers: { GST: "u5" } },
  { id: "c4", code: "NIL-022", name: "Nilkanth Foods Pvt Ltd", group: "—", kind: "Company", tier: "retainer", partner: "u1", manager: "u3", owner: "u6", backup: "u7", engagements: ["ROC", "Income Tax", "Accounting"], providers: { CS: "u9", "Income Tax": "u6" } },
  { id: "c5", code: "MEH-031", name: "Dr. Anand Mehra", group: "Mehra Family", kind: "Individual", tier: "standard", partner: "u1", manager: "u3", owner: "u6", backup: "u7", engagements: ["Income Tax"], providers: { "Income Tax": "u6" } },
  { id: "c6", code: "VRT-008", name: "Vertex Infra Projects Ltd", group: "Vertex Group", kind: "Company", tier: "key", partner: "u1", manager: "u3", owner: "u7", backup: "u6", engagements: ["Statutory Audit", "ROC", "Income Tax", "TDS"], providers: { CS: "u9", Auditor: "u7", "Income Tax": "u7" } },
  { id: "c7", code: "OAK-045", name: "Oakridge Software Pvt Ltd", group: "—", kind: "Company", tier: "retainer", partner: "u1", manager: "u2", owner: "u4", backup: "u5", engagements: ["TDS", "GST", "PF/ESI", "Payroll"], providers: { "PF Consultant": "u10", GST: "u4" } },
  { id: "c8", code: "SAI-050", name: "Sai Krupa Traders", group: "—", kind: "Proprietorship", tier: "standard", partner: "u1", manager: "u2", owner: "u8", backup: "u5", engagements: ["GST", "Income Tax"], providers: { GST: "u8" } },
  { id: "c9", code: "BLU-061", name: "Bluefin Exports Pvt Ltd", group: "—", kind: "Company", tier: "retainer", partner: "u1", manager: "u2", owner: "u5", backup: "u4", engagements: ["GST", "Accounting", "ROC"], providers: { GST: "u5", CS: "u9" } },
  { id: "c10", code: "PAT-072", name: "Patel Family Trust", group: "Patel Family", kind: "Trust", tier: "standard", partner: "u1", manager: "u3", owner: "u6", backup: "u7", engagements: ["Income Tax"], providers: { "Income Tax": "u6" } },
];

const TIERS = {
  key: { label: "Key", tat: 4 },
  retainer: { label: "Retainer", tat: 8 },
  standard: { label: "Standard", tat: 24 },
};

const QUERY_TYPES = ["GST", "TDS", "Income Tax", "ROC / MCA", "PF / ESI", "Accounting", "Audit", "Payments & Challans", "General advisory"];

// SLA master: TAT in working hours by query type x tier (#16)
const SLA_MATRIX = {
  "GST": { key: 4, retainer: 8, standard: 24 },
  "TDS": { key: 4, retainer: 8, standard: 24 },
  "Income Tax": { key: 6, retainer: 12, standard: 24 },
  "ROC / MCA": { key: 8, retainer: 16, standard: 48 },
  "PF / ESI": { key: 4, retainer: 8, standard: 24 },
  "Accounting": { key: 8, retainer: 16, standard: 48 },
  "Audit": { key: 8, retainer: 16, standard: 48 },
  "Payments & Challans": { key: 2, retainer: 4, standard: 8 },
  "General advisory": { key: 24, retainer: 48, standard: 72 },
};

/* status: received | assigned | progress | pending | resolved | closed | reopened
   ageMin = minutes since received; tatMin = turnaround in minutes */
const TICKETS = [
  { id: "TKT-1048", subject: "GSTR-3B Sept: ITC lower than GSTR-2B for 3 vendors", client: "c1", type: "GST", channel: "wa", source: "Shreeji Group – Accounts", owner: "u4", backup: "u5", escalation: "u2", status: "progress", priority: "high", ageMin: 205, tatMin: 240, members: [] },
  { id: "TKT-1047", subject: "TDS on rent paid to director — 194-I or 194-IB?", client: "c7", type: "TDS", channel: "mail", source: "cfo@oakridgesoftware.in", owner: "u4", backup: "u5", escalation: "u2", status: "pending", transferTo: "u8", transferBy: "u4", transferReason: "Vikram handled Oakridge's lease agreement review in August.", priority: "med", ageMin: 95, tatMin: 480, members: [] },
  { id: "TKT-1046", subject: "Advance tax — 3rd instalment with LTCG on property sale", client: "c5", type: "Income Tax", channel: "phone", source: "Logged by Farhan Shaikh", owner: "u6", backup: "u7", escalation: "u3", status: "assigned", priority: "med", ageMin: 60, tatMin: 1440, members: [] },
  { id: "TKT-1045", subject: "Board resolution for shifting registered office (INC-22)", client: "c6", type: "ROC / MCA", channel: "mail", source: "legal@vertexinfra.com", owner: "u9", backup: "u7", escalation: "u3", status: "assigned", priority: "high", ageMin: 545, tatMin: 480, members: [] },
  { id: "TKT-1044", subject: "PF withdrawal claims rejected for 2 employees", client: "c7", type: "PF / ESI", channel: "wa", source: "Oakridge – HR & Payroll", owner: "u10", backup: "u4", escalation: "u2", status: "progress", priority: "high", ageMin: 1530, tatMin: 480, members: [], followUps: 2 },
  { id: "TKT-1043", subject: "E-way bill cancellation requested after 24 hours", client: "c2", type: "GST", channel: "wa", source: "Shreeji Logistics – Ops", owner: "u8", backup: "u4", escalation: "u2", status: "received", priority: "med", ageMin: 12, tatMin: 240, members: [] },
  { id: "TKT-1042", subject: "Two queries from Shreeji Polymers (split by AI)", client: "c1", type: "GST", channel: "wa", source: "Shreeji Group – Accounts", owner: "u4", backup: "u5", escalation: "u2", status: "progress", priority: "med", ageMin: 330, tatMin: 240, members: [], parent: true,
    subs: [
      { id: "TKT-1042.1", subject: "TDS u/s 194Q on purchase from Ravi Packaging", type: "TDS", owner: "u5", status: "progress", ageMin: 330, tatMin: 240 },
      { id: "TKT-1042.2", subject: "Share ARN for Sept GSTR-1", type: "GST", owner: "u4", status: "resolved", ageMin: 330, tatMin: 240 },
    ] },
  { id: "TKT-1041", subject: "26AS shows TDS not deposited by HDFC Bank on FD interest", client: "c5", type: "Income Tax", channel: "mail", source: "anand.mehra@gmail.com", owner: "u7", backup: "u6", escalation: "u3", status: "resolved", priority: "low", ageMin: 2010, tatMin: 1440, members: [] },
  { id: "TKT-1040", subject: "Statutory audit: fixed asset register — capitalisation queries", client: "c6", type: "Audit", channel: "mail", source: "accounts@vertexinfra.com", owner: "u7", backup: "u6", escalation: "u3", status: "reopened", priority: "high", ageMin: 5020, tatMin: 480, members: [], reopens: 1 },
  { id: "TKT-1039", subject: "Credit note under GST for rate difference", client: "c3", type: "GST", channel: "wa", source: "Kapoor Textiles – Accounts", owner: "u5", backup: "u8", escalation: "u2", status: "closed", priority: "low", ageMin: 3100, tatMin: 480, members: [] },
  { id: "TKT-1038", subject: "MSME-1 half-yearly return — 45-day payment disclosure", client: "c4", type: "ROC / MCA", channel: "mail", source: "finance@nilkanthfoods.in", owner: "u6", backup: "u7", escalation: "u3", status: "progress", priority: "high", ageMin: 4520, tatMin: 960, members: [] },
  { id: "TKT-1037", subject: "Salary TDS for new joinee with previous employer income", client: "c7", type: "TDS", channel: "wa", source: "Oakridge – HR & Payroll", owner: "u4", backup: "u5", escalation: "u2", status: "closed", priority: "low", ageMin: 2900, tatMin: 480, members: [] },
  { id: "TKT-1036", subject: "GST registration amendment — add new godown at Bhiwandi", client: "c8", type: "GST", channel: "phone", source: "Logged by Vikram Nair", owner: "u8", backup: "u5", escalation: "u2", status: "pending", transferTo: "u4", transferBy: "u2", transferReason: "Rebalancing: Vikram is on GSTR-9 reconciliations this week; Aditya covers Bhiwandi clients.", priority: "med", ageMin: 400, tatMin: 1440, members: [] },
  { id: "TKT-1035", subject: "ITR-7 for Patel Family Trust — Form 10B and donor list", client: "c10", type: "Income Tax", channel: "mail", source: "trustees@patelfamilytrust.org", owner: "u6", backup: "u7", escalation: "u3", status: "progress", priority: "med", ageMin: 800, tatMin: 1440, members: [] },
  { id: "TKT-1034", subject: "LUT renewal for FY 2026-27 exports", client: "c9", type: "GST", channel: "mail", source: "exports@bluefin.co.in", owner: "u5", backup: "u4", escalation: "u2", status: "assigned", priority: "med", ageMin: 100, tatMin: 480, members: ["u4", "u2"] },
  { id: "TKT-1033", subject: "Bank reconciliation differences for August", client: "c4", type: "Accounting", channel: "wa", source: "Nilkanth Foods – Finance", owner: "u4", backup: "u5", escalation: "u2", status: "resolved", priority: "low", ageMin: 1600, tatMin: 960, members: [] },
  { id: "TKT-1032", subject: "TDS challan 281 paid under wrong section code", client: "c2", type: "Payments & Challans", channel: "wa", source: "Shreeji Logistics – Ops", owner: "u8", backup: "u4", escalation: "u2", status: "progress", priority: "high", ageMin: 70, tatMin: 120, members: [] },
];

/* Intake stream (#1–#5, #7, #15) */
const MESSAGES = [
  { id: "m1", channel: "wa", via: "+91 98200 41110", from: "Mahesh Shah", org: "Shreeji Group – Accounts", time: "08:05", body: "Hi team, ITC for Sept 3B is coming lower than 2B for Gujarat Chemicals, Ravi Packaging and Om Logistics. Please check before we file. Due date is 20th.", verdict: "ticket", ticket: "TKT-1048", type: "GST", client: "c1", conf: 96 },
  { id: "m2", channel: "wa", via: "+91 98200 41110", from: "Mahesh Shah", org: "Shreeji Group – Accounts", time: "08:02", body: "Good morning all. Happy Navratri to the whole team!", verdict: "skip", reason: "General greeting — no query detected", conf: 99 },
  { id: "m3", channel: "mail", via: "queries@mehtaassociates.in", from: "Sanjay Kulkarni (CFO)", org: "Oakridge Software Pvt Ltd", subject: "TDS on rent to director", time: "09:55", body: "Dear Sir,\nWe are paying monthly rent of ₹1,20,000 to our director Mr. Raghav for the Baner office. Should TDS be deducted u/s 194-I or 194-IB? Also confirm the rate.\n\nRegards,\nSanjay", verdict: "ticket", ticket: "TKT-1047", type: "TDS", client: "c7", conf: 93 },
  { id: "m4", channel: "mail", via: "staff@mehtaassociates.in", from: "Priya Iyer", org: "Internal", subject: "Office closed on 2 Oct", time: "Yesterday", body: "Team, the office will remain closed on 2 October for Gandhi Jayanti.", verdict: "skip", reason: "Internal email — sender domain is the firm's own", conf: 100 },
  { id: "m5", channel: "wa", via: "+91 98200 41110", from: "Mahesh Shah", org: "Shreeji Group – Accounts", time: "06:00", body: "1) Should we deduct TDS u/s 194Q on the purchase from Ravi Packaging? Turnover crossed 50L.\n2) Please share ARN for Sept GSTR-1.", verdict: "split", ticket: "TKT-1042", subs: ["TKT-1042.1", "TKT-1042.2"], type: "TDS + GST", client: "c1", conf: 91 },
  { id: "m6", channel: "wa", via: "+91 98200 41120", from: "Anita D'Souza", org: "Oakridge – HR & Payroll", time: "10:40", body: "Any update on the PF claim? Both employees are asking again.", verdict: "link", ticket: "TKT-1044", type: "PF / ESI", client: "c7", conf: 88 },
  { id: "m7", channel: "phone", via: "Logged by Farhan Shaikh", from: "Dr. Anand Mehra", org: "Phone call · 4 min", time: "10:30", body: "Client called. Wants advance tax computation for the December instalment. Sold Pune flat in Aug for ₹1.4 Cr — needs LTCG estimate and 54EC options.", verdict: "ticket", ticket: "TKT-1046", type: "Income Tax", client: "c5", conf: 90 },
  { id: "m8", channel: "mail", via: "queries@mehtaassociates.in", from: "TaxUpdates Weekly", org: "newsletter@taxupdates.in", subject: "GST Council 57th meeting highlights", time: "07:15", body: "This week: rate rationalisation on 14 items, changes to Table 12 of GSTR-1, and more.", verdict: "skip", reason: "Newsletter — outside accounting / client purview", conf: 97 },
  { id: "m9", channel: "mail", via: "audit@mehtaassociates.in", from: "Ramesh Iyer", org: "Vertex Infra Projects Ltd", subject: "RE: FAR — revised", time: "09:12", body: "Please find the revised fixed asset register. We still disagree on capitalising the site office containers — these are reused across projects.", verdict: "link", ticket: "TKT-1040", type: "Audit", client: "c6", conf: 94, attachments: ["FAR_FY26_rev2.xlsx", "Container_invoices.pdf"] },
  { id: "m10", channel: "mail", via: "queries@mehtaassociates.in", from: "Karan Malhotra", org: "Bluefin Exports Pvt Ltd", subject: "LUT renewal FY 2026-27", time: "09:50", to: ["neha.kulkarni@", "aditya.rao@", "priya.iyer@"], body: "Hi Neha, Aditya,\nOur LUT expires soon. Please file the renewal so our October shipments go without IGST.\nCopying Priya ma'am.", verdict: "ticket", ticket: "TKT-1034", type: "GST", client: "c9", conf: 95, multi: true },
];

const TASK_TEMPLATES = [
  { id: "tt1", engagement: "GST", name: "GSTR-1 filing", kind: "Recurring", freq: "Monthly", rule: "11th of following month", role: "GST owner", sla: "2 days before due" },
  { id: "tt2", engagement: "GST", name: "GSTR-3B filing & tax payment", kind: "Recurring", freq: "Monthly", rule: "20th of following month", role: "GST owner", sla: "2 days before due" },
  { id: "tt3", engagement: "GST", name: "GSTR-9 annual return", kind: "Recurring", freq: "Annual", rule: "31 Dec", role: "Senior accountant", sla: "15 days before due" },
  { id: "tt4", engagement: "TDS", name: "TDS payment (challan 281)", kind: "Recurring", freq: "Monthly", rule: "7th of following month", role: "TDS owner", sla: "1 day before due" },
  { id: "tt5", engagement: "TDS", name: "TDS return 24Q / 26Q", kind: "Recurring", freq: "Quarterly", rule: "31st of month after quarter", role: "TDS owner", sla: "5 days before due" },
  { id: "tt6", engagement: "Income Tax", name: "Advance tax instalment", kind: "Recurring", freq: "Quarterly", rule: "15 Jun / Sep / Dec / Mar", role: "Income-tax owner", sla: "5 days before due" },
  { id: "tt7", engagement: "Income Tax", name: "ITR filing", kind: "Recurring", freq: "Annual", rule: "31 Jul / 31 Oct (audit)", role: "Income-tax owner", sla: "10 days before due" },
  { id: "tt8", engagement: "ROC", name: "AOC-4 financial statements", kind: "Recurring", freq: "Annual", rule: "30 days from AGM", role: "Company Secretary", sla: "7 days before due" },
  { id: "tt9", engagement: "ROC", name: "MGT-7 annual return", kind: "Recurring", freq: "Annual", rule: "60 days from AGM", role: "Company Secretary", sla: "7 days before due" },
  { id: "tt10", engagement: "ROC", name: "DSC renewal", kind: "Recurring", freq: "On expiry", rule: "15 days before DSC expiry", role: "Client owner", sla: "7 days before due" },
  { id: "tt11", engagement: "PF/ESI", name: "PF & ESI contribution + ECR", kind: "Recurring", freq: "Monthly", rule: "15th of following month", role: "PF Consultant", sla: "2 days before due" },
  { id: "tt12", engagement: "All", name: "KYC & engagement letter", kind: "Onboarding", freq: "Once", rule: "Within 3 days of onboarding", role: "Client owner", sla: "3 days" },
  { id: "tt13", engagement: "All", name: "Collect prior-year returns & ledgers", kind: "Onboarding", freq: "Once", rule: "Within 7 days of onboarding", role: "Client owner", sla: "7 days" },
  { id: "tt14", engagement: "GST", name: "GST portal access & registration check", kind: "Onboarding", freq: "Once", rule: "Within 5 days of onboarding", role: "GST owner", sla: "5 days" },
];

/* Compliance calendar, Oct 2026 (#27, #30). status: done | due | overdue */
const COMPLIANCE = [
  { day: 7, title: "TDS payment — Sept", clients: 7, done: 5, status: "due" },
  { day: 11, title: "GSTR-1 — Sept", clients: 6, done: 2, status: "due" },
  { day: 13, title: "GSTR-1 IFF (QRMP)", clients: 1, done: 0, status: "due" },
  { day: 15, title: "PF & ESI — Sept", clients: 1, done: 0, status: "due" },
  { day: 15, title: "TCS return Q2", clients: 1, done: 0, status: "due" },
  { day: 20, title: "GSTR-3B — Sept", clients: 6, done: 0, status: "due" },
  { day: 30, title: "Form 15CC / ITR-audit prep", clients: 2, done: 0, status: "due" },
  { day: 30, title: "AOC-4 — Vertex Infra", clients: 1, done: 0, status: "due" },
  { day: 31, title: "TDS return 24Q/26Q — Q2", clients: 7, done: 0, status: "due" },
  { day: 31, title: "ITR (audit cases)", clients: 3, done: 0, status: "due" },
  { day: 5, title: "Advance tax follow-up", clients: 2, done: 1, status: "overdue" },
  { day: 1, title: "MSME-1 (Apr–Sep)", clients: 1, done: 0, status: "overdue" },
];

const TASKS = [
  { id: "TSK-3301", name: "TDS payment — Sept", client: "c7", template: "tt4", owner: "u4", due: "07 Oct", status: "progress", kind: "Recurring" },
  { id: "TSK-3302", name: "TDS payment — Sept", client: "c6", template: "tt4", owner: "u7", due: "07 Oct", status: "done", kind: "Recurring" },
  { id: "TSK-3303", name: "GSTR-1 — Sept", client: "c1", template: "tt1", owner: "u4", due: "11 Oct", status: "progress", kind: "Recurring" },
  { id: "TSK-3304", name: "GSTR-1 — Sept", client: "c2", template: "tt1", owner: "u8", due: "11 Oct", status: "pending", kind: "Recurring", transferTo: "u4" },
  { id: "TSK-3305", name: "GSTR-1 — Sept", client: "c3", template: "tt1", owner: "u5", due: "11 Oct", status: "done", kind: "Recurring" },
  { id: "TSK-3306", name: "PF & ESI — Sept", client: "c7", template: "tt11", owner: "u10", due: "15 Oct", status: "assigned", kind: "Recurring" },
  { id: "TSK-3307", name: "MSME-1 (Apr–Sep)", client: "c4", template: "tt8", owner: "u9", due: "31 Oct", status: "overdue", kind: "Recurring" },
  { id: "TSK-3308", name: "KYC & engagement letter", client: "c9", template: "tt12", owner: "u5", due: "09 Oct", status: "progress", kind: "Onboarding" },
  { id: "TSK-3309", name: "GST portal access & registration check", client: "c9", template: "tt14", owner: "u5", due: "11 Oct", status: "assigned", kind: "Onboarding" },
  { id: "TSK-3310", name: "DSC renewal — Director A. Patel", client: "c6", template: "tt10", owner: "u9", due: "18 Oct", status: "assigned", kind: "Recurring" },
  { id: "TSK-3311", name: "AOC-4 FY 2025-26", client: "c6", template: "tt8", owner: "u9", due: "30 Oct", status: "progress", kind: "Recurring" },
  { id: "TSK-3312", name: "Advance tax — 3rd instalment", client: "c5", template: "tt6", owner: "u6", due: "15 Dec", status: "assigned", kind: "Recurring" },
];

const KB = [
  { id: "kb1", q: "Rent paid to a director by a company — 194-I or 194-IB?", a: "Section 194-IB applies only to individuals/HUFs not liable to tax audit. A company paying rent always deducts under 194-I at 10% (land/building) once annual rent exceeds ₹2,40,000. The director's status as a related party does not change the section.", tags: ["TDS"], source: "TKT-0981", by: "u8", used: 14, updated: "12 Sep 2026" },
  { id: "kb2", q: "ITC in GSTR-3B higher than GSTR-2B — what can be claimed?", a: "Only ITC reflected in GSTR-2B can be claimed (Rule 36(4)). Hold the excess, follow up with the vendor to file GSTR-1, and claim in the month it appears in 2B. Keep the vendor-wise reconciliation on file.", tags: ["GST"], source: "TKT-0954", by: "u4", used: 31, updated: "28 Aug 2026" },
  { id: "kb3", q: "Cancelling an e-way bill after 24 hours", a: "The portal allows cancellation only within 24 hours of generation. After that, the bill cannot be cancelled; let it expire and ensure it is not verified in transit. Record the reason in the dispatch register.", tags: ["GST"], source: "TKT-0902", by: "u8", used: 9, updated: "02 Aug 2026" },
  { id: "kb4", q: "26AS shows TDS deducted but not deposited by the deductor", a: "Write to the deductor (bank) with the TAN and quarter, request a correction statement, and keep the TDS certificate. Claim credit only once 26AS / AIS reflects it; otherwise respond to the 143(1) adjustment with the evidence.", tags: ["Income Tax", "TDS"], source: "TKT-0877", by: "u7", used: 7, updated: "19 Jul 2026" },
  { id: "kb5", q: "MSME-1: which suppliers must be reported?", a: "Report outstanding dues to Micro and Small enterprises beyond 45 days (or the agreed period, if shorter). Medium enterprises are excluded. Filing is half-yearly: 31 Oct (Apr–Sep) and 30 Apr (Oct–Mar).", tags: ["ROC"], source: "TKT-0850", by: "u9", used: 11, updated: "10 Jul 2026" },
  { id: "kb6", q: "PF withdrawal rejected — 'member name mismatch with Aadhaar'", a: "Ask the employee to update KYC on the UAN portal; the employer approves the joint declaration (JD) request. Re-file the claim once the KYC shows 'Approved by employer'. Typical turnaround 7–10 working days.", tags: ["PF/ESI"], source: "TKT-0812", by: "u10", used: 5, updated: "21 Jun 2026" },
];

const LOGS = [
  { t: "11:28:41", level: "info", src: "loop2ai.webhook", msg: "Received 3 messages from +91 98200 41110 (group: Shreeji Group – Accounts)" },
  { t: "11:28:42", level: "info", src: "classifier", msg: "m2 → skip (greeting, conf 0.99); m1 → GST query, client SHR-001 (conf 0.96)" },
  { t: "11:20:03", level: "warn", src: "graph.subscriptions", msg: "Subscription for audit@ expires in 2h — renewal scheduled" },
  { t: "11:05:10", level: "info", src: "reminders", msg: "Reminder sent to Vikram Nair for transfer TKT-1047 (pending acceptance 1h 35m)" },
  { t: "10:58:44", level: "error", src: "mailer.ses", msg: "Bounce: deepak@vermapf.in (mailbox full) — assignment email TKT-1044 queued for retry" },
  { t: "10:30:12", level: "info", src: "auth", msg: "Farhan Shaikh signed in (session cached 30 days)" },
  { t: "09:00:00", level: "info", src: "scheduler", msg: "Daily exception report generated and emailed to 3 recipients" },
  { t: "06:00:00", level: "info", src: "scheduler", msg: "Recurring tasks generated: 14 tasks for October cycle" },
];

const HISTORY = {
  "TKT-1047": [
    { dot: "pend", text: "<b>Aditya Rao</b> requested transfer to <b>Vikram Nair</b> — “Vikram handled Oakridge's lease agreement review in August.”", meta: "Today 10:05 · Awaiting acceptance" },
    { dot: "", text: "Reminder sent to <b>Vikram Nair</b> to accept", meta: "Today 11:05 · auto" },
    { dot: "brand", text: "Assigned to <b>Aditya Rao</b> via client mapping (OAK-045 → TDS owner). Backup: Neha Kulkarni. Escalation: Priya Iyer", meta: "Today 09:56 · auto" },
    { dot: "", text: "Ticket created from email to queries@mehtaassociates.in", meta: "Today 09:55 · auto" },
  ],
};

const SERIES_14D = [18, 22, 15, 6, 4, 21, 26, 24, 19, 23, 7, 5, 27, 14]; // tickets/day, ends today (partial)
