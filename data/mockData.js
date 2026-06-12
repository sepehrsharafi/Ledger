const projectSeeds = [
  {
    id: "lumen-skincare",
    name: "Lumen Skincare",
    clientName: "Lumen Labs",
    type: "DTC e-commerce brand launch",
    brandPrimary: "#E8A6A1",
    brandAccent: "#3B2F2F",
    status: "Active",
    createdDate: "2026-01-10",
    topKpiLabel: "Launch ROI",
    topKpiValue: "3.84x",
  },
  {
    id: "northpeak-outdoor-co",
    name: "Northpeak Outdoor Co.",
    clientName: "Northpeak Outdoor Co.",
    type: "Retail / outdoor apparel brand",
    brandPrimary: "#2F5D50",
    brandAccent: "#D9A441",
    status: "Active",
    createdDate: "2025-10-01",
    topKpiLabel: "Seasonal Revenue",
    topKpiValue: "EUR86.4k",
  },
  {
    id: "vaultline",
    name: "Vaultline",
    clientName: "Vaultline GmbH",
    type: "B2B fintech SaaS",
    brandPrimary: "#1F3A5F",
    brandAccent: "#4CC9B0",
    status: "Active",
    createdDate: "2025-12-04",
    topKpiLabel: "Pipeline Value",
    topKpiValue: "EUR420k",
  },
];

const teamMembers = [
  {
    id: "tm-alex",
    name: "Alex Morgan",
    email: "alex.morgan@ledgerstudio.co",
    role: "Admin",
    avatarColor: "#2B58E8",
    assignedProjectIds: projectSeeds.map((project) => project.id),
  },
  {
    id: "tm-isla",
    name: "Isla Chen",
    email: "isla.chen@ledgerstudio.co",
    role: "Manager",
    avatarColor: "#5B82F5",
    assignedProjectIds: ["lumen-skincare", "northpeak-outdoor-co"],
  },
  {
    id: "tm-emma",
    name: "Emma Johnson",
    email: "emma.johnson@ledgerstudio.co",
    role: "Member",
    avatarColor: "#0EA5A3",
    assignedProjectIds: ["lumen-skincare", "vaultline"],
  },
  {
    id: "tm-liam",
    name: "Liam Smith",
    email: "liam.smith@ledgerstudio.co",
    role: "Member",
    avatarColor: "#F59E0B",
    assignedProjectIds: ["northpeak-outdoor-co"],
  },
  {
    id: "tm-noah",
    name: "Noah Williams",
    email: "noah.williams@ledgerstudio.co",
    role: "Manager",
    avatarColor: "#10B981",
    assignedProjectIds: ["vaultline"],
  },
  {
    id: "tm-priya",
    name: "Priya Shah",
    email: "priya.shah@ledgerstudio.co",
    role: "Manager",
    avatarColor: "#8B5CF6",
    assignedProjectIds: ["lumen-skincare", "northpeak-outdoor-co"],
  },
  {
    id: "tm-daniel",
    name: "Daniel Kim",
    email: "daniel.kim@ledgerstudio.co",
    role: "Member",
    avatarColor: "#EC4899",
    assignedProjectIds: ["lumen-skincare", "vaultline"],
  },
  {
    id: "tm-chloe",
    name: "Chloe Bennett",
    email: "chloe.bennett@ledgerstudio.co",
    role: "Member",
    avatarColor: "#14B8A6",
    assignedProjectIds: ["northpeak-outdoor-co"],
  },
];

const monthKeys = [
  "2025-07-01",
  "2025-08-01",
  "2025-09-01",
  "2025-10-01",
  "2025-11-01",
  "2025-12-01",
  "2026-01-01",
  "2026-02-01",
  "2026-03-01",
  "2026-04-01",
  "2026-05-01",
  "2026-06-01",
];

const timeSeries = {
  "lumen-skincare": monthKeys.map((month, index) => ({
    month,
    traffic: 6200 + index * 780 + (index % 2 === 0 ? 220 : 480),
    conversions: 110 + index * 10 + (index % 3) * 6,
    spend: 8200 + index * 680 + (index % 2 === 0 ? 180 : 420),
    leads: 70 + index * 5 + (index % 4) * 4,
  })),
  "northpeak-outdoor-co": monthKeys.map((month, index) => {
    const winterBoost = index === 4 || index === 5 || index === 6 ? 1900 : 0;
    return {
      month,
      traffic: 3900 + index * 160 + winterBoost,
      conversions: 66 + index * 2 + (winterBoost ? 22 : 0),
      spend: 4300 + index * 120 + (winterBoost ? 520 : 0),
      leads: 34 + index + (winterBoost ? 14 : 0),
    };
  }),
  vaultline: monthKeys.map((month, index) => ({
    month,
    traffic: 920 + index * 65,
    conversions: 12 + index,
    spend: 3600 + index * 210,
    leads: 8 + Math.floor(index / 2),
  })),
};

