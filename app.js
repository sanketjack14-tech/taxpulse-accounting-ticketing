// TaxPulse Accounting Pseudo-Ticketing Prototype Logic

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
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

  let tickets = [
    {
      id: 'TICK-1081',
      channel: 'WHATSAPP',
      clientName: 'XYZ Logistics Pvt Ltd',
      senderRep: 'Mr. Alok Nath',
      messageText: 'Hi Rahul, please share last year Q3 TDS computation statement and payment receipt urgently for filing returns.',
      category: 'TDS Statement Request',
      complexity: 'Low',
      tatHours: 4,
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
      status: 'PENDING',
      assignedStaffId: 'S1',
      dept: 'Direct Tax',
      itemsRequested: ['Q3 TDS Statement', 'Challan Receipts']
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
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000 - 45 * 60 * 1000),
      status: 'PENDING',
      assignedStaffId: 'S2',
      dept: 'GST & Indirect Tax',
      itemsRequested: ['GSTR-3B ITC Audit', '2B Recon Table']
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
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // OVERDUE
      status: 'PENDING',
      assignedStaffId: 'S4',
      dept: 'Audit & Compliance',
      itemsRequested: ['Notice Analysis', 'Reply Draft Sec 143(1)']
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
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'RESOLVED',
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
      assignedStaffId: 'S3',
      dept: 'Accounts & Bookkeeping',
      itemsRequested: ['SBI Bank Statement FY24-25']
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
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // OVERDUE
      status: 'PENDING',
      assignedStaffId: 'S5',
      dept: 'Direct Tax',
      itemsRequested: ['Advance Tax Sheet Q2']
    }
  ];

  let activeFilters = {
    search: '',
    channel: 'ALL',
    status: 'ALL',
    dept: 'ALL',
    staffId: null // Added staffId filter
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
  const btnResolveTicket = document.getElementById('btn-resolve-ticket');
  const btnUseAiSuggestion = document.getElementById('btn-use-ai-suggestion');
  const modalReplyText = document.getElementById('modal-reply-text');

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

  // --- 4. GEMINI AI PARSER SIMULATION ---
  function runGeminiAiParser(messageText, clientName) {
    const textLower = messageText.toLowerCase();
    
    let category = 'General Accounting Query';
    let complexity = 'Low';
    let tatHours = 4;
    let itemsRequested = ['General Clarification'];
    let isCasualPersonal = false;

    if (textLower.includes('tds') || textLower.includes('26as') || textLower.includes('challan')) {
      category = 'TDS / 26AS Statement';
      complexity = 'Low';
      tatHours = 4;
      itemsRequested = ['TDS Statement', 'Challan Copy'];
    } else if (textLower.includes('bank') || textLower.includes('statement') || textLower.includes('passbook')) {
      category = 'Bank Statement Request';
      complexity = 'Low';
      tatHours = 4;
      itemsRequested = ['Audited Bank Statement'];
    } else if (textLower.includes('gst') || textLower.includes('3b') || textLower.includes('recon') || textLower.includes('itc')) {
      category = 'GST 3B / ITC Recon';
      complexity = 'Medium';
      tatHours = 8;
      itemsRequested = ['GSTR-2B Recon', 'ITC Computation'];
    } else if (textLower.includes('notice') || textLower.includes('sec 143') || textLower.includes('audit') || textLower.includes('assessment')) {
      category = 'IT Notice / Audit Reply';
      complexity = 'High';
      tatHours = 24;
      itemsRequested = ['Notice Analysis', 'Reply Draft'];
    } else if (textLower.includes('advance tax') || textLower.includes('tax calculation')) {
      category = 'Advance Tax Computation';
      complexity = 'Medium';
      tatHours = 8;
      itemsRequested = ['Advance Tax Calculation Sheet'];
    } else if (textLower.includes('birthday') || textLower.includes('coffee') || textLower.includes('dinner') || textLower.includes('bro')) {
      category = 'Personal / Casual Message';
      complexity = 'N/A';
      tatHours = 0;
      isCasualPersonal = true;
      itemsRequested = ['None (Personal Chat)'];
    }

    const clientInfo = CLIENTS[clientName] || CLIENTS['Unknown Contact'];
    const assignedStaff = STAFF_MEMBERS.find(s => s.id === clientInfo.assignedStaffId) || STAFF_MEMBERS[0];

    return {
      category,
      complexity,
      tatHours,
      itemsRequested,
      assignedStaff,
      clientInfo,
      isCasualPersonal
    };
  }

  // --- 5. RENDER & METRICS LOGIC ---

  function updateMetrics() {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === 'PENDING').length;
    const overdue = tickets.filter(t => isTicketOverdue(t) && t.status === 'PENDING').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;

    metricTotal.textContent = total;
    metricPending.textContent = pending;
    metricOverdue.textContent = overdue;
    metricResolved.textContent = resolved;
  }

  function isTicketOverdue(ticket) {
    if (ticket.status === 'RESOLVED') return false;
    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + ticket.tatHours * 60 * 60 * 1000);
    return now > expiryTime;
  }

  function getSlaDisplay(ticket) {
    if (ticket.status === 'RESOLVED') {
      return { text: 'RESOLVED', class: 'badge-green' };
    }

    const now = new Date();
    const expiryTime = new Date(ticket.createdAt.getTime() + ticket.tatHours * 60 * 60 * 1000);
    const diffMs = expiryTime - now;

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

    // Staff filter badge handling
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
      const searchMatch = !activeFilters.search || 
        t.clientName.toLowerCase().includes(activeFilters.search) ||
        t.messageText.toLowerCase().includes(activeFilters.search) ||
        t.id.toLowerCase().includes(activeFilters.search);

      const channelMatch = activeFilters.channel === 'ALL' || t.channel === activeFilters.channel;
      const deptMatch = activeFilters.dept === 'ALL' || t.dept === activeFilters.dept;
      const staffMatch = !activeFilters.staffId || t.assignedStaffId === activeFilters.staffId;

      let statusMatch = true;
      if (activeFilters.status === 'PENDING') statusMatch = t.status === 'PENDING' && !isTicketOverdue(t);
      else if (activeFilters.status === 'OVERDUE') statusMatch = t.status === 'PENDING' && isTicketOverdue(t);
      else if (activeFilters.status === 'RESOLVED') statusMatch = t.status === 'RESOLVED';

      return searchMatch && channelMatch && deptMatch && staffMatch && statusMatch;
    });

    ticketCount.textContent = filtered.length;

    if (filtered.length === 0) {
      ticketsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: #fff; border-radius: 6px; border: 1px solid var(--border-color);">
          <i data-lucide="inbox" style="width: 36px; height: 36px; opacity: 0.4;"></i>
          <p style="margin-top: 8px; font-size: 0.85rem;">No matching tickets found for current filters.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    ticketsContainer.innerHTML = filtered.map(t => {
      const sla = getSlaDisplay(t);
      const assignedStaff = STAFF_MEMBERS.find(s => s.id === t.assignedStaffId) || { name: 'Unassigned' };
      const isOverdue = isTicketOverdue(t);

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
              <span class="badge badge-purple">${t.category}</span>
              <span class="badge ${t.complexity === 'High' ? 'badge-red' : t.complexity === 'Medium' ? 'badge-amber' : 'badge-green'}">
                Complexity: ${t.complexity}
              </span>
              <span class="badge">TAT: ${t.tatHours}h</span>
            </div>
          </div>

          <div class="ticket-sla-info">
            <span class="sla-timer ${sla.class}">${sla.text}</span>
            <span class="staff-assigned"><i data-lucide="user" style="width: 10px;"></i> ${assignedStaff.name}</span>
          </div>

          <div class="ticket-actions">
            <button class="btn btn-sm ${t.status === 'RESOLVED' ? 'btn-outline' : 'btn-primary'} btn-view-ticket" data-id="${t.id}">
              <i data-lucide="${t.status === 'RESOLVED' ? 'check' : 'message-square'}" style="width: 11px;"></i>
              <span>${t.status === 'RESOLVED' ? 'View' : 'Respond'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    lucide.createIcons();

    // Make ticket cards clickable
    document.querySelectorAll('.ticket-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        openTicketModal(id);
      });
    });
  }

  function renderStaffWorkload() {
    const staffWorkload = STAFF_MEMBERS.map(staff => {
      const pendingCount = tickets.filter(t => t.assignedStaffId === staff.id && t.status === 'PENDING').length;
      const overdueCount = tickets.filter(t => t.assignedStaffId === staff.id && t.status === 'PENDING' && isTicketOverdue(t)).length;
      return { ...staff, pendingCount, overdueCount };
    }).sort((a, b) => b.pendingCount - a.pendingCount);

    workloadContainer.innerHTML = staffWorkload.slice(0, 8).map(s => `
      <div class="workload-item ${activeFilters.staffId === s.id ? 'active' : ''}" data-staff-id="${s.id}" title="Click to filter tickets assigned to ${s.name}">
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

    // Attach click listeners to staff workload cards
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
      const pendingCount = tickets.filter(t => t.assignedStaffId === staff.id && t.status === 'PENDING').length;
      const overdueCount = tickets.filter(t => t.assignedStaffId === staff.id && t.status === 'PENDING' && isTicketOverdue(t)).length;
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

  // --- 6. EVENT HANDLERS ---

  // Metric Box Clicks
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
    document.getElementById('ai-assigned').textContent = `${aiResult.assignedStaff.name} (${aiResult.assignedStaff.dept})`;

    if (aiResult.isCasualPersonal) {
      alert("ℹ️ Gemini AI detected this as a Personal Chat. Filtered into private staff sandbox & excluded from SLA metrics.");
    }

    const newTicket = {
      id: `TICK-${Math.floor(1086 + Math.random() * 100)}`,
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
      dept: aiResult.assignedStaff.dept,
      itemsRequested: aiResult.itemsRequested
    };

    tickets.unshift(newTicket);
    updateMetrics();
    renderTickets();
    renderStaffWorkload();
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
    document.getElementById('modal-assigned').textContent = `${staff.name} (${staff.dept})`;
    document.getElementById('modal-sla').textContent = sla.text;

    document.getElementById('modal-sender').textContent = ticket.senderRep;
    document.getElementById('modal-timestamp').textContent = new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('modal-content').textContent = ticket.messageText;

    document.getElementById('modal-ai-suggestion').textContent = `Dear ${ticket.senderRep}, We have received your query regarding ${ticket.category}. Our team is processing this and will send the details within our assigned TAT window.`;

    modalReplyText.value = '';
    ticketModal.classList.remove('hidden');
  }

  btnCloseModal.addEventListener('click', () => {
    ticketModal.classList.add('hidden');
  });

  btnUseAiSuggestion.addEventListener('click', () => {
    modalReplyText.value = document.getElementById('modal-ai-suggestion').textContent;
  });

  btnResolveTicket.addEventListener('click', () => {
    if (!selectedTicketId) return;

    const reply = modalReplyText.value.trim();
    if (!reply) {
      alert("Please enter a response message before resolving.");
      return;
    }

    const ticket = tickets.find(t => t.id === selectedTicketId);
    if (ticket) {
      ticket.status = 'RESOLVED';
      ticket.resolvedAt = new Date();
    }

    ticketModal.classList.add('hidden');
    updateMetrics();
    renderTickets();
    renderStaffWorkload();

    alert(`✅ Response sent to ${ticket.clientName} via ${ticket.channel} API! Ticket marked as RESOLVED.`);
  });

  // --- 7. REAL-TIME TICKING ENGINE ---
  setInterval(() => {
    renderTickets();
    updateMetrics();
  }, 1000);

  // --- INITIAL RENDER ---
  updateMetrics();
  renderTickets();
  renderStaffWorkload();
});
