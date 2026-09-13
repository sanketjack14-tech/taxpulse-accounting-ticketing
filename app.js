// TaxPulse Accounting Pseudo-Ticketing Prototype Logic

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  function formatTime(dateObj) {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // --- 1. DATA MODELS & INITIAL STATE ---

  const STAFF_MEMBERS = [
    { id: 'S1', name: 'Rahul Sharma', dept: 'Direct Tax', role: 'Senior Tax Associate', workload: 3 },
    { id: 'S2', name: 'Priya Sundaram', dept: 'GST & Indirect Tax', role: 'GST Lead', workload: 2 },
    { id: 'S3', name: 'Vikram Mehta', dept: 'Accounts & Bookkeeping', role: 'Bookkeeping Head', workload: 1 },
    { id: 'S4', name: 'Anita Rao', dept: 'Audit & Compliance', role: 'Audit Manager', workload: 4 },
    { id: 'S5', name: 'Karan Patel', dept: 'Direct Tax', role: 'Tax Associate', workload: 2 },
    { id: 'S6', name: 'Neha Verma', dept: 'Accounts & Bookkeeping', role: 'Senior Accountant', workload: 0 },
    { id: 'S7', name: 'Siddharth Gupta', dept: 'GST & Indirect Tax', role: 'GST Specialist', workload: 1 },
    { id: 'S8', name: 'Meenakshi Iyer', dept: 'Audit & Compliance', role: 'Senior Auditor', workload: 0 },
    { id: 'S9', name: 'Amitabh Joshi', dept: 'Direct Tax', role: 'Tax Analyst', workload: 1 },
    { id: 'S10', name: 'Ritu Kapoor', dept: 'Accounts & Bookkeeping', role: 'Accountant', workload: 2 },
    { id: 'S11', name: 'Suresh Kumar', dept: 'GST & Indirect Tax', role: 'Associate', workload: 0 },
    { id: 'S12', name: 'Deepika Nair', dept: 'Audit & Compliance', role: 'Audit Staff', workload: 1 },
    { id: 'S13', name: 'Rohan Deshmukh', dept: 'Direct Tax', role: 'Associate', workload: 0 },
    { id: 'S14', name: 'Pooja Agarwal', dept: 'Accounts & Bookkeeping', role: 'Accountant', workload: 1 },
    { id: 'S15', name: 'Manish Singh', dept: 'GST & Indirect Tax', role: 'Associate', workload: 0 },
    { id: 'S16', name: 'Kavita Menon', dept: 'Audit & Compliance', role: 'Senior Auditor', workload: 0 },
    { id: 'S17', name: 'Tarun Bansal', dept: 'Direct Tax', role: 'Tax Consultant', workload: 0 },
    { id: 'S18', name: 'Swati Reddy', dept: 'Accounts & Bookkeeping', role: 'Junior Accountant', workload: 1 },
    { id: 'S19', name: 'Gaurav Bhatia', dept: 'GST & Indirect Tax', role: 'Associate', workload: 0 },
    { id: 'S20', name: 'Sneha Kulkarni', dept: 'Audit & Compliance', role: 'Audit Associate', workload: 0 },
    { id: 'S21', name: 'Varun Saxena', dept: 'Direct Tax', role: 'Associate', workload: 0 },
    { id: 'S22', name: 'Divya Pillai', dept: 'Accounts & Bookkeeping', role: 'Accountant', workload: 0 },
    { id: 'S23', name: 'Nikhil Roy', dept: 'GST & Indirect Tax', role: 'Associate', workload: 0 },
    { id: 'S24', name: 'Ananya Roy', dept: 'Audit & Compliance', role: 'Associate', workload: 0 },
    { id: 'S25', name: 'Rajesh Khanna', dept: 'Direct Tax', role: 'Partner / Lead', workload: 0 }
  ];

  const CLIENTS = {
    'XYZ Logistics Pvt Ltd': { rep: 'Mr. Alok Nath', email: 'alok@xyzlogistics.com', phone: '+91 98765 11223', assignedStaffId: 'S1', dept: 'Direct Tax' },
    'Apex Retailers India': { rep: 'Ms. Sunita Roy', email: 'sunita@apexretail.in', phone: '+91 98112 33445', assignedStaffId: 'S2', dept: 'GST & Indirect Tax' },
    'Mehta Tech Solutions': { rep: 'Mr. Rohan Mehta', email: 'rohan@mehtatech.com', phone: '+91 99201 55667', assignedStaffId: 'S3', dept: 'Accounts & Bookkeeping' },
    'Sunrise Healthcare': { rep: 'Dr. Vivek Sharma', email: 'vivek@sunrisehealth.org', phone: '+91 97690 77889', assignedStaffId: 'S4', dept: 'Audit & Compliance' },
    'GreenAgro Foods': { rep: 'Mr. Ramesh Patel', email: 'ramesh@greenagro.com', phone: '+91 98334 99001', assignedStaffId: 'S5', dept: 'Direct Tax' },
    'Horizon Infra': { rep: 'Mr. Kunal Shah', email: 'kunal@horizoninfra.com', phone: '+91 98200 44332', assignedStaffId: 'S7', dept: 'GST & Indirect Tax' },
    'Unknown Contact': { rep: 'Unregistered Contact', email: 'unknown@external.com', phone: '+91 98201 44512', assignedStaffId: 'S1', dept: 'Direct Tax' }
  };

  const now = new Date();

  let tickets = [
    {
      id: 'TICK-1080',
      channel: 'WHATSAPP',
      clientName: 'XYZ Logistics Pvt Ltd',
      senderRep: 'Mr. Alok Nath',
      messageText: 'Hi Rahul, please send our Q3 TDS computation statement AND also check why our August GSTR-3B ITC reconciliation has a mismatch.',
      category: 'Multi-Dept (TDS + GST Split)',
      complexity: 'Medium',
      tatHours: 8,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
      status: 'PENDING',
      assignedStaffId: 'S1',
      dept: 'Multi-Department',
      isMultiIntent: true,
      subTickets: [
        {
          subId: 'TICK-1080-A',
          category: 'TDS Statement Request',
          dept: 'Direct Tax',
          complexity: 'Low',
          tatHours: 4,
          assignedStaffId: 'S1',
          assignedStaffName: 'Rahul Sharma',
          status: 'PENDING',
          itemsRequested: ['Q3 TDS Statement']
        },
        {
          subId: 'TICK-1080-B',
          category: 'GST 3B Recon Issue',
          dept: 'GST & Indirect Tax',
          complexity: 'Medium',
          tatHours: 8,
          assignedStaffId: 'S2',
          assignedStaffName: 'Priya Sundaram',
          status: 'PENDING',
          itemsRequested: ['GSTR-3B ITC Recon Table']
        }
      ],
      historyLogs: [
        {
          type: 'client',
          sender: 'Mr. Alok Nath (Client)',
          timestamp: formatTime(new Date(now.getTime() - 45 * 60 * 1000)),
          content: 'Hi Rahul, please send our Q3 TDS computation statement AND also check why our August GSTR-3B ITC reconciliation has a mismatch.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 45 * 60 * 1000 + 1000)),
          content: 'Dear Mr. Alok Nath, your query regarding Multi-Dept (TDS + GST Split) has been received & logged as #TICK-1080. Multi-department sub-tickets assigned to Rahul Sharma (Direct Tax) and Priya Sundaram (GST & Indirect Tax). TAT: 8h.'
        }
      ]
    },
    {
      id: 'TICK-1081',
      channel: 'WHATSAPP',
      clientName: 'XYZ Logistics Pvt Ltd',
      senderRep: 'Mr. Alok Nath',
      messageText: 'Hi Rahul, please share last year Q3 TDS computation statement and payment receipt urgently for filing returns.',
      category: 'TDS Statement Request',
      complexity: 'Low',
      tatHours: 4,
      createdAt: new Date(now.getTime() - 35 * 60 * 1000),
      status: 'PENDING',
      assignedStaffId: 'S1',
      dept: 'Direct Tax',
      itemsRequested: ['Q3 TDS Statement', 'Challan Receipts'],
      historyLogs: [
        {
          type: 'client',
          sender: 'Mr. Alok Nath (Client)',
          timestamp: formatTime(new Date(now.getTime() - 35 * 60 * 1000)),
          content: 'Hi Rahul, please share last year Q3 TDS computation statement and payment receipt urgently for filing returns.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 35 * 60 * 1000 + 1000)),
          content: 'Dear Mr. Alok Nath, your query regarding TDS Statement Request has been received & assigned to Rahul Sharma (Direct Tax). Ticket #TICK-1081. Estimated TAT: 4h.'
        }
      ]
    },
    {
      id: 'TICK-1082',
      channel: 'EMAIL',
      clientName: 'Apex Retailers India',
      senderRep: 'Ms. Sunita Roy',
      messageText: 'Dear Priya, we noticed a discrepancy in GSTR-3B recon for August 2026. Please check ITC eligibility and confirm.',
      category: 'GST 3B Recon Issue',
      complexity: 'Medium',
      tatHours: 8,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000 - 45 * 60 * 1000),
      status: 'PENDING',
      assignedStaffId: 'S2',
      dept: 'GST & Indirect Tax',
      itemsRequested: ['GSTR-3B ITC Audit', '2B Recon Table'],
      historyLogs: [
        {
          type: 'client',
          sender: 'Ms. Sunita Roy (Client)',
          timestamp: formatTime(new Date(now.getTime() - 6 * 60 * 60 * 1000 - 45 * 60 * 1000)),
          content: 'Dear Priya, we noticed a discrepancy in GSTR-3B recon for August 2026. Please check ITC eligibility and confirm.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 6 * 60 * 60 * 1000 - 45 * 60 * 1000 + 1000)),
          content: 'Dear Ms. Sunita Roy, your email regarding GST 3B Recon Issue has been received & assigned to Suresh Kumar (GST & Indirect Tax). Ticket #TICK-1082. Estimated TAT: 8h.'
        },
        {
          type: 'reassign',
          sender: 'System / Lead Reassignment',
          timestamp: formatTime(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
          content: 'Reassigned from Suresh Kumar to Priya Sundaram (GST Lead) for senior escalation.'
        }
      ]
    },
    {
      id: 'TICK-1083',
      channel: 'WHATSAPP',
      clientName: 'Sunrise Healthcare',
      senderRep: 'Dr. Vivek Sharma',
      messageText: 'Anita, we received an Income Tax Notice under Sec 143(1) for FY 2023-24. Please review and advise response draft.',
      category: 'IT Notice Response',
      complexity: 'High',
      tatHours: 24,
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000), // OVERDUE
      status: 'PENDING',
      assignedStaffId: 'S4',
      dept: 'Audit & Compliance',
      itemsRequested: ['Notice Analysis', 'Reply Draft Sec 143(1)'],
      historyLogs: [
        {
          type: 'client',
          sender: 'Dr. Vivek Sharma (Client)',
          timestamp: formatTime(new Date(now.getTime() - 26 * 60 * 60 * 1000)),
          content: 'Anita, we received an Income Tax Notice under Sec 143(1) for FY 2023-24. Please review and advise response draft.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 26 * 60 * 60 * 1000 + 1000)),
          content: 'Dear Dr. Vivek Sharma, your query regarding IT Notice Response has been received & assigned to Anita Rao (Audit & Compliance). Ticket #TICK-1083. Estimated TAT: 24h.'
        }
      ]
    },
    {
      id: 'TICK-1084',
      channel: 'EMAIL',
      clientName: 'Mehta Tech Solutions',
      senderRep: 'Mr. Rohan Mehta',
      messageText: 'Vikram, please provide the audited bank statement of SBI account for FY 2024-25.',
      category: 'Bank Statement Request',
      complexity: 'Low',
      tatHours: 4,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      status: 'RESOLVED',
      resolvedAt: new Date(now.getTime() - 30 * 60 * 1000),
      assignedStaffId: 'S3',
      dept: 'Accounts & Bookkeeping',
      itemsRequested: ['SBI Bank Statement FY24-25'],
      historyLogs: [
        {
          type: 'client',
          sender: 'Mr. Rohan Mehta (Client)',
          timestamp: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
          content: 'Vikram, please provide the audited bank statement of SBI account for FY 2024-25.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000 + 1000)),
          content: 'Dear Mr. Rohan Mehta, your email regarding Bank Statement Request has been received & assigned to Vikram Mehta (Accounts & Bookkeeping). Ticket #TICK-1084. Estimated TAT: 4h.'
        },
        {
          type: 'solution',
          sender: 'Vikram Mehta (Bookkeeping Head)',
          timestamp: formatTime(new Date(now.getTime() - 30 * 60 * 1000)),
          content: 'Dear Mr. Rohan Mehta, Please find attached the audited SBI bank statement for FY 2024-25. Marked as RESOLVED.'
        }
      ]
    },
    {
      id: 'TICK-1085',
      channel: 'WHATSAPP',
      clientName: 'GreenAgro Foods',
      senderRep: 'Mr. Ramesh Patel',
      messageText: 'Karan, need the Advance Tax calculation sheet for Q2 before tomorrow morning.',
      category: 'Advance Tax Computation',
      complexity: 'Medium',
      tatHours: 8,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'PENDING',
      assignedStaffId: 'S5',
      dept: 'Direct Tax',
      itemsRequested: ['Advance Tax Sheet Q2'],
      historyLogs: [
        {
          type: 'client',
          sender: 'Mr. Ramesh Patel (Client)',
          timestamp: formatTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
          content: 'Karan, need the Advance Tax calculation sheet for Q2 before tomorrow morning.'
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: formatTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 1000)),
          content: 'Dear Mr. Ramesh Patel, your WhatsApp query regarding Advance Tax Computation has been received & assigned to Karan Patel (Direct Tax). Ticket #TICK-1085. Estimated TAT: 8h.'
        }
      ]
    }
  ];

  let activeFilters = {
    search: '',
    channel: 'ALL',
    status: 'ALL',
    dept: 'ALL',
    staffId: null,
    datePreset: 'TODAY',
    customDate: null
  };

  let selectedTicketId = null;

  // --- 2. DOM ELEMENTS ---
  const ticketsContainer = document.getElementById('tickets-container');
  const workloadContainer = document.getElementById('workload-container');

  const metricTotal = document.getElementById('metric-total');
  const metricPending = document.getElementById('metric-pending');
  const metricOverdue = document.getElementById('metric-overdue');
  const metricResolved = document.getElementById('metric-resolved');
  const ticketCount = document.getElementById('ticket-count');

  const inputSearch = document.getElementById('input-search');
  const channelTabs = document.getElementById('channel-tabs');
  const selectStatus = document.getElementById('select-status');
  const selectDept = document.getElementById('select-dept');
  const selectDatePreset = document.getElementById('select-date-preset');
  const inputCustomDate = document.getElementById('input-custom-date');

  const btnFastForward = document.getElementById('btn-fast-forward');
  const btnRunSimulation = document.getElementById('btn-run-simulation');
  const simChannel = document.getElementById('sim-channel');
  const simClient = document.getElementById('sim-client');
  const simMessage = document.getElementById('sim-message');

  const accordionToggle = document.getElementById('accordion-toggle');
  const accordionContent = document.getElementById('accordion-content');
  const btnToggleSimTop = document.getElementById('btn-toggle-sim-top');
  const accStateTxt = document.getElementById('acc-state-txt');

  const ticketModal = document.getElementById('ticket-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnReplyTicket = document.getElementById('btn-reply-ticket');
  const btnResolveTicket = document.getElementById('btn-resolve-ticket');
  const btnUseAiSuggestion = document.getElementById('btn-use-ai-suggestion');
  const modalReplyText = document.getElementById('modal-reply-text');
  const modalMessageHistory = document.getElementById('modal-message-history');


  const btnReassignModal = document.getElementById('btn-reassign-modal');
  const reassignModal = document.getElementById('reassign-modal');
  const btnCloseReassignModal = document.getElementById('btn-close-reassign-modal');
  const btnCancelReassign = document.getElementById('btn-cancel-reassign');
  const btnConfirmReassign = document.getElementById('btn-confirm-reassign');
  const selectReassignStaff = document.getElementById('select-reassign-staff');

  const subTicketsSection = document.getElementById('sub-tickets-section');
  const subTicketsList = document.getElementById('sub-tickets-list');

  const metricCards = document.querySelectorAll('.metric-card[data-filter-status]');
  const staffFilterTag = document.getElementById('staff-filter-tag');
  const staffFilterName = document.getElementById('staff-filter-name');
  const btnClearStaffFilter = document.getElementById('btn-clear-staff-filter');

  const btnViewAllStaff = document.getElementById('btn-view-all-staff');
  const staffDirectoryModal = document.getElementById('staff-directory-modal');
  const btnCloseStaffModal = document.getElementById('btn-close-staff-modal');
  const allStaffContainer = document.getElementById('all-staff-container');

  // --- 3. ACCORDION CONTROLS ---
  function toggleAccordion(open = null) {
    const isHidden = accordionContent.classList.contains('hidden');
    const shouldOpen = open !== null ? open : isHidden;

    if (shouldOpen) {
      accordionContent.classList.remove('hidden');
      if (accStateTxt) accStateTxt.textContent = 'Collapse Simulator';
      accordionContent.scrollIntoView({ behavior: 'smooth' });
    } else {
      accordionContent.classList.add('hidden');
      if (accStateTxt) accStateTxt.textContent = 'Expand Simulator';
    }
  }

  accordionToggle.addEventListener('click', () => toggleAccordion());
  btnToggleSimTop.addEventListener('click', () => toggleAccordion(true));

  // Preset Handlers
  const PRESETS = {
    multi: "Hi Rahul, please send our Q3 TDS computation statement AND also check why our August GSTR-3B ITC reconciliation has a mismatch.",
    tds: "Hi Rahul, please send last year Q3 TDS computation statement and payment challans urgently for filing quarterly returns.",
    bank: "Please provide the audited bank statement of SBI account for FY 2024-25 for our bank audit.",
    gst: "Hi Priya, we noticed a mismatch between our purchase register and GSTR-2B for August 2026. Can you verify ITC eligibility?",
    notice: "We just received an Income Tax Notice under Section 143(1) for FY 2023-24 regarding mismatch in Form 26AS. Please advise.",
    casual: "Hey brother, are we meeting for coffee this weekend? Let me know!"
  };

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const presetKey = e.target.getAttribute('data-preset');
      if (PRESETS[presetKey]) {
        simMessage.value = PRESETS[presetKey];
      }
    });
  });

  // --- 4. GEMINI AI MULTI-INTENT PARSER SIMULATION ---
  function runGeminiAiParser(messageText, clientName) {
    const textLower = messageText.toLowerCase();
    
    let isMultiIntent = false;
    let category = 'General Accounting Query';
    let complexity = 'Low';
    let tatHours = 4;
    let itemsRequested = ['General Clarification'];
    let isCasualPersonal = false;
    let subTickets = [];

    const hasTds = textLower.includes('tds') || textLower.includes('26as') || textLower.includes('challan');
    const hasGst = textLower.includes('gst') || textLower.includes('3b') || textLower.includes('recon') || textLower.includes('itc');
    const hasBank = textLower.includes('bank') || textLower.includes('statement') || textLower.includes('passbook');
    const hasNotice = textLower.includes('notice') || textLower.includes('sec 143') || textLower.includes('audit');

    if ((hasTds && hasGst) || (hasTds && hasNotice) || (hasGst && hasBank)) {
      isMultiIntent = true;
      category = 'Multi-Dept (TDS + GST Split)';
      complexity = 'Medium';
      tatHours = 8;

      subTickets = [
        {
          subId: 'SUB-A',
          category: 'TDS Statement Request',
          dept: 'Direct Tax',
          complexity: 'Low',
          tatHours: 4,
          assignedStaffId: 'S1',
          assignedStaffName: 'Rahul Sharma',
          status: 'PENDING',
          itemsRequested: ['Q3 TDS Statement']
        },
        {
          subId: 'SUB-B',
          category: 'GST 3B Recon Issue',
          dept: 'GST & Indirect Tax',
          complexity: 'Medium',
          tatHours: 8,
          assignedStaffId: 'S2',
          assignedStaffName: 'Priya Sundaram',
          status: 'PENDING',
          itemsRequested: ['GSTR-3B Recon Table']
        }
      ];
    } else if (hasTds) {
      category = 'TDS / 26AS Statement';
      complexity = 'Low';
      tatHours = 4;
      itemsRequested = ['TDS Statement', 'Challan Copy'];
    } else if (hasBank) {
      category = 'Bank Statement Request';
      complexity = 'Low';
      tatHours = 4;
      itemsRequested = ['Audited Bank Statement'];
    } else if (hasGst) {
      category = 'GST 3B / ITC Recon';
      complexity = 'Medium';
      tatHours = 8;
      itemsRequested = ['GSTR-2B Recon', 'ITC Computation'];
    } else if (hasNotice) {
      category = 'IT Notice / Audit Reply';
      complexity = 'High';
      tatHours = 24;
      itemsRequested = ['Notice Analysis', 'Reply Draft'];
    } else if (textLower.includes('advance tax')) {
      category = 'Advance Tax Computation';
      complexity = 'Medium';
      tatHours = 8;
      itemsRequested = ['Advance Tax Calculation Sheet'];
    } else if (textLower.includes('birthday') || textLower.includes('coffee') || textLower.includes('bro')) {
      category = 'Personal / Casual Message';
      complexity = 'N/A';
      tatHours = 0;
      isCasualPersonal = true;
      itemsRequested = ['None (Personal Chat)'];
    }

    const clientInfo = CLIENTS[clientName] || CLIENTS['Unknown Contact'];
    const assignedStaff = STAFF_MEMBERS.find(s => s.id === clientInfo.assignedStaffId) || STAFF_MEMBERS[0];

    return {
      isMultiIntent,
      category,
      complexity,
      tatHours,
      itemsRequested,
      assignedStaff,
      clientInfo,
      isCasualPersonal,
      subTickets
    };
  }

  // --- 5. DATE FILTER HELPER ---
  function isDateMatch(ticketDate) {
    const today = new Date();
    const tDate = new Date(ticketDate);

    if (activeFilters.datePreset === 'ALL_TIME') return true;

    if (activeFilters.datePreset === 'TODAY') {
      return tDate.toDateString() === today.toDateString();
    }

    if (activeFilters.datePreset === 'YESTERDAY') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return tDate.toDateString() === yesterday.toDateString();
    }

    if (activeFilters.datePreset === 'LAST_7_DAYS') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return tDate >= sevenDaysAgo;
    }

    if (activeFilters.datePreset === 'LAST_30_DAYS') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return tDate >= thirtyDaysAgo;
    }

    if (activeFilters.datePreset === 'CUSTOM' && activeFilters.customDate) {
      const custom = new Date(activeFilters.customDate);
      return tDate.toDateString() === custom.toDateString();
    }

    return true;
  }

  // --- 6. RENDER & METRICS LOGIC ---

  function updateMetrics() {
    const dateFiltered = tickets.filter(t => isDateMatch(t.createdAt));

    const total = dateFiltered.length;
    const pending = dateFiltered.filter(t => t.status === 'PENDING').length;
    const overdue = dateFiltered.filter(t => isTicketOverdue(t) && t.status === 'PENDING').length;
    const resolved = dateFiltered.filter(t => t.status === 'RESOLVED').length;

    metricTotal.textContent = total;
    metricPending.textContent = pending;
    metricOverdue.textContent = overdue;
    metricResolved.textContent = resolved;
  }

  function isTicketOverdue(ticket) {
    if (ticket.status === 'RESOLVED') return false;
    const nowTime = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + ticket.tatHours * 60 * 60 * 1000);
    return nowTime > expiryTime;
  }

  function getSlaDisplay(ticket) {
    if (ticket.status === 'RESOLVED') {
      return { text: 'RESOLVED', class: 'badge-green' };
    }

    const nowTime = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + ticket.tatHours * 60 * 60 * 1000);
    const diffMs = expiryTime - nowTime;

    if (diffMs <= 0) {
      const overdueMs = Math.abs(diffMs);
      const hrs = Math.floor(overdueMs / (1000 * 60 * 60));
      const mins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
      return { text: `OVERDUE by ${hrs}h ${mins}m`, class: 'overdue' };
    } else {
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      const isWarning = hrs < 1;
      return {
        text: `${hrs}h ${mins}m ${secs}s remaining`,
        class: isWarning ? 'warning' : 'on-track'
      };
    }
  }

  function updateMetricCardActiveState() {
    metricCards.forEach(card => {
      const status = card.getAttribute('data-filter-status');
      if (status === activeFilters.status) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function renderTickets() {
    updateMetricCardActiveState();

    if (activeFilters.staffId) {
      const staffObj = STAFF_MEMBERS.find(s => s.id === activeFilters.staffId);
      if (staffObj) {
        staffFilterName.textContent = staffObj.name;
        staffFilterTag.classList.remove('hidden');
      }
    } else {
      staffFilterTag.classList.add('hidden');
    }

    const filtered = tickets.filter(t => {
      const dateMatch = isDateMatch(t.createdAt);
      const searchMatch = !activeFilters.search || 
        t.clientName.toLowerCase().includes(activeFilters.search) ||
        t.messageText.toLowerCase().includes(activeFilters.search) ||
        t.id.toLowerCase().includes(activeFilters.search);

      const channelMatch = activeFilters.channel === 'ALL' || t.channel === activeFilters.channel;
      const deptMatch = activeFilters.dept === 'ALL' || t.dept === activeFilters.dept || (t.isMultiIntent && t.subTickets.some(st => st.dept === activeFilters.dept));
      const staffMatch = !activeFilters.staffId || t.assignedStaffId === activeFilters.staffId || (t.isMultiIntent && t.subTickets.some(st => st.assignedStaffId === activeFilters.staffId));

      let statusMatch = true;
      if (activeFilters.status === 'PENDING') statusMatch = t.status === 'PENDING' && !isTicketOverdue(t);
      else if (activeFilters.status === 'OVERDUE') statusMatch = t.status === 'PENDING' && isTicketOverdue(t);
      else if (activeFilters.status === 'RESOLVED') statusMatch = t.status === 'RESOLVED';

      return dateMatch && searchMatch && channelMatch && deptMatch && staffMatch && statusMatch;
    });

    ticketCount.textContent = filtered.length;

    if (filtered.length === 0) {
      ticketsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: #fff; border-radius: 6px; border: 1px solid var(--border-color);">
          <i data-lucide="inbox" style="width: 36px; height: 36px; opacity: 0.4;"></i>
          <p style="margin-top: 8px; font-size: 0.85rem;">No matching tickets found for selected date & filters.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    ticketsContainer.innerHTML = filtered.map(t => {
      const sla = getSlaDisplay(t);
      const assignedStaff = STAFF_MEMBERS.find(s => s.id === t.assignedStaffId) || { name: 'Unassigned' };
      const isOverdue = isTicketOverdue(t);

      let staffDisplay = assignedStaff.name;
      if (t.isMultiIntent && t.subTickets) {
        staffDisplay = t.subTickets.map(st => st.assignedStaffName).join(' & ');
      }

      return `
        <div class="ticket-card ${isOverdue ? 'status-overdue' : ''}" data-id="${t.id}">
          <div class="ticket-channel-info">
            <span class="channel-tag ${t.channel === 'WHATSAPP' ? 'wa' : 'email'}">
              <i data-lucide="${t.channel === 'WHATSAPP' ? 'message-circle' : 'mail'}" style="width: 10px;"></i>
              ${t.channel}
            </span>
            <span class="ticket-id">${t.id}</span>
          </div>

          <div class="ticket-main-info">
            <div class="client-name">${t.clientName}</div>
            <div class="query-snippet">"${t.messageText}"</div>
            <div class="query-tags">
              <span class="badge ${t.isMultiIntent ? 'badge-multi' : 'badge-purple'}">${t.category}</span>
              <span class="badge ${t.complexity === 'High' ? 'badge-red' : t.complexity === 'Medium' ? 'badge-amber' : 'badge-green'}">
                Complexity: ${t.complexity}
              </span>
              <span class="badge">Max TAT: ${t.tatHours}h</span>
            </div>
          </div>

          <div class="ticket-sla-info">
            <span class="sla-timer ${sla.class}">${sla.text}</span>
            <span class="staff-assigned"><i data-lucide="users" style="width: 10px;"></i> ${staffDisplay}</span>
          </div>

          <div class="ticket-actions">
            <button class="btn btn-sm ${t.status === 'RESOLVED' ? 'btn-outline' : 'btn-primary'} btn-view-ticket" data-id="${t.id}">
              <i data-lucide="${t.status === 'RESOLVED' ? 'check' : 'message-square'}" style="width: 11px;"></i>
              <span>${t.status === 'RESOLVED' ? 'View' : 'Inspect Log & Respond'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.ticket-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openTicketModal(id);
      });
    });
  }

  function renderStaffWorkload() {
    const staffWorkload = STAFF_MEMBERS.map(staff => {
      const pendingCount = tickets.filter(t => (t.assignedStaffId === staff.id || (t.isMultiIntent && t.subTickets.some(st => st.assignedStaffId === staff.id))) && t.status === 'PENDING').length;
      const overdueCount = tickets.filter(t => (t.assignedStaffId === staff.id || (t.isMultiIntent && t.subTickets.some(st => st.assignedStaffId === staff.id))) && t.status === 'PENDING' && isTicketOverdue(t)).length;
      return { ...staff, pendingCount, overdueCount };
    }).sort((a, b) => b.pendingCount - a.pendingCount);

    workloadContainer.innerHTML = staffWorkload.slice(0, 8).map(s => `
      <div class="workload-item ${activeFilters.staffId === s.id ? 'active' : ''}" data-staff-id="${s.id}">
        <div class="staff-info">
          <div class="avatar">${s.name.split(' ').map(n=>n[0]).join('')}</div>
          <div>
            <div class="staff-name">${s.name}</div>
            <div class="staff-dept">${s.dept}</div>
          </div>
        </div>
        <div>
          <span class="badge ${s.overdueCount > 0 ? 'badge-red' : s.pendingCount > 0 ? 'badge-amber' : 'badge-green'}">
            ${s.pendingCount} Pending ${s.overdueCount > 0 ? `(${s.overdueCount} Overdue)` : ''}
          </span>
        </div>
      </div>
    `).join('');

    workloadContainer.querySelectorAll('.workload-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-staff-id');
        activeFilters.staffId = (activeFilters.staffId === id) ? null : id;
        renderTickets();
        renderStaffWorkload();
      });
    });
  }

  function renderStaffDirectoryModal() {
    const staffWorkload = STAFF_MEMBERS.map(staff => {
      const pendingCount = tickets.filter(t => (t.assignedStaffId === staff.id || (t.isMultiIntent && t.subTickets.some(st => st.assignedStaffId === staff.id))) && t.status === 'PENDING').length;
      const overdueCount = tickets.filter(t => (t.assignedStaffId === staff.id || (t.isMultiIntent && t.subTickets.some(st => st.assignedStaffId === staff.id))) && t.status === 'PENDING' && isTicketOverdue(t)).length;
      return { ...staff, pendingCount, overdueCount };
    });

    allStaffContainer.innerHTML = staffWorkload.map(s => `
      <div class="workload-item ${activeFilters.staffId === s.id ? 'active' : ''}" data-staff-id="${s.id}" style="padding: 10px;">
        <div class="staff-info">
          <div class="avatar">${s.name.split(' ').map(n=>n[0]).join('')}</div>
          <div>
            <div class="staff-name">${s.name}</div>
            <div class="staff-dept">${s.dept} • ${s.role}</div>
          </div>
        </div>
        <div>
          <span class="badge ${s.overdueCount > 0 ? 'badge-red' : s.pendingCount > 0 ? 'badge-amber' : 'badge-green'}">
            ${s.pendingCount} Pending
          </span>
        </div>
      </div>
    `).join('');

    allStaffContainer.querySelectorAll('.workload-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-staff-id');
        activeFilters.staffId = (activeFilters.staffId === id) ? null : id;
        staffDirectoryModal.classList.add('hidden');
        renderTickets();
        renderStaffWorkload();
      });
    });
  }

  // --- 7. EVENT HANDLERS ---

  selectDatePreset.addEventListener('change', (e) => {
    activeFilters.datePreset = e.target.value;
    if (e.target.value === 'CUSTOM') {
      inputCustomDate.classList.remove('hidden');
    } else {
      inputCustomDate.classList.add('hidden');
    }
    updateMetrics();
    renderTickets();
  });

  inputCustomDate.addEventListener('change', (e) => {
    activeFilters.customDate = e.target.value;
    updateMetrics();
    renderTickets();
  });

  metricCards.forEach(card => {
    card.addEventListener('click', () => {
      const statusFilter = card.getAttribute('data-filter-status');
      activeFilters.status = statusFilter;
      selectStatus.value = statusFilter;
      renderTickets();
    });
  });

  btnClearStaffFilter.addEventListener('click', () => {
    activeFilters.staffId = null;
    renderTickets();
    renderStaffWorkload();
  });

  btnViewAllStaff.addEventListener('click', () => {
    renderStaffDirectoryModal();
    staffDirectoryModal.classList.remove('hidden');
  });

  btnCloseStaffModal.addEventListener('click', () => {
    staffDirectoryModal.classList.add('hidden');
  });

  inputSearch.addEventListener('input', (e) => {
    activeFilters.search = e.target.value.toLowerCase().trim();
    renderTickets();
  });

  channelTabs.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      channelTabs.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      activeFilters.channel = e.target.getAttribute('data-channel');
      renderTickets();
    });
  });

  selectStatus.addEventListener('change', (e) => {
    activeFilters.status = e.target.value;
    renderTickets();
  });

  selectDept.addEventListener('change', (e) => {
    activeFilters.dept = e.target.value;
    renderTickets();
  });

  btnFastForward.addEventListener('click', () => {
    tickets.forEach(t => {
      t.createdAt = new Date(t.createdAt.getTime() - 3 * 60 * 60 * 1000);
    });
    updateMetrics();
    renderTickets();
    renderStaffWorkload();
    alert("⏰ Simulated: 3 Hours Passed! Updated SLA timers and overdue warnings.");
  });

  btnRunSimulation.addEventListener('click', () => {
    const channel = simChannel.value;
    const clientName = simClient.value;
    const messageText = simMessage.value.trim();

    if (!messageText) {
      alert("Please enter a client message to simulate.");
      return;
    }

    const aiResult = runGeminiAiParser(messageText, clientName);

    document.getElementById('ai-intent').textContent = aiResult.category;
    document.getElementById('ai-items').textContent = aiResult.itemsRequested.join(', ');
    document.getElementById('ai-complexity').textContent = aiResult.complexity;
    document.getElementById('ai-complexity').className = `badge ${aiResult.complexity === 'High' ? 'badge-red' : aiResult.complexity === 'Medium' ? 'badge-amber' : 'badge-green'}`;
    document.getElementById('ai-tat').textContent = `${aiResult.tatHours} Hours`;
    document.getElementById('ai-assigned').textContent = aiResult.isMultiIntent ? 'Multiple (Split Sub-Tickets)' : `${aiResult.assignedStaff.name} (${aiResult.assignedStaff.dept})`;

    if (aiResult.isCasualPersonal) {
      alert("ℹ️ Gemini AI detected this as a Personal Chat. Filtered into private staff sandbox & excluded from SLA metrics.");
    }

    const newTicketId = `TICK-${Math.floor(1086 + Math.random() * 100)}`;
    const currentTime = formatTime(new Date());

    const newTicket = {
      id: newTicketId,
      channel: channel,
      clientName: clientName,
      senderRep: aiResult.clientInfo.rep,
      messageText: messageText,
      category: aiResult.category,
      complexity: aiResult.complexity,
      tatHours: aiResult.tatHours,
      createdAt: new Date(),
      status: 'PENDING',
      assignedStaffId: aiResult.assignedStaff.id,
      dept: aiResult.isMultiIntent ? 'Multi-Department' : aiResult.assignedStaff.dept,
      itemsRequested: aiResult.itemsRequested,
      isMultiIntent: aiResult.isMultiIntent,
      subTickets: aiResult.subTickets,
      historyLogs: [
        {
          type: 'client',
          sender: `${aiResult.clientInfo.rep} (${clientName})`,
          timestamp: currentTime,
          content: messageText
        },
        {
          type: 'auto-ack',
          sender: 'TaxPulse System (Auto-Ack)',
          timestamp: currentTime,
          content: `Dear ${aiResult.clientInfo.rep}, your query regarding ${aiResult.category} has been received & assigned to ${aiResult.isMultiIntent ? 'Multiple Departments' : aiResult.assignedStaff.name + ' (' + aiResult.assignedStaff.dept + ')'}. Ticket #${newTicketId}. Estimated TAT: ${aiResult.tatHours}h.`
        }
      ]
    };

    tickets.unshift(newTicket);
    updateMetrics();
    renderTickets();
    renderStaffWorkload();
  });

  // Reassign Modal Logic
  btnReassignModal.addEventListener('click', () => {
    if (!selectedTicketId) return;
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (!ticket) return;

    selectReassignStaff.innerHTML = STAFF_MEMBERS.map(s => `
      <option value="${s.id}" ${s.id === ticket.assignedStaffId ? 'selected' : ''}>
        ${s.name} (${s.dept} - ${s.role})
      </option>
    `).join('');

    reassignModal.classList.remove('hidden');
  });

  function closeReassignModal() {
    reassignModal.classList.add('hidden');
  }

  btnCloseReassignModal.addEventListener('click', closeReassignModal);
  btnCancelReassign.addEventListener('click', closeReassignModal);

  btnConfirmReassign.addEventListener('click', () => {
    if (!selectedTicketId) return;
    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (!ticket) return;

    const newStaffId = selectReassignStaff.value;
    const oldStaff = STAFF_MEMBERS.find(s => s.id === ticket.assignedStaffId);
    const newStaff = STAFF_MEMBERS.find(s => s.id === newStaffId);

    if (newStaff) {
      ticket.assignedStaffId = newStaff.id;
      if (!ticket.isMultiIntent) {
        ticket.dept = newStaff.dept;
      }

      const currentTime = formatTime(new Date());
      if (!ticket.historyLogs) ticket.historyLogs = [];

      ticket.historyLogs.push({
        type: 'reassign',
        sender: 'System / Lead Reassignment',
        timestamp: currentTime,
        content: `Reassigned ticket from ${oldStaff ? oldStaff.name : 'Previous Member'} to ${newStaff.name} (${newStaff.dept} - ${newStaff.role}).`
      });

      closeReassignModal();
      openTicketModal(ticket.id);
      updateMetrics();
      renderTickets();
      renderStaffWorkload();
    }
  });

  // Modal Functions
  function openTicketModal(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    selectedTicketId = ticketId;
    const staff = STAFF_MEMBERS.find(s => s.id === ticket.assignedStaffId) || { name: 'Unassigned', dept: 'General' };
    const sla = getSlaDisplay(ticket);

    document.getElementById('modal-ticket-id').textContent = ticket.id;
    document.getElementById('modal-channel-badge').textContent = ticket.channel;
    document.getElementById('modal-channel-badge').className = `badge ${ticket.channel === 'WHATSAPP' ? 'badge-green' : 'badge-purple'}`;
    
    document.getElementById('modal-client').textContent = ticket.clientName;
    document.getElementById('modal-intent').textContent = ticket.category;
    document.getElementById('modal-assigned').textContent = ticket.isMultiIntent ? `${staff.name} (${staff.dept})` : `${staff.name} (${staff.dept})`;
    document.getElementById('modal-sla').textContent = sla.text;

    // Render Sub-Tickets if Multi-Intent
    if (ticket.isMultiIntent && ticket.subTickets && ticket.subTickets.length > 0) {
      subTicketsSection.classList.remove('hidden');
      subTicketsList.innerHTML = ticket.subTickets.map(st => {
        const isCompleted = st.status === 'COMPLETED' || st.status === 'RESOLVED';
        return `
          <div class="sub-ticket-item">
            <div class="sub-ticket-info">
              <span class="sub-title">${st.category}</span>
              <span class="sub-meta">Dept: <strong>${st.dept}</strong> | Assignee: <strong>${st.assignedStaffName}</strong> | Max TAT: ${st.tatHours}h</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge ${isCompleted ? 'badge-green' : 'badge-amber'}">${st.status === 'COMPLETED' ? 'COMPLETED & HANDED OFF' : st.status}</span>
              ${!isCompleted ? `
                <button class="btn-complete-sub" data-sub-id="${st.subId}">
                  <i data-lucide="check" style="width: 10px; height: 10px;"></i> Complete & Hand off
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      // Bind Hand-off button clicks
      subTicketsList.querySelectorAll('.btn-complete-sub').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const subId = btn.getAttribute('data-sub-id');
          const subTicket = ticket.subTickets.find(st => st.subId === subId);
          if (subTicket) {
            subTicket.status = 'COMPLETED';

            const nextPending = ticket.subTickets.find(st => st.status === 'PENDING');
            let handoffText = '';
            if (nextPending) {
              ticket.assignedStaffId = nextPending.assignedStaffId;
              handoffText = `handed off parent ticket to ${nextPending.assignedStaffName} (${nextPending.dept}) for final response.`;
            } else {
              handoffText = `all sub-tickets completed. Ready for final response & ticket closure.`;
            }

            const currentTime = formatTime(new Date());
            ticket.historyLogs.push({
              type: 'reassign',
              sender: 'Multi-Dept Sequential Workflow',
              timestamp: currentTime,
              content: `${subTicket.assignedStaffName} (${subTicket.dept}) COMPLETED Sub-Ticket (${subTicket.category}) and ${handoffText}`
            });

            openTicketModal(ticket.id);
            updateMetrics();
            renderTickets();
            renderStaffWorkload();
          }
        });
      });
    } else {
      subTicketsSection.classList.add('hidden');
    }

    // Render Message History & Activity Audit Trail
    if (ticket.historyLogs && ticket.historyLogs.length > 0) {
      modalMessageHistory.innerHTML = ticket.historyLogs.map(log => {
        let icon = 'message-square';
        let senderColor = 'var(--text-main)';
        
        if (log.type === 'client') {
          icon = 'user';
        } else if (log.type === 'auto-ack') {
          icon = 'bot';
          senderColor = 'var(--color-green)';
        } else if (log.type === 'reassign') {
          icon = 'arrow-right-left';
          senderColor = 'var(--color-blue)';
        } else if (log.type === 'reply') {
          icon = 'message-square';
          senderColor = 'var(--color-amber)';
        } else if (log.type === 'solution') {
          icon = 'check-circle-2';
          senderColor = 'var(--color-green)';
        }

        return `
          <div class="history-item ${log.type}">
            <div class="history-meta">
              <span class="history-sender" style="color: ${senderColor};">
                <i data-lucide="${icon}" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle;"></i>
                ${log.sender}
              </span>
              <span class="history-time" style="font-size: 0.7rem; color: var(--text-dim);">${log.timestamp}</span>
            </div>
            <div class="history-body" style="font-size: 0.78rem; margin-top: 3px; color: var(--text-muted);">${log.content}</div>
          </div>
        `;
      }).join('');
    } else {
      modalMessageHistory.innerHTML = `<div class="history-item client"><div class="history-body">No history logs available.</div></div>`;
    }

    if (window.lucide) lucide.createIcons();

    const suggestedReply = `Dear ${ticket.senderRep}, We have prepared your ${ticket.category} files. Please find them attached. This query is now complete and marked as RESOLVED.`;
    document.getElementById('modal-ai-suggestion').textContent = suggestedReply;

    // Pre-fill response composer with AI draft by default
    modalReplyText.value = suggestedReply;
    ticketModal.classList.remove('hidden');
  }

  btnCloseModal.addEventListener('click', () => {
    ticketModal.classList.add('hidden');
  });

  btnUseAiSuggestion.addEventListener('click', () => {
    modalReplyText.value = document.getElementById('modal-ai-suggestion').textContent;
  });

  // Intermediate Reply (Keep Open) Button Handler
  if (btnReplyTicket) {
    btnReplyTicket.addEventListener('click', () => {
      if (!selectedTicketId) return;

      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (!ticket) return;

      let replyText = modalReplyText.value.trim();
      if (!replyText) {
        replyText = `Dear ${ticket.senderRep}, your query regarding ${ticket.category} is currently being processed by our team. We will share full details shortly.`;
      }

      const currentStaff = STAFF_MEMBERS.find(s => s.id === ticket.assignedStaffId);
      const staffName = currentStaff ? `${currentStaff.name} (${currentStaff.dept})` : 'Accountant';
      const currentTime = formatTime(new Date());

      if (!ticket.historyLogs) ticket.historyLogs = [];
      ticket.historyLogs.push({
        type: 'reply',
        sender: `${staffName} (Intermediate Reply)`,
        timestamp: currentTime,
        content: replyText
      });

      modalReplyText.value = '';
      openTicketModal(ticket.id);
      updateMetrics();
      renderTickets();

      alert(`💬 Intermediate reply sent to ${ticket.clientName} via ${ticket.channel} API! Ticket #${ticket.id} remains OPEN (TAT clock running).`);
    });
  }

  // Reply & Close (Mark RESOLVED) Button Handler
  if (btnResolveTicket) {
    btnResolveTicket.addEventListener('click', () => {
      if (!selectedTicketId) return;

      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (!ticket) return;

      let reply = modalReplyText.value.trim();
      if (!reply) {
        reply = `Dear ${ticket.senderRep}, We have completed your request regarding ${ticket.category}. Please find the relevant documents attached. This query is now marked as RESOLVED.`;
      }

      ticket.status = 'RESOLVED';
      ticket.resolvedAt = new Date();
      if (ticket.isMultiIntent && ticket.subTickets) {
        ticket.subTickets.forEach(st => st.status = 'RESOLVED');
      }

      const currentStaff = STAFF_MEMBERS.find(s => s.id === ticket.assignedStaffId);
      const staffName = currentStaff ? `${currentStaff.name} (${currentStaff.dept})` : 'Accountant';

      if (!ticket.historyLogs) ticket.historyLogs = [];
      ticket.historyLogs.push({
        type: 'solution',
        sender: `${staffName} (Final Solution & Resolution)`,
        timestamp: formatTime(new Date()),
        content: reply
      });

      ticketModal.classList.add('hidden');
      updateMetrics();
      renderTickets();
      renderStaffWorkload();

      alert(`✅ Solution sent to ${ticket.clientName} via ${ticket.channel} API! Ticket #${ticket.id} marked as RESOLVED.`);
    });
  }

  // --- 8. REAL-TIME TICKING ENGINE ---
  setInterval(() => {
    renderTickets();
    updateMetrics();
  }, 1000);

  // --- INITIAL RENDER ---
  updateMetrics();
  renderTickets();
  renderStaffWorkload();
});