const kpiSnapshots = {
  "lumen-skincare": {
    traffic: { current: 14820, previous: 12420, sparkline: [11, 13, 14, 12, 16, 17, 19] },
    conversions: { current: 432, previous: 362, sparkline: [6, 7, 8, 7, 9, 10, 11] },
    costPerLead: { current: 18.4, previous: 21.1, sparkline: [22, 21, 20, 19, 18.5, 18.8, 18.4] },
    roi: { current: 3.84, previous: 3.22, sparkline: [2.5, 2.8, 3.1, 3.0, 3.4, 3.6, 3.84] },
  },
  "northpeak-outdoor-co": {
    traffic: { current: 9260, previous: 8140, sparkline: [7, 7.4, 7.8, 8.2, 8.1, 8.9, 9.2] },
    conversions: { current: 204, previous: 181, sparkline: [4, 4.4, 4.5, 5, 5.1, 5.4, 5.7] },
    costPerLead: { current: 24.7, previous: 26.4, sparkline: [27, 26.7, 26, 25.6, 25.2, 24.8, 24.7] },
    roi: { current: 2.96, previous: 2.68, sparkline: [2, 2.2, 2.3, 2.4, 2.6, 2.8, 2.96] },
  },
  vaultline: {
    traffic: { current: 1540, previous: 1390, sparkline: [1.1, 1.15, 1.2, 1.26, 1.32, 1.4, 1.54] },
    conversions: { current: 34, previous: 30, sparkline: [1.2, 1.3, 1.4, 1.5, 1.55, 1.62, 1.7] },
    costPerLead: { current: 218.6, previous: 231.4, sparkline: [240, 236, 233, 230, 226, 221, 218.6] },
    roi: { current: 4.6, previous: 4.1, sparkline: [3.2, 3.5, 3.6, 3.9, 4.1, 4.3, 4.6] },
  },
};

const channelBreakdowns = {
  "lumen-skincare": [
    { channel: "Search", visits: 2480, conversions: 88, spend: 5400, costPerLead: 23.2 },
    { channel: "Social", visits: 5160, conversions: 164, spend: 10200, costPerLead: 17.4 },
    { channel: "Email", visits: 1320, conversions: 48, spend: 1200, costPerLead: 8.2 },
    { channel: "Paid", visits: 5860, conversions: 132, spend: 12600, costPerLead: 21.5 },
  ],
  "northpeak-outdoor-co": [
    { channel: "Search", visits: 3620, conversions: 82, spend: 4100, costPerLead: 19.8 },
    { channel: "Social", visits: 1180, conversions: 24, spend: 1800, costPerLead: 30.2 },
    { channel: "Email", visits: 2440, conversions: 64, spend: 900, costPerLead: 10.9 },
    { channel: "Paid", visits: 2020, conversions: 34, spend: 3100, costPerLead: 27.3 },
  ],
  vaultline: [
    { channel: "Search", visits: 540, conversions: 11, spend: 2800, costPerLead: 168.5 },
    { channel: "Social", visits: 170, conversions: 2, spend: 760, costPerLead: 310.4 },
    { channel: "Email", visits: 230, conversions: 5, spend: 420, costPerLead: 83.6 },
    { channel: "Paid", visits: 600, conversions: 16, spend: 4680, costPerLead: 222.9 },
  ],
};

const timelineAnnotations = {
  "lumen-skincare": [
    { date: "2025-10-15", label: "Holiday creative", note: "New paid social creative went live.", author: "Isla Chen" },
    { date: "2026-02-12", label: "Landing page v2", note: "Friction reduced on the checkout funnel.", author: "Emma Johnson" },
    { date: "2026-05-20", label: "Creator burst", note: "Influencer collaboration week lifted referral traffic.", author: "Alex Morgan" },
  ],
  "northpeak-outdoor-co": [
    { date: "2025-11-08", label: "Winter launch", note: "Seasonal collection launch pushed search demand higher.", author: "Liam Smith" },
    { date: "2026-01-22", label: "Email relaunch", note: "Lifecycle refresh improved repeat purchase conversion.", author: "Alex Morgan" },
  ],
  vaultline: [
    { date: "2025-12-10", label: "Demo page refresh", note: "Shorter form raised qualified request volume.", author: "Noah Williams" },
    { date: "2026-04-06", label: "Paid search test", note: "Higher-intent campaigns improved meeting quality.", author: "Emma Johnson" },
  ],
};

const goals = {
  "lumen-skincare": [
    { label: "Qualified leads", targetValue: 150, currentValue: 128, unit: "leads", period: "This month" },
    { label: "Launch ROI", targetValue: 4.2, currentValue: 3.84, unit: "x", period: "Quarter" },
    { label: "Email signups", targetValue: 2800, currentValue: 2140, unit: "contacts", period: "This month" },
  ],
  "northpeak-outdoor-co": [
    { label: "Organic sessions", targetValue: 6400, currentValue: 5780, unit: "visits", period: "This month" },
    { label: "Seasonal revenue", targetValue: 92000, currentValue: 86400, unit: "EUR", period: "Quarter" },
    { label: "Email conversion", targetValue: 3.8, currentValue: 3.2, unit: "%", period: "This month" },
  ],
  vaultline: [
    { label: "Pipeline value", targetValue: 500000, currentValue: 420000, unit: "EUR", period: "Quarter" },
    { label: "Demo requests", targetValue: 24, currentValue: 18, unit: "requests", period: "This quarter" },
    { label: "CAC payback", targetValue: 7, currentValue: 5.8, unit: "months", period: "This quarter" },
  ],
};

function createLead(projectId, index, overrides = {}) {
  return {
    id: `${projectId}-lead-${index + 1}`,
    projectId,
    name: overrides.name || `Lead ${index + 1}`,
    email: overrides.email || `lead${index + 1}@example.com`,
    company: overrides.company || "Individual Customer",
    phone: overrides.phone || `+1-555-${String(1200 + index).padStart(4, "0")}`,
    source: overrides.source || "Website form",
    status: overrides.status || "New",
    estimatedValue: overrides.estimatedValue || 120 + (index % 8) * 35,
    capturedFrom: overrides.capturedFrom || "Landing page",
    assignedTeamMember: overrides.assignedTeamMember || teamMembers[index % teamMembers.length].name,
    createdDate: overrides.createdDate || `2026-05-${String((index % 28) + 1).padStart(2, "0")}`,
    lastContactedDate: overrides.lastContactedDate || `2026-06-${String((index % 11) + 1).padStart(2, "0")}`,
  };
}

function buildContactNames(firstNames, lastNames, count) {
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    return `${firstName} ${lastName}`;
  });
}

function getStatusByIndex(index, counts) {
  let cursor = 0;
  for (const [status, count] of counts) {
    cursor += count;
    if (index < cursor) {
      return status;
    }
  }
  return counts.at(-1)?.[0] || "New";
}

function buildConsumerEmail(name, domain) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@${domain}`;
}

function buildBusinessEmail(name, company) {
  const companyDomain = company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/gmbh|inc|co|llc|group|labs|systems|analytics/g, "");
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@${companyDomain}.com`;
}

function buildLeadBatch({
  projectId,
  names,
  emailDomain,
  companies,
  sources,
  assignees,
  statusCounts,
  valueBase,
  valueStep,
  createdDayStart,
  contactDayStart,
}) {
  return names.map((name, index) => {
    const status = getStatusByIndex(index, statusCounts);
    const sourceProfile = sources[index % sources.length];
    const company = companies ? companies[index % companies.length] : "Individual Customer";
    const assignedTeamMember = assignees[index % assignees.length];
    const createdDay = ((createdDayStart + index) % 28) + 1;
    const contactedDay = ((contactDayStart + index * 2) % 28) + 1;

    return createLead(projectId, index, {
      name,
      email: emailDomain
        ? buildConsumerEmail(name, emailDomain)
        : buildBusinessEmail(name, company),
      company,
      source: sourceProfile.source,
      status,
      estimatedValue:
        status === "Lost"
          ? valueBase
          : valueBase + (index % 7) * valueStep + (status === "Won" ? valueStep * 1.5 : 0),
      capturedFrom: sourceProfile.capturedFrom,
      assignedTeamMember,
      createdDate: `2026-05-${String(createdDay).padStart(2, "0")}`,
      lastContactedDate: `2026-06-${String(contactedDay).padStart(2, "0")}`,
      phone: `+1-555-${String(2100 + index + createdDayStart * 3).padStart(4, "0")}`,
    });
  });
}

const lumenLeadNames = buildContactNames(
  ["Ava", "Mila", "Zoey", "Sage", "Leah", "Nina", "Ella", "Ruby", "Aria", "Maya", "Chloe", "Ivy", "Lena", "Sophie"],
  ["Carter", "Brooks", "Hayes", "Turner", "Cole", "Walsh", "Foster", "Price", "Bell", "Reed", "Parker", "Dean"],
  124,
);

const northpeakLeadNames = buildContactNames(
  ["Owen", "Levi", "Hannah", "Miles", "Nora", "Ethan", "Maya", "Lila", "Jack", "Eva", "Caleb", "Sadie"],
  ["Frost", "Stone", "Pike", "Avery", "Fields", "Marsh", "Grant", "Holt", "Carter", "Quinn"],
  56,
);

const vaultlineLeadNames = buildContactNames(
  ["Amelia", "Felix", "Jonas", "Clara", "Sophie", "Matteo", "Lena", "Oliver"],
  ["Weber", "Keller", "Hoffmann", "Roth", "Becker", "Schulz", "Meyer", "Fischer"],
  18,
);

const vaultlineCompanies = [
  "Nordspan Systems",
  "Hexa Core Capital",
  "Praxis Grid",
  "Riverbank Metrics",
  "Atlas Compliance",
  "Brightforge Finance",
  "Quantis Data",
  "Bluewell Insurance",
];

const leads = [
  ...buildLeadBatch({
    projectId: "lumen-skincare",
    names: lumenLeadNames,
    emailDomain: "lumenmail.com",
    sources: [
      { source: "Paid ad", capturedFrom: "Meta lead form - hydration quiz" },
      { source: "Website form", capturedFrom: "Serum launch landing page" },
      { source: "Referral", capturedFrom: "Creator ambassador referral" },
      { source: "Email signup", capturedFrom: "Welcome flow signup form" },
      { source: "Event", capturedFrom: "Pop-up skin consultation booth" },
      { source: "Organic search", capturedFrom: "Routine finder article CTA" },
    ],
    assignees: ["Alex Morgan", "Isla Chen", "Emma Johnson", "Priya Shah", "Daniel Kim"],
    statusCounts: [
      ["New", 44],
      ["Contacted", 33],
      ["Qualified", 26],
      ["Won", 14],
      ["Lost", 7],
    ],
    valueBase: 95,
    valueStep: 35,
    createdDayStart: 2,
    contactDayStart: 5,
  }),
  ...buildLeadBatch({
    projectId: "northpeak-outdoor-co",
    names: northpeakLeadNames,
    emailDomain: "northpeakmail.com",
    sources: [
      { source: "Website form", capturedFrom: "Trail gear guide signup" },
      { source: "Paid ad", capturedFrom: "Google search ad - trail jacket" },
      { source: "Referral", capturedFrom: "Friend referral checkout opt-in" },
      { source: "Email signup", capturedFrom: "Camping checklist download" },
      { source: "Event", capturedFrom: "Retail pop-up QR capture" },
      { source: "Organic search", capturedFrom: "Outerwear comparison article" },
    ],
    assignees: ["Isla Chen", "Liam Smith", "Priya Shah", "Chloe Bennett"],
    statusCounts: [
      ["New", 21],
      ["Contacted", 15],
      ["Qualified", 11],
      ["Won", 6],
      ["Lost", 3],
    ],
    valueBase: 140,
    valueStep: 55,
    createdDayStart: 4,
    contactDayStart: 8,
  }),
  ...buildLeadBatch({
    projectId: "vaultline",
    names: vaultlineLeadNames,
    companies: vaultlineCompanies,
    sources: [
      { source: "Paid ad", capturedFrom: "Enterprise compliance search ad" },
      { source: "Website form", capturedFrom: "Demo request page" },
      { source: "Referral", capturedFrom: "Partner referral intro" },
      { source: "Event", capturedFrom: "Fintech risk summit booth" },
      { source: "Outbound", capturedFrom: "SDR outbound follow-up" },
      { source: "Webinar", capturedFrom: "Risk reporting webinar registration" },
    ],
    assignees: ["Alex Morgan", "Emma Johnson", "Noah Williams", "Daniel Kim"],
    statusCounts: [
      ["New", 5],
      ["Contacted", 5],
      ["Qualified", 4],
      ["Won", 3],
      ["Lost", 1],
    ],
    valueBase: 12000,
    valueStep: 6500,
    createdDayStart: 6,
    contactDayStart: 10,
  }),
];

function buildLeadActivities(lead, index) {
  const activities = [
    {
      id: `${lead.id}-activity-1`,
      leadId: lead.id,
      projectId: lead.projectId,
      activityType: "Form submission",
      content: `${lead.name} entered from ${lead.capturedFrom}.`,
      author: "System",
      timestamp: `${lead.createdDate}T09:15:00Z`,
    },
  ];

  if (lead.status !== "New") {
    activities.push({
      id: `${lead.id}-activity-2`,
      leadId: lead.id,
      projectId: lead.projectId,
      activityType: index % 3 === 0 ? "Call" : "Email",
      content:
        lead.projectId === "vaultline"
          ? "Initial qualification completed and next-step criteria were confirmed."
          : "First-touch follow-up sent and response intent was logged.",
      author: lead.assignedTeamMember,
      timestamp: `${lead.lastContactedDate}T14:30:00Z`,
    });
  }

  if (["Qualified", "Won", "Lost"].includes(lead.status)) {
    activities.push({
      id: `${lead.id}-activity-3`,
      leadId: lead.id,
      projectId: lead.projectId,
      activityType: "Timeline update",
      content:
        lead.status === "Qualified"
          ? "Lead matched the current ICP and moved into priority follow-up."
          : lead.status === "Won"
            ? "Opportunity converted after follow-up and offer confirmation."
            : "Lead was closed after repeated follow-up with no intent signal.",
      author: lead.assignedTeamMember,
      timestamp: `${lead.lastContactedDate}T16:45:00Z`,
    });
  }

  return activities;
}

const leadActivities = leads.flatMap(buildLeadActivities);

const campaigns = [
  {
    id: "camp-lumen-hydration",
    projectId: "lumen-skincare",
    name: "Hydration Boost",
    channel: "Paid",
    status: "Active",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    budget: 28000,
    spent: 22340,
    impressions: 528000,
    clicks: 9080,
    conversions: 38,
    objective: "High-intent acquisition",
    audience: "Returning visitors and lookalikes",
    owner: "Emma Johnson",
    notes: "Creative rotation every 10 days to keep CTR stable.",
  },
  {
    id: "camp-lumen-glow",
    projectId: "lumen-skincare",
    name: "Glow Awareness",
    channel: "Social",
    status: "Active",
    startDate: "2026-03-10",
    endDate: "2026-06-20",
    budget: 22000,
    spent: 17400,
    impressions: 412000,
    clicks: 7640,
    conversions: 27,
    objective: "Awareness and education",
    audience: "Prospecting, lifestyle shoppers",
    owner: "Isla Chen",
    notes: "Heavy emphasis on creator-led carousel content.",
  },
  {
    id: "camp-lumen-retargeting",
    projectId: "lumen-skincare",
    name: "Retargeting Q2",
    channel: "Paid",
    status: "Scheduled",
    startDate: "2026-06-18",
    endDate: "2026-07-28",
    budget: 10000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    objective: "Cart recovery",
    audience: "High-intent cart abandoners",
    owner: "Alex Morgan",
    notes: "Launches after new checkout proof points land.",
  },
  {
    id: "camp-northpeak-trails",
    projectId: "northpeak-outdoor-co",
    name: "Trail Jacket Push",
    channel: "Search",
    status: "Active",
    startDate: "2026-02-01",
    endDate: "2026-06-25",
    budget: 18000,
    spent: 14450,
    impressions: 238000,
    clicks: 4820,
    conversions: 18,
    objective: "Winter outerwear demand capture",
    audience: "Outdoor shoppers with seasonal intent",
    owner: "Liam Smith",
    notes: "SEO and search ads aligned to jacket launch calendar.",
  },
  {
    id: "camp-northpeak-winter",
    projectId: "northpeak-outdoor-co",
    name: "Winter Readiness",
    channel: "Email",
    status: "Ended",
    startDate: "2025-11-15",
    endDate: "2026-01-15",
    budget: 4600,
    spent: 4600,
    impressions: 84000,
    clicks: 1880,
    conversions: 11,
    objective: "Retention and repeat purchase",
    audience: "Past buyers and newsletter subscribers",
    owner: "Isla Chen",
    notes: "Email triggered from winter guide downloads.",
  },
  {
    id: "camp-vaultline-demo",
    projectId: "vaultline",
    name: "Demo Intent Search",
    channel: "Paid",
    status: "Active",
    startDate: "2026-03-01",
    endDate: "2026-07-01",
    budget: 24000,
    spent: 18640,
    impressions: 54000,
    clicks: 920,
    conversions: 8,
    objective: "Qualified demo bookings",
    audience: "Compliance leaders and finance ops",
    owner: "Noah Williams",
    notes: "Search terms tightly controlled for enterprise intent.",
  },
  {
    id: "camp-vaultline-compliance",
    projectId: "vaultline",
    name: "Compliance Webinar",
    channel: "Email",
    status: "Active",
    startDate: "2026-06-21",
    endDate: "2026-07-10",
    budget: 5200,
    spent: 2380,
    impressions: 18200,
    clicks: 210,
    conversions: 4,
    objective: "Thought leadership",
    audience: "Risk and compliance stakeholders",
    owner: "Emma Johnson",
    notes: "Awaits final speaker confirmation.",
  },
  {
    id: "camp-lumen-ugc",
    projectId: "lumen-skincare",
    name: "UGC Story Sprint",
    channel: "Social",
    status: "Active",
    startDate: "2026-05-12",
    endDate: "2026-07-08",
    budget: 14500,
    spent: 9320,
    impressions: 286000,
    clicks: 5180,
    conversions: 19,
    objective: "Creator trust building",
    audience: "Skincare enthusiasts 24-40",
    owner: "Emma Johnson",
    notes: "Expands the social proof angle for the hero serum.",
  },
  {
    id: "camp-lumen-email-flow",
    projectId: "lumen-skincare",
    name: "Launch Email Flow",
    channel: "Email",
    status: "Active",
    startDate: "2026-04-20",
    endDate: "2026-07-20",
    budget: 6200,
    spent: 4120,
    impressions: 102000,
    clicks: 3440,
    conversions: 13,
    objective: "Lifecycle conversion",
    audience: "Recent site visitors and subscribers",
    owner: "Alex Morgan",
    notes: "Welcome, cross-sell, and replenishment sequences.",
  },
  {
    id: "camp-northpeak-content",
    projectId: "northpeak-outdoor-co",
    name: "Trail Content Engine",
    channel: "Search",
    status: "Active",
    startDate: "2026-03-01",
    endDate: "2026-07-15",
    budget: 15200,
    spent: 12140,
    impressions: 194000,
    clicks: 4360,
    conversions: 14,
    objective: "Mid-funnel education",
    audience: "Outdoor planners and hikers",
    owner: "Liam Smith",
    notes: "Supports the guide library and collection pages.",
  },
  {
    id: "camp-vaultline-webinar",
    projectId: "vaultline",
    name: "Risk Webinar Series",
    channel: "Email",
    status: "Scheduled",
    startDate: "2026-06-21",
    endDate: "2026-08-05",
    budget: 8600,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    objective: "Top-of-funnel education",
    audience: "Ops leaders and compliance teams",
    owner: "Noah Williams",
    notes: "Landing page and reminders still in review.",
  },
];

const tasks = [
  {
    id: "task-lumen-1",
    projectId: "lumen-skincare",
    title: "Triage hydration quiz leads from yesterday",
    description: "Review the latest Meta lead-form batch and push high-intent contacts into same-day follow-up.",
    column: "To Do",
    assignee: "Alex Morgan",
    dueDate: "2026-06-13",
    priority: "High",
    notes: "Current batch came in above target CPL and needs prioritization before 2 PM.",
  },
  {
    id: "task-lumen-2",
    projectId: "lumen-skincare",
    title: "Finalize landing page FAQ revisions",
    description: "Update shipping, subscription cadence, and bundle-return language for the launch page.",
    column: "In Progress",
    assignee: "Isla Chen",
    dueDate: "2026-06-14",
    priority: "Medium",
    notes: "Waiting on one final CX note around expedited shipping timing.",
  },
  {
    id: "task-lumen-3",
    projectId: "lumen-skincare",
    title: "Approve creator cutdowns for paid launch",
    description: "Sign off on the three 15-second cutdowns queued for Monday spend.",
    column: "Review",
    assignee: "Emma Johnson",
    dueDate: "2026-06-14",
    priority: "High",
    notes: "Needs final brand-safe subtitle pass before export.",
  },
  {
    id: "task-lumen-4",
    projectId: "lumen-skincare",
    title: "Refresh retention subject line matrix",
    description: "Lock the next welcome-flow A/B test using the top open-rate variants from last week.",
    column: "In Progress",
    assignee: "Daniel Kim",
    dueDate: "2026-06-16",
    priority: "Medium",
    notes: "Need a final legal check on one claim-driven subject line.",
  },
  {
    id: "task-lumen-5",
    projectId: "lumen-skincare",
    title: "Prepare social proof pull-quote shortlist",
    description: "Curate customer-review snippets for the launch-page proof block refresh.",
    column: "Review",
    assignee: "Priya Shah",
    dueDate: "2026-06-17",
    priority: "Medium",
    notes: "Need 8 approved quotes and category balance across serum, cleanser, and bundle buyers.",
  },
  {
    id: "task-lumen-6",
    projectId: "lumen-skincare",
    title: "Publish weekly performance readout",
    description: "Package channel learnings, CPL shifts, and lead quality notes for the Monday client sync.",
    column: "Done",
    assignee: "Alex Morgan",
    dueDate: "2026-06-10",
    priority: "Low",
    notes: "Delivered to the client workspace and internal team recap channel.",
  },
  {
    id: "task-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Prioritize high-intent trail jacket submissions",
    description: "Separate sizing and promo-driven inquiries from leads ready for direct follow-up.",
    column: "To Do",
    assignee: "Liam Smith",
    dueDate: "2026-06-18",
    priority: "High",
    notes: "Lead-source QA matters here because the retail pop-up submissions skew lower intent.",
  },
  {
    id: "task-northpeak-2",
    projectId: "northpeak-outdoor-co",
    title: "Audit abandoned-cart email timing",
    description: "Check send delays, discount sequencing, and mobile layout before the July promo push.",
    column: "In Progress",
    assignee: "Isla Chen",
    dueDate: "2026-06-19",
    priority: "High",
    notes: "Need to align cart timing with current inventory thresholds.",
  },
  {
    id: "task-northpeak-3",
    projectId: "northpeak-outdoor-co",
    title: "Draft peak-season content brief",
    description: "Outline the July editorial package for trail layering, shell jackets, and camp kitchen bundles.",
    column: "Review",
    assignee: "Chloe Bennett",
    dueDate: "2026-06-20",
    priority: "Medium",
    notes: "Needs client-facing framing before it goes into the monthly roadmap.",
  },
  {
    id: "task-northpeak-4",
    projectId: "northpeak-outdoor-co",
    title: "Refresh paid-search negatives",
    description: "Tighten search intent by removing broad seasonal traffic from the best-converting ad groups.",
    column: "In Progress",
    assignee: "Priya Shah",
    dueDate: "2026-06-21",
    priority: "High",
    notes: "Current CPC drift is coming from generic camping terms.",
  },
  {
    id: "task-northpeak-5",
    projectId: "northpeak-outdoor-co",
    title: "QA mobile gear-guide signup flow",
    description: "Validate form capture, event tracking, and thank-you page attribution on iPhone and Android.",
    column: "Done",
    assignee: "Liam Smith",
    dueDate: "2026-06-11",
    priority: "Low",
    notes: "All production fixes were pushed after the checkout CSS cleanup.",
  },
  {
    id: "task-vaultline-1",
    projectId: "vaultline",
    title: "Review enterprise case-study draft",
    description: "Tighten the proof points used in active demo and proposal follow-up.",
    column: "Review",
    assignee: "Noah Williams",
    dueDate: "2026-06-17",
    priority: "High",
    notes: "Legal wants one anonymized reference swapped before the final PDF goes out.",
  },
  {
    id: "task-vaultline-2",
    projectId: "vaultline",
    title: "Prepare SDR handoff for qualified June leads",
    description: "Package discovery notes for the newest qualified accounts before next week’s outbound follow-up block.",
    column: "To Do",
    assignee: "Alex Morgan",
    dueDate: "2026-06-18",
    priority: "High",
    notes: "Six accounts are ready for sales handoff once budget range is confirmed.",
  },
  {
    id: "task-vaultline-3",
    projectId: "vaultline",
    title: "Refine webinar-to-demo attribution notes",
    description: "Separate webinar-assisted conversions from branded paid-search conversions in the June report.",
    column: "Done",
    assignee: "Emma Johnson",
    dueDate: "2026-06-09",
    priority: "Low",
    notes: "Definitions were approved and rolled into the reporting workspace.",
  },
  {
    id: "task-vaultline-4",
    projectId: "vaultline",
    title: "Edit webinar follow-up sequence",
    description: "Update nurture copy for finance ops, compliance leads, and technical evaluators.",
    column: "In Progress",
    assignee: "Daniel Kim",
    dueDate: "2026-06-20",
    priority: "High",
    notes: "The branching logic is done; only copy and CTA hierarchy remain.",
  },
  {
    id: "task-vaultline-5",
    projectId: "vaultline",
    title: "Finalize Q3 pipeline forecast assumptions",
    description: "Update scenario ranges based on close rate, ACV, and current SDR capacity.",
    column: "To Do",
    assignee: "Noah Williams",
    dueDate: "2026-06-24",
    priority: "High",
    notes: "Need a version for board-level review and a version for weekly operations pacing.",
  },
  {
    id: "task-vaultline-6",
    projectId: "vaultline",
    title: "QA pricing one-pager before approval reroute",
    description: "Verify legal edits, retention language, and CTA consistency across the PDF handoff.",
    column: "Review",
    assignee: "Emma Johnson",
    dueDate: "2026-06-21",
    priority: "Medium",
    notes: "Once this is clean it can go back into the approvals queue.",
  },
];

const calendarEvents = [
  {
    id: "event-lumen-1",
    projectId: "lumen-skincare",
    title: "Hydration Boost Reel publish",
    channel: "Social",
    date: "2026-06-14",
    status: "Scheduled",
    assignee: "Emma Johnson",
  },
  {
    id: "event-lumen-2",
    projectId: "lumen-skincare",
    title: "Launch welcome flow send",
    channel: "Email",
    date: "2026-06-16",
    status: "Scheduled",
    assignee: "Daniel Kim",
  },
  {
    id: "event-lumen-3",
    projectId: "lumen-skincare",
    title: "Customer story interview",
    channel: "Social",
    date: "2026-06-18",
    status: "Scheduled",
    assignee: "Isla Chen",
  },
  {
    id: "event-lumen-4",
    projectId: "lumen-skincare",
    title: "Bundle FAQ update",
    channel: "Search",
    date: "2026-06-19",
    status: "Draft",
    assignee: "Isla Chen",
  },
  {
    id: "event-lumen-5",
    projectId: "lumen-skincare",
    title: "Creator cutdown export",
    channel: "Social",
    date: "2026-06-19",
    status: "Scheduled",
    assignee: "Emma Johnson",
  },
  {
    id: "event-lumen-6",
    projectId: "lumen-skincare",
    title: "Retention test launch",
    channel: "Email",
    date: "2026-06-19",
    status: "Draft",
    assignee: "Daniel Kim",
  },
  {
    id: "event-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Trail jacket blog update",
    channel: "Search",
    date: "2026-06-20",
    status: "Scheduled",
    assignee: "Chloe Bennett",
  },
  {
    id: "event-northpeak-2",
    projectId: "northpeak-outdoor-co",
    title: "Peak season gear round-up email",
    channel: "Email",
    date: "2026-06-23",
    status: "Draft",
    assignee: "Isla Chen",
  },
  {
    id: "event-northpeak-3",
    projectId: "northpeak-outdoor-co",
    title: "Search copy refresh",
    channel: "Search",
    date: "2026-06-23",
    status: "Scheduled",
    assignee: "Liam Smith",
  },
  {
    id: "event-northpeak-4",
    projectId: "northpeak-outdoor-co",
    title: "Retail pop-up recap post",
    channel: "Social",
    date: "2026-06-26",
    status: "Draft",
    assignee: "Priya Shah",
  },
  {
    id: "event-vaultline-1",
    projectId: "vaultline",
    title: "Compliance webinar invite",
    channel: "Email",
    date: "2026-06-24",
    status: "Draft",
    assignee: "Daniel Kim",
  },
  {
    id: "event-vaultline-2",
    projectId: "vaultline",
    title: "Analyst quote one-pager",
    channel: "Email",
    date: "2026-06-24",
    status: "Scheduled",
    assignee: "Emma Johnson",
  },
  {
    id: "event-vaultline-3",
    projectId: "vaultline",
    title: "SDR follow-up sequence push",
    channel: "Email",
    date: "2026-06-27",
    status: "Scheduled",
    assignee: "Alex Morgan",
  },
];

const approvals = [
  {
    id: "approval-lumen-1",
    projectId: "lumen-skincare",
    title: "Hydration Boost Hero",
    type: "Image",
    requestType: "Creative",
    thumbnailColor: "#F5C2BF",
    status: "Pending",
    submittedBy: "Emma Johnson",
    submittedDate: "2026-06-11",
    summary: "Approve the final hero image for the launch landing page and paid social set.",
    details:
      "This asset is the primary visual for the Q2 launch. It needs signoff on the CTA lockup, product crop, and claim hierarchy before media goes live.",
    pros: "Strong product focus, consistent brand colors, and a clear CTA path.",
    cons: "CTA copy is slightly longer than the other variants.",
    recommendation: "Approve with the current CTA lockup if the legal copy lands unchanged.",
    attachments: "Hero mockup, alternate crop, CTA lockup",
    comments: [
      { id: "approval-lumen-1-c1", author: "Alex Morgan", message: "Need final client signoff on the CTA lockup.", timestamp: "2026-06-11T10:00:00Z" },
    ],
  },
  {
    id: "approval-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Winter Trails Newsletter",
    type: "Copy",
    requestType: "Copy",
    thumbnailColor: "#D9A441",
    status: "Approved",
    submittedBy: "Liam Smith",
    submittedDate: "2026-06-08",
    summary: "Final newsletter draft for the winter gear drop.",
    details:
      "Newsletter includes a new product block, social proof, and a reminder on free shipping thresholds. All required edits are already reflected in the final copy.",
    pros: "Concise, seasonal, and aligned with the search landing pages.",
    cons: "Long body copy may compress on mobile if not trimmed.",
    recommendation: "Approved for send.",
    attachments: "Subject line options, email mockup",
    comments: [
      { id: "approval-northpeak-1-c1", author: "Isla Chen", message: "Approved after final subject line update.", timestamp: "2026-06-09T09:10:00Z" },
    ],
  },
  {
    id: "approval-vaultline-1",
    projectId: "vaultline",
    title: "Enterprise Demo Cut",
    type: "Video",
    requestType: "Video",
    thumbnailColor: "#4CC9B0",
    status: "Pending",
    submittedBy: "Noah Williams",
    submittedDate: "2026-06-10",
    summary: "Short-form demo cut for enterprise prospects.",
    details:
      "This version trims the intro by 18 seconds and moves the compliance proof point earlier in the sequence to improve hold rate.",
    pros: "Cleaner pacing and stronger hook in the first five seconds.",
    cons: "The legal disclaimer appears slightly earlier than the story arc.",
    recommendation: "Keep the current edit and only adjust captions.",
    attachments: "Rough cut, caption file, branded outro",
    comments: [],
  },
  {
    id: "approval-vaultline-2",
    projectId: "vaultline",
    title: "Pricing one-pager",
    type: "PDF",
    requestType: "Budget",
    thumbnailColor: "#D6E4FF",
    status: "Pending",
    submittedBy: "Emma Johnson",
    submittedDate: "2026-06-12",
    summary: "Internal approval for the new pricing explainer sheet.",
    details:
      "The one-pager combines the core plan summary, security assurances, and procurement FAQ. It should be reviewed before being shared with the sales team.",
    pros: "Tight format and clear internal procurement answers.",
    cons: "Needs one more legal review on data retention language.",
    recommendation: "Hold until final legal wording is confirmed.",
    attachments: "Draft PDF, redline notes, FAQ sheet",
    comments: [],
  },
];

const reportConfigs = [
  {
    id: "report-lumen",
    projectId: "lumen-skincare",
    includedSections: ["Executive summary", "Channel performance", "Leads", "Campaign learnings"],
    frequency: "Weekly",
    internalReviewFirst: true,
    recipients: ["growth@lumenlabs.com", "ceo@lumenlabs.com"],
    lastSentDate: "2026-06-06",
    engagementStats: {
      opens: 42,
      downloads: 16,
      lastOpenedDate: "2026-06-07",
    },
  },
  {
    id: "report-northpeak",
    projectId: "northpeak-outdoor-co",
    includedSections: ["Executive summary", "SEO", "Email", "Revenue"],
    frequency: "Monthly",
    internalReviewFirst: true,
    recipients: ["marketing@northpeak.co"],
    lastSentDate: "2026-05-31",
    engagementStats: {
      opens: 18,
      downloads: 6,
      lastOpenedDate: "2026-06-01",
    },
  },
  {
    id: "report-vaultline",
    projectId: "vaultline",
    includedSections: ["Executive summary", "Pipeline", "Paid search", "Meetings"],
    frequency: "Weekly",
    internalReviewFirst: false,
    recipients: ["ops@vaultline.de", "cmo@vaultline.de"],
    lastSentDate: "2026-06-05",
    engagementStats: {
      opens: 24,
      downloads: 9,
      lastOpenedDate: "2026-06-06",
    },
  },
];

const agencySettings = {
  agencyName: "Ledger Studio",
  logoPlaceholder: "LS",
  notifications: {
    approvals: true,
    reports: true,
    tasks: false,
  },
  integrations: [
    { id: "google-ads", name: "Google Ads", connected: true },
    { id: "meta-ads", name: "Meta Ads", connected: true },
    { id: "hubspot", name: "HubSpot", connected: false },
  ],
};

export function createInitialData() {
  return {
    projects: projectSeeds,
    kpiSnapshots,
    timeSeries,
    channelBreakdowns,
    timelineAnnotations,
    goals,
    leads,
    leadActivities,
    campaigns,
    tasks,
    calendarEvents,
    approvals,
    teamMembers,
    reportConfigs,
    agencySettings,
  };
}
